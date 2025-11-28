// ============================================================
// 🌲 map1Events.js — Whispering Meadows Story Script (Final)
// ------------------------------------------------------------
// Map 1: Light narrative, soft tutorial, early pacing, boss intro
//
// Covers:
//   • Timed introduction (reduced + corrected mechanics)
//   • Wave start/end flavour
//   • First goblin kill
//   • First worg kill (with “controlled” hint for lore)
//   • Ariana wave 5 comms
//   • First time pickups (Diamonds, Shards, Health, Mana, Bravery)
//   • First spire destroyed
//   • First full Echo collection
//   • Life-loss callouts at thresholds
//   • Seraphine encounter + HP threshold reactions
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

// Life-loss speech cues at thresholds (by percent of lives remaining)
export const lifeLossLines = {
  80: [
    "Oof— one got through! Stay sharp Princess!",
    "It's okay! Just breathe, we’ve got this!"
  ],
  60: [
    "We’re losing ground… place more Spires!",
    "That path’s getting busy—maybe reinforce it?"
  ],
  40: [
    "Ah! They’re slipping past faster now!",
    "We can still turn this around—don’t panic!"
  ],
  20: [
    "Princess, careful! We're almost overwhelmed!",
    "We can't take many more hits!"
  ]
};

// ============================================================
// PLAYER POSITION HELPER
// ============================================================

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };
const isActiveMap = () => (gameState.progress?.currentMap ?? 1) === 1;

// ============================================================
// 1) REVISED TIMED INTRO — 45s, LIGHT + NON-INTRUSIVE
// ============================================================

const TIMED_EVENTS = [
  {
    id: "t_003",
    timeRequired: 3,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Okay Glitter… WASD to move. Deep breath.",
        pos.x, pos.y, 4000
      );
    }
  },
  {
    id: "t_010",
    timeRequired: 10,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Crystal Echoes… collect them when you see them.",
        pos.x, pos.y, 3800
      );
    }
  },
  {
    id: "t_018",
    timeRequired: 18,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Place your Spires close to the paths—so they hit more goblins.",
        pos.x, pos.y, 4200
      );
    }
  },
  {
    id: "t_042",
    timeRequired: 42,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Focus Glitter… the first wave is almost here.",
        pos.x, pos.y, 3800
      );
    }
  }
];

// ============================================================
// INIT
// ============================================================

