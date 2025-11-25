// ============================================================
// 🌑 Map 8 — Glitter’s Void / Gravity Realm Extended Script
// ------------------------------------------------------------
// • 10–12 minute pacing (~700s)
// • Gravity glitches, floating rocks, strange shadows
// • Shadow Architect tension rising
// • Glitter is dramatic, confused, fearless, hilarious
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ENTERING THE VOID (3–40s)
  // ============================================================

  {
    id: "t_003",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay… this place needs a warning label. Preferably several.",
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
        "Why is the ground FLOATING? Who designed this map—chaos itself?",
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
        "If gravity turns off, I’m grabbing the nearest rock. Or goblin. Whichever is closer.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — SHADOW GOBLINS (60–130s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Eww, shadow goblins. They look like nightmares with legs.",
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
        "One just phased through a rock. NO. Absolutely not.",
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
        "They move like ‘woOoOo’. Stop it. You're not scary. You're weird.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — VOID REALM FLAVOUR + ARCHITECT FORESHADOWING (155–260s)
  // ============================================================

  {
    id: "t_155",
    timeRequired: 155,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Everything here is purple and dramatic. Honestly? Same.",
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
        "Why does the AIR feel floaty? Am I floating? Am I panicking?",
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
        "Ariana said gravity breaks down where corruption is strongest… amazing.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_260",
    timeRequired: 260,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If the Shadow Architect is behind this, I'm kicking him into low orbit.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — PEAK VOID CHAOS (285–380s)
  // ============================================================

  {
    id: "t_285",
    timeRequired: 285,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "A goblin just FLOATED at me. Absolutely not. Despawn yourself.",
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
        "I can’t tell if that one is walking or hovering. Gross either way.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_380",
    timeRequired: 380,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This whole place feels like a fever dream with goblins. Ew.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — GRAVITY DRAMA (410–520s)
  // ============================================================

  {
    id: "t_410",
    timeRequired: 410,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Why do the shadows move BEFORE I move? No thank you.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_455",
    timeRequired: 455,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If gravity flips upside down, I’m suing the universe AND the Architect.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_520",
    timeRequired: 520,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Everything is floaty… including my patience.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — LATE-VOID REVELATIONS (550–640s)
  // ============================================================

  {
    id: "t_550",
    timeRequired: 550,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana said the Void Realm bends to fear… but I’m Glitter. I don’t do fear.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_590",
    timeRequired: 590,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Some goblins are literally phasing in and out… pick a dimension!!",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_640",
    timeRequired: 640,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The Architect wants the Crystal Heart… over my sparkly, fabulous body.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — THE FINAL PUSH (660–700s)
  // ============================================================

  {
    id: "t_660",
    timeRequired: 660,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still alive. Still fabulous. Still ignoring gravity’s nonsense.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_685",
    timeRequired: 685,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Next stop: Crystal Keep. Architect, your days are numbered.",
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
        "Ariana is NOT ready for how hard I’m going to win the final map.",
        p.pos.x, p.pos.y
      );
    },
  },

];
