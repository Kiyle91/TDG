// ============================================================
// 🌸 alert.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Custom pastel alert, confirm, and input modals
// ✦ Fairy Sprinkle (OK/Yes) and Cancel SFX
// ✦ Cleaned for production (no internal debug logs)
// ============================================================
/* ------------------------------------------------------------
 * MODULE: alert.js
 * PURPOSE:
 *   Provides a unified system for displaying custom modal
 *   interactions to the player, including alerts, confirmation
 *   prompts, and text input requests.
 *
 * SUMMARY:
 *   This module injects a reusable pastel-themed modal component
 *   into the DOM (once only), and exposes clean functions that
 *   open each type of user prompt with the appropriate buttons
 *   and inputs. All modals pause the game visually and use the
 *   game's Fairy Sprinkle and Cancel audio cues.
 *
 * FEATURES:
 *   • showAlert()  — simple OK modal
 *   • showConfirm() — Yes/No branching modal
 *   • showInput() — text field modal with callback
 *   • Automatic DOM creation + cleanup
 *   • Fully theme-consistent pastel UI
 *
 * NOTES:
 *   No gameplay state is affected directly — only callbacks
 *   provided by callers define behaviour.
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { playFairySprinkle, playCancelSound } from "../core/soundtrack.js";

// ------------------------------------------------------------
// 🗺️ MODULE-LEVEL VARIABLES
// ------------------------------------------------------------

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

function resetAlertButtons() {
  if (!modal) return;

  const ok = modal.querySelector("#ow-alert-ok");
  const cancel = modal.querySelector("#ow-alert-cancel");

  // Restore normal displays (JS will hide/show depending on modal type)
  ok.style.display = "inline-flex";
  cancel.style.display = "inline-flex";
}

// ------------------------------------------------------------
// 💖 SHOW ALERT
// ------------------------------------------------------------

export function showAlert(message, callback = null) {
  if (!modal) createModal();
  resetAlertButtons();

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
// 🌺 SHOW CONFIRM
// ------------------------------------------------------------

export function showConfirm(message, onYes, onNo = null, options = {}) {
  if (!modal) createModal();
  resetAlertButtons();

  const text = modal.querySelector("#ow-alert-text");
  const extra = modal.querySelector("#ow-alert-extra");
  const ok = modal.querySelector("#ow-alert-ok");
  const cancel = modal.querySelector("#ow-alert-cancel");
  const box = modal.querySelector(".ow-alert-box");

  const variant = options.variant || "default";

  // reset variant-specific styling
  modal.classList.remove("danger");
  box.classList.remove("confirm-danger");
  text.classList.remove("confirm-danger-text");
  ok.classList.remove("danger");
  cancel.classList.remove("danger");

  box.classList.add("confirm-box");
  text.classList.add("confirm-message");
  ok.classList.add("confirm-btn", "yes");
  cancel.classList.add("confirm-btn", "no");

  if (variant === "danger") {
    modal.classList.add("danger");
    box.classList.add("confirm-danger");
    text.classList.add("confirm-danger-text");
    ok.classList.add("danger");
    cancel.classList.add("danger");
  }

  text.textContent = message;
  extra.innerHTML = "";
  cancel.style.display = "inline-flex";
  ok.textContent = "Yes";
  cancel.textContent = "No";

  modal.style.display = "flex";

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
// 🌷 SHOW INPUT
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

export function showDifficultySelect(onSelect) {
  if (!modal) createModal();

  const text = modal.querySelector("#ow-alert-text");
  const extra = modal.querySelector("#ow-alert-extra");
  const ok = modal.querySelector("#ow-alert-ok");
  const cancel = modal.querySelector("#ow-alert-cancel");

  // Title
  text.textContent = "Choose your difficulty:";

  // Hide both OK and Cancel for this modal
  ok.style.display = "none";
  cancel.style.display = "none";

  // Difficulty buttons container
  extra.innerHTML = `
    <div class="difficulty-select">
      <button class="diff-btn" data-diff="easy">Easy</button>
      <button class="diff-btn" data-diff="normal">Normal</button>
      <button class="diff-btn" data-diff="hard">Hard</button>
    </div>
  `;

  modal.style.display = "flex";

  // Click handlers for each difficulty option
  extra.querySelectorAll(".diff-btn").forEach(btn => {
    btn.onclick = () => {
      const diff = btn.dataset.diff;
      playFairySprinkle();
      modal.style.display = "none";
      if (onSelect) onSelect(diff);
    };
  });
}



// ============================================================
// 🌟 END OF FILE
// ============================================================
