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
