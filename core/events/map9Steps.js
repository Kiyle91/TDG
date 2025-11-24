// ============================================================
// 👑 Map 9 — Glitter’s Crystal Keep Interior Script
// ------------------------------------------------------------
// Final map. No tutorials, pure heroic comedy.
// Glitter is home, done with everyone’s nonsense, and unstoppable.
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ENTERING THE KEEP (0–20s)
  // ============================================================

  {
    id: "t_000",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Home sweet home… and of COURSE goblins broke in.",
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
        "Look at my floors! My beautiful shiny floors! Goblins have muddy FEET.",
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
        "I’m cleaning NONE of this. They can pay for a maid.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — TRESPASSING GOBLINS (30–60s)
  // ============================================================

  {
    id: "t_030",
    timeRequired: 30,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Eww, they’re touching the royal carpets. THE ROYAL CARPETS.",
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
        "Why are they always screaming? You’re in a palace, show some manners!",
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
        "I’m putting up a giant ‘NO GOBLINS ALLOWED’ sign after this.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — INTERIOR FLAVOUR (75–120s)
  // ============================================================

  {
    id: "t_075",
    timeRequired: 75,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I love this room. The chandeliers, the crystals, the ambience…",
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
        "If a goblin knocks over my crystal vase, I will become UNHINGED.",
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
        "This is the FINAL map. The FINAL stand. And they’re STILL screaming.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — KEEP CHAOS (135–180s)
  // ============================================================

  {
    id: "t_135",
    timeRequired: 135,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Stop running! You’re tracking dirt everywhere! DIRTY goblins!",
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
        "Who let them in? Seriously. Who. Let. Them. In.",
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
        "If these goblins touch the throne I’m throwing all of them out the window.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — HEROIC GLITTER (200–250s)
  // ============================================================

  {
    id: "t_200",
    timeRequired: 200,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana trusted me to guard the Keep. And I’m doing AMAZING.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_225",
    timeRequired: 225,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Honestly I should get a crown upgrade after this. A SPARKLY one.",
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
        "This Keep is MINE. These crystals are MINE. These goblins? NOT mine.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — FINAL CONFIDENCE (270–330s)
  // ============================================================

  {
    id: "t_270",
    timeRequired: 270,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still standing. Still sparkling. Still undefeated.",
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
        "I can’t wait to brag about this. This is PRIME brag material.",
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
        "Ariana… your Keep is safe. Glitter saved the day. Again.",
        p.pos.x, p.pos.y
      );
    },
  },

];
