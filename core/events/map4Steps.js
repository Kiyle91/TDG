// ============================================================
// 🔥 Map 4 — Glitter’s Ember Realm Script
// ------------------------------------------------------------
// No tutorials. Pure humour, sass, confidence.
// Flame castle theme with dramatic Glitter commentary.
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ARRIVAL (0–20s)
  // ============================================================

  {
    id: "t_000",
    timeRequired: 0,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Oh GREAT. Everything’s on fire. Love that for me.",
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
        "Seriously though… who decorates with lava? It’s not a vibe.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_020",
    timeRequired: 20,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If a goblin pushes me into lava, I’m filing a complaint.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — FIRE REALM GOBLINS (30–60s)
  // ============================================================

  {
    id: "t_030",
    timeRequired: 30,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Fire goblins… hotter, angrier, and still deeply unfashionable.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_045",
    timeRequired: 45,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If one of them catches my hair, I’m SCREAMING.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Reminder: Glitter beats goblins AND fire. I’m unstoppable.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — EMBER REALM FLAVOUR (70–120s)
  // ============================================================

  {
    id: "t_070",
    timeRequired: 70,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Everything here smells like burnt marshmallows and rage.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_090",
    timeRequired: 90,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "These rocks are literally glowing… glitter, but make it dangerous.",
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
        "Imagine living in a place that’s just… fire, forever. Couldn’t be me.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — FIERY COMEDY (135–180s)
  // ============================================================

  {
    id: "t_135",
    timeRequired: 135,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I bet the goblins here think they’re SO tough. Bless.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_155",
    timeRequired: 155,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay but why do they run like their feet are hot? Oh wait.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_180",
    timeRequired: 180,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If one more goblin screams at me, I’m throwing it INTO the lava.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — GLITTER GETS DRAMATIC (195–250s)
  // ============================================================

  {
    id: "t_195",
    timeRequired: 195,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I feel like a fire princess. A sweaty, irritated fire princess.",
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
        "Do goblins even moisturise? Their skin looks… crunchy.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_250",
    timeRequired: 250,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Note to self: Ember Realm is a great place to roast marshmallows… and goblins.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — ENDGAME FIRE ENERGY (270–330s)
  // ============================================================

  {
    id: "t_270",
    timeRequired: 270,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still alive. Still fabulous. Flame-proof at this point.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_300",
    timeRequired: 300,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Honestly? I’m kinda slaying this entire volcano.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_330",
    timeRequired: 330,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana’s going to freak out when she hears I beat the FIRE map. Big bragging moment.",
        p.pos.x, p.pos.y
      );
    },
  },

];
