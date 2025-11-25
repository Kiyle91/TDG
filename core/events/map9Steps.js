// ============================================================
// 👑 Map 9 — Glitter’s Crystal Keep Interior EXTENDED Script
// ------------------------------------------------------------
// FINAL MAP. Peak heroic comedy, emotional payoff,
// Glitter defending her home and the Crystal Heart.
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — RETURNING HOME (3–40s)
  // ============================================================

  {
    id: "t_003",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Home sweet home… and OF COURSE goblins broke in.",
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
        "MY FLOORS! My shiny beautiful floors! Covered in goblin footprints!",
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
        "I am cleaning NONE of this. Someone call a maid. Or a wizard.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — PALACE INTRUDERS (60–130s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Eww, they’re TOUCHING the royal carpets. THEIR FEET. ON MY CARPETS.",
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
        "Why are they screaming?! This is a palace. USE YOUR INSIDE GOBLIN VOICES!",
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
        "After this, I'm putting up a giant ‘NO GOBLINS ALLOWED EVER’ sign.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — CRYSTAL HEART LORE (155–260s)
  // ============================================================

  {
    id: "t_155",
    timeRequired: 155,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The Crystal Heart is close… I can feel it glowing stronger.",
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
        "Ariana said the Architect wants the Heart for his weird shadow plans… nope.",
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
        "NOT TODAY MISTER ARCHITECT! Glitter is home and ready to throw hands.",
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
        "These halls held every memory I have… no goblin is taking them.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — KEEP CHAOS (290–380s)
  // ============================================================

  {
    id: "t_290",
    timeRequired: 290,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "STOP RUNNING! You’re making the mess WORSE!",
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
        "Who opened the side doors? WHO LET THEM IN?!",
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
        "If any goblin touches the throne… they’re going out the WINDOW.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — HEROIC GLITTER (410–520s)
  // ============================================================

  {
    id: "t_410",
    timeRequired: 410,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana trusted me to protect the Keep… and I am SLAYING THIS.",
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
        "Honestly, I deserve a crown upgrade. With sparkles. Many sparkles.",
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
        "The Keep is MINE. The crystals are MINE. These goblins? NOT MINE.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — FINAL BATTLE ENERGY (550–650s)
  // ============================================================

  {
    id: "t_550",
    timeRequired: 550,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The Crystal Heart is pulsing… it knows I’m close.",
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
        "Architect, if you can hear this: YOU’RE NOT GETTING MY HEART. OR THE CRYSTAL ONE.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_650",
    timeRequired: 650,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This is it. Glitter vs EVERY goblin EVER. Spoiler: I win.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — THE FINAL TRIUMPH (670–710s)
  // ============================================================

  {
    id: "t_670",
    timeRequired: 670,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still shining. Still slaying. Still Sparkle Guardian Number One.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_690",
    timeRequired: 690,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana… your Keep is safe. Glitter saved the day. AGAIN.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_710",
    timeRequired: 710,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Now someone please fetch me a cupcake. I have earned twelve.",
        p.pos.x, p.pos.y
      );
    },
  },

];
