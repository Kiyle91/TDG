// ============================================================
// rewards.js — Wave-end bonuses and shared reward helpers
// ------------------------------------------------------------
// Adds shard bonuses based on enemies defeated per wave.
// ============================================================

import { gameState, addGold } from "./gameState.js";

// Track kills per wave (gameState-scoped)
export function incrementWaveKillCount() {
  gameState.waveKillCount = (gameState.waveKillCount || 0) + 1;
}

// Award 1 shard (gold) per 2 kills at wave end, capped at 100 total
export function addShardsForWaveBonus(updateHUDFn) {
  const kills = gameState.waveKillCount || 0;
  if (kills <= 0) return;

  const shards = Math.floor(kills / 2);
  if (shards <= 0) return;

  const profile = gameState.profile;
  if (!profile) return;

  const current = profile.currencies?.gold ?? 0; // gold is the shard currency
  const space = Math.max(0, 100 - current);
  if (space <= 0) return;

  const toGive = Math.min(space, shards);
  if (toGive > 0) {
    addGold(toGive);
    if (typeof updateHUDFn === "function") updateHUDFn();
  }
}

export function resetWaveKillCount() {
  gameState.waveKillCount = 0;
}
