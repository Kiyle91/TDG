// ============================================================
// 🌲 Map 1 — Glitter's Time-Based Story & Tutorial Script
// ------------------------------------------------------------
// • All events driven by elapsed game time (seconds)
// • Smooth pacing, no reliance on movement distance
// • Glitter talks to herself as she explores & fights
// • Covers: movement, melee, ranged, heal, spell, bravery, spires
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — WAKE UP & BASIC MOVEMENT (0–6s)
  // ============================================================

  {
    id: "t_000",
    timeRequired: 0,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Well this is the meadows.. I should use WASD to move..",
        p.pos.x, p.pos.y,
        4500
      );
    },
  },

  {
    id: "t_006",
    timeRequired: 6,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Left Click to shoot my bow.. that's right..",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_012",
    timeRequired: 12,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Spacebar.. thats my trusty sword..",
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
        "Spells... We cast them with the F Key..",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_024",
    timeRequired: 24,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Now I remember.. We can heal with the R Key..",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_030",
    timeRequired: 30,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay lets keep our eye out for any Goblins!",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — BASIC COMBAT HINTS (36–60s)
  // ============================================================

  {
    id: "t_036",
    timeRequired: 36,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If something attacks… I swing my blade. SPACE to slash.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_044",
    timeRequired: 44,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "And if they’re further away… LEFT CLICK to fire a shot.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_052",
    timeRequired: 52,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Blade up close, arrows at range. Easy… right?",
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
        "Okay Glitter… if it moves and looks mean, hit it first.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — CRYSTAL ECHOES & EXPLORATION (65–90s)
  // ============================================================

  {
    id: "t_065",
    timeRequired: 65,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Those glowing Echoes… I should grab every one I see.",
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
        "Crystal Echoes make me stronger. Sparkly power-ups—yes, please.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_085",
    timeRequired: 85,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana said some Echoes even give diamonds… imagine the shine.",
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
        "Note to self: if it glows, touch it. Probably safe. Probably.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — SPIRES & HOTKEYS (1–6) (105–135s)
  // ============================================================

  {
    id: "t_105",
    timeRequired: 105,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Hmm… I can place a Spire with the number keys.",
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
        "Basic Spire on 1… More fancy ones unlock later.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_125",
    timeRequired: 125,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Gold in, Spires out. I just need to remember where I put them.",
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
        "Spires don’t judge. They just blast things. Love that for them.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — HEAL (R), SPELL (F), BRAVERY (Q) (140–170s)
  // ============================================================

  {
    id: "t_140",
    timeRequired: 140,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I get hurt, I can press R to heal… if I’ve got the mana.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_150",
    timeRequired: 150,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Healing isn’t free, Glitter—don’t spam R… save it for trouble.",
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
        "F for spells. Big, shiny, mana-hungry spells.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_170",
    timeRequired: 170,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "And Q… Q is my bravery aura. My ‘absolutely not today’ button.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — LEVELS, POWER & SELF-ENCOURAGEMENT (175–230s)
  // ============================================================

  {
    id: "t_175",
    timeRequired: 175,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I feel stronger all of a sudden… that’s a level up.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_195",
    timeRequired: 195,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "More power, more choices. Attack, spells, ranged…",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_215",
    timeRequired: 215,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I should build into what feels right. Glitter knows best.",
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
        "If things get rough, it just means I need more Echoes and more levels.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — MID/LATE MAP FLAVOUR (240–300s)
  // ============================================================

  {
    id: "t_240",
    timeRequired: 240,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still standing. Still swinging. Not bad, Glitter.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_265",
    timeRequired: 265,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "They keep coming… but so do I.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_285",
    timeRequired: 285,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Note to the goblins: this is MY forest today.",
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
        "If I can survive this, Ariana’s going to be SO proud.",
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
        "Glitter Guardian of the Crystal Keep… yeah, that still sounds right.",
        p.pos.x, p.pos.y
      );
    },
  },

];
