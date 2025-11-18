// ============================================================
// 🌸 landing.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles landing screen logic and transitions
// ✦ First click anywhere transitions to Profile Select
// ============================================================
/* ------------------------------------------------------------
 * MODULE: landing.js
 * PURPOSE:
 *   Controls the behaviour of the Landing screen — the very
 *   first screen the player sees when launching the game.
 *
 * SUMMARY:
 *   This module listens for the first click anywhere on the
 *   landing screen and then gracefully transitions into the
 *   Profile Select screen using a soft fade animation.
 *
 * FEATURES:
 *   • initLanding() — enables one-time click-to-start
 *   • fadeOut() / fadeIn() — helper animations for transitions
 *
 * FLOW:
 *   User loads game → landing screen active →
 *   first click → fadeOut → showScreen("profile-screen")
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { showScreen } from "../core/screens.js";

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------

export function initLanding() {
  const landing = document.getElementById("landing-screen");
  if (!landing) return;

  const handleClick = () => {
    landing.removeEventListener("click", handleClick);
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
