// ============================================================
// 💾 saveSlots.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Renders 10 save slots into any container
// ✦ Each slot: Save / Load / Delete (if occupied)
// ✦ Designed for the in-game navbar "💾" overlay
// ============================================================

import {
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  getSlotSummaries,
} from "./saveSystem.js";

import { playFairySprinkle, playCancelSound } from "./soundtrack.js";
import { resumeGame } from "./ui.js";

// ------------------------------------------------------------
// 🧱 RENDER SLOTS
// ------------------------------------------------------------
// container: DOM node (e.g. #save-slots-ingame)
// allowSave: keep this signature for navbar.js, but we treat it as in-game mode
export function renderSlots(container, allowSave = true) {
  if (!container) {
    console.warn("💾 renderSlots: no container provided.");
    return;
  }

  container.innerHTML = "";

  const summaries = getSlotSummaries() || [];

  for (let i = 0; i < 10; i++) {
    const summary = summaries[i];
    const slotEl = document.createElement("div");
    slotEl.className = "save-slot";

    // ----- title -----
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
        `${summary.profileName} — Map ${summary.map}, ` +
        `Wave ${summary.wave}, Lv ${summary.level} ` +
        `(${summary.gold}💰 / ${summary.diamonds}💎) — ${timeStr}`;
    }

    // ----- buttons -----
    const btnRow = document.createElement("div");
    btnRow.className = "save-slot-buttons";

    // SAVE / OVERWRITE (in-game)
    if (allowSave) {
      const saveBtn = document.createElement("button");
      saveBtn.className = "save-btn";
      saveBtn.textContent = summary ? "Overwrite" : "Save";

      // ⭐ ADD THIS
      saveBtn.dataset.index = i;

      saveBtn.addEventListener("click", () => {
        playFairySprinkle();
        try {
          saveToSlot(i);
          renderSlots(container, allowSave);
        } catch (err) {
          console.error("💾 Save failed:", err);
        }
      });

      btnRow.appendChild(saveBtn);
    }

    // LOAD (only if something saved)
    if (summary) {
      const loadBtn = document.createElement("button");
      loadBtn.className = "load-btn";
      loadBtn.textContent = "Load";

      // ⭐ ADD THIS
      loadBtn.dataset.index = i;

      loadBtn.addEventListener("click", () => {
        playFairySprinkle();
        try {
          const snap = loadFromSlot(i);
          console.log("💾 Loaded snapshot from slot", i, snap);
        } catch (err) {
          console.error("💾 Load failed:", err);
        }

        const overlay = document.getElementById("overlay-save-game");
        if (overlay) {
          overlay.classList.remove("active");
          overlay.style.display = "none";
        }

        resumeGame();
      });

      btnRow.appendChild(loadBtn);
    }

    // DELETE (if occupied)
    if (summary) {
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "Delete";

      // ⭐ ADD THIS
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
}
