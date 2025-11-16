// ============================================================
// 💾 saveSlots.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Renders 10 save slots into any container
// ✦ Save / Load / Delete support
// ✦ FULLY FIXED: loads correct map when loading in-game
// ============================================================

import {
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  getSlotSummaries,
  applySnapshot
} from "./saveSystem.js";

import { playFairySprinkle, playCancelSound } from "./soundtrack.js";

// FIXED: showScreen comes from screens.js, not ui.js
import { resumeGame } from "./ui.js";
import { showScreen } from "./screens.js";

import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// 🧱 RENDER SLOTS
// ------------------------------------------------------------
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

    // --------------------------------------------------------
    // TITLE
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
        `${summary.profileName} — Map ${summary.map}, ` +
        `Wave ${summary.wave}, Lv ${summary.level} ` +
        `(${summary.gold}💰 / ${summary.diamonds}💎) — ${timeStr}`;
    }

    // --------------------------------------------------------
    // BUTTON ROW
    // --------------------------------------------------------
    const btnRow = document.createElement("div");
    btnRow.className = "save-slot-buttons";

    // ========================================================
    // SAVE / OVERWRITE (in-game only)
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
          console.error("💾 Save failed:", err);
        }
      });

      btnRow.appendChild(saveBtn);
    }

    // ========================================================
    // LOAD BUTTON (Hub & Navbar)
    // ========================================================
    if (summary) {
      const loadBtn = document.createElement("button");
      loadBtn.className = "load-btn";
      loadBtn.textContent = "Load";
      loadBtn.dataset.index = i;

      loadBtn.addEventListener("click", async () => {
        playFairySprinkle();

        try {
          // 1️⃣ Read snapshot
          const snap = loadFromSlot(i);
          if (!snap) return;

          console.log("💾 [NAVBAR] Loaded snapshot:", snap);

          // 2️⃣ Set correct map BEFORE initGame()
          if (snap.progress?.currentMap) {
            gameState.progress.currentMap = snap.progress.currentMap;
          }

          // 3️⃣ Switch to game screen
          showScreen("game-container");

          // 4️⃣ FULL game reinit
          const gameMod = await import("./game.js");
          await gameMod.initGame();

          // 5️⃣ Apply snapshot (player, towers, enemies, etc)
          applySnapshot(snap);

          // 6️⃣ Resume gameplay loop
          resumeGame();

        } catch (err) {
          console.error("💾 Load failed:", err);
        }

        // 7️⃣ Close navbar save overlay if present
        const overlay = document.getElementById("overlay-save-game");
        if (overlay) {
          overlay.classList.remove("active");
          overlay.style.display = "none";
        }
      });

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
    // Assemble slot
    // --------------------------------------------------------
    slotEl.appendChild(titleEl);
    slotEl.appendChild(btnRow);
    container.appendChild(slotEl);
  }
}
