// ============================================================
// player.js - Olivia's World: Crystal Keep
// ------------------------------------------------------------
// - Defines base player stats template
// - Name/title injected from Profile system
// - Supports init + save-slot restoration
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
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// Imports
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";

const DEFAULT_POS = { x: 400, y: 400 };
const DEFAULT_SKIN = "glitter";

// ------------------------------------------------------------
// Create new player object
// ------------------------------------------------------------

export function createPlayer(overrides = {}) {
  const pos = {
    x: typeof overrides.pos?.x === "number" ? overrides.pos.x : (typeof overrides.x === "number" ? overrides.x : DEFAULT_POS.x),
    y: typeof overrides.pos?.y === "number" ? overrides.pos.y : (typeof overrides.y === "number" ? overrides.y : DEFAULT_POS.y),
  };

  const skin = (overrides.skin ?? overrides.skinId ?? DEFAULT_SKIN) || DEFAULT_SKIN;
  const normalizedSkin = skin === "default" ? DEFAULT_SKIN : skin;

  const base = {
    name: "",
    title: "",

    skin: normalizedSkin,
    skinId: normalizedSkin,

    level: 1,
    xp: 0,
    statPoints: 0,

    hp: 100,
    maxHp: 100,

    mana: 50,
    maxMana: 50,

    speed: 160,

    spellPower: 10,
    healPower: 10,
    rangedAttack: 10,
    attack: 15,
    defense: 5,
    critChance: 0.1,

    pos,
    x: pos.x,
    y: pos.y,

    sprite: "./assets/sprites/glitter_guardian_default.png",
  };

  return {
    ...base,
    ...overrides,
    pos,
    skin: normalizedSkin,
    skinId: normalizedSkin,
    x: pos.x,
    y: pos.y,
  };
}

// ------------------------------------------------------------
// Initialize new player
// ------------------------------------------------------------

export function initPlayer() {
  gameState.player = createPlayer();
}

// ------------------------------------------------------------
// Restore player from save slot
// ------------------------------------------------------------

export function restorePlayer(savedPlayer) {
  if (!savedPlayer) return;
  gameState.player = createPlayer(savedPlayer);
}

// ============================================================
// END OF FILE
// ============================================================
