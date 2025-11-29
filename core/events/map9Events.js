// ============================================================
// 🟣 map9Events.js — The Crystal Keep (FINAL MAP) Script
// ------------------------------------------------------------
// Map 9: Full enemy roster + Seraphine Phase IV
// The Architect’s final attempt to seize the Crystal Heart.
//
// Tone:
//   • Epic, high-stakes, emotional
//   • Glitter fully confident in her Guardian role
//   • Seraphine reveals her motives, her tragedy, and her plan
//   • Humour still present, but lighter — this is the final battle
//
// Covers:
//   • Wave start/end flavour (all-out assault)
//   • First Void->Mixed swarm reactions
//   • Seraphine arrival + mid-fight HP threshold lines
//   • Final “defeat but escape” lore beat
//   • Crystal Heart references
//   • Life-loss callouts (intense version)
//   • Resource flavour
// ============================================================

import { Events, EVENT_NAMES as E } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

// ============================================================
// PLAYER POSITION
// ============================================================

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ============================================================
// LIFE LOSS CALLOUTS — FINAL MAP VARIANTS
// ============================================================

const lifeLossLines = {
  80: [
    "One slipped through—stay focused!",
    "Don’t let the pressure shake you, Princess!"
  ],
  60: [
    "We’re getting overwhelmed—move, move!",
    "Paths collapsing—reinforce faster!"
  ],
  40: [
    "I can’t lose now… not this close!",
    "Crystal Keep is depending on me!"
  ],
  20: [
    "Princess—please! The Keep will fall!",
    "Glitter—hold the line!!"
  ]
};

// ============================================================
// INIT
// ============================================================

