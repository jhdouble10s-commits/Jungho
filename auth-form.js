import { client } from './auth-client.js';
import { accessMessages, signInApproved, signUpPending } from './auth-access.js';

const form = document.querySelector('#loginForm, #signupForm');
const message = document.querySelector('.message');
const submit = form.querySelector('.submit');
const password = form.querySelector('[name=password]');
const toggle = form.querySelector('.toggle');
const showMessage = (text, error = false) => {
  message.textContent = text;
  message.classList.toggle('error', error);
};
const reason = new URLSearchParams(location.search).get('reason');
if (reason) showMessage(accessMessages[reason] || accessMessages.unavailable, true);
toggle?.addEventListener('click', () => {
  const shown = password.type === 'text';
  password.type = shown ? 'password' : 'text';
  toggle.textContent = shown ? '보기' : '숨기기';
  toggle.setAttribute('aria-label', shown ? '비밀번호 표시' : '비밀번호 숨기기');
});
const confirmation = form.querySelector('[name=passwordConfirm]');
const validateConfirmation = () => confirmation?.setCustomValidity(
  confirmation.value === password.value ? '' : '비밀번호가 일치하지 않습니다.');
confirmation?.addEventListener('input', validateConfirmation);
password.addEventListener('input', validateConfirmation);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  const fields = new FormData(form);
  submit.disabled = true;
  showMessage(form.id === 'signupForm' ? '회원가입 중…' : '로그인 중…');
  try {
    if (form.id === 'signupForm') {
      const data = await signUpPending(client, {
        email: fields.get('email'), password: fields.get('password'),
        passwordConfirm: fields.get('passwordConfirm'), displayName: fields.get('displayName'),
      });
      form.reset();
      showMessage(`${accessMessages.pending}${data.session ? '' : ' 이메일 확인 안내를 받으셨다면 확인을 완료해 주세요.'}`);
    } else {
      await signInApproved(client, fields.get('username'), fields.get('password'));
      location.replace('../');
    }
  } catch (error) { showMessage(error.message || '요청에 실패했습니다.', true); }
  finally { submit.disabled = false; }
});
