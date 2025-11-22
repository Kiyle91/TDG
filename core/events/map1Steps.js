// ============================================================
// 🌲 Map 1 — Glitter's Step-Based Story & Tutorial Script
// ------------------------------------------------------------
// • All events driven ONLY by player.steps
// • No kills / waves / HP / mana conditions
// • Glitter talks to herself as she explores & fights
// • Covers: movement, melee, ranged, heal, spell, bravery, spires
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — WAKE UP & BASIC MOVEMENT
  // ============================================================

  {
    id: "step_000",
    stepsRequired: 0,
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
    id: "step_005",
    stepsRequired: 10,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Left Click to shoot my bow.. that's right..",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_015",
    stepsRequired: 20,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Spacebar.. thats my trusty sword..",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_030",
    stepsRequired: 30,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Spells... We cast them with the F Key..",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_045",
    stepsRequired: 40,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Now I remember.. We can heal with the R Key..",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_060",
    stepsRequired: 50,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay lets keep our eye out for any Goblins!",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_080",
    stepsRequired: 80,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If something attacks… I swing my blade. SPACE to slash.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — BASIC COMBAT HINTS
  // ============================================================

  {
    id: "step_100",
    stepsRequired: 100,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "And if they’re further away… LEFT CLICK to fire a shot.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_130",
    stepsRequired: 130,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Blade up close, arrows at range. Easy… right?",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_160",
    stepsRequired: 160,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay Glitter… if it moves and looks mean, hit it first.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_190",
    stepsRequired: 190,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Don’t panic. Swing, step, breathe. You’ve got this.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — CRYSTAL ECHOES & EXPLORATION
  // ============================================================

  {
    id: "step_220",
    stepsRequired: 220,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Those glowing Echoes… I should grab every one I see.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_250",
    stepsRequired: 250,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Crystal Echoes make me stronger. Sparkly power-ups—yes, please.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_280",
    stepsRequired: 280,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana said some Echoes even give diamonds… imagine the shine.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_310",
    stepsRequired: 310,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Note to self: if it glows, touch it. Probably safe. Probably.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — SPIRES & HOTKEYS (1–6)
  // ============================================================

  {
    id: "step_340",
    stepsRequired: 340,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Hmm… I can place a Spire with the number keys.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_370",
    stepsRequired: 370,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Basic Spire on 1… More fancy ones unlock later.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_400",
    stepsRequired: 400,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Gold in, Spires out. I just need to remember where I put them.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_430",
    stepsRequired: 430,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Spires don’t judge. They just blast things. Love that for them.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_460",
    stepsRequired: 460,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If things get rough… more Spires. Always more Spires.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — HEAL (R), SPELL (F), BRAVERY (Q)
  // ============================================================

  {
    id: "step_490",
    stepsRequired: 490,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I get hurt, I can press R to heal… if I’ve got the mana.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_520",
    stepsRequired: 520,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Healing isn’t free, Glitter—don’t spam R… save it for trouble.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_550",
    stepsRequired: 550,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "F for spells. Big, shiny, mana-hungry spells.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_580",
    stepsRequired: 580,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Note: don’t fire off F when I’m already low on mana. Future me will be mad.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_610",
    stepsRequired: 610,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "And Q… Q is my bravery aura. My ‘absolutely not today’ button.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_640",
    stepsRequired: 640,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Bravery builds up over time… I should save Q for the worst moments.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — LEVELS, POWER & SELF-ENCOURAGEMENT
  // ============================================================

  {
    id: "step_670",
    stepsRequired: 670,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I feel stronger all of a sudden… that’s a level up.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_700",
    stepsRequired: 700,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "More power, more choices. Attack, spells, ranged…",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_730",
    stepsRequired: 730,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I should build into what feels right. Glitter knows best.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_760",
    stepsRequired: 760,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If things get rough, it just means I need more Echoes and more levels.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — MID/LATE MAP FLAVOUR (FIGHTS LAST A WHILE)
  // ============================================================

  {
    id: "step_800",
    stepsRequired: 800,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still standing. Still swinging. Not bad, Glitter.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_850",
    stepsRequired: 850,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "They keep coming… but so do I.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_900",
    stepsRequired: 900,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Note to the goblins: this is MY forest today.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_950",
    stepsRequired: 950,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I can survive this, Ariana’s going to be SO proud.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "step_1000",
    stepsRequired: 1000,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Glitter Guardian of the Crystal Keep… yeah, that still sounds right.",
        p.pos.x, p.pos.y
      );
    },
  },

];
