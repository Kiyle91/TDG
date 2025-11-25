// ============================================================
// 🟣 bravery.js — Player Bravery & Aura System
// ------------------------------------------------------------
// Extracted from ui.js (surgically), moved into player folder.
// Handles:
//   • gaining bravery
//   • activating bravery
//   • draining over time
//   • applying stat boosts
//   • invincibility toggle
//   • the full-screen aura flash
// ============================================================

import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { updateBraveryBar } from "../screenManagement/ui.js";    // UI-display ONLY

// ------------------------------------------------------------
// 🟪 ADD BRAVERY
// ------------------------------------------------------------
export function addBravery(amount) {
  const b = gameState.bravery;
  if (b.charged || b.draining) return;

  b.current = Math.min(b.max, b.current + amount);

  if (b.current >= b.max) {
    b.current = b.max;
    b.charged = true;
    b.draining = false;
  }

  updateBraveryBar();
}

// ------------------------------------------------------------
// 🟦 ACTIVATE BRAVERY
// ------------------------------------------------------------
export function activateBravery() {
  const b = gameState.bravery;
  if (!b.charged) return;

  b.charged = false;
  b.draining = true;

  updateBraveryBar();
  triggerBraveryPower();
  drainBraveryBar(8000);
}

// ------------------------------------------------------------
// 🟧 DRAIN BRAVERY
// ------------------------------------------------------------
function drainBraveryBar(duration) {
  const b = gameState.bravery;
  const start = b.current;
  const startTime = performance.now();

  function tick(now) {
    const pct = Math.min(1, (now - startTime) / duration);
    b.current = start * (1 - pct);
    updateBraveryBar();

    if (pct < 1 && b.draining) {
      requestAnimationFrame(tick);
    } else {
      b.current = 0;
      b.draining = false;
      updateBraveryBar();
    }
  }

  requestAnimationFrame(tick);
}

// ------------------------------------------------------------
// 🟥 BRAVERY POWER (INVINCIBLE MODE + STATS)
// ------------------------------------------------------------
function triggerBraveryPower() {
  const p = gameState.player;
  if (!p) return;

  const original = {
    speed: p.speed,
    attack: p.attack,
    defense: p.defense,
  };

  p.speed *= 1.8;
  p.attack *= 1.6;
  p.defense *= 1.4;
  p.invincible = true;

  braveryFlashEffect();

  const watchEnd = () => {
    if (!gameState.bravery.draining) {
      p.speed = original.speed;
      p.attack = original.attack;
      p.defense = original.defense;
      p.invincible = false;
    } else {
      requestAnimationFrame(watchEnd);
    }
  };

  requestAnimationFrame(watchEnd);
}

// ------------------------------------------------------------
// 🟩 AURA FLASH EFFECT (FULL-SCREEN)
// ------------------------------------------------------------
function braveryFlashEffect() {
  const fx = document.createElement("div");
  Object.assign(fx.style, {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(circle at center, rgba(255,140,255,0.45) 0%, rgba(80,0,80,0.65) 80%)",
    pointerEvents: "none",
    zIndex: "9999999",
    opacity: "0",
  });

  document.body.appendChild(fx);

  // Initial flash-in
  fx.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 300, easing: "ease-out", fill: "forwards" }
  );

  // Pulse while active
  const pulse = fx.animate(
    [
      { opacity: 0.25 },
      { opacity: 0.45 },
      { opacity: 0.25 },
    ],
    { duration: 1500, easing: "ease-in-out", iterations: Infinity }
  );

  // Remove when bravery ends
  function watchEnd() {
    if (!gameState.bravery.draining) {
      pulse.cancel();
      fx.animate([{ opacity: 0.3 }, { opacity: 0 }], {
        duration: 400,
        easing: "ease-out",
      }).finished.then(() => fx.remove());
    } else {
      requestAnimationFrame(watchEnd);
    }
  }

  requestAnimationFrame(watchEnd);
}
