// ============================================================
// 🌸 landing.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles landing screen logic and transitions
// ✦ Now transitions to profile screen on first click anywhere
// ============================================================

import { showScreen } from "../core/screens.js";

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initLanding() {
  const landing = document.getElementById("landing-screen");

  if (!landing) return;

  // 🌸 First click anywhere starts the game
  const handleClick = () => {
    landing.removeEventListener("click", handleClick); // prevent multiple triggers
    fadeOut(landing, () => showScreen("profile-screen"));
  };

  landing.addEventListener("click", handleClick);
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
