import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

const source = stripTypeScriptTypes((await readFile(new URL('../supabase/functions/account-admin/index.ts', import.meta.url), 'utf8'))
  .replace(/^import .*?;\n/, ''));
function fixture({ role = 'admin', status = 'approved', duplicate = false, failApproval = false, missingProfile = false } = {}) {
  const profiles = new Map([['actor', { user_id: 'actor', role, status }]]);
  const created = [], deleted = [], writes = [];
  let handler;
  function createClient(_url, key) {
    return {
      auth: {
        getUser: async token => ({ data: { user: token === 'valid' ? { id: 'actor', user_metadata: { role: 'admin' } } : null }, error: null }),
        admin: {
          listUsers: async ({page,perPage}) => ({data:{users:[...profiles.keys()].slice((page-1)*perPage,page*perPage).map(id => ({id,last_sign_in_at:'2026-10-09T01:00:00Z',identities:['private']}))},error:null}),
          createUser: async args => {
            created.push(args);
            if (duplicate) return { data: {}, error: { code: 'email_exists' } };
            if (!missingProfile) profiles.set('new-user', { user_id: 'new-user', role: 'user', status: 'pending' });
            return { data: { user: { id: 'new-user' } }, error: null };
          },
          deleteUser: async id => { deleted.push(id); profiles.delete(id); return { error: null }; },
        },
      },
      rpc: async (_name,args) => {
        const actor = profiles.get('actor'), member = profiles.get(args.p_user_id);
        if (key !== 'anon' || actor.role !== 'admin' || actor.status !== 'approved' || failApproval || member?.status !== args.p_expected_status) return {data:null,error:new Error('RLS denied')};
        member.status = args.p_status; writes.push({key,patch:{status:args.p_status}});
        return {data:member,error:null};
      },
      from: () => {
        let patch;
        const filters = [];
        const result = (single = false) => {
          if (patch && key === 'anon' && failApproval) return { data: null, error: new Error('RLS denied') };
          const rows = [...profiles.values()].filter(row => filters.every(([name, value]) => Array.isArray(value) ? value.includes(row[name]) : row[name] === value));
          if (patch) { writes.push({ key, patch }); rows.forEach(row => Object.assign(row, patch)); }
          return { data: single ? rows[0] || null : rows, error: null };
        };
        const query = {
          select: () => query, order: () => query, limit: () => query,
          in: (name,value) => { filters.push([name,value]); return query; },
          eq: (name, value) => { filters.push([name, value]); return query; },
          update: value => { patch = value; return query; },
          single: async () => result(true), maybeSingle: async () => result(true),
          then: (resolve, reject) => Promise.resolve(result()).then(resolve, reject),
        };
        return query;
      },
    };
  }
  vm.runInNewContext(source, { createClient, Response, console: { error() {} }, Deno: {
    env: { get: name => name === 'SUPABASE_SERVICE_ROLE_KEY' ? 'service' : name === 'SUPABASE_ANON_KEY' ? 'anon' : 'https://test.invalid' },
    serve: callback => { handler = callback; },
  } });
  const request = async (body, token = 'valid') => {
    const response = await handler(new Request('https://test.invalid/account-admin', { method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }));
    return { status: response.status, body: await response.json() };
  };
  return { request, created, deleted, profiles, writes };
}
const input = { action: 'create', username: ' Reader_01 ', displayName: ' 독자 ', password: 'test-only-secret' };

