// ============================================================
// 🍂 Map 3 — Glitter’s Extended Time-Based Story Script
// ------------------------------------------------------------
// • ~10–12 minute pacing (up to ~700s)
// • Humorous, girly, confident, dramatic Glitter commentary
// • Golden Drylands theme — warm, dusty, magical
// • Ties into Life Crystal weakening + Fire Realm foreshadowing
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ARRIVING IN THE DRYLANDS (3–40s)
  // ============================================================

  {
    id: "t_003",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Wow… everything’s so gold and sparkly. Did I accidentally walk into a shampoo commercial?",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_015",
    timeRequired: 15,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Drylands? More like Glitterlands. I’m owning this whole colour palette.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_035",
    timeRequired: 35,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If a goblin jumps out of a leaf pile, I’m kicking it straight back in.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — FIRST GOBLIN ENCOUNTERS (60–130s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ugh… that smell. Goblins. Burnt toast mixed with old socks. Fantastic.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_090",
    timeRequired: 90,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Remember Glitter: cute, powerful, and absolutely terrifying when provoked.",
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
        "If one more goblin wobbles at me, I swear it’s sword o’clock.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — CRYSTAL ECHOES & LIFE MAGIC (150–220s)
  // ============================================================

  {
    id: "t_150",
    timeRequired: 150,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The Crystal Echoes look extra shiny out here… like they’re posing for a photoshoot.",
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
        "The Drylands feel warm but… wrong. Like all the Life magic is draining away.",
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
        "More Echoes means more glitter power. Goblins touching them means disaster.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — SPIRES & DEFENCE PLANNING (240–310s)
  // ============================================================

  {
    id: "t_240",
    timeRequired: 240,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This place is HUGE. Perfect for Spires. Glitter Guardian HQ, coming right up.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_275",
    timeRequired: 275,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "1 through 5 to summon Spires… my little sparkle soldiers of doom.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_310",
    timeRequired: 310,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Strategic placement ONLY. No putting a Spire in the middle of a tumbleweed.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — POWERS & HEAT (340–420s)
  // ============================================================

  {
    id: "t_340",
    timeRequired: 340,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If I get hurt, R to heal. Glitter refuses to look dusty. Hydrate AND heal.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_375",
    timeRequired: 375,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "F for spells. Time to turn these goblins into glitter smoke.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_405",
    timeRequired: 405,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Q for bravery. Also known as my ‘stop annoying me’ energy burst.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — DRYLANDS FLAVOUR (440–540s)
  // ============================================================

  {
    id: "t_440",
    timeRequired: 440,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "These golden trees look gorgeous. Probably hiding something hideous.",
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
        "Why do goblins run like spaghetti? Stand STILL so I can fix it!",
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
        "If one more worg snarls at me, it’s getting a sparkly timeout.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — PLOT BUILDUP (560–650s)
  // ============================================================

  {
    id: "t_560",
    timeRequired: 560,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The Drylands didn’t used to be this hot… something is draining the Life Crystal.",
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
        "If the goblins are collecting Echoes, they’re powering something up.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_635",
    timeRequired: 635,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Ariana said the Fire Realm is acting weird too… great. Love that for us.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_665",
    timeRequired: 665,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If this is the warm-up, the next map is going to be like walking into an oven.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 7 — LATE MAP CONFIDENCE (690–720s)
  // ============================================================

  {
    id: "t_690",
    timeRequired: 690,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still slaying. Still iconic. Glitter conquers the Drylands.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_720",
    timeRequired: 720,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Next stop: The Ember Realm. I’m bringing sunscreen AND attitude.",
        p.pos.x, p.pos.y
      );
    },
  },

];
