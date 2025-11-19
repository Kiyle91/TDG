// ============================================================
// 💾 saveSlots.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Renders 10 save slots (Hub or Navbar)
// ✦ Autosave (Slot 0) + Manual Saves (Slots 1–9)
// ✦ Save / Load / Delete functionality
// ✦ Fully compatible with continue button + autosave
// ============================================================

/* ------------------------------------------------------------
 * MODULE: saveSlots.js
 * PURPOSE:
 *   Renders up to 10 save slots (Autosave + Manual Saves).
 *   Ensures correct map restoration, safe UI transitions,
 *   and fully integrates with continue button logic.
 *
 * STRUCTURE:
 *   Slot 0 = Autosave (Game triggers automatically)
 *   Slots 1–9 = Manual saves
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
// 🧱 RENDER SAVE SLOTS
// ------------------------------------------------------------
export function renderSlots(containerEl, allowSave = true) {
  if (!containerEl) return;

  // ⭐ Prevent duplicated event handlers
  const clean = containerEl.cloneNode(false);
  containerEl.replaceWith(clean);
  const container = clean;

  container.innerHTML = "";
  const summaries = getSlotSummaries() || [];

  // ============================================================
  // ⭐ AUTOSAVE BLOCK (Slot 0)
  // ============================================================
  {
    const summary = summaries[0];
    const slotEl = document.createElement("div");
    slotEl.className = "save-slot save-slot-auto";

    const titleEl = document.createElement("div");
    titleEl.className = "save-slot-title auto-title";

    if (!summary) {
      titleEl.textContent = "AUTO SAVE — Empty";
    } else {
      const d = new Date(summary.savedAt);
      const timeStr = d.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      titleEl.textContent =
        `AUTO SAVE — Map ${summary.map}, ` +
        `Wave ${summary.wave}, Lv ${summary.level}, ` +
        `${timeStr}`;
    }

    const btnRow = document.createElement("div");
    btnRow.className = "save-slot-buttons";

    // Autosave is LOAD-ONLY
    if (summary) {
      const loadBtn = document.createElement("button");
      loadBtn.className = "load-btn";
      loadBtn.textContent = "Load";
      loadBtn.dataset.index = 0;
      btnRow.appendChild(loadBtn);
    }

    slotEl.appendChild(titleEl);
    slotEl.appendChild(btnRow);
    container.appendChild(slotEl);
  }

  // ============================================================
  // ⭐ HEADER: MANUAL SAVES (Slots 1–9)
  // ============================================================
  const header = document.createElement("h3");
  header.className = "save-header";
  header.textContent = "Manual Saves";
  container.appendChild(header);

  // ============================================================
  // ⭐ MANUAL SAVE SLOTS 1–9
  // ============================================================
  for (let i = 1; i < 10; i++) {
    const summary = summaries[i];
    const slotEl = document.createElement("div");
    slotEl.className = "save-slot";

    // -----------------------------
    // TITLE
    // -----------------------------
    const titleEl = document.createElement("div");
    titleEl.className = "save-slot-title";

    if (!summary) {
      titleEl.textContent = `Empty Slot ${i}`;
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

    // -----------------------------
    // BUTTONS
    // -----------------------------
    const btnRow = document.createElement("div");
    btnRow.className = "save-slot-buttons";

    // SAVE/OVERWRITE
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

    // LOAD
    if (summary) {
      const loadBtn = document.createElement("button");
      loadBtn.className = "load-btn";
      loadBtn.textContent = "Load";
      loadBtn.dataset.index = i;
      btnRow.appendChild(loadBtn);
    }

    // DELETE
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

    slotEl.appendChild(titleEl);
    slotEl.appendChild(btnRow);
    container.appendChild(slotEl);
  }

  return container;
}


// ============================================================
// 🌟 END OF FILE
// ============================================================
