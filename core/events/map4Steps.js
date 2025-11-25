// ============================================================
// 🔥 Map 4 — Glitter’s Ember Realm Extended Script
// ------------------------------------------------------------
// • ~10–12 minute pacing (up to ~700s)
// • Pure humour, sass, confidence — no tutorials
// • Ember Realm theme with drama + Fire Crystal plot tie-ins
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ARRIVAL (3–40s)
  // ============================================================

  {
    id: "t_003",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Oh GREAT. Everything’s on fire. Love that for me. Really sets the mood.",
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
        "Seriously… who decorates with lava? It’s not a vibe. It’s a hazard.",
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
        "If a goblin pushes me into lava, I’m filing an official Glitter Complaint.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — FIRE REALM GOBLINS (60–130s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Fire goblins… hotter, angrier, and still dressed like they lost a bet.",
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
        "If one of them sets my hair on fire, I’m SCREAMING and they’re BURNED.",
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
        "Reminder: Glitter beats goblins *and* fire. I’m practically unstoppable.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — EMBER REALM FLAVOUR (155–240s)
  // ============================================================

  {
    id: "t_155",
    timeRequired: 155,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Everything smells like burnt marshmallows and rage. Gorgeous.",
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
        "These glowing rocks are pretty… in a ‘touch me and die’ sort of way.",
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
        "Living in a place that’s just fire forever? No thanks. My shoes would melt.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — FIERY COMEDY (270–350s)
  // ============================================================

  {
    id: "t_270",
    timeRequired: 270,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The goblins here think they’re SO tough. Bless their crispy hearts.",
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
        "Why do they run like their feet are hot? Oh wait. THEY ARE.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_350",
    timeRequired: 350,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "One more goblin screams at me and I’m tossing it straight into the magma.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — PLOT: FIRE CRYSTAL IMBALANCE (380–470s)
  // ============================================================

  {
    id: "t_380",
    timeRequired: 380,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This heat isn’t natural… the Fire Crystal must be freaking out again.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_425",
    timeRequired: 425,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If goblins are collecting Fire Echoes, they’re powering something BAD.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_470",
    timeRequired: 470,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana said the Fire General might be awake… I hope he’s ugly. Easier to punch.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — GLITTER GETS DRAMATIC (500–580s)
  // ============================================================

  {
    id: "t_500",
    timeRequired: 500,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I feel like a fire princess… a sweaty, irritated, dramatic fire princess.",
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
        "Do fire goblins moisturise? Their skin looks like burnt cereal.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_580",
    timeRequired: 580,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This realm is perfect for roasting marshmallows… AND goblins.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — LATE MAP / FIRE QUEEN ENERGY (610–700s)
  // ============================================================

  {
    id: "t_610",
    timeRequired: 610,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still alive. Still fabulous. Basically lava-proof at this point.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_655",
    timeRequired: 655,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Honestly? I’m slaying this entire volcano. It should thank me.",
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
        "Wait till Ariana hears I beat the FIRE Realm. Massive bragging rights.",
        p.pos.x, p.pos.y
      );
    },
  },

];
