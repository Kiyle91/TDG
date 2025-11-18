// ============================================================
// 👑 player.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Defines base player stats template
// ✦ Name/title injected from Profile system
// ✦ Supports init + save-slot restoration
// ============================================================
/* ------------------------------------------------------------
 * MODULE: player.js
 * PURPOSE:
 *   Provides creation, initialization, and restoration of the
 *   player's core stats. The profile system supplies the
 *   player's name; this module strictly defines base stats and
 *   handles assignment into gameState.
 *
 * SUMMARY:
 *   createPlayer() returns the default player template. 
 *   initPlayer() installs a fresh player object into gameState.
 *   restorePlayer() restores a saved snapshot into gameState.
 *
 * FEATURES:
 *   • createPlayer() — base stats for a new character
 *   • initPlayer() — installs fresh player (used by new story)
 *   • restorePlayer() — merges saved data back into runtime
 *
 * TECHNICAL NOTES:
 *   • Stats are tuned for early-game balancing
 *   • Name/title fields are set by profile creation flow
 *   • Skin and sprite assignment align with skins.js
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// 🎀 CREATE NEW PLAYER OBJECT
// ------------------------------------------------------------

export function createPlayer() {
  return {
    name: "",
    title: "",

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

// ------------------------------------------------------------
// 🌸 INITIALIZE NEW PLAYER
// ------------------------------------------------------------

export function initPlayer() {
  gameState.player = createPlayer();
}

// ------------------------------------------------------------
// 💾 RESTORE PLAYER FROM SAVE SLOT
// ------------------------------------------------------------

export function restorePlayer(savedPlayer) {
  if (!savedPlayer) return;
  gameState.player = { ...savedPlayer };
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