export default function initMap9Events() {

  // ------------------------------------------------------------
  // 1) WAVE START — escalating chaos
  // ------------------------------------------------------------
  Events.on(E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble(
          "Crystal Keep… home. If this falls… everything falls.",
          pos.x, pos.y, 4800
        );
        break;

      case 2:
        spawnSpeechBubble(
          "They’re coming harder now… all tribes united against us.",
          pos.x, pos.y, 4500
        );
        break;

      case 3:
        spawnSpeechBubble(
          "Elites, Worgs, Voidlings—this is a full assault.",
          pos.x, pos.y, 4500
        );
        break;

      case 4:
        spawnSpeechBubble(
          "The Architect is close. I can feel her breathing through the crystals.",
          pos.x, pos.y, 4800
        );
        break;

      case 5:
        spawnSpeechBubble(
          "That rumble… she’s almost here.",
          pos.x, pos.y, 4500
        );
        break;

      case 6:
        spawnSpeechBubble(
          "This wave is huge—Spire placement is everything now!",
          pos.x, pos.y, 4500
        );
        break;

      case 7:
        spawnSpeechBubble(
          "They’re hitting every path at once—classic Seraphine move.",
          pos.x, pos.y, 4500
        );
        break;

      case 8:
        spawnSpeechBubble(
          "The Crystal Heart is pulsing… like it's afraid.",
          pos.x, pos.y, 4800
        );
        break;

      case 9:
        spawnSpeechBubble(
          "Last wave before she comes. Deep breath Glitter…",
          pos.x, pos.y, 4800
        );
        break;

      case 10:
        spawnSpeechBubble(
          "She’s here.",
          pos.x, pos.y, 4000
        );
        break;
    }
  });

  // ------------------------------------------------------------
  // 2) WAVE END — short, tense reactions
  // ------------------------------------------------------------
  Events.on(E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("The Keep still stands. Good.", pos.x, pos.y, 3500);
        break;
      case 2:
        spawnSpeechBubble("They’re testing our defences.", pos.x, pos.y, 3500);
        break;
      case 3:
        spawnSpeechBubble("Every tribe is here… why?", pos.x, pos.y, 3800);
        break;
      case 4:
        spawnSpeechBubble("Seraphine’s magic is bleeding into reality.", pos.x, pos.y, 4000);
        break;
      case 5:
        spawnSpeechBubble("She wants the Heart… but why steal it?", pos.x, pos.y, 4200);
        break;
      case 6:
        spawnSpeechBubble("I'm not backing down. Not now.", pos.x, pos.y, 3500);
        break;
      case 7:
        spawnSpeechBubble("Almost… almost…", pos.x, pos.y, 3500);
        break;
      case 8:
        spawnSpeechBubble("The Heart is… crying?", pos.x, pos.y, 4500);
        break;
      case 9:
        spawnSpeechBubble("Last chance to breathe before she arrives.", pos.x, pos.y, 4500);
        break;
    }
  });

  // ------------------------------------------------------------
  // 3) FIRST KILLS — only Void gets special here
  // ------------------------------------------------------------
  let firstVoid = false;
  Events.on(E.enemyKilled, ({ type }) => {
    if (type === "voidGoblin" && !firstVoid) {
      firstVoid = true;
      const pos = p();
      spawnSpeechBubble(
        "Even here, Void Goblins twist the light…",
        pos.x, pos.y, 4800
      );
    }
  });

  // ------------------------------------------------------------
  // 4) LIFE LOSS CALLOUTS
  // ------------------------------------------------------------
  const thresholds = Object.keys(lifeLossLines)
    .map(Number)
    .sort((a, b) => b - a);

  const done = new Set();

  Events.on(E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of thresholds) {
      if (pct <= t && !done.has(t)) {
        done.add(t);
        const options = lifeLossLines[t];
        const line = options[Math.floor(Math.random() * options.length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4500);
        break;
      }
    }
  });

  // ------------------------------------------------------------
  // 5) BOSS ENCOUNTER — SERAPHINE (FINAL FORM)
  // ------------------------------------------------------------
  Events.on(E.bossSpawn, ({ boss }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    // Entrance line
    setTimeout(() => {
      spawnSpeechBubble(
        "Glitter… step aside. The Heart belongs to my people.",
        pos.x, pos.y, 5200
      );
    }, 700);

    // Glitter answers
    setTimeout(() => {
      spawnSpeechBubble(
        "Seraphine… you can't take it! The Isles will collapse!",
        pos.x, pos.y, 5200
      );
    }, 3800);

    // Seraphine reveals motive
    setTimeout(() => {
      spawnSpeechBubble(
        "The Voidlands are dying… The Heart is the only thing that can save them.",
        pos.x, pos.y, 5200
      );
    }, 7200);

    // Glitter’s resolve
    setTimeout(() => {
      spawnSpeechBubble(
        "You want to save your home… but not like this!",
        pos.x, pos.y, 4800
      );
    }, 10500);
  });

  // ------------------------------------------------------------
  // 6) MID-BATTLE SERAPHINE THRESHOLDS
  // ------------------------------------------------------------
  Events.on(E.bossHpThreshold, ({ boss, threshold }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    if (threshold === 75) {
      spawnSpeechBubble(
        "You’re strong, Princess… but not strong enough.",
        pos.x, pos.y, 4800
      );
    }

    if (threshold === 50) {
      spawnSpeechBubble(
        "Why resist? I’m trying to save an entire realm!",
        pos.x, pos.y, 4800
      );
    }

    if (threshold === 25) {
      spawnSpeechBubble(
        "I won’t fail again… not after everything I lost!",
        pos.x, pos.y, 5000
      );
    }
  });

  // ------------------------------------------------------------
  // 7) SERAPHINE “DEFEAT” — ESCAPES (SEQUEL SETUP)
  // ------------------------------------------------------------
  Events.on(E.bossDefeated, ({ boss, phase }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    setTimeout(() => {
      spawnSpeechBubble(
        "No… not again… I was so close...",
        pos.x, pos.y,
        5500
      );
    }, 500);

    setTimeout(() => {
      spawnSpeechBubble(
        "Glitter… next time, I won’t hold back.",
        pos.x, pos.y,
        5200
      );
    }, 3500);

    setTimeout(() => {
      spawnSpeechBubble(
        "And next time… you’ll understand why.",
        pos.x, pos.y,
        5200
      );
    }, 6500);
  });

  // ------------------------------------------------------------
  // 8) RESOURCE PICKUPS (subtle, final-map version)
  // ------------------------------------------------------------
  let lastD = 0, lastG = 0, lastH = 0, lastM = 0, lastB = 0;
  let saidD = false, saidG = false, saidH = false, saidM = false, saidB = false;

  Events.on("resourceUpdate", () => {
    const pos = p();

    if (!saidD && gameState.diamonds > lastD) {
      saidD = true;
      spawnSpeechBubble(
        "The crystals resonate with the Keep’s Heart…",
        pos.x, pos.y, 4800
      );
    }

    if (!saidG && gameState.gold > lastG) {
      saidG = true;
      spawnSpeechBubble(
        "Shards… the Keep produces them faster here.",
        pos.x, pos.y, 4200
      );
    }

    if (!saidH && gameState.hearts > lastH) {
      saidH = true;
      spawnSpeechBubble(
        "A Heart—no time to waste it!",
        pos.x, pos.y, 4000
      );
    }

    if (!saidM && gameState.mana > lastM) {
      saidM = true;
      spawnSpeechBubble(
        "Mana surges through the Keep’s walls…",
        pos.x, pos.y, 4000
      );
    }

    if (!saidB && gameState.bravery > lastB) {
      saidB = true;
      spawnSpeechBubble(
        "Bravery shards… the Keep wants me to win.",
        pos.x, pos.y, 4500
      );
    }

    lastD = gameState.diamonds;
    lastG = gameState.gold;
    lastH = gameState.hearts;
    lastM = gameState.mana;
    lastB = gameState.bravery;
  });

}
