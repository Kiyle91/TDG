// ============================================================
// 🌲 Map 2 — Glitter’s Time-Based Story Script
// ------------------------------------------------------------
// • Humorous, girly, bossy, fearless Glitter commentary
// • Tied into Farmer Bragg’s Field + Crystal Echo plot
// • Spaced for ~10–12 minutes of play
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // ============================================================
  // ⭐ PHASE 0 — ARRIVAL AT FARMER BRAGG’S (3–40s)
  // ============================================================

  {
    id: "t_003",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay… so this is Farmer Bragg’s place. Cute… but also kinda spooky.",
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
        "Fields, fences, mysterious forest edges… this map is giving ‘goblin raid starter pack’.",
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
        "Ariana said Bragg saw goblins out here. If he’s right… things are about to get loud.",
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
        "Okay Glitter, mission recap: protect the farm, grab Echoes, and don’t let anything explode.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 1 — FIRST ENEMIES & FARM CHAOS (60–130s)
  // ============================================================

  {
    id: "t_060",
    timeRequired: 60,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "There it is… goblin screeching. Like a rusty violin with anger issues.",
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
        "If they touch Farmer Bragg’s crops, I am personally escorting them off the map.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_100",
    timeRequired: 100,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Goblins plus pitchforks would be a disaster. Luckily, they’re too busy screaming.",
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
        "Bragg’s always been dramatic… but if goblins are here, he was right to panic.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 2 — CRYSTAL ECHOES & GOBLIN PLAN (150–220s)
  // ============================================================

  {
    id: "t_150",
    timeRequired: 150,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "I see Crystal Echoes out in the fields… goblins will definitely want those.",
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
        "Echoes plus goblins equals ‘very bad idea’. Echoes plus Glitter equals ‘very good idea’.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_200",
    timeRequired: 200,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Maybe they’re stealing food and Echoes to fuel some big goblin army. Rude.",
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
        "If the Shadow Architect really is behind this… Bragg’s farm is just step one.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 3 — SPIRES & DEFENDING THE FIELDS (240–320s)
  // ============================================================

  {
    id: "t_240",
    timeRequired: 240,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "These fields are huge. Perfect place for Spires to keep watch.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_270",
    timeRequired: 270,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Note to self: Spires near the paths, not just randomly in the cabbage patch.",
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
        "Honestly, this is kind of fun. Like gardening… but with more explosions.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_320",
    timeRequired: 320,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Bragg should pay me in snacks for this. Guardian work AND farm defence.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 4 — POWERS & PANIC MANAGEMENT (340–420s)
  // ============================================================

  {
    id: "t_340",
    timeRequired: 340,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "If the goblins get too close, remember: heal with R, stay calm, bonk goblin.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_370",
    timeRequired: 370,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "F for spells if they start swarming. Glitter solves problems with glittery explosions.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_400",
    timeRequired: 400,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "And Q for bravery aura… just in case they think they can rush the farm.",
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
        "Big rule: don’t panic. Panicking is for goblins. Glitter is composed and deadly.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 5 — FARM LIFE & GOBLIN NONSENSE (450–540s)
  // ============================================================

  {
    id: "t_450",
    timeRequired: 450,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Somewhere out here is Farmer Bragg shouting at a scarecrow. I can just feel it.",
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
        "I bet the animals are hiding. Honestly? Same. I’d hide too if goblins were in my garden.",
        p.pos.x, p.pos.y
      );
    },
  },

  {
    id: "t_510",
    timeRequired: 510,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Look at them run through the crops. Zero respect for agriculture.",
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
        "If they trample one more row of vegetables, I’m upgrading every Spire I own.",
        p.pos.x, p.pos.y
      );
    },
  },

  // ============================================================
  // ⭐ PHASE 6 — PLOT HINTS & MOVING ON (570–690s)
  // ============================================================

  {
    id: "t_570",
    timeRequired: 570,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "The goblins are organised here… more than they were in the Meadows. That’s worrying.",
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
        "If they’re gathering food and Echoes, they’re planning for something bigger.",
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
        "Ariana’s going to want a full report after this. ‘Dear Princess, goblins are annoying.’",
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
        "Once Bragg’s farm is safe, I’ll have to see what they’re doing in the Drylands next.",
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
        "Still here. Still fabulous. Glitter Guardian of the Fields has a nice ring to it.",
        p.pos.x, p.pos.y
      );
    },
  },

];
