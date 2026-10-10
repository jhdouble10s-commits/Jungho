// startup-screen.js
function showStartupPhase(phase) {
  const screen = document.querySelector("#accessMessage");
  if (!screen || screen.dataset.phase === "error" && phase !== "error") return;
  screen.dataset.phase = phase;
  const failed = phase === "error";
  screen.querySelector(".startup-status").setAttribute("role", failed ? "alert" : "status");
  screen.querySelector(".startup-title").textContent = failed ? "\uD3B8\uC9D1\uAE30\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4." : "\uC791\uC5C5\uC2E4\uC744 \uC5F4\uACE0 \uC788\uC5B4\uC694";
  screen.querySelector(".startup-description").textContent = failed ? "\uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uD655\uC778\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694." : "\uC791\uC5C5 \uACF5\uAC04\uC744 \uC900\uBE44\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694.";
  const retry = screen.querySelector(".startup-retry");
  retry.hidden = !failed;
  if (failed) retry.href = location.href;
}

export {
  showStartupPhase
};
