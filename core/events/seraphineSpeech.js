// ============================================================
// 🎭 seraphineSpeech.js — Lines + Event Hooks
// ------------------------------------------------------------
// Handles Seraphine intro + 40% HP lines for phase 1/2/3
// ============================================================

import { Events, EVENT_NAMES as E } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";

// ------------------------------------------------------------
// 📜 LINES BY PHASE
// ------------------------------------------------------------

const SERAPHINE_LINES = {
  1: { // Map 3
    intro: "So the Princess walks alone… interesting.",
    hp40:  "You’re… stronger than I expected.",
  },
  2: { // Map 6
    intro: "You again… The Isles shift around you.",
    hp40:  "Not yet… I refuse to break again…",
  },
  3: { // Map 9 Final (used in seraphine_final.js)
    intro: "No more illusions. No more fragments. Only truth.",
    hp40:  "Enough! You will not decide my fate!",
  },
};

// ------------------------------------------------------------
// 🎬 SPAWN → TIMED INTRO
// ------------------------------------------------------------

Events.on(E.bossSpawn, ({ boss, phase, x, y, instance }) => {
  if (boss !== "seraphine") return;

  const line = SERAPHINE_LINES[phase]?.intro;
  if (!line) return;

  setTimeout(() => {
    const anchor = instance || { x, y };
    spawnSpeechBubble(line, x, y, 4200, anchor);
  }, 1800); // 1.8 seconds after spawn
});

// ------------------------------------------------------------
// ❤️ HP 40%
// ------------------------------------------------------------

Events.on(E.bossHpThreshold, ({ boss, phase, threshold, x, y, instance }) => {
  if (boss !== "seraphine") return;
  if (threshold !== 40) return;

  const line = SERAPHINE_LINES[phase]?.hp40;
  if (!line) return;

  const anchor = instance || { x, y };
  spawnSpeechBubble(line, x, y, 4500, anchor);
});

// ------------------------------------------------------------
// 💀 DEFEAT / ESCAPE LINE (Phase 1 & 2 only)
// ------------------------------------------------------------

Events.on(E.bossDefeated, ({ boss, phase, x, y, instance }) => {
  if (boss !== "seraphine") return;

  // Final form (phase 3) should NOT speak on defeat
  if (phase === 3) return;

  const lines = {
    1: "This isn’t over… Princess…",
    2: "You can’t stop what’s coming…",
  };

  const line = lines[phase];
  if (!line) return;

  const anchor = instance || { x, y };
  spawnSpeechBubble(line, x, y, 4300, anchor);
});


// ------------------------------------------------------------
// ⏱️ TIMED TAUNTS (Max 2 per encounter)
// ------------------------------------------------------------

const TAUNTS = {
  1: [
    "Run, little Princess… run…",
    "You don’t even understand what you’re walking into…",
  ],
  2: [
    "You're persistent... I'll give you that.",
    "Your light… it stings...",
  ],
  3: [
    "I will break your destiny myself.",
    "This world bends to *me*.",
  ],
};

// tracks active taunt timers per instance
const activeTauntHandles = new WeakMap();

function scheduleTaunts(instance, phase) {
  // Prevent double scheduling for same boss
  if (activeTauntHandles.has(instance)) return;

  let tauntCount = 0;
  const maxTaunts = 2;
  
  function fireTaunt() {
    if (!instance?.alive || instance?.defeated) return;
    if (tauntCount >= maxTaunts) return;

    const pool = TAUNTS[phase] || [];
    if (!pool.length) return;

    const line = pool[Math.floor(Math.random() * pool.length)];
    spawnSpeechBubble(line, instance.x, instance.y, 4200, instance);

    tauntCount++;

    if (tauntCount < maxTaunts) {
      const delay = 8000 + Math.random() * 10000; // 8–18 sec
      const handle = setTimeout(fireTaunt, delay);
      activeTauntHandles.set(instance, handle);
    }
  }

  // first delay before first taunt
  const startDelay = 6000 + Math.random() * 6000; // 6–12 sec
  const handle = setTimeout(fireTaunt, startDelay);
  activeTauntHandles.set(instance, handle);
}

// Start taunts when boss spawns
Events.on(E.bossSpawn, ({ boss, phase, instance }) => {
  if (boss !== "seraphine") return;
  if (!instance) return;

  scheduleTaunts(instance, phase);
});

// Cleanup on defeat
Events.on(E.bossDefeated, ({ boss, instance }) => {
  if (boss !== "seraphine") return;
  if (!instance) return;

  const handle = activeTauntHandles.get(instance);
  if (handle) clearTimeout(handle);

  activeTauntHandles.delete(instance);
});