export function initMap1Events() {
  loadTimedEventsForMap(1, TIMED_EVENTS);

  // ------------------------------------------------------------
  // 2) WAVE START SPEECHES
  // ------------------------------------------------------------
  mapOn(1, E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Here they come… stay sharp.", pos.x, pos.y, 3500);
        break;
      case 2:
        spawnSpeechBubble("More goblins… they’re desperate.", pos.x, pos.y, 3500);
        break;
      case 3:
        spawnSpeechBubble("Something feels… wrong in these woods.", pos.x, pos.y, 4000);
        break;
      case 4:
        spawnSpeechBubble("They’re not slowing down… keep moving.", pos.x, pos.y, 3500);
        break;
      case 5:
        spawnSpeechBubble("Ariana? Are you there?", pos.x, pos.y, 3500);
        break;
      case 6:
        spawnSpeechBubble("The goblins are getting bolder…", pos.x, pos.y, 3500);
        break;
      case 7:
        spawnSpeechBubble("I can feel Echo energy building…", pos.x, pos.y, 3500);
        break;
      case 8:
        spawnSpeechBubble("Almost there… just a little more!", pos.x, pos.y, 3500);
        break;
      case 9:
        spawnSpeechBubble("Something powerful approaches…", pos.x, pos.y, 3800);
        break;
      case 10:
        spawnSpeechBubble("This presence… it’s overwhelming.", pos.x, pos.y, 4000);
        break;
    }
  });

  // ------------------------------------------------------------
  // 3) WAVE END SPEECHES (30s downtime)
  // ------------------------------------------------------------
  mapOn(1, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Okay… okay. That wasn’t so bad.", pos.x, pos.y, 3500);
        break;
      case 2:
        spawnSpeechBubble("Why would goblins come this deep…", pos.x, pos.y, 3500);
        break;
      case 3:
        spawnSpeechBubble("Feels like something's watching…", pos.x, pos.y, 3800);
        break;
      case 4:
        spawnSpeechBubble("Ariana better have answers…", pos.x, pos.y, 3500);
        break;
      case 6:
        spawnSpeechBubble("Stronger than they look… but so am I.", pos.x, pos.y, 3500);
        break;
      case 7:
        spawnSpeechBubble("My Spires are doing great—keep them close to the path.", pos.x, pos.y, 4000);
        break;
      case 8:
        spawnSpeechBubble("Echoes are humming… something’s near.", pos.x, pos.y, 3800);
        break;
      case 9:
        spawnSpeechBubble("That magic… it’s suffocating.", pos.x, pos.y, 4000);
        break;
    }
  });

  // ------------------------------------------------------------
  // 4) ARIANA CALL AFTER WAVE 5 (Overlay handled in story.js)
  // ------------------------------------------------------------
  mapOn(1, E.waveEnd, ({ wave }) => {
    if (wave !== 5) return;
    const pos = p();
    spawnSpeechBubble(
      "Ariana… I knew you'd call. Something is wrong here.",
      pos.x, pos.y, 4500
    );
  });

  // ------------------------------------------------------------
  // 5) FIRST GOBLIN KILL (ONE TIME)
  // ------------------------------------------------------------
  let firstGoblinKill = false;

  mapOn(1, E.enemyKilled, ({ type }) => {
    if (type !== "goblin") return;
    if (firstGoblinKill) return;
    firstGoblinKill = true;

    const pos = p();
    spawnSpeechBubble(
      "I… I beat it. I can actually do this.",
      pos.x, pos.y, 4200
    );
  });

  // ------------------------------------------------------------
  // 6) FIRST WORG KILL (ONE TIME)
  // ------------------------------------------------------------
  let firstWorgKill = false;

  mapOn(1, E.enemyKilled, ({ type }) => {
    if (type !== "worg") return;
    if (firstWorgKill) return;
    firstWorgKill = true;

    const pos = p();
    spawnSpeechBubble(
      "The wolves aren’t attacking on their own… something’s controlling them.",
      pos.x, pos.y, 5000
    );
  });

  // ------------------------------------------------------------
  // 7) FIRST BRAVERY FULL
  // ------------------------------------------------------------
  let firstBraveryFull = false;

  mapOn(1, E.braveryFull, () => {
    if (firstBraveryFull) return;
    firstBraveryFull = true;

    const pos = p();
    spawnSpeechBubble(
      "My Bravery is charged… press Q to unleash it!",
      pos.x, pos.y, 5000
    );
  });

  // ------------------------------------------------------------
  // 8) FIRST BRAVERY ACTIVATION
  // ------------------------------------------------------------
  let firstBraveryUse = false;

  mapOn(1, E.braveryActivated, () => {
    if (firstBraveryUse) return;
    firstBraveryUse = true;

    const pos = p();
    spawnSpeechBubble(
      "For the Crystal Isles!",
      pos.x, pos.y, 4500
    );
  });

  // ------------------------------------------------------------
  // 9) LIFE LOSS CALLOUTS
  // ------------------------------------------------------------
  const lifeThresholds = Object.keys(lifeLossLines)
    .map(Number)
    .sort((a, b) => b - a);

  const lifeCalloutDone = new Set();

  mapOn(1, E.playerLifeLost, ({ lives }) => {
    const totalLives = 10;
    const pct = (lives / totalLives) * 100;
    const pos = p();

    for (const threshold of lifeThresholds) {
      if (pct <= threshold && !lifeCalloutDone.has(threshold)) {
        lifeCalloutDone.add(threshold);
        const options = lifeLossLines[threshold];
        const line = options[Math.floor(Math.random() * options.length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4200);
        break;
      }
    }
  });

  // ------------------------------------------------------------
  // 10) BOSS / SERAPHINE EVENTS
  // ------------------------------------------------------------
  mapOn(1, E.bossSpawn, ({ boss }) => {
    if (boss !== "seraphine") return;

    const pos = p();
    setTimeout(() => {
      spawnSpeechBubble(
        "What… what is THAT? That’s no goblin magic…",
        pos.x, pos.y, 4500
      );
    }, 800);
  });

  mapOn(1, E.bossHpThreshold, ({ boss, threshold }) => {
    if (boss !== "seraphine") return;

    const pos = p();
    if (threshold === 75) {
      spawnSpeechBubble("Her magic feels… ancient…", pos.x, pos.y, 3800);
    }
    if (threshold === 50) {
      spawnSpeechBubble("She's testing me. Why?", pos.x, pos.y, 3800);
    }
  });

  mapOn(1, E.bossDefeated, ({ boss, phase }) => {
    if (boss !== "seraphine" || phase !== 1) return;

    const pos = p();
    spawnSpeechBubble(
      "She escaped… but why spare me?",
      pos.x, pos.y, 4500
    );
  });

  // ------------------------------------------------------------
  // 11) FIRST PICKUPS (Diamonds, Shards, Health, Mana, Bravery)
  // ------------------------------------------------------------
  let lastGold = 0;
  let lastDiamonds = 0;
  let lastHearts = 0;
  let lastMana = 0;
  let lastBravery = 0;

  let saidDiamond = false;
  let saidShard = false;
  let saidHeart = false;
  let saidMana = false;
  let saidBravery = false;

  mapOn(1, "resourceUpdate", () => {
    const pos = p();

    // Diamonds
    if (!saidDiamond && gameState.diamonds > lastDiamonds) {
      saidDiamond = true;
      spawnSpeechBubble(
        "Diamonds! I can use these to upgrade my Spires!",
        pos.x, pos.y, 5000
      );
    }

    // Shards (Gold)
    if (!saidShard && gameState.gold > lastGold) {
      saidShard = true;
      spawnSpeechBubble(
        "Shards! I can use these to place and refresh my Spires.",
        pos.x, pos.y, 5000
      );
    }

    // Health
    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble(
        "A Heart! That'll heal me when I’m hurt.",
        pos.x, pos.y, 5000
      );
    }

    // Mana
    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble(
        "Mana essence… this lets me cast spells more often.",
        pos.x, pos.y, 5000
      );
    }

    // Bravery
    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble(
        "Bravery shards… these charge my Guardian form!",
        pos.x, pos.y, 5000
      );
    }

    // Update last values
    lastGold = gameState.gold;
    lastDiamonds = gameState.diamonds;
    lastHearts = gameState.hearts;
    lastMana = gameState.mana;
    lastBravery = gameState.bravery;
  });

  // ------------------------------------------------------------
  // 12) FIRST TIME A SPIRE IS DESTROYED
  // ------------------------------------------------------------
  let firstSpireDestroyed = false;

  mapOn(1, "spireDestroyed", ({ x, y }) => {
    if (firstSpireDestroyed) return;
    firstSpireDestroyed = true;

    const pos = p();
    spawnSpeechBubble(
      "My Spire! They can break them?! I need to keep those safe!",
      pos.x, pos.y, 5000
    );
  });

  // ------------------------------------------------------------
  // 13) ALL CRYSTAL ECHOES COLLECTED (ONE TIME)
  // ------------------------------------------------------------
  mapOnce(1, "echoComplete", ({ found, total }) => {
    const pos = p();
    spawnSpeechBubble(
      "All the Crystal Echoes… they’re resonating. They feel warm—like they're choosing me…",
      pos.x, pos.y, 5500
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "Ariana was right… something ancient is waking.",
        pos.x, pos.y, 5200
      );
    }, 2500);
  });

  // ------------------------------------------------------------
  // 14) External tutorial lines (from engine)
  // ------------------------------------------------------------
  mapOn(1, "tutorialSpeech", line => {
    const pos = p();
    spawnSpeechBubble(line, pos.x, pos.y, 4500);
  });
}

// ============================================================
// END OF FILE
// ============================================================
