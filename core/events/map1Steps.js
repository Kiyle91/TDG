// ============================================================
// 🌲 Map 1 — Step-Based Story Tutorial Script
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

export default [

  // --- STEP 0: Initial prompt on load (no movement required) ---
  {
    id: "move_prompt",
    stepsRequired: 0,
    action: (state) => {
      const p = state.player;
      spawnSpeechBubble(
        "PRESS WASD OR ARROW KEYS TO MOVE",
        p.pos.x, p.pos.y, 4500
      );
    }
  },

  // --- STEP 1: First movement (steps >= 5) ---
  {
    id: "wake_up",
    stepsRequired: 5,
    action: (state) => {
      const p = state.player;
      spawnSpeechBubble(
        "Good… your legs remember the path again.",
        p.pos.x, p.pos.y
      );
    }
  },

  // --- STEP 2: Movement confidence (steps >= 20) ---
  {
    id: "steady_steps",
    stepsRequired: 20,
    action: (state) => {
      const p = state.player;
      spawnSpeechBubble(
        "The forest feels familiar, doesn’t it?",
        p.pos.x, p.pos.y
      );
    }
  },

  // --- STEP 3: Awareness (steps >= 40) ---
  {
    id: "whisper",
    stepsRequired: 40,
    action: (state) => {
      const p = state.player;
      spawnSpeechBubble(
        "…Something stirs deeper in these woods.",
        p.pos.x, p.pos.y
      );
    }
  },

  // --- STEP 4: Subtle hint at danger (steps >= 60) ---
  {
    id: "danger_hint",
    stepsRequired: 60,
    action: (state) => {
      const p = state.player;
      spawnSpeechBubble(
        "Keep moving, Glitter. Don't let the shadows settle.",
        p.pos.x, p.pos.y
      );
    }
  },

  // --- STEP 5: Tutorial hook (steps >= 80) ---
  {
    id: "tutorial_attack_hint",
    stepsRequired: 80,
    action: (state) => {
      const p = state.player;
      spawnSpeechBubble(
        "If anything threatens you… left-click to strike.",
        p.pos.x, p.pos.y
      );
    }
  },

  // --- STEP 6: Spire hint before enemies (steps >= 110) ---
  {
    id: "spire_hint",
    stepsRequired: 110,
    action: (state) => {
      const p = state.player;
      spawnSpeechBubble(
        "Crystal Spires still answer your call… try pressing 1.",
        p.pos.x, p.pos.y
      );
    }
  },

  // --- STEP 7: Echo hint (steps >= 135) ---
  {
    id: "echo_hint",
    stepsRequired: 135,
    action: (state) => {
      const p = state.player;
      spawnSpeechBubble(
        "And remember… Crystal Echoes shine brightest near danger.",
        p.pos.x, p.pos.y
      );
    }
  },

  // --- STEP 8: Final encouragement (steps >= 160) ---
  {
    id: "encouragement",
    stepsRequired: 160,
    action: (state) => {
      const p = state.player;
      spawnSpeechBubble(
        "You’re ready, Glitter. Stay brave.",
        p.pos.x, p.pos.y
      );
    }
  }

];
