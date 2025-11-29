// ============================================================
// 🎭 seraphineSpeech.js — Lore-Integrated Boss Speech
// ------------------------------------------------------------
// Handles Seraphine’s intro, HP-threshold reactions,
// defeat lines, and ambient taunts for Maps 1, 4, and 7.
// (Final Map IV handled inside map9Events.js)
// ============================================================

import { Events, EVENT_NAMES as E } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";

// ------------------------------------------------------------
// 📜 PHASED LINES (0, 1, 2) — RESPECT INCREASES OVER TIME
// ------------------------------------------------------------

const SERAPHINE_LINES = {
  // ------------------------------------------------------------
  // Phase 0 — MAP 1 (Whispering Meadows)
  // Tone: Condescending, amused, dismissive
  // ------------------------------------------------------------
  0: {
    intro:
      "So… you are the guardian they sent? Cute. Let us see what you can actually do.",
    hp40:
      "Still standing? Hmph… perhaps you’re not entirely helpless.",
    defeat:
      "Impressive… for a beginner. Do not get comfortable."
  },

  // ------------------------------------------------------------
  // Phase 1 — MAP 4 (Ember Plains)
  // Tone: Challenging, irritated, still condescending
  // ------------------------------------------------------------
  1: {
    intro:
      "You again? The Isles favour you for some reason… I intend to learn why.",
    hp40:
      "You grow stronger… but strength alone will not save your home.",
    defeat:
      "Tch… you’re more trouble than I anticipated. This isn’t over."
  },

  // ------------------------------------------------------------
  // Phase 2 — MAP 7 (Swamplands)
  // Tone: Strained, pressured, respect emerging
  // ------------------------------------------------------------
  2: {
    intro:
      "Why do you keep standing against me…? I don’t have time for this fight.",
    hp40:
      "You fight with purpose… I can feel it. Don’t make me hurt you more.",
    defeat:
      "Fine… have your victory. But know this—your courage complicates everything."
  }
};


// ------------------------------------------------------------
// 🎬 INTRO ON SPAWN
// ------------------------------------------------------------
Events.on(E.bossSpawn, ({ boss, phase, x, y, instance }) => {
  if (boss !== "seraphine") return;
  if (phase === 3) return; // Phase 3 handled in map9Events.js

  const line = SERAPHINE_LINES[phase]?.intro;
  if (!line) return;

  const anchor = instance || { x, y };

  setTimeout(() => {
    spawnSpeechBubble(line, anchor.x, anchor.y, 4200, anchor);
  }, 1800);
});


// ------------------------------------------------------------
// ❤️ 40% HP THRESHOLD
// ------------------------------------------------------------
Events.on(E.bossHpThreshold, ({ boss, phase, threshold, x, y, instance }) => {
  if (boss !== "seraphine") return;
  if (phase === 3) return;
  if (threshold !== 40) return;

  const line = SERAPHINE_LINES[phase]?.hp40;
  if (!line) return;

  const anchor = instance || { x, y };
  spawnSpeechBubble(line, anchor.x, anchor.y, 4500, anchor);
});


// ------------------------------------------------------------
// 💔 DEFEAT / ESCAPE LINES (Phase 0, 1, 2)
// ------------------------------------------------------------
Events.on(E.bossDefeated, ({ boss, phase, x, y, instance }) => {
  if (boss !== "seraphine") return;
  if (phase === 3) return; // phase 3 handled in map9Events.js

  const line = SERAPHINE_LINES[phase]?.defeat;
  if (!line) return;

  const anchor = instance || { x, y };
  spawnSpeechBubble(line, anchor.x, anchor.y, 4300, anchor);
});


// ------------------------------------------------------------
// ⏱️ AMBIENT TAUNTS — 2 per encounter max
// Tone shifts by phase:
//   0 = mocking
//   1 = sharp, frustrated
//   2 = conflicted, pained
// ------------------------------------------------------------
const TAUNTS = {
  0: [
    "Try not to trip over your own feet.",
    "Come now—surely you can do better than that?",
    "Is this truly the best the Crystal Isles can muster?"
  ],

  1: [
    "You push forward… but you do not understand what waits ahead.",
    "Stubborn little guardian… you risk more than you know.",
    "The Ember Plains are harsh—let us see if you survive them."
  ],

  2: [
    "Stop… please. I don’t want to fight you.",
    "Every moment we waste… the Voidlands slip further away.",
    "You’re strong… but strength won’t fix what’s dying."
  ]
};

const activeTauntHandles = new WeakMap();

function scheduleTaunts(instance, phase) {
  if (activeTauntHandles.has(instance)) return;

  let count = 0;
  const maxTaunts = 2;

  function fireTaunt() {
    if (!instance?.alive || instance?.defeated) return;
    if (count >= maxTaunts) return;

    const pool = TAUNTS[phase] || [];
    if (!pool.length) return;

    const line = pool[Math.floor(Math.random() * pool.length)];
    spawnSpeechBubble(line, instance.x, instance.y, 4200, instance);

    count++;

    if (count < maxTaunts) {
      const delay = 8000 + Math.random() * 10000; // 8–18 sec
      const handle = setTimeout(fireTaunt, delay);
      activeTauntHandles.set(instance, handle);
    }
  }

  const startDelay = 6000 + Math.random() * 6000; // 6–12 sec
  const handle = setTimeout(fireTaunt, startDelay);
  activeTauntHandles.set(instance, handle);
}

Events.on(E.bossSpawn, ({ boss, phase, instance }) => {
  if (boss !== "seraphine") return;
  if (phase === 3) return; // Phase 3 handled separately

  if (instance) scheduleTaunts(instance, phase);
});

Events.on(E.bossDefeated, ({ boss, instance }) => {
  if (boss !== "seraphine") return;

  const handle = activeTauntHandles.get(instance);
  if (handle) clearTimeout(handle);

  activeTauntHandles.delete(instance);
});
