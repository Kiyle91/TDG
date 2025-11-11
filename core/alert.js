// ============================================================
// 🌸 alert.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Custom pastel alert, confirm, and input modals
// ✦ Plays Fairy Sparkle (OK/Yes) and Cancel SFX (No/Cancel)
// ============================================================

import { playFairySprinkle, playCancelSound } from "./soundtrack.js";

let modal = null;

// ------------------------------------------------------------
// 🌷 CREATE MODAL CONTAINER
// ------------------------------------------------------------
function createModal() {
  modal = document.createElement("div");
  modal.id = "ow-alert-modal";
  modal.innerHTML = `
    <div class="ow-alert-box">
      <p id="ow-alert-text"></p>
      <div id="ow-alert-extra"></div>
      <div class="ow-alert-actions">
        <button id="ow-alert-ok" class="ow-alert-btn ok">OK</button>
        <button id="ow-alert-cancel" class="ow-alert-btn cancel">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ------------------------------------------------------------
// 💖 SHOW ALERT (simple OK dialog)
// ------------------------------------------------------------
export function showAlert(message, callback = null) {
  if (!modal) createModal();

  const text = modal.querySelector("#ow-alert-text");
  const extra = modal.querySelector("#ow-alert-extra");
  const ok = modal.querySelector("#ow-alert-ok");
  const cancel = modal.querySelector("#ow-alert-cancel");

  text.textContent = message;
  extra.innerHTML = "";
  cancel.style.display = "none";
  ok.textContent = "OK";

  modal.style.display = "flex";
  ok.onclick = () => {
    playFairySprinkle();
    modal.style.display = "none";
    if (callback) callback();
  };
}

// ------------------------------------------------------------
// 🌺 SHOW CONFIRM (yes/no dialog) — Crystal Overlay Edition
// ------------------------------------------------------------
export function showConfirm(message, onYes, onNo = null) {
  if (!modal) createModal();

  const text = modal.querySelector("#ow-alert-text");
  const extra = modal.querySelector("#ow-alert-extra");
  const ok = modal.querySelector("#ow-alert-ok");
  const cancel = modal.querySelector("#ow-alert-cancel");
  const box = modal.querySelector(".ow-alert-box");

  // Apply unified crystal styling
  box.classList.add("confirm-box");
  text.classList.add("confirm-message");
  ok.classList.add("confirm-btn", "yes");
  cancel.classList.add("confirm-btn", "no");

  // Message setup
  text.textContent = message;
  extra.innerHTML = "";
  cancel.style.display = "inline-flex";
  ok.textContent = "Yes";
  cancel.textContent = "No";

  // Show modal
  modal.style.display = "flex";

  // 🎵 Click sounds + callbacks
  ok.onclick = () => {
    playFairySprinkle();
    modal.style.display = "none";
    if (onYes) onYes();
  };

  cancel.onclick = () => {
    playCancelSound();
    modal.style.display = "none";
    if (onNo) onNo();
  };
}


// ------------------------------------------------------------
// 🌷 SHOW INPUT (custom name entry / text prompt)
// ------------------------------------------------------------
export function showInput(message, onSubmit, placeholder = "Type here...") {
  if (!modal) createModal();

  const text = modal.querySelector("#ow-alert-text");
  const extra = modal.querySelector("#ow-alert-extra");
  const ok = modal.querySelector("#ow-alert-ok");
  const cancel = modal.querySelector("#ow-alert-cancel");

  text.textContent = message;
  extra.innerHTML = `
    <input id="ow-alert-input" class="ow-alert-input" type="text" placeholder="${placeholder}" />
  `;
  cancel.style.display = "inline-flex";
  ok.textContent = "OK";
  cancel.textContent = "Cancel";

  modal.style.display = "flex";

  const input = modal.querySelector("#ow-alert-input");
  input.focus();

  ok.onclick = () => {
    playFairySprinkle();
    const value = input.value.trim();
    modal.style.display = "none";
    if (value && onSubmit) onSubmit(value);
  };

  cancel.onclick = () => {
    playCancelSound();
    modal.style.display = "none";
  };
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
