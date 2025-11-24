// ============================================================
// 🌲 Map 2 — Glitter’s Time-Based Story Script
// ------------------------------------------------------------
// Humorous, girly, bossy, fearless Glitter commentary
// Family-friendly, witty, no repeats, kid-funny moments
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ARRIVAL (0–20s)
  // ============================================================

  {
    id: "t_000",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Oooh… spooky trees. Map Two is giving ‘mysterious woodland chic’.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_008",
    timeRequired: 8,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay Glitter… stay fabulous, stay focused, and maybe don’t trip on a goblin.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_016",
    timeRequired: 16,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If anything jumps out… I’m screaming AND hitting it.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — FIRST ENEMIES (25–50s)
  // ============================================================

  {
    id: "t_025",
    timeRequired: 25,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ugh! I hear goblins… they sound like wet socks arguing.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_035",
    timeRequired: 35,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Remember Glitter: cute on the outside, dangerous on every side.",
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
        "If a goblin gets too close, that’s THEIR mistake. Not mine.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — ECHO COLLECTING (60–95s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Crystal Echoes! My favourite kind of treasure: shiny AND useful.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_075",
    timeRequired: 75,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I find all the Echoes here, Ariana better give me a sparkly badge.",
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
        "Note to self: Glitter loves glowing things. Avoid dull rocks.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — SPIRE TALK (100–135s)
  // ============================================================

  {
    id: "t_100",
    timeRequired: 100,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Hmm… maybe a Spire would look cute right here. Function AND fashion.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_115",
    timeRequired: 115,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Spires are like… magical lawn sprinklers, but for goblins.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_135",
    timeRequired: 135,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Reminder: position them smartly, Glitter. Pretty AND strategic.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — COMBAT POWERS (140–175s)
  // ============================================================

  {
    id: "t_140",
    timeRequired: 140,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I get hurt, press R to heal. Glitter does NOT do low HP.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_160",
    timeRequired: 160,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "F for spells. Sparkly, explodey, very ‘wow’.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_175",
    timeRequired: 175,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "And Q for bravery aura… also known as Glitter Mode.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — MID-MAP FLAVOUR (185–230s)
  // ============================================================

  {
    id: "t_185",
    timeRequired: 185,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This forest is actually kinda cute… minus the goblins.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_210",
    timeRequired: 210,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Why do goblins run like that? It’s giving ‘bad toddler energy’.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_230",
    timeRequired: 230,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If the Hollow Woods had a queen… it'd totally be me.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — LATE MAP / CONFIDENCE (240–300s)
  // ============================================================

  {
    id: "t_245",
    timeRequired: 245,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still here. Still fabulous. Still undefeated.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_270",
    timeRequired: 270,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Goblins must hate me. I keep ruining their whole… everything.",
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
        "Ariana’s gonna be like ‘Wow Glitter, you survived Map Two?’ and I’ll be like ‘Obviously.’",
        p.pos.x, p.pos.y
      );
    },
  },

];
