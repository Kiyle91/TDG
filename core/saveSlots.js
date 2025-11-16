// ============================================================
// 💾 saveSlots.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Renders 10 save slots with Save / Load / Delete buttons
// Works for hub overlay + in-game save overlay
// ============================================================

import { saveProfiles, gameState } from "../utils/gameState.js";
import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { applyMapSpawn, resetCombatState } from "./game.js";

// Create empty save record if missing
function getOrCreateSaves() {
  if (!gameState.saves) {
    gameState.saves = Array(10).fill(null); // 10 slots
  }
  return gameState.saves;
}

// ============================================================
// 🧩 RENDER SAVE / LOAD SLOTS
// ============================================================
export function renderSlots(container, allowSave = false) {
  if (!container) return;

  const saves = getOrCreateSaves();
  container.innerHTML = ""; // reset

  saves.forEach((slot, i) => {
    const div = document.createElement("div");
    div.className = "save-slot";

    // Title
    const title = document.createElement("div");
    title.className = "save-slot-title";
    title.textContent = slot
      ? `Slot ${i + 1}: Level ${slot.level} — Map ${slot.map}`
      : `Empty Slot ${i + 1}`;

    // Button group
    const btns = document.createElement("div");
    btns.className = "save-slot-buttons";

    // --------------------------------------------------------
    // 💾 SAVE BUTTON (only in-game)
    // --------------------------------------------------------
    if (allowSave) {
      const saveBtn = document.createElement("button");
      saveBtn.className = "save-btn";
      saveBtn.textContent = "Save";

      saveBtn.onclick = () => {
        saveSlot(i);
        renderSlots(container, allowSave);
      };

      btns.appendChild(saveBtn);
    }

    // --------------------------------------------------------
    // ▶ LOAD BUTTON (if slot exists)
    // --------------------------------------------------------
    if (slot) {
      const loadBtn = document.createElement("button");
      loadBtn.className = "load-btn";
      loadBtn.textContent = "Load";

      loadBtn.onclick = () => {
        loadSlot(i);
      };

      btns.appendChild(loadBtn);
    }

    // --------------------------------------------------------
    // ❌ DELETE BUTTON
    // --------------------------------------------------------
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Delete";

    delBtn.onclick = () => {
      deleteSlot(i);
      renderSlots(container, allowSave);
    };

    btns.appendChild(delBtn);

    div.appendChild(title);
    div.appendChild(btns);
    container.appendChild(div);
  });
}

// ============================================================
// 💾 SAVE IMPLEMENTATION
// ============================================================
function saveSlot(index) {
  gameState.saves[index] = {
    level: gameState.player?.level ?? 1,
    map: gameState.currentMap ?? 1,
    gold: gameState.gold ?? 0,
    diamonds: gameState.diamonds ?? 0,
    player: structuredClone(gameState.player),
  };

  saveProfiles();
  console.log(`💾 Saved game to slot ${index + 1}`);
}

// ============================================================
// ▶ LOAD IMPLEMENTATION
// ============================================================
function loadSlot(index) {
  const slot = gameState.saves[index];
  if (!slot) return;

  console.log(`📂 Loading save slot ${index + 1}…`);

  // Restore player + base currencies
  gameState.player = structuredClone(slot.player);
  gameState.gold = slot.gold;
  gameState.diamonds = slot.diamonds;
  gameState.currentMap = slot.map;

  // Reset combat & spawn player on the correct map
  resetCombatState();
  applyMapSpawn();

  // Go to game screen
  showScreen("game-container");

  // Start gameplay correctly
  startGameplay();
}

// ============================================================
// ❌ DELETE IMPLEMENTATION
// ============================================================
function deleteSlot(index) {
  gameState.saves[index] = null;
  saveProfiles();
  console.log(`🗑 Deleted save slot ${index + 1}`);
}
