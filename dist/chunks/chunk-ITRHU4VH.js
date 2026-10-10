// auth-access.js
var accessMessages = {
  pending: "\uAD00\uB9AC\uC790 \uC2B9\uC778 \uB300\uAE30 \uC911\uC785\uB2C8\uB2E4.",
  rejected: "\uAC00\uC785 \uC2B9\uC778\uC774 \uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  suspended: "\uC774 \uACC4\uC815\uC740 \uC774\uC6A9\uC774 \uC815\uC9C0\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uAD00\uB9AC\uC790\uC5D0\uAC8C \uBB38\uC758\uD558\uC138\uC694.",
  missing: "\uD68C\uC6D0 \uC815\uBCF4\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uAD00\uB9AC\uC790\uC5D0\uAC8C \uBB38\uC758\uD558\uC138\uC694.",
  login: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
  unavailable: "\uC2B9\uC778 \uC0C1\uD0DC\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.",
  admin: "\uAD00\uB9AC\uC790\uB9CC \uC811\uADFC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  email: "\uC774\uBA54\uC77C \uD655\uC778\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694. \uAD00\uB9AC\uC790 \uC2B9\uC778 \uD6C4 \uB85C\uADF8\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
};
var AccessError = class extends Error {
  constructor(code) {
    super(accessMessages[code] || accessMessages.unavailable);
    this.code = code;
  }
};
var loginEmail = (value) => {
  const normalized = String(value).trim().toLowerCase();
  return normalized.includes("@") ? normalized : `${normalized}@users.sitescout.local`;
};
var checkedRequest = async (request) => {
  try {
    return await request();
  } catch {
    throw new AccessError("unavailable");
  }
};
async function readAccess(client) {
  const { data: sessionData, error: sessionError } = await checkedRequest(() => client.auth.getSession());
  if (sessionError) throw new AccessError("unavailable");
  const session = sessionData?.session;
  if (!session) throw new AccessError("login");
  const targetId = session.user.id;
  const { data: userData, error } = await checkedRequest(() => client.auth.getUser());
  if (error) throw new AccessError([401, 403].includes(error.status) ? "login" : "unavailable");
  const user = userData?.user;
  if (!user || user.is_anonymous) throw new AccessError("login");
  if (user.id !== targetId) throw new AccessError("stale");
  const { data: profile, error: profileError } = await checkedRequest(() => client.from("user_profiles").select("user_id,username,display_name,role,status").eq("user_id", targetId).maybeSingle());
  const { data: current, error: currentError } = await checkedRequest(() => client.auth.getSession());
  if (currentError) throw new AccessError("unavailable");
  if (current?.session?.user.id !== targetId) throw new AccessError("stale");
  if (profileError) throw new AccessError([401, 403].includes(profileError.status) ? "missing" : "unavailable");
  if (!profile || profile.user_id !== targetId) throw new AccessError("missing");
  if (profile.status !== "approved") throw new AccessError(
    ["pending", "rejected", "suspended"].includes(profile.status) ? profile.status : "missing"
  );
  return { user, profile };
}
async function signInApproved(client, identifier, password) {
  const { data, error } = await client.auth.signInWithPassword({ email: loginEmail(identifier), password });
  if (error) {
    if (error.code === "email_not_confirmed") throw new AccessError("email");
    throw error;
  }
  try {
    const access = await readAccess(client);
    if (access.user.id !== data.user?.id) throw new AccessError("stale");
    return access;
  } catch (error2) {
    if (error2.code === "unavailable") throw error2;
    const { data: current } = await client.auth.getSession();
    if (error2.code !== "stale" && current.session?.user.id === data.user?.id) {
      await client.auth.signOut({ scope: "local" });
    }
    throw error2;
  }
}
async function signUpPending(client, { email, password, passwordConfirm, displayName }) {
  if (password !== passwordConfirm) throw new Error("\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
  const name = String(displayName || "").trim();
  if (!name || name.length > 80) throw new Error("\uC774\uB984 \uB610\uB294 \uB2C9\uB124\uC784\uC740 1~80\uC790\uB85C \uC785\uB825\uD558\uC138\uC694.");
  const { data, error } = await client.auth.signUp({
    email: String(email).trim().toLowerCase(),
    password,
    options: { data: { display_name: name } }
  });
  if (error) throw error;
  if (data.session) {
    const { data: current } = await client.auth.getSession();
    if (current.session?.user.id === data.user?.id) await client.auth.signOut({ scope: "local" });
  }
  return data;
}

export {
  accessMessages,
  AccessError,
  readAccess,
  signInApproved,
  signUpPending
};
