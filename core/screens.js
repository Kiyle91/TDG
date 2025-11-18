// ============================================================
// 🌸 screens.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Unified screen switching logic
// ✦ Ensures only one screen is visible at a time
// ✦ Smooth pastel fade-in effect
// ============================================================
/* ------------------------------------------------------------
 * MODULE: screens.js
 * PURPOSE:
 *   Provides a unified method for switching between major UI
 *   screens (Landing, Profile, Hub, Game, Credits, etc). This
 *   module ensures that only one `.screen` element is visible
 *   at any time, with a smooth fade-in transition.
 *
 * SUMMARY:
 *   • showScreen(id) — hides all screens and fades in the target.
 *   • Relies on `.screen` class for all high-level screen nodes.
 *   • Fully compatible with overlays, hub transitions, and
 *     story/UI systems.
 *
 * FEATURES:
 *   • Centralized screen visibility control
 *   • .active class maintained consistently
 *   • CSS-friendly fade animation (0.8s pastel fade)
 *
 * TECHNICAL NOTES:
 *   • This function should be called BEFORE gameplay init when
 *     loading maps or restoring snapshots.
 *   • Displays screens using flex layout for consistent centering.
 * ------------------------------------------------------------ */


export function showScreen(id) {
  const screens = document.querySelectorAll(".screen");

  screens.forEach((s) => {
    s.classList.remove("active");
    s.style.display = "none";
  });

  const next = document.getElementById(id);
  if (!next) return;

  next.classList.add("active");
  next.style.display = "flex";
  next.style.opacity = 0;
  next.style.transition = "opacity 0.8s ease";

  requestAnimationFrame(() => {
    next.style.opacity = 1;
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
