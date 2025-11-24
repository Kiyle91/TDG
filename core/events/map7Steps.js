// ============================================================
// 🍄 Map 7 — Glitter’s Mushroom Realm Script
// ------------------------------------------------------------
// No tutorials. Peak comedy. Glitter vs spores, mushrooms,
// suspicious goblins, weird colours, and general nonsense.
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — FIRST IMPRESSIONS (0–20s)
  // ============================================================

  {
    id: "t_000",
    timeRequired: 0,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay… this place is weird. Like, REALLY weird.",
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
        "Why are the mushrooms taller than me? Who allowed this?",
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
        "If one of these mushrooms talks to me, I’m leaving.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — MUSHROOM GOBLINS (30–60s)
  // ============================================================

  {
    id: "t_030",
    timeRequired: 30,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Oh no. Even the goblins look weird here. That’s saying something.",
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
        "Eww! That one just sneezed spores. I’m suing.",
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
        "Why are they running like they’re on a sugar rush?",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — REALM FLAVOUR (75–120s)
  // ============================================================

  {
    id: "t_075",
    timeRequired: 75,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "There are so many colours. It’s like someone spilled a rainbow.",
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
        "Why does the air taste like… strawberry? Should I be worried?",
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
        "I swear one mushroom just twitched. I’m watching you.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — PEAK MUSHROOM CHAOS (135–180s)
  // ============================================================

  {
    id: "t_135",
    timeRequired: 135,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Imagine a goblin tripping on a mushroom cap. That’d make my day.",
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
        "This map smells… funky. Not cute-funky. FUNKY-funky.",
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
        "If these mushrooms are magical, they better give me sparkles.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — GLITTER GETS STRANGE (195–250s)
  // ============================================================

  {
    id: "t_195",
    timeRequired: 195,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Do… do goblins grow mushrooms on purpose? Gross thought. Cancel that.",
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
        "Everything here is squishy. I hate squishy.",
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
        "Note to Ariana: We are NEVER vacationing here.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — LATE-MAP CONFIDENCE (270–330s)
  // ============================================================

  {
    id: "t_270",
    timeRequired: 270,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still alive. Still fabulous. Still avoiding the weird mushrooms.",
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
        "Honestly? This place is kinda cute… in a chaotic ‘don’t breathe the air’ way.",
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
        "Ariana is gonna laugh SO hard when I tell her about Mushroom Land.",
        p.pos.x, p.pos.y
      );
    },
  },

];
