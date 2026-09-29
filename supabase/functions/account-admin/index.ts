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
    const { username, password } = validateCredentials(body.username?.toLowerCase(), body.password);
    const action = body.action || 'create';

    if (action === 'bootstrap') {
      const { count, error: countError } = await adminClient
        .from('user_profiles')
        .select('user_id', { count: 'exact', head: true });
      if (countError) throw countError;
      if ((count || 0) > 0) return json({ error: '관리자 계정이 이미 설정되어 있습니다.' }, 409);

      const { data, error } = await adminClient.auth.admin.createUser({
        email: emailForUsername(username),
        password,
        email_confirm: true,
        app_metadata: { role: 'admin' },
        user_metadata: { username },
      });
      if (error) throw error;
      const { error: profileError } = await adminClient.from('user_profiles').insert({
        user_id: data.user.id,
        username,
        role: 'admin',
      });
      if (profileError) {
        await adminClient.auth.admin.deleteUser(data.user.id);
        throw profileError;
      }
      return json({ username, role: 'admin' }, 201);
    }

    const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: '관리자 로그인이 필요합니다.' }, 401);
    const { data: caller, error: callerError } = await adminClient.auth.getUser(token);
    if (callerError || !caller.user) return json({ error: '관리자 세션이 유효하지 않습니다.' }, 401);
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles').select('role').eq('user_id', caller.user.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== 'admin') return json({ error: '관리자만 계정을 발급할 수 있습니다.' }, 403);

    const { data, error } = await adminClient.auth.admin.createUser({
      email: emailForUsername(username),
      password,
      email_confirm: true,
      app_metadata: { role: 'user' },
      user_metadata: { username },
    });
    if (error) throw error;
    const { error: insertError } = await adminClient.from('user_profiles').insert({
      user_id: data.user.id,
      username,
      role: 'user',
    });
    if (insertError) {
      await adminClient.auth.admin.deleteUser(data.user.id);
      throw insertError;
    }
    return json({ username, role: 'user' }, 201);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : '계정 처리에 실패했습니다.' }, 400);
  }
});
