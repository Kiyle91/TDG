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
import { damageGoblin } from "../entities/goblin.js";
import { damageGoblin as damageIceGoblin } from "../entities/iceGoblin.js";
import { damageGoblin as damageEmberGoblin } from "../entities/emberGoblin.js";
import { damageGoblin as damageAshGoblin } from "../entities/ashGoblin.js";
import { damageGoblin as damageVoidGoblin } from "../entities/voidGoblin.js";
import { damageOgre } from "../entities/ogre.js";
import { damageElite } from "../entities/elite.js";
import { damageTroll } from "../entities/troll.js";
import { damageWorg } from "../entities/worg.js";
import { damageCrossbow } from "../entities/crossbow.js";
import { damageSeraphine } from "../entities/seraphine.js";
import { Events, EVENT_NAMES as E } from "../core/eventEngine.js";
import { getGoblins } from "../entities/goblin.js";
import { getOgres } from "../entities/ogre.js";
import { getElites } from "../entities/elite.js";
import { getTrolls } from "../entities/troll.js";
import { getWorg } from "../entities/worg.js";
import { getCrossbows } from "../entities/crossbow.js";
import { getSeraphines } from "../entities/seraphine.js";
import { getGoblins as getIceGoblins } from "../entities/iceGoblin.js";
import { getGoblins as getEmberGoblins } from "../entities/emberGoblin.js";
import { getGoblins as getAshGoblins } from "../entities/ashGoblin.js";
import { getGoblins as getVoidGoblins } from "../entities/voidGoblin.js";
import { playBraveryCharge } from "../core/soundtrack.js";
import { slideRect } from "../utils/mapCollision.js";
import { areVisualsEnabled } from "../screenManagement/settings.js";
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
    Events.emit(E.braveryFull);
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
  Events.emit(E.braveryActivated);
  braveryActivationBlast();   
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

// ============================================================
// 🟣 Bravery Aura — Pushback + Contact Damage
// ============================================================

let auraTickNext = 0;    // per-player global tick throttler
const AURA_RADIUS = 130;
const AURA_DAMAGE = 4;   // base damage (will scale with player level)
const AURA_TICK_MS = 150; // damage every 150ms

export function applyBraveryAuraEffects(enemy) {
  const p = gameState.player;
  const b = gameState.bravery;
  if (!p || !b.draining) return;
  if (!enemy || !enemy.alive) return;

  const dx = enemy.x - p.pos.x;
  const dy = enemy.y - p.pos.y;
  const dist = Math.hypot(dx, dy);

  if (dist > AURA_RADIUS) return;

  // -------- PUSHBACK --------
  if (dist > 0) {
    const push = (AURA_RADIUS - dist) * 0.35;
    const nx = dx / dist;
    const ny = dy / dist;

    // Keep pushback out of collision tiles: slide the enemy rect safely
    const dims = getEnemyCollisionBox(enemy);
    const result = slideRect(
      enemy.x - dims.w / 2,
      enemy.y - dims.h / 2,
      dims.w,
      dims.h,
      nx * push,
      ny * push,
      { ignoreBounds: true }
    );
    enemy.x = result.x + dims.w / 2;
    enemy.y = result.y + dims.h / 2;
  }


    // -------- CONTACT DAMAGE (tick-limited) --------
    const now = performance.now();
    if (now < auraTickNext) return;

    const lvl = p.level ?? 1;
    const auraDamage = AURA_DAMAGE + Math.max(0, lvl - 1); // +1 per level up

    switch (enemy.type) {
      case "goblin":      damageGoblin(enemy, auraDamage); break;
      case "iceGoblin":   damageIceGoblin(enemy, auraDamage); break;
      case "emberGoblin": damageEmberGoblin(enemy, auraDamage); break;
      case "ashGoblin":   damageAshGoblin(enemy, auraDamage); break;
      case "voidGoblin":  damageVoidGoblin(enemy, auraDamage); break;

      case "ogre":        damageOgre(enemy, auraDamage); break;
      case "elite":       damageElite(enemy, auraDamage); break;
      case "troll":       damageTroll(enemy, auraDamage); break;
      case "worg":        damageWorg(enemy, auraDamage); break;
      case "crossbow":    damageCrossbow(enemy, auraDamage); break;
      case "seraphine":   damageSeraphine(enemy, auraDamage); break;
    }

    spawnFloatingText(enemy.x, enemy.y - 40, `-${auraDamage}`, "#ff55ff");
    enemy.flashTimer = 150;
    auraTickNext = now + AURA_TICK_MS;

}

function getEnemyCollisionBox(enemy) {
  const approx = {
    goblin: 42, iceGoblin: 42, emberGoblin: 42, ashGoblin: 42, voidGoblin: 42,
    worg: 44, elite: 48, troll: 55, ogre: 64, crossbow: 44, seraphine: 96,
  };
  const w = enemy.hitbox || enemy.width || approx[enemy.type] || 48;
  const h = enemy.height || w;
  return { w, h };
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

  if (areVisualsEnabled()) braveryFlashEffect();
  playBraveryCharge();

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


function braveryActivationBlast() {
  const p = gameState.player;
  if (!p) return;

  const enemies = [
    ...getGoblins(),        // base goblins
    ...getIceGoblins?.() || [],
    ...getEmberGoblins?.() || [],
    ...getAshGoblins?.() || [],
    ...getVoidGoblins?.() || [],

    ...getOgres(),
    ...getElites(),
    ...getTrolls(),
    ...getWorg(),
    ...getCrossbows(),
    ...(getSeraphines ? getSeraphines() : [])
  ];

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const dx = enemy.x - p.pos.x;
    const dy = enemy.y - p.pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > AURA_RADIUS) continue;

    // PUSHBACK
    if (dist > 0) {
      const push = (AURA_RADIUS - dist) * 0.9;   // stronger initial blast
      const nx = dx / dist;
      const ny = dy / dist;

      enemy.x += nx * push;
      enemy.y += ny * push;
    }

    // ONE-TIME DAMAGE
    switch (enemy.type) {
      case "goblin":      damageGoblin(enemy, AURA_DAMAGE); break;
      case "iceGoblin":   damageIceGoblin(enemy, AURA_DAMAGE); break;
      case "emberGoblin": damageEmberGoblin(enemy, AURA_DAMAGE); break;
      case "ashGoblin":   damageAshGoblin(enemy, AURA_DAMAGE); break;
      case "voidGoblin":  damageVoidGoblin(enemy, AURA_DAMAGE); break;

      case "ogre":        damageOgre(enemy, AURA_DAMAGE); break;
      case "elite":       damageElite(enemy, AURA_DAMAGE); break;
      case "troll":       damageTroll(enemy, AURA_DAMAGE); break;
      case "worg":        damageWorg(enemy, AURA_DAMAGE); break;
      case "crossbow":    damageCrossbow(enemy, AURA_DAMAGE); break;
      case "seraphine":   damageSeraphine(enemy, AURA_DAMAGE); break;
    }

    spawnFloatingText(enemy.x, enemy.y - 40, `-${AURA_DAMAGE}`, "#ff55ff");
    enemy.flashTimer = 150;
  }
}
