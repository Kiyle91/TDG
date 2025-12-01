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
} from "../save/saveSystem.js";

import { playFairySprinkle, playCancelSound } from "../core/soundtrack.js";
import { resumeGame } from "../screenManagement/ui.js";
import { showScreen } from "../screenManagement/screens.js";
import { gameState, saveProfiles } from "../utils/gameState.js";
import { ensureSkin } from "../screenManagement/skins.js";
import { setProfile } from "../utils/gameState.js";  // Ensure setProfile is imported

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
      loadBtn.addEventListener("click", () => {
        // Ensure correct profile is loaded
        setProfile(gameState.profiles[gameState.activeProfileIndex]);
        loadFromSlot(0);  // Load from slot 0 (autosave)
      });
      btnRow.appendChild(loadBtn);
    }

    slotEl.appendChild(titleEl);
    slotEl.appendChild(btnRow);
    container.appendChild(slotEl);
  }

  // ============================================================
  // ⭐ MANUAL SAVE SLOTS (Slots 1–9)
  // ============================================================
  for (let i = 1; i < 10; i++) {
    const summary = summaries[i];
    const slotEl = document.createElement("div");
    slotEl.className = "save-slot";

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

    const btnRow = document.createElement("div");
    btnRow.className = "save-slot-buttons";

    // Save/Overwrite
    if (allowSave) {
      const saveBtn = document.createElement("button");
      saveBtn.className = "save-btn";
      saveBtn.textContent = summary ? "Overwrite" : "Save";
      saveBtn.dataset.index = i;

      saveBtn.addEventListener("click", () => {
        // Ensure the correct profile is active before saving
        setProfile(gameState.profiles[gameState.activeProfileIndex]);
        saveToSlot(i);  // Save to the slot
        renderSlots(container, allowSave);
      });

      btnRow.appendChild(saveBtn);
    }

    // Load
    if (summary) {
      const loadBtn = document.createElement("button");
      loadBtn.className = "load-btn";
      loadBtn.textContent = "Load";
      loadBtn.dataset.index = i;
      loadBtn.addEventListener("click", () => {
        setProfile(gameState.profiles[gameState.activeProfileIndex]);
        loadFromSlot(i);  // Load from the selected slot
      });
      btnRow.appendChild(loadBtn);
    }

    // Delete
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
