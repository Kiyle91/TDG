// ============================================================
// 🌸 landing.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles landing screen logic and transitions
// ✦ Uses class-based screen management to prevent overlap
// ✦ Smooth fade to profile screen when player starts
// ============================================================

import { showScreen } from "../core/screens.js";

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initLanding() {
  const startBtn = document.getElementById("start-button");
  const landing = document.getElementById("landing-screen");

  if (!startBtn || !landing) return;

  // 🌸 Start Button Logic
  startBtn.addEventListener("click", () => {
    startBtn.disabled = true;
    startBtn.textContent = "Loading...";
    fadeOut(landing, () => showScreen("profile-screen"));
  });
}

// ------------------------------------------------------------
// 🌈 FADE HELPERS
// ------------------------------------------------------------
function fadeOut(element, callback) {
  element.style.transition = "opacity 0.8s ease";
  element.style.opacity = 0;

  setTimeout(() => {
    element.classList.remove("active");
    element.style.display = "none";
    if (callback) callback();
  }, 800);
}

function fadeIn(element) {
  element.style.display = "flex";
  element.style.opacity = 0;
  element.classList.add("active");
  element.style.transition = "opacity 0.8s ease";
  requestAnimationFrame(() => (element.style.opacity = 1));
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
