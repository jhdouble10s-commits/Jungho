import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const usernamePattern = /^[a-z0-9][a-z0-9_.-]{2,31}$/;
const emailForUsername = (username: string) => `${username}@users.sitescout.local`;
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const adminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const validateCredentials = (username: unknown, password: unknown) => {
  if (typeof username !== 'string' || !usernamePattern.test(username)) {
    throw new Error('아이디는 영문 소문자, 숫자, ., _, -를 사용하는 3~32자로 입력하세요.');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new Error('비밀번호는 6자 이상이어야 합니다.');
  }
  return { username, password };
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'POST 요청만 허용됩니다.' }, 405);

  try {
    const body = await request.json();
    const action = body.action || 'create';

    const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: '관리자 로그인이 필요합니다.' }, 401);
    const { data: caller, error: callerError } = await adminClient.auth.getUser(token);
    if (callerError || !caller.user) return json({ error: '관리자 세션이 유효하지 않습니다.' }, 401);
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles').select('role,status').eq('user_id', caller.user.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== 'admin' || profile?.status !== 'approved') return json({ error: '관리자만 접근할 수 있습니다.' }, 403);

    // Approval operations use the caller JWT, so RLS is enforced even inside this API.
    const callerClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (action === 'list-pending') {
      const { data: members, error } = await callerClient.from('user_profiles')
        .select('user_id,email,username,display_name,created_at').eq('status', 'pending')
        .eq('role', 'user').order('created_at').limit(1000);
      if (error) throw error;
      return json({ members });
    }
    if (action === 'set-status') {
      if (!['approved', 'rejected'].includes(body.status) ||
          typeof body.userId !== 'string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.userId)) {
        return json({ error: '유효한 회원 ID와 승인 상태가 필요합니다.' }, 400);
      }
      const { data: member, error } = await callerClient.from('user_profiles')
        .update({ status: body.status }).eq('user_id', body.userId)
        .eq('status', 'pending').eq('role', 'user').select('user_id,status').maybeSingle();
      if (error) throw error;
      if (!member) return json({ error: '이미 처리되었거나 승인 대기 회원이 아닙니다.' }, 409);
      return json({ member });
    }
    if (action !== 'create') return json({ error: '지원하지 않는 요청입니다.' }, 400);
    const { username, password } = validateCredentials(
      typeof body.username === 'string' ? body.username.trim().toLowerCase() : body.username, body.password);
    const displayName = body.displayName === undefined ? username :
      typeof body.displayName === 'string' ? body.displayName.trim() : '';
    if (!displayName || displayName.length > 80) return json({ error: '이름 또는 닉네임은 1~80자로 입력하세요.' }, 400);

    const { data, error } = await adminClient.auth.admin.createUser({
      email: emailForUsername(username),
      password,
      email_confirm: true,
      app_metadata: { role: 'user' },
      user_metadata: { username, display_name: displayName },
    });
    if (error && ['email_exists', 'user_already_exists'].includes(error.code || '')) {
      return json({ error: '이미 사용 중인 아이디입니다.' }, 409);
    }
    if (error) throw error;
    if (!data.user) throw new Error('계정 생성 결과를 확인할 수 없습니다.');
    try {
      const { data: member, error: profileError } = await adminClient.from('user_profiles')
        .update({ username, display_name: displayName }).eq('user_id', data.user.id).select('user_id').single();
      if (profileError || !member) throw profileError || new Error('회원 정보를 저장하지 못했습니다.');
      // Use the issuing admin's JWT: RLS rechecks approval authority at the write.
      const { data: approved, error: approvalError } = await callerClient.from('user_profiles')
        .update({ status: 'approved' }).eq('user_id', data.user.id)
        .eq('role', 'user').eq('status', 'pending').select('user_id,status').single();
      if (approvalError || !approved) throw approvalError || new Error('계정을 승인하지 못했습니다.');
    } catch (creationError) {
      const { error: cleanupError } = await adminClient.auth.admin.deleteUser(data.user.id);
      if (cleanupError) throw new Error('계정 발급을 완료하지 못했습니다. 관리자에게 계정 상태 확인을 요청하세요.');
      throw creationError;
    }
    return json({ username, displayName, role: 'user', status: 'approved' }, 201);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : '계정 처리에 실패했습니다.' }, 400);
  }
});
