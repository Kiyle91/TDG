// ============================================================
// 🌑 map8Events.js — The Voidlands Story Script (Rewritten Final)
// ------------------------------------------------------------
// Map 8: Seraphine’s homeland. Forbidden magic. Heavy atmosphere.
// No physics distortion, no gravity tricks, no arrow bending.
//
// Introduces:
//   • Void Goblins (creepy, unsettling, void-touched)
//   • Void Trolls (cloak nearby enemies from Spires)
//   • Seraphine’s homeland, deep lore hints
//
// Covers:
//   • Wave start/end flavour
//   • First Void Goblin kill (ONE TIME)
//   • Life loss callouts (void-flavoured)
//   • Void-themed resource lines
//   • Seraphine cameo (Phase 4 foreshadowing, not a fight)
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

// Player position helper
const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ============================================================
// LIFE LOSS CALLOUTS (Void-themed panic)
// ============================================================

const lifeLossLines = {
  80: [
    "That one slipped past… stay focused!",
    "Void creatures move strangely… keep your guard up!"
  ],
  60: [
    "They’re hiding behind something… I can’t see them all!",
    "My Spires can’t track them when they’re cloaked!"
  ],
  40: [
    "This place feels like it’s watching me…",
    "Something here is creeping closer…"
  ],
  20: [
    "Don’t let the Void scare you… stay brave!",
    "Hold on… we’re almost through!"
  ]
};

// ============================================================
// INIT
// ============================================================

