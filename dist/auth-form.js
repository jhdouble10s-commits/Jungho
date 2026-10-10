import {
  accessMessages,
  signInApproved,
  signUpPending
} from "./chunks/chunk-ITRHU4VH.js";
import {
  client
} from "./chunks/chunk-VXYETN7S.js";
import "./chunks/chunk-XCBH6NLF.js";

// auth-form.js
var form = document.querySelector("#loginForm, #signupForm");
var message = document.querySelector(".message");
var submit = form.querySelector(".submit");
var password = form.querySelector("[name=password]");
var toggle = form.querySelector(".toggle");
var showMessage = (text, error = false) => {
  message.textContent = text;
  message.classList.toggle("error", error);
};
var reason = new URLSearchParams(location.search).get("reason");
if (reason) showMessage(accessMessages[reason] || accessMessages.unavailable, true);
toggle?.addEventListener("click", () => {
  const shown = password.type === "text";
  password.type = shown ? "password" : "text";
  toggle.textContent = shown ? "\uBCF4\uAE30" : "\uC228\uAE30\uAE30";
  toggle.setAttribute("aria-label", shown ? "\uBE44\uBC00\uBC88\uD638 \uD45C\uC2DC" : "\uBE44\uBC00\uBC88\uD638 \uC228\uAE30\uAE30");
});
var confirmation = form.querySelector("[name=passwordConfirm]");
var validateConfirmation = () => confirmation?.setCustomValidity(
  confirmation.value === password.value ? "" : "\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
);
confirmation?.addEventListener("input", validateConfirmation);
password.addEventListener("input", validateConfirmation);
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  const fields = new FormData(form);
  submit.disabled = true;
  showMessage(form.id === "signupForm" ? "\uD68C\uC6D0\uAC00\uC785 \uC911\u2026" : "\uB85C\uADF8\uC778 \uC911\u2026");
  try {
    if (form.id === "signupForm") {
      const data = await signUpPending(client, {
        email: fields.get("email"),
        password: fields.get("password"),
        passwordConfirm: fields.get("passwordConfirm"),
        displayName: fields.get("displayName")
      });
      form.reset();
      showMessage(`${accessMessages.pending}${data.session ? "" : " \uC774\uBA54\uC77C \uD655\uC778 \uC548\uB0B4\uB97C \uBC1B\uC73C\uC168\uB2E4\uBA74 \uD655\uC778\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694."}`);
    } else {
      await signInApproved(client, fields.get("username"), fields.get("password"));
      location.replace("../");
    }
  } catch (error) {
    showMessage(error.message || "\uC694\uCCAD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.", true);
  } finally {
    submit.disabled = false;
  }
});
