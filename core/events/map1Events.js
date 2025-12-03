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

  // 1 — WASD movement
  {
    id: "t_006",
    timeRequired: 6,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Okay… Whispering Meadows. I should look around. I move with WASD.",
        pos.x, pos.y, 4200
      );
    }
  },

  // 2 — Sword / Melee
  {
    id: "t_012",
    timeRequired: 12,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "If anything gets close, I can swing my weapon with SPACEBAR.",
        pos.x, pos.y, 4000
      );
    }
  },

  // 3 — Bow / Click to shoot
  {
    id: "t_018",
    timeRequired: 18,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "I can fire an arrow by CLICKING anywhere. It costs mana, so I shouldn’t spam it.",
        pos.x, pos.y, 4200
      );
    }
  },

  // 4 — Spellcasting
  {
    id: "t_024",
    timeRequired: 24,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "I can cast my SPELL with F. It’s strong, but uses more mana.",
        pos.x, pos.y, 4000
      );
    }
  },

  // 5 — Healing
  {
    id: "t_030",
    timeRequired: 30,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "If I’m hurt, I can HEAL with R. Good to remember.",
        pos.x, pos.y, 4000
      );
    }
  },

  // 6 — Sprint
  {
    id: "t_036",
    timeRequired: 36,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Holding SHIFT lets me sprint. Great for dodging and collecting things quickly.",
        pos.x, pos.y, 4100
      );
    }
  },

  // 7 — Crystals (Echoes)
  {
    id: "t_042",
    timeRequired: 42,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "These glowing fragments are Crystal Echoes. I should collect as many as I can.",
        pos.x, pos.y, 4200
      );
    }
  },

  // 8 — Bravery Mode
  {
    id: "t_048",
    timeRequired: 48,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "My Health, Mana and Bravery Bar are at the bottom of the screen",
        pos.x, pos.y, 4400
      );
    }
  },

  // 9 — Spires + objective
  {
    id: "t_054",
    timeRequired: 54,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "I should put down some Spires and keep an eye out for any goblin activity.",
        pos.x, pos.y, 4500
      );
    }
  }

]

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
        spawnSpeechBubble("Whats that?… That might be a goblin!", pos.x, pos.y, 3500);
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
