// ============================================================
// 🌾 map2Events.js — Bragg’s Farm Story Script (FINAL & FULL)
// ------------------------------------------------------------
// Map 2: The Farm
// Tone: Humorous, semi-chaotic, light reinforcement of Map 1.
// Mechanics: First ELITE enemy introduction.
// NO BOSSES appear on this map.
//
// Includes:
//   • Short 20s timed intro
//   • Wave start lines
//   • Wave end reflections
//   • First Goblin/Worg/Elite kill reactions
//   • Bravery full + used
//   • Spire destroyed
//   • All Echoes collected
//   • Life loss warnings (shared thresholds)
//   • Light shard pickup reminder
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";
import { lifeLossLines } from "./map1Events.js";

// Player position helper
const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ============================================================
// 1) SHORT 20-SECOND INTRO (player already knows basics)
// ============================================================

const TIMED_EVENTS = [
  {
    id: "t_003",
    timeRequired: 3,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Bragg’s Farm… still smells like hay and despair.",
        pos.x, pos.y, 4200
      );
    }
  },
  {
    id: "t_009",
    timeRequired: 9,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Crystal Echoes should still be around. Free shards if I’m quick.",
        pos.x, pos.y, 4200
      );
    }
  },
  {
    id: "t_015",
    timeRequired: 15,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Remember Glitter… Spires work best near the paths.",
        pos.x, pos.y, 4500
      );
    }
  },
  {
    id: "t_020",
    timeRequired: 20,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Okay… wave one incoming.",
        pos.x, pos.y, 4000
      );
    }
  }
];

// ============================================================
// INIT
// ============================================================