export default function initMap8Events() {

  // ------------------------------------------------------------
  // 1) WAVE START — No physics-breaking, just atmosphere
  // ------------------------------------------------------------
  mapOn(8, E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble(
          "This air… it’s heavy. Like the whole place is holding its breath.",
          pos.x, pos.y, 4500
        );
        break;

      case 2:
        spawnSpeechBubble(
          "Void Goblins… even the other enemies avoid them.",
          pos.x, pos.y, 4500
        );
        break;

      case 3:
        spawnSpeechBubble(
          "My Spires feel slower here… like something is dulling the light.",
          pos.x, pos.y, 4500
        );
        break;

      case 4:
        spawnSpeechBubble(
          "Void Trolls… careful! They can hide everyone around them!",
          pos.x, pos.y, 4800
        );
        break;

      case 5:
        spawnSpeechBubble(
          "Seraphine was born here… it feels lonely and loud at the same time.",
          pos.x, pos.y, 4800
        );
        break;

      case 6:
        spawnSpeechBubble(
          "This place hums under my feet. Not sure I like that.",
          pos.x, pos.y, 4500
        );
        break;

      case 7:
        spawnSpeechBubble(
          "The shadows move oddly… but it’s just the creatures. Right?",
          pos.x, pos.y, 4600
        );
        break;

      case 8:
        spawnSpeechBubble(
          "Keep breathing… keep moving… don’t look too long at anything.",
          pos.x, pos.y, 4600
        );
        break;

      case 9:
        spawnSpeechBubble(
          "Something big is beneath this land. I can feel it.",
          pos.x, pos.y, 4500
        );
        break;

      case 10:
        spawnSpeechBubble(
          "Seraphine… I can feel your presence. Are you still my enemy?",
          pos.x, pos.y, 5000
        );
        break;
    }
  });

  // ------------------------------------------------------------
  // 2) WAVE END — No gravity/physics wording
  // ------------------------------------------------------------
  mapOn(8, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Okay. Survived the welcome party.", pos.x, pos.y, 4000);
        break;

      case 2:
        spawnSpeechBubble("Void Goblins move weird… like they know I’m watching.", pos.x, pos.y, 4200);
        break;

      case 3:
        spawnSpeechBubble("My Spires don’t like this place. Honestly, same.", pos.x, pos.y, 4200);
        break;

      case 4:
        spawnSpeechBubble("Void Troll cloaking is so unfair…", pos.x, pos.y, 4500);
        break;

      case 5:
        spawnSpeechBubble("Seraphine grew up here… explains a few things.", pos.x, pos.y, 4500);
        break;

      case 6:
        spawnSpeechBubble("Even the Echoes feel nervous in this land.", pos.x, pos.y, 4200);
        break;

      case 7:
        spawnSpeechBubble("The shadows stretch… too far.", pos.x, pos.y, 4500);
        break;

      case 8:
        spawnSpeechBubble("Almost done… just don’t stare at the dark spots.", pos.x, pos.y, 4500);
        break;

      case 9:
        spawnSpeechBubble("Did the ground just… sigh?", pos.x, pos.y, 4200);
        break;
    }
  });

  // ------------------------------------------------------------
  // 3) FIRST VOID GOBLIN KILL
  // ------------------------------------------------------------
  let firstVoidKill = false;

  mapOn(8, E.enemyKilled, ({ type }) => {
    if (type !== "voidGoblin") return;
    if (firstVoidKill) return;
    firstVoidKill = true;

    const pos = p();
    spawnSpeechBubble(
      "Void Goblin down… that felt wrong. Like it saw straight through me.",
      pos.x, pos.y, 5000
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "No wonder my Spires lose them… they twist the shadows around themselves.",
        pos.x, pos.y, 4800
      );
    }, 2400);
  });

  // ------------------------------------------------------------
  // 4) LIFE LOSS CALLOUTS
  // ------------------------------------------------------------
  const thresholds = Object.keys(lifeLossLines)
    .map(Number)
    .sort((a, b) => b - a);

  const used = new Set();

  mapOn(8, E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of thresholds) {
      if (pct <= t && !used.has(t)) {
        used.add(t);
        const arr = lifeLossLines[t];
        spawnSpeechBubble(arr[Math.floor(Math.random() * arr.length)], pos.x, pos.y, 4500);
        break;
      }
    }
  });

  // ------------------------------------------------------------
  // 5) SERAPHINE — Not a fight, just presence
  // ------------------------------------------------------------
  mapOn(8, E.bossSpawn, ({ boss }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    setTimeout(() => {
      spawnSpeechBubble(
        "Seraphine… this place shaped you, didn’t it?",
        pos.x, pos.y, 4800
      );
    }, 700);

    setTimeout(() => {
      spawnSpeechBubble(
        "Why does it feel like you don’t want me stepping any closer?",
        pos.x, pos.y, 4800
      );
    }, 3500);
  });

  // ------------------------------------------------------------
  // 6) RESOURCE PICKUPS — Void Flavour
  // ------------------------------------------------------------
  let lastD = 0, lastG = 0, lastH = 0, lastM = 0, lastB = 0;
  let saidD = false, saidG = false, saidH = false, saidM = false, saidB = false;

  mapOn(8, "resourceUpdate", () => {
    const pos = p();

    if (!saidD && gameState.diamonds > lastD) {
      saidD = true;
      spawnSpeechBubble("These diamonds hum softly… like they’re alive.", pos.x, pos.y, 4800);
    }

    if (!saidG && gameState.gold > lastG) {
      saidG = true;
      spawnSpeechBubble("Shards touched by the Void… still spendable though.", pos.x, pos.y, 4600);
    }

    if (!saidH && gameState.hearts > lastH) {
      saidH = true;
      spawnSpeechBubble("A Heart… glowing faint purple. Probably fine.", pos.x, pos.y, 5000);
    }

    if (!saidM && gameState.mana > lastM) {
      saidM = true;
      spawnSpeechBubble("Void mana… it buzzes when I hold it.", pos.x, pos.y, 4800);
    }

    if (!saidB && gameState.bravery > lastB) {
      saidB = true;
      spawnSpeechBubble("Bravery shards… they vibrate like they’re warning me.", pos.x, pos.y, 4800);
    }

    lastD = gameState.diamonds;
    lastG = gameState.gold;
    lastH = gameState.hearts;
    lastM = gameState.mana;
    lastB = gameState.bravery;
  });

}
