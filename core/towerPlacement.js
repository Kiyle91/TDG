// ============================================================
// 🏗️ towerPlacement.js — Olivia’s World: Crystal Keep (Profile Gold Integration)
// ------------------------------------------------------------
// ✦ Handles player-triggered tower placement (press 1 key)
// ✦ Unlocks Crystal Defender at Level 2
// ✦ Costs 50 gold (from profile.currencies.gold)
// ✦ Uses spendGold() for persistence + HUD sync
// ============================================================

import { gameState, spendGold } from "../utils/gameState.js";
import { addTower } from "./towers.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle, playCancelSound } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

const CRYSTAL_DEFENDER_COST = 50;
const CRYSTAL_DEFENDER_UNLOCK_LEVEL = 2;
const TILE_SIZE = 64;

// ------------------------------------------------------------
// 🩵 Attempt to place a tower
// ------------------------------------------------------------
export function tryPlaceTower() {
  const p = gameState.player;
  if (!p) return;

  // 🔒 Unlock requirement
  if ((p.level || 1) < CRYSTAL_DEFENDER_UNLOCK_LEVEL) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, "Locked!", "#ff7aa8");
    playCancelSound();
    console.log("🔒 Tower locked — reach level 2 to unlock Crystal Defender.");
    return;
  }

  // 💰 Check gold using profile currencies
  const gold = gameState.profile?.currencies?.gold ?? 0;
  if (gold < CRYSTAL_DEFENDER_COST) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, "Not enough gold", "#ff7aa8");
    playCancelSound();
    console.log(`💰 Not enough gold (${gold}/${CRYSTAL_DEFENDER_COST}).`);
    return;
  }

  // 🏗️ Determine spawn position (1 tile to the right for now)
  const spawnX = p.pos.x + TILE_SIZE;
  const spawnY = p.pos.y;

  // ✅ Create the tower
  addTower({
    name: "Crystal Defender",
    type: "basic_turret",
    projectileType: "crystal",
    x: spawnX,
    y: spawnY,
  });

  // 💸 Deduct gold via helper for persistence
  const success = spendGold(CRYSTAL_DEFENDER_COST);
  if (success) {
    updateHUD();
    spawnFloatingText(spawnX, spawnY - 40, "-50 G", "#ffd6eb");
    playFairySprinkle();
    console.log(
      `🏰 Placed Crystal Defender! Remaining gold: ${
        gameState.profile.currencies.gold
      }`
    );
  } else {
    playCancelSound();
    console.warn("❌ spendGold() failed — possibly unsynced profile.");
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
