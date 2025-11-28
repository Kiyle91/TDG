// ============================================================
// 🌵 map3Events.js — Drylands Story Script (FULL VERSION)
// ------------------------------------------------------------
// Map 3: Troll territory. Dry, hot, miserable. Glitter hates it.
// Introduces Trolls (big HP brutes), first Ogres near the end.
//
// Covers:
//   • Timed introduction (humorous + environmental context)
//   • Wave start/end flavour text (10+ waves)
//   • First troll kill reaction
//   • First ogre kill reaction
//   • First pickups (Shards, Diamonds, Hearts, Mana, Bravery)
//   • Spire destruction (one-time)
//   • Echo half + complete narrative
//   • Life-loss callouts
//   • No boss here — Seraphine returns later.
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

// ------------------------------------------------------------
// PLAYER POSITION HELPER
// ------------------------------------------------------------
const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ------------------------------------------------------------
// LIFE-LOSS CALLOUT LINES
// ------------------------------------------------------------
const lifeLossLines = {
  80: [
    "One slipped past—ugh, the dust is blinding!",
    "Stay sharp Glitter—dry air’s no excuse!"
  ],
  60: [
    "These trolls hit harder than they smell!",
    "Focus! Reinforce the paths!"
  ],
  40: [
    "We’re losing ground! Hold them back!",
    "If any more get through I’m blaming the heat!"
  ],
  20: [
    "Princess, we’re almost out of room here!",
    "This is looking bad… don’t give up!"
  ]
};

