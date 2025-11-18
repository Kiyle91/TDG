// ============================================================
// 🎬 credits.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles credits screen setup + navigation back to hub
// ✦ Triggered automatically upon completing Map 9
// ============================================================
/* ------------------------------------------------------------
 * MODULE: credits.js
 * PURPOSE:
 *   Controls the Credits screen flow after completing Map 9.
 *
 * SUMMARY:
 *   This module provides two exported functions used by the
 *   campaign system: one to initialise the credits screen UI
 *   (including its Back button) and one to display the credits
 *   once the final map is completed.
 *
 * FEATURES:
 *   • initCredits() — binds the "Back to Hub" button
 *   • showCredits() — displays the credits screen UI
 *
 * FLOW:
 *   Map 9 victory → campaign logic → showCredits()
 *   Back button → return to hub → re-initialize hub systems
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { showScreen } from "./screens.js";
import { initHub } from "./hub.js";

// ------------------------------------------------------------
// 🎞️ INITIALIZE CREDITS SCREEN
// ------------------------------------------------------------
export function initCredits() {
  const btn = document.getElementById("credits-back-btn");
  if (!btn) return;

  btn.onclick = () => {
    showScreen("hub-screen");
    setTimeout(() => initHub(), 50);
  };
}

// ------------------------------------------------------------
// 🎉 DISPLAY CREDITS (used after Map 9 victory)
// ------------------------------------------------------------
export function showCredits() {
  showScreen("credits-screen");
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
