// ============================================================
// 🌵 map3Events.js — Drylands Story Script (Rewritten Final)
// ------------------------------------------------------------
// Map 3: Troll territory. Dry, hot, miserable.
// Introduces Trolls (big HP brutes) and first Ogres.
// No Seraphine / No boss events here.
//
// Covers:
//   • Timed environmental intro
//   • Wave start/end flavour text
//   • First troll kill + first ogre kill
//   • First pickups (Shards, Diamonds, Hearts, Mana, Bravery)
//   • Spire depletion (one-time)
//   • Echo half + complete dialogue
//   • Life-loss callouts
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

// ------------------------------------------------------------
// PLAYER POSITION HELPER
// ------------------------------------------------------------
const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ------------------------------------------------------------
// LIFE-LOSS CALLOUTS (updated to remove names + lore errors)
// ------------------------------------------------------------
const lifeLossLines = {
  80: [
    "One slipped past—this dust is brutal!",
    "Ugh… dry air doesn’t help, but stay focused!"
  ],
  60: [
    "These trolls hit harder than the heat!",
    "Focus… reinforce the paths!"
  ],
  40: [
    "They’re pushing through! Hold them back!",
    "If any more slip past, I’m blaming the sun!"
  ],
  20: [
    "Almost out of room here!",
    "This is looking rough… don’t give up!"
  ]
};

