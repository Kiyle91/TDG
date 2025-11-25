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

];