export default function initMap2Events() {
  loadTimedEventsForMap(2, TIMED_EVENTS);

  // ------------------------------------------------------------
  // 2) WAVE START LINES
  // ------------------------------------------------------------
  mapOn(2, E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Goblins on a farm… that tracks.", pos.x, pos.y, 3500);
        break;
      case 2:
        spawnSpeechBubble("More? I just got here!", pos.x, pos.y, 3500);
        break;
      case 3:
        spawnSpeechBubble("They’re multiplying again…", pos.x, pos.y, 3500);
        break;
      case 4:
        spawnSpeechBubble("Wait— is that an Elite? HERE?!", pos.x, pos.y, 4000);
        break;
      case 5:
        spawnSpeechBubble("Bragg would be furious if he saw this mess.", pos.x, pos.y, 3500);
        break;
      case 6:
        spawnSpeechBubble("Worgs? Who let wolves onto a farm?", pos.x, pos.y, 3500);
        break;
      case 7:
        spawnSpeechBubble("This is getting ridiculous.", pos.x, pos.y, 3500);
        break;
      case 8:
        spawnSpeechBubble("Spires, don’t fail me now!", pos.x, pos.y, 3500);
        break;
      case 9:
        spawnSpeechBubble("Okay Glitter, focus. Almost there.", pos.x, pos.y, 3500);
        break;
      case 10:
        spawnSpeechBubble("This farm needs a holiday.", pos.x, pos.y, 4000);
        break;
      case 11:
        spawnSpeechBubble("Why is wave eleven so intense?!", pos.x, pos.y, 4000);
        break;
      case 12:
        spawnSpeechBubble("Deep breaths… this is fine.", pos.x, pos.y, 4000);
        break;
    }
  });

  // ------------------------------------------------------------
  // 3) WAVE END REFLECTIONS
  // ------------------------------------------------------------
  mapOn(2, E.waveEnd, ({ wave }) => {
    const pos = p();

    const lines = {
      1: "Farm’s quiet… too quiet.",
      2: "Should grab Echoes while I can.",
      3: "My Spires are carrying, actually.",
      4: "An Elite on a farm… fantastic.",
      5: "Shards mean upgrades. Don’t forget.",
      6: "Worgs shouldn’t be this close to humans…",
      7: "Quick breather. Very quick.",
      8: "This is a LOT for Bragg’s Farm.",
      9: "Nearly through… I hope.",
      10: "No boss here… right? RIGHT?",
      11: "Glitter… why did you say that.",
    };

    if (lines[wave]) {
      spawnSpeechBubble(lines[wave], pos.x, pos.y, 3800);
    }
  });

  // ------------------------------------------------------------
  // 4) FIRST GOBLIN KILL
  // ------------------------------------------------------------
  let firstGoblin = false;

  mapOn(2, E.enemyKilled, ({ type }) => {
    if (type !== "goblin" || firstGoblin) return;
    firstGoblin = true;

    const pos = p();
    spawnSpeechBubble("Yep. Still got it.", pos.x, pos.y, 4000);
  });

  // ------------------------------------------------------------
  // 5) FIRST WORG KILL
  // ------------------------------------------------------------
  let firstWorg = false;

  mapOn(2, E.enemyKilled, ({ type }) => {
    if (type !== "worg" || firstWorg) return;
    firstWorg = true;

    const pos = p();
    spawnSpeechBubble(
      "Poor wolves… they’re being forced into this.",
      pos.x, pos.y, 4500
    );
  });

  // ------------------------------------------------------------
  // 6) FIRST ELITE KILL (Map 2's big moment)
  // ------------------------------------------------------------
  let firstElite = false;

  mapOn(2, E.enemyKilled, ({ type }) => {
    if (type !== "elite" || firstElite) return;
    firstElite = true;

    const pos = p();
    spawnSpeechBubble(
      "Elites on a farm… absolutely not.",
      pos.x, pos.y, 4500
    );
  });

  // ------------------------------------------------------------
  // 7) BRAVERY TRIGGERS
  // ------------------------------------------------------------
  let braveryFull = false;
  let braveryUsed = false;

  mapOn(2, E.braveryFull, () => {
    if (braveryFull) return;
    braveryFull = true;

    const pos = p();
    spawnSpeechBubble("Bravery charged! Press Q!", pos.x, pos.y, 4500);
  });

  mapOn(2, E.braveryActivated, () => {
    if (braveryUsed) return;
    braveryUsed = true;

    const pos = p();
    spawnSpeechBubble("Guardian mode! Let’s clear this farm!", pos.x, pos.y, 4500);
  });

  // ------------------------------------------------------------
  // 8) FIRST SPIRE DESTROYED
  // ------------------------------------------------------------
  let spireDown = false;

  mapOn(2, "spireDestroyed", () => {
    if (spireDown) return;
    spireDown = true;

    const pos = p();
    spawnSpeechBubble(
      "My Spire! They're actually breaking them?!",
      pos.x, pos.y, 4800
    );
  });

  // ------------------------------------------------------------
  // 9) ALL CRYSTAL ECHOES COLLECTED
  // ------------------------------------------------------------
  mapOnce(2, E.echoComplete, () => {
    const pos = p();

    spawnSpeechBubble(
      "All Echoes collected… they’re resonating again.",
      pos.x, pos.y, 5200
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "Feels like I’m actually getting good at this.",
        pos.x, pos.y, 4500
      );
    }, 2200);
  });

  // ------------------------------------------------------------
  // 10) LIFE LOSS CALLOUTS (reuse Map1 lines)
// ------------------------------------------------------------
  const thresholds = Object.keys(lifeLossLines)
    .map(Number)
    .sort((a, b) => b - a);

  const used = new Set();

  mapOn(2, E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of thresholds) {
      if (pct <= t && !used.has(t)) {
        used.add(t);

        const arr = lifeLossLines[t];
        const line = arr[Math.floor(Math.random() * arr.length)];

        spawnSpeechBubble(line, pos.x, pos.y, 4200);
        break;
      }
    }
  });

  // ------------------------------------------------------------
  // 11) OPTIONAL RESOURCE REMINDER (SHARDS)
  // ------------------------------------------------------------
  let shardReminder = false;

  mapOn(2, "resourceUpdate", () => {
    const pos = p();

    if (!shardReminder && gameState.gold > 0) {
      shardReminder = true;
      spawnSpeechBubble(
        "Shards are handy… don’t forget to spend them!",
        pos.x, pos.y, 4500
      );
    }
  });
}

// ============================================================
// END OF FILE
// ============================================================
