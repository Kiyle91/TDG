// ============================================================
// 🌈 skins.js — Skin registry + portrait + unlock costs
// ============================================================

import { gameState, saveProfiles } from "../utils/gameState.js";

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

export function ensureSkin(player) {

  // ⭐ Ensure the profile exists
  if (!gameState.profile) {
    gameState.profile = {};
  }

  // ⭐ Ensure the cosmetics block exists
  if (!gameState.profile.cosmetics) {
    gameState.profile.cosmetics = {
      skin: "glitter",
      unlocked: ["glitter"]
    };
  }

  // ⭐ Ensure player object exists
  if (!player) return;

  // Load profile cosmetics into player
  player.skin = gameState.profile.cosmetics.skin;
  player.unlockedSkins = [...gameState.profile.cosmetics.unlocked];
}

export function unlockSkin(player, key) {
  if (!player.unlockedSkins.includes(key)) {
    player.unlockedSkins.push(key);
  }

  // persist to profile cosmetics
  if (!gameState.profile.cosmetics.unlocked.includes(key)) {
    gameState.profile.cosmetics.unlocked.push(key);
  }

  saveProfiles();
}

export function selectSkin(player, key) {
  if (!player.unlockedSkins.includes(key)) return;

  player.skin = key;

  // persist selection
  gameState.profile.cosmetics.skin = key;

  saveProfiles();
}
