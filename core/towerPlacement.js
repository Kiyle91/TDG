// ============================================================
// 🏗️ towerPlacement.js — Olivia’s World: Crystal Keep (Full Multi-Turret System)
// ------------------------------------------------------------
// ✦ Handles player-triggered tower placement (keys 1–6)
// ✦ Unlocks different turret types based on player level
// ✦ Deducts gold using profile currencies via spendGold()
// ✦ Uses addTower() to create turret instances
// ✦ Integrates sounds, floating text, and HUD updates
// ============================================================

import { gameState, spendGold } from "../utils/gameState.js";
import { addTower } from "./towers.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle, playCancelSound } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const TILE_SIZE = 64;
const TOWER_COST = 50;

// ✨ Unlock levels + metadata for each turret
const TOWER_UNLOCKS = {
  1: { name: "Crystal Defender", key: "basic_turret", unlock: 2, projectile: "crystal" },
  2: { name: "Frost Sentinel", key: "frost_turret", unlock: 6, projectile: "frost" },
  3: { name: "Flameheart", key: "flame_turret", unlock: 10, projectile: "flame" },
  4: { name: "Arcane Spire", key: "arcane_turret", unlock: 15, projectile: "arcane" },
  5: { name: "Beacon of Light", key: "light_turret", unlock: 20, projectile: "light" },
  6: { name: "Moonlight Aegis", key: "moon_turret", unlock: 25, projectile: "moon" },
};

// ------------------------------------------------------------
// 🧭 handleTowerKey()
// ------------------------------------------------------------
// Called from playerController.js when key 1–6 pressed.
// ------------------------------------------------------------
export function handleTowerKey(keyCode) {
  const num = parseInt(keyCode.replace("Digit", ""));
  if (num >= 1 && num <= 6) tryPlaceTower(num);
}

// ------------------------------------------------------------
// 🩵 tryPlaceTower()
// ------------------------------------------------------------
// Handles placement, unlock checks, cost, and spawn.
// ------------------------------------------------------------
function tryPlaceTower(num) {
  const p = gameState.player;
  if (!p || !gameState.profile) return;

  const towerData = TOWER_UNLOCKS[num];
  if (!towerData) return;

  // 🔒 Check level unlock
  if ((p.level || 1) < towerData.unlock) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, `Locked — Lvl ${towerData.unlock}`, "#ff7aa8");
    playCancelSound();
    console.log(`🔒 ${towerData.name} locked until level ${towerData.unlock}.`);
    return;
  }

  // 💰 Check gold (profile currencies)
  const gold = gameState.profile?.currencies?.gold ?? 0;
  if (gold < TOWER_COST) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, "Not enough gold", "#ff7aa8");
    playCancelSound();
    console.log(`💰 Not enough gold (${gold}/${TOWER_COST}).`);
    return;
  }

  // 🏗️ Determine spawn position (right tile for now)
  const spawnX = p.pos.x + TILE_SIZE;
  const spawnY = p.pos.y;

  // 🏰 Create the new tower instance
  addTower({
    name: towerData.name,
    type: towerData.key,
    projectileType: towerData.projectile,
    x: spawnX,
    y: spawnY,
  });

  // 💸 Deduct gold & refresh HUD
  const success = spendGold(TOWER_COST);
  if (success) {
    updateHUD();
    spawnFloatingText(spawnX, spawnY - 40, `-${TOWER_COST} G`, "#ffd6eb");
    playFairySprinkle();
    console.log(`🏰 Placed ${towerData.name}!`);
  } else {
    playCancelSound();
    console.warn("❌ spendGold() failed — possibly unsynced profile.");
  }
}

// ============================================================