// ------------------------------------------------------------
// TIMED INTRO — 45s (Humour + Environmental Setup)
// ------------------------------------------------------------
const TIMED_EVENTS = [
  {
    id: "t_003",
    timeRequired: 3,
    action: () => {
      const pos = p();
      spawnSpeechBubble("Ugh… dry, dusty, hot… welcome to the Drylands.", pos.x, pos.y, 4500);
    }
  },
  {
    id: "t_010",
    timeRequired: 10,
    action: () => {
      const pos = p();
      spawnSpeechBubble("Troll territory. Perfect. Just perfect.", pos.x, pos.y, 4200);
    }
  },
  {
    id: "t_018",
    timeRequired: 18,
    action: () => {
      const pos = p();
      spawnSpeechBubble("Echoes still appear out here… somehow.", pos.x, pos.y, 4200);
    }
  },
  {
    id: "t_026",
    timeRequired: 26,
    action: () => {
      const pos = p();
      spawnSpeechBubble("Place your Spires close to the paths—trolls don’t fall for tricks.", pos.x, pos.y, 4500);
    }
  },
  {
    id: "t_040",
    timeRequired: 40,
    action: () => {
      const pos = p();
      spawnSpeechBubble("Heat’s rising… something’s coming.", pos.x, pos.y, 4000);
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
      1: "First wave… let’s see how trolls handle arrows.",
      2: "More goblins? How’d they survive out here?",
      3: "I hear stomping. That’s… not reassuring.",
      4: "Heat and goblins… worst combination.",
      5: "Okay, now they're getting organised. Bad sign.",
      6: "Is that… a troll? Yep. That’s a troll.",
      7: "They're pushing hard… stay close to your Spires.",
      8: "Drylands aren’t slowing them down… why?!",
      9: "Something massive is rumbling out there…",
      10: "These footsteps… that better not be an ogre.",
      11: "Here they come—big ones too.",
      12: "I refuse to get flattened today.",
      13: "Almost at the end… stay sharp!",
      14: "This heat is making everything worse.",
      15: "One last push—Drylands won’t beat me!"
    };

    if (lines[wave]) {
      spawnSpeechBubble(lines[wave], pos.x, pos.y, 4200);
    }
  });

  // ------------------------------------------------------------
  // WAVE END DIALOGUE
  // ------------------------------------------------------------
  mapOn(3, E.waveEnd, ({ wave }) => {
    const pos = p();

    const lines = {
      1: "Okay… that wasn’t too bad.",
      2: "Why does everything taste like sand?",
      3: "Someone’s definitely watching us.",
      4: "Heat’s getting worse… great.",
      5: "Trolls incoming soon. I can feel it.",
      6: "Troll down! They’re tough but slow.",
      7: "My Spires are working overtime out here.",
      8: "We’re getting closer… stay cautious.",
      9: "Those footsteps sounded… large.",
      10: "If that wasn’t an ogre… what was it?",
      11: "They just keep coming…",
      12: "Everything hurts and it's too hot.",
      13: "Nearly done! I can taste victory… or sand.",
      14: "One more wave… let's end this!",
    };

    if (lines[wave]) {
      spawnSpeechBubble(lines[wave], pos.x, pos.y, 4200);
    }
  });

  // ------------------------------------------------------------
  // FIRST TROLL KILL
  // ------------------------------------------------------------
  let firstTrollKill = false;

  mapOn(3, E.enemyKilled, ({ type }) => {
    if (type !== "troll" || firstTrollKill) return;
    firstTrollKill = true;

    const pos = p();
    spawnSpeechBubble("Troll defeated! That took way too long.", pos.x, pos.y, 4800);
  });

  // ------------------------------------------------------------
  // FIRST OGRE KILL
  // ------------------------------------------------------------
  let firstOgreKill = false;

  mapOn(3, E.enemyKilled, ({ type }) => {
    if (type !== "ogre" || firstOgreKill) return;
    firstOgreKill = true;

    const pos = p();
    spawnSpeechBubble("An ogre… fell?! I’m stronger than I thought!", pos.x, pos.y, 5000);
  });

  // ------------------------------------------------------------
  // FIRST PICKUPS (Shards, Diamonds, Hearts, Mana, Bravery)
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
      spawnSpeechBubble("Shards! Perfect—more Spires for the field.", pos.x, pos.y, 5000);
    }

    if (!saidDiamond && gameState.diamonds > lastDiamonds) {
      saidDiamond = true;
      spawnSpeechBubble("Diamonds! Upgrade time!", pos.x, pos.y, 5000);
    }

    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble("Heart essence—much needed in this heat.", pos.x, pos.y, 5000);
    }

    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble("Mana! Finally—I can cast again.", pos.x, pos.y, 5000);
    }

    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble("Bravery shards… I feel stronger already.", pos.x, pos.y, 5000);
    }

    lastGold = gameState.gold;
    lastDiamonds = gameState.diamonds;
    lastHearts = gameState.hearts;
    lastMana = gameState.mana;
    lastBravery = gameState.bravery;
  });

  // ------------------------------------------------------------
  // SPIRE DESTROYED — FIRST TIME
  // ------------------------------------------------------------
  let firstSpireDown = false;

  mapOn(3, "spireDestroyed", () => {
    if (firstSpireDown) return;
    firstSpireDown = true;

    const pos = p();
    spawnSpeechBubble("My Spire! Ugh—trolls hit like wagons!", pos.x, pos.y, 5000);
  });

  // ------------------------------------------------------------
  // ECHO COLLECTION — HALF + COMPLETE
  // ------------------------------------------------------------
  mapOn(3, E.echoHalf, ({ found, total }) => {
    const pos = p();
    spawnSpeechBubble("Half the Echoes… even out here they shine.", pos.x, pos.y, 4500);
  });

  mapOnce(3, E.echoComplete, () => {
    const pos = p();
    spawnSpeechBubble("All the Echoes… glowing together again.", pos.x, pos.y, 5500);

    setTimeout(() => {
      spawnSpeechBubble("Drylands or not… the crystals still trust me.", pos.x, pos.y, 5200);
    }, 2500);
  });

  // ------------------------------------------------------------
  // LIFE LOSS CALLOUTS
  // ------------------------------------------------------------
  const thresholds = Object.keys(lifeLossLines).map(Number).sort((a, b) => b - a);
  const triggered = new Set();

  mapOn(3, E.playerLifeLost, ({ lives }) => {
    const total = 10;
    const pct = (lives / total) * 100;
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
