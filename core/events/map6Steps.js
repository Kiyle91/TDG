// ============================================================
// 🌟 Map 6 — Glitter’s Realm of Light Script
// ------------------------------------------------------------
// No tutorials. Max sparkle energy, angel jokes, fearless humour.
// Goblins hate the light, Glitter LOVES it. Chaos ensues.
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ARRIVING IN THE LIGHT REALM (0–20s)
  // ============================================================

  {
    id: "t_000",
    timeRequired: 0,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Oh WOW. This place is brighter than my future.",
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
        "Am I glowing? Wait—don’t answer. I’m ALWAYS glowing.",
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
        "If the sun asks, yes—I’m the main character here.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — LIGHT-REALM GOBLINS (30–60s)
  // ============================================================

  {
    id: "t_030",
    timeRequired: 30,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Eww, goblins in the Light Realm? This is illegal.",
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
        "They’re squinting! HA! Too bright for you, little gremlins?",
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
        "If they hiss at the light, I’m throwing sparkles directly at them.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — HOLY REALM FLAVOUR (75–120s)
  // ============================================================

  {
    id: "t_075",
    timeRequired: 75,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This place is so shiny… I need sunglasses. Glitter shades.",
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
        "The air tastes like… sparkles? That’s new.",
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
        "I feel powerful. Like… ‘cosmic princess about to demolish goblins’ powerful.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — LIGHT REALM COMEDY (135–180s)
  // ============================================================

  {
    id: "t_135",
    timeRequired: 135,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Imagine being a goblin scared of sunshine. Couldn’t be me.",
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
        "One of them just shielded its eyes from me. Yes. GOOD.",
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
        "At this point, I’m basically their worst nightmare. I love it.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — DIVINE DRAMA (195–250s)
  // ============================================================

  {
    id: "t_195",
    timeRequired: 195,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I feel like an angel… a very dangerous angel.",
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
        "If a goblin calls me ‘too bright,’ that’s a COMPLIMENT.",
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
        "Somewhere, Ariana is absolutely cheering. I can FEEL it.",
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
        "Still glowing. Still heroic. Still the prettiest danger alive.",
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
        "Honestly this whole realm should be renamed to Glitterland.",
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
        "When I beat this, Ariana better throw me a parade. With sparkles.",
        p.pos.x, p.pos.y
      );
    },
  },

];
