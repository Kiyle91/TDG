// ============================================================
// ❄️ Map 5 — Glitter’s Frost Kingdom Script
// ------------------------------------------------------------
// Zero tutorials. Girly, bossy, dramatic, hilarious,
// "ugh it's cold" energy with goblins slipping everywhere.
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ARRIVAL (0–20s)
  // ============================================================

  {
    id: "t_000",
    timeRequired: 0,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Nope. Immediately no. Why is everything frozen?",
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
        "I swear the air just slapped me. Rude.",
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
        "If my hair freezes, someone’s getting sparkled aggressively.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — FROST GOBLINS (30–60s)
  // ============================================================

  {
    id: "t_030",
    timeRequired: 30,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Eww, ice goblins. They wobble like cold jelly.",
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
        "Why are they blue? Are they cold? That’s not my problem.",
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
        "If a frosty goblin sneezes on me, we're fighting.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — FROZEN WORLD FLAVOUR (75–120s)
  // ============================================================

  {
    id: "t_075",
    timeRequired: 75,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I can literally see my breath. Sparkly, but still cold.",
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
        "The ground is so slippery… one wrong step and Glitter becomes a snowball.",
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
        "Even the trees are frozen. At this point, so is my patience.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — COMEDY IN THE SNOW (135–180s)
  // ============================================================

  {
    id: "t_135",
    timeRequired: 135,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If a goblin slips on the ice, I’m not helping. I’m laughing.",
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
        "This place needs a heater. Or ten heaters. And a hot chocolate machine.",
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
        "Note to Ariana: Glitter requires a coat. Preferably pink. Preferably fluffy.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — FROST DRAMA (195–250s)
  // ============================================================

  {
    id: "t_195",
    timeRequired: 195,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Every time a goblin breathes out mist I shrivel a little inside.",
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
        "Great. Now my nose is cold. I didn’t sign up for cold noses.",
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
        "If I slip, nobody look at me. I slide with dignity.",
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
        "Cold or not, I’m still the cutest thing in this entire frozen kingdom.",
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
        "Honestly? I think I’m warming up to this place. Get it? No? Whatever.",
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
        "Ariana better have a blanket ready when I get home. And maybe soup.",
        p.pos.x, p.pos.y
      );
    },
  },

];
