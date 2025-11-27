// ============================================================
// 🌲 map1Events.js — Whispering Meadows Story Script (Final)
// ------------------------------------------------------------
// This file handles ALL narrative + tutorial logic for Map 1:
//   • 45-second guided introduction (controls, echoes, danger)
//   • Wave announcements + post-wave reflections
//   • First goblin kill dialogue (ONE TIME)
//   • First worg kill dialogue (ONE TIME)
//   • Wave 5 Ariana message (Crystal Link)
//   • Seraphine encounter dialogue (intro + mid-fight)
//   • Echo story hooks (50% / 100% handled globally)
//   • Low HP, bravery, etc. inherited from engine defaults
//
// All dialogue is shown using spawnSpeechBubble(), NOT full
// overlays (those are for wave1/wave5 only).
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

// ============================================================
// PLAYER POSITION HELPER
// ============================================================

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ============================================================
// 1) 45-SECOND TIMED INTRO (Tutorial + Setup)
// ============================================================
//
// Fired by eventEngine.js based on elapsed time.
// ============================================================

const TIMED_EVENTS = [
  {
    id: "t_003",
    timeRequired: 3,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Okay Glitter… deep breath. Move with WASD… this place feels familiar.",
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
        "Crystal Echoes… Ariana said to collect every one I can find.",
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
        "Spires activate when I stand close… arrows, magic—whatever helps.",
        pos.x, pos.y, 4200
      );
    }
  },
  {
    id: "t_025",
    timeRequired: 25,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "If goblins are really here… Ariana was right. Something’s stirring.",
        pos.x, pos.y, 4200
      );
    }
  },
  {
    id: "t_033",
    timeRequired: 33,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "And if the Echoes react… the Architect’s influence may be returning…",
        pos.x, pos.y, 5000
      );
    }
  },
  {
    id: "t_042",
    timeRequired: 42,
    action: () => {
      const pos = p();
      spawnSpeechBubble(
        "Focus Glitter… the first wave is coming.",
        pos.x, pos.y, 4000
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
  // 2) WAVE START
  // ------------------------------------------------------------
  Events.on(E.waveStart, ({ wave }) => {
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
        spawnSpeechBubble("They’re not slowing down… I need to stay focused.", pos.x, pos.y, 3500);
        break;

      case 5:
        spawnSpeechBubble("Ariana? Are you there?", pos.x, pos.y, 3500);
        break;

      case 6:
        spawnSpeechBubble("The goblins are getting bolder…", pos.x, pos.y, 3500);
        break;

      case 7:
        spawnSpeechBubble("I can feel the Echo energy pulsing…", pos.x, pos.y, 3500);
        break;

      case 8:
        spawnSpeechBubble("Almost there… just a little more!", pos.x, pos.y, 3500);
        break;

      case 9:
        spawnSpeechBubble("One last push before whatever’s coming…", pos.x, pos.y, 4000);
        break;

      case 10:
        spawnSpeechBubble("Something big is approaching…", pos.x, pos.y, 4000);
        break;
    }
  });

  // ------------------------------------------------------------
  // 3) WAVE END EVENTS (30 seconds between waves)
  // ------------------------------------------------------------
  Events.on(E.waveEnd, ({ wave }) => {
    const pos = p();

    if (wave === 1) {
      spawnSpeechBubble("Okay… okay. That wasn’t so bad.", pos.x, pos.y, 3500);
    }
    if (wave === 2) {
      spawnSpeechBubble("Why would goblins come this deep into the Meadows…?", pos.x, pos.y, 3500);
    }
    if (wave === 3) {
      spawnSpeechBubble("The air’s getting thicker… like something’s watching.", pos.x, pos.y, 4000);
    }
    if (wave === 4) {
      spawnSpeechBubble("Ariana better have an explanation for this…", pos.x, pos.y, 3500);
    }
    if (wave === 6) {
      spawnSpeechBubble("Stronger than they look… but so am I.", pos.x, pos.y, 3500);
    }
    if (wave === 7) {
      spawnSpeechBubble("My spires are really helping… I should stay close when they fire.", pos.x, pos.y, 4000);
    }
    if (wave === 8) {
      spawnSpeechBubble("Almost at the end… I can feel a presence ahead.", pos.x, pos.y, 3500);
    }
    if (wave === 9) {
      spawnSpeechBubble("That… that magic. Something powerful is coming…", pos.x, pos.y, 4000);
    }

  });

  // ------------------------------------------------------------
  // 4) WAVE 5 — ARIANA COMMS (full story overlay handled by story.js)
  // ------------------------------------------------------------
  // · Trigger handled globally by triggerEndOfWave5Story() in story.js
  // · We only add Glitter’s reaction here

  Events.on(E.waveEnd, ({ wave }) => {
    if (wave !== 5) return;
    const pos = p();
    spawnSpeechBubble(
      "Ariana… I knew you’d call. Something is wrong here.",
      pos.x, pos.y, 4500
    );
  });

  // ------------------------------------------------------------
  // 5) FIRST GOBLIN KILL (ONE TIME)
  // ------------------------------------------------------------
  let firstGoblinKill = false;

  Events.on(E.enemyKilled, ({ type }) => {
    if (type !== "goblin") return;

    if (!firstGoblinKill) {
      firstGoblinKill = true;

      const pos = p();
      spawnSpeechBubble(
        "I… I beat it. I can actually do this.",
        pos.x, pos.y, 4000
      );
    }
  });

  // ------------------------------------------------------------
  // 6) FIRST WORG KILL (ONE TIME)
  // ------------------------------------------------------------
  let firstWorgKill = false;

  Events.on(E.enemyKilled, ({ type }) => {
    if (type !== "worg") return;

    if (!firstWorgKill) {
      firstWorgKill = true;

      const pos = p();
      spawnSpeechBubble(
        "The wolves aren’t attacking on their own… something’s controlling them.",
        pos.x, pos.y,
        5000
      );
    }
  });

  // ------------------------------------------------------------
  // 7) FIRST BRAVERY FULL (ONE TIME)
  // ------------------------------------------------------------
  let firstBraveryFull = false;

  Events.on(E.braveryFull, () => {
    if (firstBraveryFull) return;
    firstBraveryFull = true;

    const pos = p();
    spawnSpeechBubble(
      "My Bravery is charged… press Q to unleash it!",
      pos.x, pos.y,
      5000
    );
  });
  
  // ------------------------------------------------------------
  // 8) FIRST BRAVERY ACTIVATION (ONE TIME, MORE DRAMATIC)
  // ------------------------------------------------------------
  let firstBraveryUse = false;

  Events.on(E.braveryActivated, () => {
    if (firstBraveryUse) return;
    firstBraveryUse = true;

    const pos = p();
    spawnSpeechBubble(
      "For the Crystal Isles!",
      pos.x, pos.y,
      4500
    );
  });


  // ------------------------------------------------------------
  // 7) BOSS / SERAPHINE: CONVERSATION + REACTIONS
  // ------------------------------------------------------------
  Events.on(E.bossSpawn, ({ boss, x, y }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    // Glitter sees her for the first time
    setTimeout(() => {
      spawnSpeechBubble(
        "What… what is THAT? That’s no goblin magic…",
        pos.x, pos.y,
        4500
      );
    }, 800);
  });

  // Optional mid-fight responses
  Events.on(E.bossHpThreshold, ({ boss, threshold }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    if (threshold === 75) {
      spawnSpeechBubble("Her magic feels… ancient…", pos.x, pos.y, 4000);
    }
    if (threshold === 50) {
      spawnSpeechBubble("She's testing me. Why?", pos.x, pos.y, 4000);
    }
  });

  // Seraphine Speech Module handles her lines + defeat line
  // We add Glitter’s last words ONLY for Map 1
  Events.on(E.bossDefeated, ({ boss, phase }) => {
    if (boss !== "seraphine" || phase !== 1) return;

    const pos = p();
    spawnSpeechBubble(
      "She escaped… but why spare me?",
      pos.x, pos.y,
      4500
    );
  });

  // END OF SCRIPT
}

// ============================================================
// 9) FIRST PICKUPS (diamonds, gold, health, mana, bravery)
// ============================================================

// Track previous values to detect first increase
let lastGold = gameState.gold ?? 0;
let lastDiamonds = gameState.diamonds ?? 0;
let lastHearts = gameState.hearts ?? 0;       // health pickups
let lastMana = gameState.mana ?? 0;           // mana pickups
let lastBravery = gameState.bravery ?? 0;     // bravery orbs

// One-time flags
let saidDiamond = false;
let saidGold = false;
let saidHeart = false;
let saidMana = false;
let saidBravery = false;

// Called every frame inside events system
Events.on("resourceUpdate", () => {
  const pos = p();

  // ----- DIAMONDS -----
  if (!saidDiamond && gameState.diamonds > lastDiamonds) {
    saidDiamond = true;
    spawnSpeechBubble(
      "Diamonds! I can use these to upgrade my Spires!",
      pos.x, pos.y, 5000
    );
  }

  // ----- GOLD -----
  if (!saidGold && gameState.gold > lastGold) {
    saidGold = true;
    spawnSpeechBubble(
      "Gold… useful! I can spend this on new abilities and upgrades.",
      pos.x, pos.y, 5000
    );
  }

  // ----- HEALTH PICKUP -----
  if (!saidHeart && gameState.hearts > lastHearts) {
    saidHeart = true;
    spawnSpeechBubble(
      "A Heart! That’ll heal me if I get hurt.",
      pos.x, pos.y, 5000
    );
  }

  // ----- MANA PICKUP -----
  if (!saidMana && gameState.mana > lastMana) {
    saidMana = true;
    spawnSpeechBubble(
      "Mana essence… this lets me cast my spells more often.",
      pos.x, pos.y, 5000
    );
  }

  // ----- BRAVERY PICKUP -----
  if (!saidBravery && gameState.bravery > lastBravery) {
    saidBravery = true;
    spawnSpeechBubble(
      "Bravery shards… these charge my Guardian form!",
      pos.x, pos.y, 5000
    );
  }

  // Update last known values
  lastGold = gameState.gold;
  lastDiamonds = gameState.diamonds;
  lastHearts = gameState.hearts;
  lastMana = gameState.mana;
  lastBravery = gameState.bravery;
});


Events.on("tutorialSpeech", line => {
  const pos = p();
  spawnSpeechBubble(line, pos.x, pos.y, 4500);
});