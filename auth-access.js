export const accessMessages = {
  pending: '관리자 승인 대기 중입니다.',
  rejected: '가입 승인이 되지 않았습니다.',
  missing: '회원 정보를 확인할 수 없습니다. 관리자에게 문의하세요.',
  login: '로그인이 필요합니다.',
  unavailable: '승인 상태를 확인할 수 없습니다. 잠시 후 다시 시도하세요.',
  admin: '관리자만 접근할 수 있습니다.',
  email: '이메일 확인을 완료해 주세요. 관리자 승인 후 로그인할 수 있습니다.',
};

export class AccessError extends Error {
  constructor(code) { super(accessMessages[code] || accessMessages.unavailable); this.code = code; }
}

export const loginEmail = (value) => {
  const normalized = String(value).trim().toLowerCase();
  return normalized.includes('@') ? normalized : `${normalized}@users.sitescout.local`;
};

// Auth verifies identity; the database is the only authority for role and approval.
export async function readAccess(client) {
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw new AccessError('unavailable');
  if (!session) throw new AccessError('login');
  const targetId = session.user.id;
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user || user.is_anonymous) throw new AccessError('login');
  if (user.id !== targetId) throw new AccessError('stale');
  const { data: profile, error: profileError } = await client.from('user_profiles')
    .select('user_id,username,display_name,role,status').eq('user_id', targetId).maybeSingle();
  const { data: current, error: currentError } = await client.auth.getSession();
  if (currentError || current.session?.user.id !== targetId) throw new AccessError('stale');
  if (profileError) throw new AccessError('unavailable');
  if (!profile || profile.user_id !== targetId) throw new AccessError('missing');
  if (profile.status !== 'approved') throw new AccessError(
    ['pending', 'rejected'].includes(profile.status) ? profile.status : 'missing');
  return { user, profile };
}

export async function signInApproved(client, identifier, password) {
  const { data, error } = await client.auth.signInWithPassword({ email: loginEmail(identifier), password });
  if (error) {
    if (error.code === 'email_not_confirmed') throw new AccessError('email');
    throw error;
  }
  try {
    const access = await readAccess(client);
    if (access.user.id !== data.user?.id) throw new AccessError('stale');
    return access;
  }
  catch (error) {
    const { data: current } = await client.auth.getSession();
    if (error.code !== 'stale' && current.session?.user.id === data.user?.id) {
      await client.auth.signOut({ scope: 'local' });
    }
    throw error;
  }
}

export async function signUpPending(client, { email, password, passwordConfirm, displayName }) {
  if (password !== passwordConfirm) throw new Error('비밀번호가 일치하지 않습니다.');
  const name = String(displayName || '').trim();
  if (!name || name.length > 80) throw new Error('이름 또는 닉네임은 1~80자로 입력하세요.');
  // Confirmation, role and status never leave this client. The Auth trigger sets pending/user.
  const { data, error } = await client.auth.signUp({
    email: String(email).trim().toLowerCase(), password, options: { data: { display_name: name } },
  });
  if (error) throw error;
  if (data.session) {
    const { data: current } = await client.auth.getSession();
    if (current.session?.user.id === data.user?.id) await client.auth.signOut({ scope: 'local' });
  }
  return data;
}
