// ============================================================
// ❄️ Map 5 — Glitter’s Frost Kingdom Extended Script
// ------------------------------------------------------------
// • 10–12 minute pacing (~700s)
// • Girly, bossy, hilarious, dramatic cold-energy Glitter
// • Ice Crystal plot tie-in + Fire Realm fallout + Architect hints
// • Goblins slipping everywhere. Perfect.
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
        "Nope. Immediately no. Why is everything frozen? My eyelashes just froze together.",
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
        "I swear the air just slapped me. Rude. Absolutely disrespectful.",
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
        "If my hair freezes into an icicle, someone’s getting sparkled aggressively.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — ICE GOBLINS (60–130s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Eww—ice goblins. They wobble like cold jelly… that screams.",
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
        "Why are they blue? Are they cold? Because that is not my problem.",
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
        "If a frosty goblin sneezes on me, we’re fighting. Immediately.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — FROZEN WORLD FLAVOUR + STORY (160–250s)
  // ============================================================

  {
    id: "t_160",
    timeRequired: 160,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I can literally see my breath. Sparkly… but still freezing.",
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
        "The Ice Crystal must be freaking out. Too much Fire magic + too little balance = this mess.",
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
        "Even the trees are frozen… and honestly? So is my patience.",
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
        "Goblins stealing Ice Echoes… yeah, that would absolutely break an entire kingdom.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — COMEDY IN THE SNOW (280–360s)
  // ============================================================

  {
    id: "t_280",
    timeRequired: 280,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If a goblin slips on the ice, I am not helping. I’m laughing. Out loud.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_315",
    timeRequired: 315,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This place needs a heater. Or ten heaters. And a hot chocolate waterfall.",
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
        "Note to Ariana: Glitter requires a coat. Preferably pink. Preferably fluffy.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — FROST DRAMA + CRYSTAL PLOT (390–490s)
  // ============================================================

  {
    id: "t_390",
    timeRequired: 390,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The cold feels wrong… like the Ice Crystal is pulling magic from everything nearby.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_430",
    timeRequired: 430,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana said the Fire imbalance is hitting the Ice Realm hardest. Balance is a diva, apparently.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_460",
    timeRequired: 460,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "And of course goblins are here making it worse. They cannot mind their business.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_490",
    timeRequired: 490,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If the Shadow Architect touches the Ice Crystal… everything will freeze solid. Including me. No thanks.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — COLD CHAOS (520–620s)
  // ============================================================

  {
    id: "t_520",
    timeRequired: 520,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Every time a goblin breathes out mist, I shrivel a little bit inside.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_560",
    timeRequired: 560,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Great. Now my nose is cold. I did NOT sign up for cold noses.",
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
        "If I slip, nobody look at me. I slide with dignity and grace only.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_620",
    timeRequired: 620,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Somewhere in this kingdom is an ancient frost monster waking up. Yay. Love that journey for me.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — FROST QUEEN ENERGY (650–700s)
  // ============================================================

  {
    id: "t_650",
    timeRequired: 650,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Cold or not, I am STILL the cutest thing in this kingdom. And the deadliest.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_680",
    timeRequired: 680,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana better have a blanket, soup, AND a warm hug ready when I’m done.",
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
        "Next up: the Realm of Light. If it’s bright AND cold, I’m quitting.",
        p.pos.x, p.pos.y
      );
    },
  },

];
