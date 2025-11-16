// ============================================================
// 🌈 skins.js — Skin registry + portrait + unlock costs
// ============================================================

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

// Default
export function ensureSkin(player) {
  if (!player.skin) player.skin = "glitter";
  if (!player.unlockedSkins) player.unlockedSkins = ["glitter"];
}

export function unlockSkin(player, key) {
  if (!player.unlockedSkins.includes(key)) {
    player.unlockedSkins.push(key);
  }
}

export function selectSkin(player, key) {
  if (player.unlockedSkins.includes(key)) {
    player.skin = key;
  }
}