// ------------------------------------------------------------
// TIMED INTRO — 45s (Environmental + humour)
// ------------------------------------------------------------
const TIMED_EVENTS = [
  {
    id: "t_003",
    timeRequired: 3,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Dry, dusty, hot… yep. Welcome to the Drylands.",
        pos.x, pos.y, 4500
      );
    }
  },
  {
    id: "t_010",
    timeRequired: 10,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Troll territory… of course it is.",
        pos.x, pos.y, 4200
      );
    }
  },
  {
    id: "t_018",
    timeRequired: 18,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Crystal Echoes still appear out here… somehow.",
        pos.x, pos.y, 4200
      );
    }
  },
  {
    id: "t_026",
    timeRequired: 26,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Spires near the path… trolls don’t fall for tricks.",
        pos.x, pos.y, 4500
      );
    }
  },
  {
    id: "t_040",
    timeRequired: 40,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Feels like something heavy is headed this way…",
        pos.x, pos.y, 4000
      );
    }
  }
];

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
export default function initMap3Events() {
  loadTimedEventsForMap(3, TIMED_EVENTS);

  // ------------------------------------------------------------
  // WAVE START DIALOGUE
  // ------------------------------------------------------------
  mapOn(3, E.waveStart, ({ wave }) => {
    const pos = p();

    const lines = {
      1:  "First wave… let’s see how trolls handle arrows.",
      2:  "More goblins… how do they survive out here?",
      3:  "I hear stomping… not reassuring.",
      4:  "Heat and goblins… perfect combination.",
      5:  "Great… now they’re getting organised.",
      6:  "Is that a troll? Yep. That’s a troll.",
      7:  "They’re pushing hard… stay close to the spires.",
      8:  "Drylands aren’t slowing them down… why?",
      9:  "Something massive is rumbling out there…",
      10: "Those footsteps… please don’t be an ogre.",
      11: "Okay… looks like the bigger ones are here.",
      12: "I refuse to get flattened today.",
      13: "Almost through… stay focused.",
      14: "This heat is making everything worse.",
      15: "Last push… Drylands won’t beat me!"
    };

    if (lines[wave]) spawnSpeechBubble(lines[wave], pos.x, pos.y, 4200);
  });

  // ------------------------------------------------------------
  // WAVE END DIALOGUE
  // ------------------------------------------------------------
  mapOn(3, E.waveEnd, ({ wave }) => {
    const pos = p();

    const lines = {
      1:  "Okay… that wasn’t too bad.",
      2:  "Everything tastes like sand.",
      3:  "I swear someone’s watching from the cliffs.",
      4:  "Heat’s getting worse… of course it is.",
      5:  "Trolls incoming soon… I can feel it.",
      6:  "Troll down… tough but slow.",
      7:  "Spires are working overtime out here.",
      8:  "Getting closer… stay cautious.",
      9:  "Those footsteps were definitely large.",
      10: "If that wasn’t an ogre… what was it?",
      11: "They just keep coming…",
      12: "Everything hurts and it’s too hot.",
      13: "Nearly done… I can taste victory. Or sand.",
      14: "One more wave… let's end this."
    };

    if (lines[wave]) spawnSpeechBubble(lines[wave], pos.x, pos.y, 4200);
  });

  // ------------------------------------------------------------
  // FIRST TROLL KILL
  // ------------------------------------------------------------
  let firstTrollKill = false;

  mapOn(3, E.enemyKilled, ({ type }) => {
    if (type !== "troll" || firstTrollKill) return;
    firstTrollKill = true;

    const pos = p();
    spawnSpeechBubble(
      "Troll defeated… took long enough.",
      pos.x, pos.y, 4800
    );
  });

  // ------------------------------------------------------------
  // FIRST OGRE KILL
  // ------------------------------------------------------------
  let firstOgreKill = false;

  mapOn(3, E.enemyKilled, ({ type }) => {
    if (type !== "ogre" || firstOgreKill) return;
    firstOgreKill = true;

    const pos = p();
    spawnSpeechBubble(
      "An ogre… fell?! I’m stronger than I thought.",
      pos.x, pos.y, 5000
    );
  });

  // ------------------------------------------------------------
  // BRAVERY TRIGGERS
  // ------------------------------------------------------------
  let braveryFull = false;
  let braveryUsed = false;

  mapOn(3, E.braveryFull, () => {
    if (braveryFull) return;
    braveryFull = true;

    const pos = p();
    spawnSpeechBubble(
      "My Bravery is full… press Q to release the aura!",
      pos.x, pos.y, 4500
    );
  });

  mapOn(3, E.braveryActivated, () => {
    if (braveryUsed) return;
    braveryUsed = true;

    const pos = p();
    spawnSpeechBubble(
      "Drylands won’t break me—Aura, let’s go!",
      pos.x, pos.y, 4800
    );
  });


  // ------------------------------------------------------------
  // FIRST PICKUPS
  // ------------------------------------------------------------
  let lastGold = 0;
  let lastDiamonds = 0;
  let lastHearts = 0;
  let lastMana = 0;
  let lastBravery = 0;

  let saidShard = false;
  let saidDiamond = false;
  let saidHeart = false;
  let saidMana = false;
  let saidBravery = false;

  mapOn(3, "resourceUpdate", () => {
    const pos = p();

    if (!saidShard && gameState.gold > lastGold) {
      saidShard = true;
      spawnSpeechBubble("Shards! More spires for the field.", pos.x, pos.y, 5000);
    }

    if (!saidDiamond && gameState.diamonds > lastDiamonds) {
      saidDiamond = true;
      spawnSpeechBubble("Diamonds… upgrade time.", pos.x, pos.y, 5000);
    }

    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble("Heart essence… desperately needed.", pos.x, pos.y, 5000);
    }

    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble("Mana! Finally—I can cast again.", pos.x, pos.y, 5000);
    }

    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble("Bravery shards… my Aura feels stronger.", pos.x, pos.y, 5000);
    }

    lastGold = gameState.gold;
    lastDiamonds = gameState.diamonds;
    lastHearts = gameState.hearts;
    lastMana = gameState.mana;
    lastBravery = gameState.bravery;
  });

  // ------------------------------------------------------------
  // FIRST SPIRE DEPLETION
  // ------------------------------------------------------------
  let firstSpireDown = false;

  mapOn(3, "spireDestroyed", () => {
    if (firstSpireDown) return;
    firstSpireDown = true;

    const pos = p();
    spawnSpeechBubble(
      "A spire faded… trolls hit too hard to rely on one.",
      pos.x, pos.y, 5000
    );
  });

  // ------------------------------------------------------------
  // ECHO COLLECTION — HALF + COMPLETE
  // ------------------------------------------------------------
  mapOn(3, E.echoHalf, ({ found, total }) => {
    const pos = p();
    spawnSpeechBubble(
      "Half the Echoes… even in the Drylands they shine.",
      pos.x, pos.y, 4500
    );
  });

  mapOnce(3, E.echoComplete, () => {
    const pos = p();
    spawnSpeechBubble(
      "All the Echoes… glowing together again.",
      pos.x, pos.y, 5500
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "Drylands or not… the crystals still trust me.",
        pos.x, pos.y, 5200
      );
    }, 2500);
  });

  // ------------------------------------------------------------
  // LIFE LOSS CALLOUTS
  // ------------------------------------------------------------
  const thresholds = Object.keys(lifeLossLines)
    .map(Number)
    .sort((a, b) => b - a);

  const triggered = new Set();

  mapOn(3, E.playerLifeLost, ({ lives }) => {
    const totalLives = 10;
    const pct = (lives / totalLives) * 100;
    const pos = p();

    for (const t of thresholds) {
      if (pct <= t && !triggered.has(t)) {
        triggered.add(t);
        const arr = lifeLossLines[t];
        const line = arr[Math.floor(Math.random() * arr.length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4200);
        break;
      }
    }
  });
}


// ============================================================
// END OF FILE
// ============================================================
