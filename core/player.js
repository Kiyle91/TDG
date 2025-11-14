// ============================================================
// 👑 player.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Defines base player stats
// ✦ Name is now provided by the Profile system
// ============================================================

import { gameState } from "../utils/gameState.js";

export function createPlayer() {
  return {
    name: "",                     // ← filled from profile
    title: "",                    // optional, can be customized later

    skinId: "default",

    level: 1,
    xp: 0,
    statPoints: 0,

    hp: 100,
    maxHp: 100,

    mana: 50,
    maxMana: 50,

    spellPower: 10,
    rangedAttack: 10,
    attack: 15,
    defense: 5,
    critChance: 0.1,

    x: 0,
    y: 0,

    sprite: "./assets/sprites/glitter_guardian_default.png",
  };
}

// For runtime convenience
export function initPlayer() {
  gameState.player = createPlayer();
  console.log("👑 Player initialized.");
}

export function restorePlayer(savedPlayer) {
  if (!savedPlayer) return;
  gameState.player = { ...savedPlayer };
  console.log("💾 Player restored:", gameState.player.name);
}