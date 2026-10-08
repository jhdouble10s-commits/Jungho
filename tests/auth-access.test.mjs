import test from 'node:test';
import assert from 'node:assert/strict';
import { loginEmail, readAccess, signInApproved, signUpPending } from '../auth-access.js';

function fixture({ status = 'approved', role = 'user', profileError = null } = {}) {
  const user = { id: 'original-user', email: 'jungho@users.sitescout.local', user_metadata: { role: 'admin' } };
  let session = { user };
  const calls = [];
  const profile = { user_id: user.id, role, status };
  const client = {
    auth: {
      getSession: async () => ({ data: { session } }),
      getUser: async () => ({ data: { user: session?.user } }),
      signInWithPassword: async args => { calls.push(['login', args]); return { data: { user } }; },
      signUp: async args => { calls.push(['signup', args]); return { data: { user, session } }; },
      signOut: async args => { calls.push(['logout', args]); session = null; return {}; },
    },
    from: table => { assert.equal(table, 'user_profiles'); return {
      select: () => ({ eq: (column, id) => {
        assert.equal(column, 'user_id'); assert.equal(id, user.id);
        return { maybeSingle: async () => ({ data: profile, error: profileError }) };
      } }),
    }; },
  };
  return { client, calls, profile, changeUser: () => { session = { user: { id: 'another-user' } }; } };
}

test('existing username login and email login share the SDK path', async () => {
  assert.equal(loginEmail(' Jungho '), 'jungho@users.sitescout.local');
  assert.equal(loginEmail(' Person@Example.com '), 'person@example.com');
  const { client, calls } = fixture({ role: 'admin' });
  assert.equal((await signInApproved(client, 'jungho', 'test-password')).profile.role, 'admin');
  assert.equal(calls[0][1].email, 'jungho@users.sitescout.local');
  assert.equal(calls.length, 1);
});
for (const [status, message] of [['pending', '관리자 승인 대기 중입니다.'], ['rejected', '가입 승인이 되지 않았습니다.']]) {
  test(`${status} is blocked after authentication and its local session is removed`, async () => {
    const { client, calls } = fixture({ status });
    await assert.rejects(signInApproved(client, 'person@example.com', 'test-password'), { message });
    assert.deepEqual(calls.at(-1), ['logout', { scope: 'local' }]);
  });
}
test('reload reads approval from DB and does not trust user metadata', async () => {
  const { client, profile } = fixture();
  assert.equal((await readAccess(client)).profile.role, 'user');
  profile.status = 'rejected';
  await assert.rejects(readAccess(client), { code: 'rejected' });
});
test('profile network errors fail closed', async () => {
  const { client } = fixture({ profileError: { message: 'offline' } });
  await assert.rejects(readAccess(client), { code: 'unavailable' });
});
test('unconfirmed email keeps the existing Supabase confirmation requirement', async () => {
  const { client } = fixture();
  client.auth.signInWithPassword = async () => ({ data: {}, error: { code: 'email_not_confirmed' } });
  await assert.rejects(signInApproved(client, 'person@example.com', 'test-password'), {
    code: 'email', message: '이메일 확인을 완료해 주세요. 관리자 승인 후 로그인할 수 있습니다.',
  });
});
test('signup sends no confirmation or privilege fields and discards the automatic session', async () => {
  const { client, calls } = fixture();
  await signUpPending(client, { email: ' New@Example.com ', password: 'test-password', passwordConfirm: 'test-password', displayName: ' 새 회원 ' });
  assert.deepEqual(calls, [
    ['signup', { email: 'new@example.com', password: 'test-password', options: { data: { display_name: '새 회원' } } }],
    ['logout', { scope: 'local' }],
  ]);
});
test('password mismatch never calls Auth or the database', async () => {
  const { client, calls } = fixture();
  await assert.rejects(signUpPending(client, { password: 'a', passwordConfirm: 'b', displayName: '이름' }), /일치/);
  assert.equal(calls.length, 0);
});
test('stale profile results neither authorize nor sign out a different user', async () => {
  const { client, changeUser, calls } = fixture();
  const from = client.from;
  client.from = table => {
    const query = from(table);
    return { select: fields => {
      const selected = query.select(fields);
      return { eq: (...args) => {
        const filtered = selected.eq(...args);
        return { maybeSingle: async () => { const result = await filtered.maybeSingle(); changeUser(); return result; } };
      } };
    } };
  };
  await assert.rejects(signInApproved(client, 'jungho', 'test-password'), { code: 'stale' });
  assert.equal(calls.filter(([name]) => name === 'logout').length, 0);
});
