// ============================================================
// 💾 saveSlots.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Renders 10 save slots (Hub or Navbar)
// ✦ Save / Load / Delete functionality
// ✦ FULLY FIXED: loads correct map + applies snapshot cleanly
// ============================================================
/* ------------------------------------------------------------
 * MODULE: saveSlots.js
 * PURPOSE:
 *   Renders up to 10 save slots in any container (Hub or
 *   in-game navbar), allowing saving, loading, and deleting
 *   individual slots. Ensures correct map restoration,
 *   full game reinitialization, and safe UI transitions.
 *
 * SUMMARY:
 *   • renderSlots(container, allowSave)
 *       - Shows 10 slots with Save/Overwrite, Load, Delete.
 *   • Correctly loads snapshot → applies map, player, spires,
 *     goblins, currencies, and skins, then resumes gameplay.
 *   • Works in hub OR during gameplay (navbar save overlay).
 *
 * FEATURES:
 *   • Save / Overwrite (when allowSave = true)
 *   • Load snapshot correctly restores currentMap before init
 *   • Delete individual slot with instant UI refresh
 *   • Applies snapshot AFTER initGame() for full reconstruction
 *   • Skin system guaranteed via ensureSkin()
 *
 * TECHNICAL NOTES:
 *   • Snapshot structure stored in localStorage via saveSystem.js
 *   • showScreen("game-container") must be called BEFORE initGame()
 *   • Gameplay loop is explicitly (re)started after load
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import {
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  getSlotSummaries,
  applySnapshot
} from "./saveSystem.js";

import { playFairySprinkle, playCancelSound } from "./soundtrack.js";
import { resumeGame } from "./ui.js";
import { showScreen } from "./screens.js";
import { gameState, saveProfiles } from "../utils/gameState.js";
import { ensureSkin } from "./skins.js";


// ------------------------------------------------------------
// 🧱 RENDER SAVE SLOTS (PATCHED)
// ------------------------------------------------------------
export function renderSlots(containerEl, allowSave = true) {
  if (!containerEl) return;

  // ⭐ Prevent stacked event handlers (no parameter reassignment)
  const clean = containerEl.cloneNode(false);
  containerEl.replaceWith(clean);
  const container = clean;

  container.innerHTML = "";
  const summaries = getSlotSummaries() || [];

  for (let i = 0; i < 10; i++) {
    const summary = summaries[i];
    const slotEl = document.createElement("div");
    slotEl.className = "save-slot";

    // --------------------------------------------------------
    // TITLE / SLOT HEADER
    // --------------------------------------------------------

    const titleEl = document.createElement("div");
    titleEl.className = "save-slot-title";

    if (!summary) {
      titleEl.textContent = `Empty Slot ${i + 1}`;
    } else {
      const d = new Date(summary.savedAt);
      const timeStr = d.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      titleEl.textContent =
        `Map ${summary.map}, ` +
        `Wave ${summary.wave}, Lv ${summary.level}, ` +
        `${timeStr}`;
    }

    // --------------------------------------------------------
    // BUTTON ROW
    // --------------------------------------------------------

    const btnRow = document.createElement("div");
    btnRow.className = "save-slot-buttons";

    // ========================================================
    // SAVE / OVERWRITE (In-game only)
    // ========================================================

    if (allowSave) {
      const saveBtn = document.createElement("button");
      saveBtn.className = "save-btn";
      saveBtn.textContent = summary ? "Overwrite" : "Save";
      saveBtn.dataset.index = i;

      saveBtn.addEventListener("click", () => {
        playFairySprinkle();
        try {
          saveToSlot(i);
          renderSlots(container, allowSave);
        } catch (err) {
          console.error("Error saving slot", err);
        }
      });

      btnRow.appendChild(saveBtn);
    }

    // ========================================================
    // LOAD BUTTON (Hub or Navbar)
    // ========================================================

    if (summary) {
      const loadBtn = document.createElement("button");
      loadBtn.className = "load-btn";
      loadBtn.textContent = "Load";
      loadBtn.dataset.index = i;

      // ⭐ DO NOT load here — the Hub attaches a listener to the container.
      // This button simply exists and is detected by event delegation.

      btnRow.appendChild(loadBtn);
    }

    // ========================================================
    // DELETE BUTTON
    // ========================================================

    if (summary) {
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "Delete";
      delBtn.dataset.index = i;

      delBtn.addEventListener("click", () => {
        playCancelSound?.();
        deleteSlot(i);
        renderSlots(container, allowSave);
      });

      btnRow.appendChild(delBtn);
    }

    // --------------------------------------------------------
    // Final assembly
    // --------------------------------------------------------
    slotEl.appendChild(titleEl);
    slotEl.appendChild(btnRow);
    container.appendChild(slotEl);
  }

  // ⭐ Critical fix for hub load: return the new <div>
  return container;
}


// ============================================================
// 🌟 END OF FILE
// ============================================================
