// ============================================================
// 🌈 skins.js — Skin registry + portrait + unlock costs
// ============================================================
/* ------------------------------------------------------------
 * MODULE: skins.js
 * PURPOSE:
 *   Central registry and manager for all Glitter Guardian skins.
 *   Each profile owns its unlocked skins, and every skin has a
 *   name, folder, portrait, and diamond unlock cost.
 *
 * SUMMARY:
 *   • SKINS — global skin metadata registry
 *   • ensureSkin(player) — guarantees cosmetics block exists
 *   • unlockSkin(player, key) — unlocks a skin permanently
 *   • selectSkin(player, key) — equips a skin + persists it
 *
 * DATA MODEL:
 *   gameState.profile.cosmetics = {
 *     skin: "glitter",               // currently equipped
 *     unlocked: ["glitter", ...]     // full unlocked list
 *   }
 *
 * DESIGN NOTES:
 *   • Player object mirrors the cosmetics for runtime use
 *   • Profiles own cosmetic progress (persistent)
 *   • Player inherits cosmetics at login/profile-select
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, saveProfiles } from "../utils/gameState.js";

// ------------------------------------------------------------
// 🎨 SKIN REGISTRY
// ------------------------------------------------------------
export const SKINS = {
  glitter: {
    name: "Glitter Guardian",
    folder: "glitter",
    portrait: "portrait_glitter.png",
    cost: 0,
  },
  moon: {
    name: "Moonflower Druid",
    folder: "moon",
    portrait: "portrait_moonflower.png",
    cost: 2000,
  },
  star: {
    name: "Star Sage",
    folder: "star",
    portrait: "portrait_star_sage.png",
    cost: 2000,
  },
  silver: {
    name: "Silver Arrow",
    folder: "silver",
    portrait: "portrait_silver_arrow.png",
    cost: 2000,
  },
};

// ------------------------------------------------------------
// 🛡️ ENSURE COSMETICS EXIST (profile → player sync)
// ------------------------------------------------------------
export function ensureSkin(player) {

  // Make sure profile is valid
  if (!gameState.profile) {
    gameState.profile = {};
  }

  // Ensure cosmetics block exists
  if (!gameState.profile.cosmetics) {
    gameState.profile.cosmetics = {
      skin: "glitter",
      unlocked: ["glitter"],
    };
  }

  if (!player) return;

  // Copy cosmetic data → player
  player.skin = gameState.profile.cosmetics.skin;
  player.unlockedSkins = [...gameState.profile.cosmetics.unlocked];
}

// ------------------------------------------------------------
// 🔓 UNLOCK A SKIN
// ------------------------------------------------------------
export function unlockSkin(player, key) {
  if (!player.unlockedSkins.includes(key)) {
    player.unlockedSkins.push(key);
  }

  // Persist to profile cosmetics
  const cos = gameState.profile.cosmetics;
  if (!cos.unlocked.includes(key)) {
    cos.unlocked.push(key);
  }

  saveProfiles();
}

// ------------------------------------------------------------
// 👗 EQUIP A SKIN
// ------------------------------------------------------------
export function selectSkin(player, key) {
  if (!player.unlockedSkins.includes(key)) return;

  player.skin = key;

  // Persist equipped skin
  gameState.profile.cosmetics.skin = key;

  saveProfiles();
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
