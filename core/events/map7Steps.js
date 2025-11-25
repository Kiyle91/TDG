// ============================================================
// 🍄 Map 7 — Glitter’s Mushroom Realm Extended Script
// ------------------------------------------------------------
// • 10–12 minute pacing (~700s)
// • Pure chaos: spores, colours, bouncing goblins, weird magic
// • Wild Magic Bloom lore + Architect hints
// • Glitter is dramatic, funny, confused, fearless
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — FIRST IMPRESSIONS (3–40s)
  // ============================================================

  {
    id: "t_003",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay… this place is weird. Like, ‘who spilled magic everywhere?’ weird.",
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
        "Why are the mushrooms taller than me? Who approved giant fungus?!",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_040",
    timeRequired: 40,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If any mushroom talks to me… I am leaving. Immediately.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — MUSHROOM GOBLINS (60–130s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Oh no. Even the goblins look weird here. That’s saying A LOT.",
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
        "EWW! That one just sneezed spores. No. Absolutely not.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_130",
    timeRequired: 130,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Why are they running like they drank five cups of sugar? Calm DOWN.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — REALM FLAVOUR + BLOOM LORE (155–250s)
  // ============================================================

  {
    id: "t_155",
    timeRequired: 155,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "There are so many colours… it’s like a rainbow exploded and didn’t clean up.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_190",
    timeRequired: 190,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Why does the air taste like strawberry? Should *air* taste like anything?!",
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
        "Ariana said the Wild Magic Bloom started here… everything’s mutating.",
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
        "If this is what happens when crystals lose balance… yikes.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — PEAK MUSHROOM CHAOS (280–360s)
  // ============================================================

  {
    id: "t_280",
    timeRequired: 280,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Imagine a goblin tripping on a mushroom cap… that would make my WEEK.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_315",
    timeRequired: 315,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This map smells… funky. Not cute-funky. FUNGUS-funky.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_360",
    timeRequired: 360,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If these mushrooms are magical, I expect sparkles. Minimum requirement.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — GLITTER GETS STRANGE (390–490s)
  // ============================================================

  {
    id: "t_390",
    timeRequired: 390,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Do… do goblins grow mushrooms on purpose? That thought lives rent-free in my nightmares.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_430",
    timeRequired: 430,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Everything here is squishy. Glitter hates squishy. I need a towel.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_460",
    timeRequired: 460,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The Bloom is spreading spores everywhere. No wonder the goblins are EXTRA weird.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_490",
    timeRequired: 490,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If the Shadow Architect corrupts this Bloom… the whole Isles will turn into Mushroom Land.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — MUSHROOM MADNESS (520–620s)
  // ============================================================

  {
    id: "t_520",
    timeRequired: 520,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "That goblin just bounced off a mushroom and didn’t even question it. Iconic.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_555",
    timeRequired: 555,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The colours keep changing. Either magic is broken… or I’m dizzy.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_600",
    timeRequired: 600,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If a mushroom starts singing, I'm leaving the whole universe.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_620",
    timeRequired: 620,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana said the Void Realm reacts to wild magic… oh good. More chaos coming.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — LATE-MAP CONFIDENCE (650–700s)
  // ============================================================

  {
    id: "t_650",
    timeRequired: 650,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still alive. Still fabulous. Still avoiding suspicious shrooms.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_680",
    timeRequired: 680,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Next stop: The Void Realm. Time to defeat gravity with style.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_700",
    timeRequired: 700,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana’s gonna SCREAM laughing when I describe this place. Mushroom Realm: complete.",
        p.pos.x, p.pos.y
      );
    },
  },

];
