// ============================================================
// 🌲 map1Events.js — Whispering Meadows Story Script (Rewrite)
// ------------------------------------------------------------
// Map 1: Light narrative, soft tutorial, early pacing, boss intro
//
// Covers:
//   • Timed introduction (updated for lore + mechanics)
//   • Wave start/end flavour
//   • First goblin kill
//   • First worg kill (controlled hint)
//   • Ariana wave 5 comms
//   • First pickups (Diamonds, Shards, Health, Mana, Bravery)
//   • First spire depletion
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
    "Ah! One slipped past—stay focused.",
    "It’s okay… just breathe. I can handle this."
  ],
  60: [
    "They’re rushing the paths… I should place more spires.",
    "That lane’s heating up—maybe reinforce it?"
  ],
  40: [
    "They’re getting through faster now… stay calm.",
    "Still winnable… don’t panic."
  ],
  20: [
    "Careful… I’m running out of room here!",
    "I can’t afford many more mistakes…"
  ]
};

// ============================================================
// PLAYER POSITION HELPER
// ============================================================

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };
const isActiveMap = () => (gameState.progress?.currentMap ?? 1) === 1;

// ============================================================
// 1) TIMED INTRO — Light + Non-Intrusive
// ============================================================

const TIMED_EVENTS = [

  // --- Movement ---
  {
    id: "t_003",
    timeRequired: 3,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Okay… Whispering Meadows. Let’s take a look around. I can move with WASD.",
        pos.x, pos.y, 4200
      );
    }
  },

  // --- Exploring the area ---
  {
    id: "t_007",
    timeRequired: 7,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "I should get used to the controls before heading deeper into the fields.",
        pos.x, pos.y, 4200
      );
    }
  },

  // --- Melee attack ---
  {
    id: "t_010",
    timeRequired: 10,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "If anything gets close, I can swing my weapon with SPACEBAR.",
        pos.x, pos.y, 3800
      );
    }
  },

  // --- Purpose clarity (simple) ---
  {
    id: "t_014",
    timeRequired: 14,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Ariana said the Meadows have been acting strange lately… I’ll check the paths.",
        pos.x, pos.y, 4300
      );
    }
  },

  // --- Ranged attacks ---
  {
    id: "t_018",
    timeRequired: 18,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "If I CLICK anywhere, I can shoot an arrow. It uses mana, so I shouldn’t spam it.",
        pos.x, pos.y, 4200
      );
    }
  },

  // --- Mana reminder ---
  {
    id: "t_022",
    timeRequired: 22,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "My mana refills slowly over time. I should use ranged shots wisely.",
        pos.x, pos.y, 4200
      );
    }
  },

  // --- Spellcasting ---
  {
    id: "t_028",
    timeRequired: 28,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "I can cast my SPELL with the F KEY. It’s powerful, but costs more mana.",
        pos.x, pos.y, 4100
      );
    }
  },

  // --- Healing ---
  {
    id: "t_033",
    timeRequired: 33,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "If I take damage, I can HEAL myself with R. Good to remember!",
        pos.x, pos.y, 4100
      );
    }
  },

  // --- Sprint ---
  {
    id: "t_038",
    timeRequired: 38,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Holding SHIFT lets me sprint. Perfect for dodging or collecting things faster.",
        pos.x, pos.y, 4100
      );
    }
  },

  // --- Echo explanation ---
  {
    id: "t_045",
    timeRequired: 45,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "These glowing fragments are Crystal Echoes. I should pick up as many as I can.",
        pos.x, pos.y, 4200
      );
    }
  },

  // --- Purpose summary ---
  {
    id: "t_052",
    timeRequired: 52,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Ariana asked me to sweep the Meadows and make sure everything is normal.",
        pos.x, pos.y, 4500
      );
    }
  },
  
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
        spawnSpeechBubble("Here they come… stay ready.", pos.x, pos.y, 3500);
        break;
      case 2:
        spawnSpeechBubble("More goblins… still pushing forward.", pos.x, pos.y, 3500);
        break;
      case 3:
        spawnSpeechBubble("Something feels strange in these woods…", pos.x, pos.y, 4000);
        break;
      case 4:
        spawnSpeechBubble("They’re not slowing down… keep moving.", pos.x, pos.y, 3500);
        break;
      case 5:
        spawnSpeechBubble("Ariana… can you hear me?", pos.x, pos.y, 3500);
        break;
      case 6:
        spawnSpeechBubble("They’re getting braver… or desperate.", pos.x, pos.y, 3500);
        break;
      case 7:
        spawnSpeechBubble("The Echo energy is building… I can feel it.", pos.x, pos.y, 3500);
        break;
      case 8:
        spawnSpeechBubble("Almost there… just a little more.", pos.x, pos.y, 3500);
        break;
      case 9:
        spawnSpeechBubble("Something powerful is approaching…", pos.x, pos.y, 3800);
        break;
      case 10:
        spawnSpeechBubble("This presence… it’s overwhelming.", pos.x, pos.y, 4000);
        break;
    }
  });

  // ------------------------------------------------------------
  // 3) WAVE END SPEECHES
  // ------------------------------------------------------------
  mapOn(1, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Goblins in the Whispering Meadows.. Let me try to get Ariana on the Crystal Link", pos.x, pos.y, 3500);
        break;
      case 2:
        spawnSpeechBubble("No idea why goblins are here, but im getting some Crystal Spires down fast!", pos.x, pos.y, 3500);
        break;
      case 3:
        spawnSpeechBubble("Feels like something is watching me…", pos.x, pos.y, 3800);
        break;
      case 4:
        spawnSpeechBubble("Ariana better have answers…", pos.x, pos.y, 3500);
        break;
      case 6:
        spawnSpeechBubble("They’re stronger than they look… but so am I.", pos.x, pos.y, 3500);
        break;
      case 7:
        spawnSpeechBubble("My spires are holding… keeping them close to the path helps.", pos.x, pos.y, 4000);
        break;
      case 8:
        spawnSpeechBubble("The Echoes are humming… something’s stirring.", pos.x, pos.y, 3800);
        break;
      case 9:
        spawnSpeechBubble("That magic… it feels heavy.", pos.x, pos.y, 4000);
        break;
    }
  });

  // ------------------------------------------------------------
  // 4) ARIANA CALL AFTER WAVE 5
  // ------------------------------------------------------------
  mapOn(1, E.waveEnd, ({ wave }) => {
    if (wave !== 5) return;
    const pos = p();
    spawnSpeechBubble(
      "Ariana… I knew you’d reach me. Something’s wrong here.",
      pos.x, pos.y, 4500
    );
  });

  // ------------------------------------------------------------
  // 5) FIRST GOBLIN KILL
  // ------------------------------------------------------------
  let firstGoblinKill = false;

  mapOn(1, E.enemyKilled, ({ type }) => {
    if (type !== "goblin") return;
    if (firstGoblinKill) return;
    firstGoblinKill = true;

    const pos = p();
    spawnSpeechBubble(
      "No mistaking it.. Thats a goblin.. Ewww.",
      pos.x, pos.y, 4200
    );
  });

  // ------------------------------------------------------------
  // 6) FIRST WORG KILL
  // ------------------------------------------------------------
  let firstWorgKill = false;

  mapOn(1, E.enemyKilled, ({ type }) => {
    if (type !== "worg") return;
    if (firstWorgKill) return;
    firstWorgKill = true;

    const pos = p();
    spawnSpeechBubble(
      "The wolves aren’t acting on their own… something’s guiding them.",
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
      "My Bravery is full… press Q to release the aura!",
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
        "What… what is that? That’s not goblin magic…",
        pos.x, pos.y, 4500
      );
    }, 800);
  });

  mapOn(1, E.bossHpThreshold, ({ boss, threshold }) => {
    if (boss !== "seraphine") return;

    const pos = p();
    if (threshold === 75) {
      spawnSpeechBubble("Her magic feels ancient… older than these woods.", pos.x, pos.y, 3800);
    }
    if (threshold === 50) {
      spawnSpeechBubble("She’s holding back… but why?", pos.x, pos.y, 3800);
    }
  });

  mapOn(1, E.bossDefeated, ({ boss, phase }) => {
    if (boss !== "seraphine" || phase !== 1) return;

    const pos = p();
    spawnSpeechBubble(
      "She slipped away… but she could’ve ended me. Why spare me?",
      pos.x, pos.y, 4500
    );
  });

  // ------------------------------------------------------------
  // 11) FIRST PICKUPS
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
        "Diamonds! I can use these to upgrade my spires.",
        pos.x, pos.y, 5000
      );
    }

    // Shards
    if (!saidShard && gameState.gold > lastGold) {
      saidShard = true;
      spawnSpeechBubble(
        "Shards! I need these to place and refresh spires.",
        pos.x, pos.y, 5000
      );
    }

    // Health
    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble(
        "A Heart! That’ll help when I’m hurt.",
        pos.x, pos.y, 5000
      );
    }

    // Mana
    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble(
        "Mana essence… now I can cast more spells.",
        pos.x, pos.y, 5000
      );
    }

    // Bravery
    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble(
        "Bravery shards… these build up my Bravery Aura!",
        pos.x, pos.y, 5000
      );
    }

    lastGold = gameState.gold;
    lastDiamonds = gameState.diamonds;
    lastHearts = gameState.hearts;
    lastMana = gameState.mana;
    lastBravery = gameState.bravery;
  });

  // ------------------------------------------------------------
  // 12) FIRST SPIRE DEPLETED
  // ------------------------------------------------------------
  let firstSpireDestroyed = false;

  mapOn(1, "spireDestroyed", ({ x, y }) => {
    if (firstSpireDestroyed) return;
    firstSpireDestroyed = true;

    const pos = p();
    spawnSpeechBubble(
      "My spire faded… I need to keep watch and replace them.",
      pos.x, pos.y, 5000
    );
  });

  // ------------------------------------------------------------
  // 13) ALL CRYSTAL ECHOES COLLECTED
  // ------------------------------------------------------------
  mapOnce(1, "echoComplete", ({ found, total }) => {
    const pos = p();
    

    setTimeout(() => {
      spawnSpeechBubble(
        "All Crystal Echoes collected.. My Crystal Spires are fully powered!",
        pos.x, pos.y, 5200
      );
    }, 2500);
  });

  // ------------------------------------------------------------
  // 14) EXTERNAL TUTORIAL LINES
  // ------------------------------------------------------------
  mapOn(1, "tutorialSpeech", line => {
    const pos = p();
    spawnSpeechBubble(line, pos.x, pos.y, 4500);
  });
}

// ------------------------------------------------------------
// Pegasus Loot Lines — Map 1 (Whispering Meadow)
// ------------------------------------------------------------

export const pegasusLootLines_Map1 = [
  "Thanks girl! My flying unicorn always knows when I need help.",
  "Oh! Another drop? She really looks out for me.",
  "Ariana calls her a pegasus… but she drops loot like a magical unicorn."
];


// ============================================================
// END OF FILE
// ============================================================