test('admin issues an email-confirmed ordinary account and approves it through caller RLS', async () => {
  const f = fixture();
  const result = await f.request({ ...input, role: 'admin', status: 'rejected' });
  assert.equal(result.status, 201);
  assert.equal(result.body.username, 'reader_01');
  assert.equal(result.body.status, 'approved');
  assert.equal(result.body.role, 'user');
  assert.equal(f.created.length, 1);
  assert.equal(f.created[0].email, 'reader_01@users.sitescout.local');
  assert.equal(f.created[0].email_confirm, true);
  assert.equal(f.created[0].password, input.password);
  assert.equal(f.profiles.get('new-user').display_name, '독자');
  assert.equal(f.profiles.get('new-user').role, 'user');
  assert.equal(f.writes.find(write => write.patch.status)?.key, 'anon');
  assert.ok(!JSON.stringify([result, [...f.profiles], f.writes]).includes(input.password));
});
for (const [role, status] of [['user', 'approved'], ['admin', 'pending'], ['admin', 'rejected'], ['admin', 'suspended']]) {
  test(`${role}/${status} cannot issue accounts despite admin metadata`, async () => {
    const f = fixture({ role, status });
    assert.equal((await f.request(input)).status, 403);
    assert.equal(f.created.length, 0);
  });
}
test('missing/invalid session and invalid credentials do not create accounts', async () => {
  const f = fixture();
  for (const token of [null, 'invalid']) assert.equal((await f.request(input, token)).status, 401);
  for (const patch of [{ username: {} }, { username: 'x' }, { password: '123' }, { displayName: '' }, { displayName: 'a'.repeat(81) }]) {
    assert.equal((await f.request({ ...input, ...patch })).status, 400);
  }
  assert.equal(f.created.length, 0);
});
test('duplicate username returns conflict without replacing or deleting an existing account', async () => {
  const f = fixture({ duplicate: true });
  const result = await f.request(input);
  assert.equal(result.status, 409);
  assert.equal(result.body.error, '이미 사용 중인 아이디입니다.');
  assert.equal(f.deleted.length, 0);
  assert.equal(f.writes.length, 0);
});
for (const failure of ['failApproval', 'missingProfile']) {
  test(`${failure} rolls back only the newly issued Auth account`, async () => {
    const f = fixture({ [failure]: true });
    assert.equal((await f.request(input)).status, 400);
    assert.deepEqual(f.deleted, ['new-user']);
    assert.equal(f.profiles.has('new-user'), false);
    assert.equal(f.profiles.has('actor'), true);
  });
}
test('legacy username-only issuer and pending member approval still work', async () => {
  const f = fixture();
  assert.equal((await f.request({ action: 'create', username: 'legacy', password: input.password })).status, 201);
  assert.equal(f.profiles.get('new-user').display_name, 'legacy');
  const id = '11111111-1111-4111-8111-111111111111';
  f.profiles.set(id, { user_id: id, role: 'user', status: 'pending' });
  assert.equal((await f.request({ action: 'list-pending' })).body.members.length, 1);
  assert.equal((await f.request({ action: 'set-status', userId: id, status: 'rejected' })).body.member.status, 'rejected');
});

test('dashboard returns actual last login without exposing Auth internals', async () => {
  const result = await fixture().request({action:'list-members'});
  assert.equal(result.status,200);
  assert.equal(result.body.members[0].last_sign_in_at,'2026-10-09T01:00:00Z');
  assert.equal(result.body.members[0].identities,undefined);
  assert.equal(result.body.loginHistoryAvailable,false);
});
test('dashboard follows Auth pages without dropping or duplicating members', async () => {
  const f=fixture();
  for(let i=0;i<205;i++) f.profiles.set(`member-${i}`,{user_id:`member-${i}`,role:'user',status:'approved'});
  const result=await f.request({action:'list-members'});
  assert.equal(result.status,200);
  assert.equal(result.body.members.length,206);
  assert.equal(new Set(result.body.members.map(member=>member.user_id)).size,206);
});
for (const [role,status] of [['user','approved'],['admin','pending'],['admin','rejected'],['admin','suspended']]) {
  test(`dashboard rejects ${role}/${status}`, async () => {
    assert.equal((await fixture({role,status}).request({action:'list-members'})).status,403);
  });
}
test('every request checks current admin approval again', async () => {
  const f=fixture();
  assert.equal((await f.request({action:'list-members'})).status,200);
  f.profiles.get('actor').status='suspended';
  assert.equal((await f.request({action:'list-members'})).status,403);
  assert.equal((await f.request(input)).status,403);
  assert.equal(f.created.length,0);
});
