// ============================================================
// 🌟 Map 6 — Glitter’s Realm of Light Extended Script
// ------------------------------------------------------------
// • 10–12 minute pacing (~700s)
// • Max sparkle energy, angel jokes, fearless humour
// • Light Crystal instability + Architect plot tie-in
// • Goblins hate the light. Glitter LOVES it.
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ARRIVING IN THE LIGHT REALM (3–40s)
  // ============================================================

  {
    id: "t_003",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Oh WOW. This place is brighter than my entire future.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_020",
    timeRequired: 20,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Wait—am I glowing more than usual? Actually… I ALWAYS glow. Nevermind.",
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
        "If the sun asks: yes, I’m the main character today.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — LIGHT-REALM GOBLINS (60–130s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Eww—goblins in the Light Realm? That’s illegal. Someone arrest them.",
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
        "Look! They’re squinting! The light is too bright for their gremlin eyes!",
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
        "If they hiss at the light, I’m throwing sparkles directly at them. Double-blind!",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — HOLY REALM FLAVOUR + CRYSTAL LORE (155–250s)
  // ============================================================

  {
    id: "t_155",
    timeRequired: 155,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This place is so shiny I need sunglasses. Glitter shades. Maximum fabulousness.",
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
        "The air literally tastes like sparkles. That’s new… kind of delicious?",
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
        "The Light Crystal must be unstable… I can feel it humming through my bones.",
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
        "Ariana said holy energy is bursting everywhere… love that for ME, hate it for everyone else.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — LIGHT REALM COMEDY (280–360s)
  // ============================================================

  {
    id: "t_280",
    timeRequired: 280,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Imagine being a goblin scared of sunshine. Couldn’t be me. I *am* the sunshine.",
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
        "One of them just shielded its eyes from ME. Yes. You SHOULD fear this glow.",
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
        "At this point, I am basically their final boss. Fabulous AND terrifying.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — DIVINE DRAMA + PLOT (390–480s)
  // ============================================================

  {
    id: "t_390",
    timeRequired: 390,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Holy energy is bursting everywhere… the Light Crystal is losing control.",
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
        "If the Shadow Architect twists THIS realm too… everything’s gonna glow wrong.",
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
        "And of course goblins are here, making things worse. They’re allergic to peace.",
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
        "Somewhere above us, a holy guardian is waking up… I really hope it likes me.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — LIGHT CHAOS (510–620s)
  // ============================================================

  {
    id: "t_510",
    timeRequired: 510,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "This realm is so bright, my eyes are turning into glitter. Again.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_555",
    timeRequired: 555,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "One goblin actually tripped because it couldn’t see. I am LIVING for this.",
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
        "Light beams are bursting everywhere… Ariana was NOT exaggerating.",
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
        "If the Light Crystal fully cracks, this realm will glow itself inside-out. No thanks.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — LATE-MAP GLITTER GODDESS ENERGY (650–700s)
  // ============================================================

  {
    id: "t_650",
    timeRequired: 650,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Still glowing. Still heroic. Still the prettiest danger in existence.",
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
        "After this? Straight to the Mushroom Realm. Wild magic and chaos incoming.",
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
        "Ariana better give me a halo after this. Or at least a glowstick.",
        p.pos.x, p.pos.y
      );
    },
  },

];
