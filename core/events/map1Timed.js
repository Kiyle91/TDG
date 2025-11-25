// ============================================================
// 🌲 Map 1 — Glitter's Time-Based Story & Tutorial Script
// ------------------------------------------------------------
// • All events driven by elapsed game time (seconds)
// • Smooth pacing, no reliance on movement distance
// • Glitter talks to herself as she explores & fights
// • Covers: movement, melee, ranged, heal, spell, bravery, spires
// • Now spaced for ~10–15 minute waves with added plot ties
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — WAKE UP & BASIC MOVEMENT (3–30s)
  // ============================================================

  {
    id: "t_003",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay Glitter… deep breath. The Whispering Meadows. WASD to move… I remember this part.",
        p.pos.x, p.pos.y,
        4500
      );
    },
  },

  {
    id: "t_008",
    timeRequired: 8,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Left click to shoot my bow. Easy. Point, click, glittery doom.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_014",
    timeRequired: 14,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Spacebar… that’s my trusty sword slash. Very princess, very dangerous.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_022",
    timeRequired: 22,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Spells are on F. Big, shiny, mana-hungry ‘go away’ buttons.",
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
        "And R lets me heal… if I’ve actually got mana. Note to self: don’t spam it.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — FIRST GOBLIN & BASIC COMBAT (45–90s)
  // ============================================================

  {
    id: "t_045",
    timeRequired: 45,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana was right… if there’s even one goblin here, there’ll be more nearby.",
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
        "If something ugly runs at me… SPACE for slash, LEFT CLICK for arrows. Sorted.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_080",
    timeRequired: 80,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Up close, they get the sword. Far away, they get the bow. Glitter has RANGE.",
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
        "If it moves, screams, and looks like a mouldy potato… probably a goblin. Hit it.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — CRYSTAL ECHOES & THE MISSION (110–180s)
  // ============================================================

  {
    id: "t_110",
    timeRequired: 110,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Those glowing Crystal Echoes… Ariana said they’re pieces of the Crystal Heart.",
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
        "If goblins grab Echoes, bad things happen. Shadowy, void-y, explode-y things.",
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
        "So rule number one: if it glows, I pick it up before the goblins do.",
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
        "Ariana mentioned some old Void thing… the ‘Shadow Architect’. Yeah, that sounds bad.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — SPIRES & HOTKEYS (190–260s)
  // ============================================================

  {
    id: "t_190",
    timeRequired: 190,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I can place Spires with the number keys… little crystal guardians helping me out.",
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
        "Basic Spire on 1 for now. Fancier ones unlock when I prove I’m extra amazing.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_240",
    timeRequired: 240,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Gold turns into more Spires. More Spires turns into less goblins. Perfect.",
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
        "Spires don’t complain, don’t scream, they just blast goblins. I respect that.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — POWERS: HEAL, SPELL, BRAVERY (280–360s)
  // ============================================================

  {
    id: "t_280",
    timeRequired: 280,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I get hurt, R lets me heal… but only if I’ve got mana. Don’t panic-tap it.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_305",
    timeRequired: 305,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "F is for spells. Big, flashy, crystal-powered drama. My favourite kind.",
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
        "And Q charges my bravery aura. When it’s ready… goblins should be scared.",
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
        "Note to self: Don’t waste bravery on one goblin. Wait until they arrive in, like… a crowd.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — LEVELS, POWER & SELF-BELIEF (390–480s)
  // ============================================================

  {
    id: "t_390",
    timeRequired: 390,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "When I suddenly feel stronger, faster, sparklier… that’s a level up kicking in.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_420",
    timeRequired: 420,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "More levels means better choices. Stronger sword, stronger spells, stronger me.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_450",
    timeRequired: 450,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I should build into what feels right. Glitter’s instincts are never wrong.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_480",
    timeRequired: 480,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If things get rough, I just need more Echoes, more levels, and maybe fewer goblins screaming.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — MID/LATE MAP FLAVOUR + PLOT (510–660s)
  // ============================================================

  {
    id: "t_510",
    timeRequired: 510,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The Meadows feel… different. Like the land itself is holding its breath.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_540",
    timeRequired: 540,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If the goblins are this bold here, what are they doing in the other realms?",
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
        "Ariana mentioned the Shadow Architect once… some Void thing that almost broke the Isles.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_630",
    timeRequired: 630,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If he’s really behind this… he picked the wrong princess to mess with.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_660",
    timeRequired: 660,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Survive the Meadows, check on Farmer Bragg, save the Isles. Easy. Probably.",
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
        "Glitter Guardian of the Crystal Keep… yeah. I’m starting to really like how that sounds.",
        p.pos.x, p.pos.y
      );
    },
  },

];
