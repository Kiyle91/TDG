// ============================================================
// 🍂 Map 3 — Glitter’s Time-Based Story Script
// ------------------------------------------------------------
// Humorous, girly, confident Glitter commentary
// Golden Drylands theme — warm, dusty, dramatic
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ARRIVING IN THE DRYLANDS (0–20s)
  // ============================================================

  {
    id: "t_000",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Wow… everything’s so gold and sparkly. Did I accidentally walk into a hair advert?",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_010",
    timeRequired: 10,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Drylands? More like Glitterlands. I own this vibe.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_018",
    timeRequired: 18,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If a goblin pops out of a leaf pile, I swear I’m kicking it.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — FIRST ENCOUNTERS (25–50s)
  // ============================================================

  {
    id: "t_025",
    timeRequired: 25,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ugh, I smell goblins. They smell like burnt toast and bad decisions.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_038",
    timeRequired: 38,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Remember Glitter: cute, brave, and terrifying when provoked.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_050",
    timeRequired: 50,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The second a goblin wobbles at me… boom. Sword time.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — ECHOES & EXPLORATION (60–95s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Crystal Echoes look extra shiny out here… like treasure posing for photos.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_078",
    timeRequired: 78,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ooooh, I want ALL the Echoes. Glitter is collecting EVERYTHING today.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_095",
    timeRequired: 95,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If it sparkles, I pick it up. It’s the rule.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — SPIRE TALK (105–140s)
  // ============================================================

  {
    id: "t_105",
    timeRequired: 105,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "These Drylands are huge… better place some Spires.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_120",
    timeRequired: 120,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Spires are basically my little sparkle soldiers.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_140",
    timeRequired: 140,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "1 through 5 to summon… and yes, they make me look powerful.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — POWERS & ABILITIES (150–185s)
  // ============================================================

  {
    id: "t_150",
    timeRequired: 150,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I get hurt, R to heal. Glitter refuses to look dusty.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_165",
    timeRequired: 165,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "F for spells. Let’s turn goblins into glitter clouds.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_185",
    timeRequired: 185,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Q for bravery. Basically my ‘I’m done being nice’ button.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — MID-MAP FLAVOUR (195–240s)
  // ============================================================

  {
    id: "t_195",
    timeRequired: 195,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The trees here look pretty… probably hiding ugly goblins.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_220",
    timeRequired: 220,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Why do goblins run like noodles? Stand still so I can fix you!",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_240",
    timeRequired: 240,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I swear, if one more worg snarls at me, it’s getting sparkled.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — LATE MAP CONFIDENCE (255–310s)
  // ============================================================

  {
    id: "t_255",
    timeRequired: 255,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still slaying. Still iconic. Still Glitter.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_280",
    timeRequired: 280,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Golden Drylands? More like Golden Glitterlands now.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_310",
    timeRequired: 310,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana is gonna scream when she hears I beat Map Three. Happy scream, not goblin scream.",
        p.pos.x, p.pos.y
      );
    },
  },

];
