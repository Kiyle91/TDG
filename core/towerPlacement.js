// ============================================================
// 🏗️ towerPlacement.js — Olivia’s World: Crystal Keep (Full Multi-Turret System + Overlap Check)
// ------------------------------------------------------------
// ✦ Handles player-triggered tower placement (keys 1–6)
// ✦ Unlocks different turret types based on player level
// ✦ Deducts gold using profile currencies via spendGold()
// ✦ Uses addTower() to create turret instances
// ✦ Integrates sounds, floating text, and HUD updates
// ✦ 🆕 Spawns tower at player location, prevents overlap
// ============================================================

import { gameState, spendGold } from "../utils/gameState.js";
import { addTower, getTowers } from "./towers.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle, playCancelSound } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const TILE_SIZE = 64;
const TOWER_COST = 50;
const TOWER_RADIUS = 75;// 🛑 No other tower can be within this distance

// ✨ Unlock levels + metadata for each turret
const TOWER_UNLOCKS = {
  1: { name: "Crystal Defender", key: "basic_turret", unlock: 1, projectile: "crystal" },
  2: { name: "Frost Sentinel", key: "frost_turret", unlock: 6, projectile: "frost" },
  3: { name: "Flameheart", key: "flame_turret", unlock: 10, projectile: "flame" },
  4: { name: "Arcane Spire", key: "arcane_turret", unlock: 15, projectile: "arcane" },
  5: { name: "Beacon of Light", key: "light_turret", unlock: 20, projectile: "light" },
  6: { name: "Moonlight Aegis", key: "moon_turret", unlock: 25, projectile: "moon" },
};

// ------------------------------------------------------------
// 🧭 handleTowerKey()
// ------------------------------------------------------------
export function handleTowerKey(keyCode) {
  const num = parseInt(keyCode.replace("Digit", ""));
  if (num >= 1 && num <= 6) tryPlaceTower(num);
}

// ------------------------------------------------------------
// 🩵 tryPlaceTower()
// ------------------------------------------------------------
// Handles placement, unlock checks, cost, and spawn.
// Towers now spawn exactly where the player stands, unless blocked.
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

  // 🏗️ Determine spawn position (exactly at player)
  const spawnX = p.pos.x;
  const spawnY = p.pos.y;

  // 🧱 Prevent overlapping towers
  const towers = typeof getTowers === "function" ? getTowers() : [];
  const overlapping = towers.some(t => {
    const dx = t.x - spawnX;
    const dy = t.y - spawnY;
    return Math.hypot(dx, dy) < TOWER_RADIUS; // too close
  });

  if (overlapping) {
    spawnFloatingText(spawnX, spawnY - 40, "❌ Too close to another tower", "#ff7aa8");
    playCancelSound();
    console.warn("🧱 Tower placement blocked — overlap detected.");
    return;
  }

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
    console.log(`🏰 Placed ${towerData.name} at (${spawnX}, ${spawnY})`);
  } else {
    playCancelSound();
    console.warn("❌ spendGold() failed — possibly unsynced profile.");
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
