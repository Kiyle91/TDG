// ============================================================
// 🌑 Map 8 — Glitter’s Void / Gravity Realm Script
// ------------------------------------------------------------
// No tutorials. Maximum drama, sass, and “what is this place?”
// Shadow goblins, floating rocks, gravity weirdness.
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ENTERING THE VOID (0–20s)
  // ============================================================

  {
    id: "t_000",
    timeRequired: 0,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay… this place needs a warning label.",
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
        "Why is the ground… FLOATING? Who designed this map, chaos?",
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
        "If gravity turns off, I’m grabbing onto something immediately.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — SHADOW GOBLINS (30–60s)
  // ============================================================

  {
    id: "t_030",
    timeRequired: 30,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Eww, shadow goblins. They look like bad dreams with legs.",
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
        "One just phased through a rock. I hate it here.",
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
        "They move like ‘woOoOo’. Stop it. You're not spooky.",
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
        "Everything here is purple and dramatic. I respect that.",
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
        "Why does the air feel… floaty? Am I floating? Am I panicking?",
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
        "If a rock starts orbiting me, I’m quitting the map.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — PEAK VOID CHAOS (135–185s)
  // ============================================================

  {
    id: "t_135",
    timeRequired: 135,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "A goblin just FLOATED at me. Absolutely not.",
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
        "I can’t tell if that thing is walking or hovering. Gross either way.",
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
        "This whole map feels like a fever dream with goblins in it.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — GRAVITY DRAMA (200–250s)
  // ============================================================

  {
    id: "t_200",
    timeRequired: 200,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Why do the shadows move BEFORE I move? Stop it!",
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
        "If the gravity flips, I’m suing the universe.",
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
        "Everything feels so floaty… including my patience.",
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
        "Still fabulous, even in the void. Obviously.",
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
        "Shadow Realm? More like Glitter’s Realm now.",
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
        "Ariana is NOT going to believe this one. Floating rocks, goblins… chaos.",
        p.pos.x, p.pos.y
      );
    },
  },

];
