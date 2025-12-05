// ============================================================
// 🌌 goblinAuras.js — Global Aura Engine
// Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Handles all goblin aura effects in one central system:
//
//  • Ice Goblin     → Slow the player inside aura radius
//  • Ember Goblin   → Burn damage to player inside radius
//  • Ash Goblin     → Heal ALL enemies inside radius
//  • Void Goblin    → Disable spire targeting inside radius
//
// Designed to avoid modifying individual enemy files.
// This module is called once per frame from game.js.
// ============================================================

import { gameState } from "../utils/gameState.js";
import { GOBLIN_AURA_RADIUS } from "./goblinAuraConstants.js";
import { getNeighbors } from "../utils/spatialGrid.js";

// 🧩 Pull enemy lists from all enemy modules
import { getGoblins as getBaseGoblins } from "./goblin.js";
import { getGoblins as getIceGoblins } from "./iceGoblin.js";
import { getGoblins as getEmberGoblins } from "./emberGoblin.js";
import { getGoblins as getAshGoblins } from "./ashGoblin.js";
import { getGoblins as getVoidGoblins } from "./voidGoblin.js";

import { getElites } from "./elite.js";
import { getTrolls } from "./troll.js";
import { getWorg } from "./worg.js";
import { getOgres } from "./ogre.js";
import { getCrossbows } from "./crossbow.js";

import { updateHUD } from "../screenManagement/ui.js";
import { spawnFloatingText } from "../fx/floatingText.js";


// ============================================================
// ⚙️ AURA CONSTANTS
// ============================================================

const PLAYER_SLOW_AMOUNT = 0.45;     // 45% movement speed
const FIRE_TICK_DAMAGE  = 4;         // 4 HP per second
const FIRE_TICK_RATE    = 500;       // damage every 500ms
const ASH_HEAL_PER_SEC  = 4;         // heal allies 4 HP per sec

const FX_THROTTLE_MS = 500;          // min gap between aura FX texts


// ============================================================
// 🧩 GET ALL ENEMIES (one unified list)
// ============================================================

export function getAllEnemies() {
  return [
    ...getBaseGoblins(),
    ...getIceGoblins(),
    ...getEmberGoblins(),
    ...getAshGoblins(),
    ...getVoidGoblins(),
    ...getElites(),
    ...getTrolls(),
    ...getOgres(),
    ...getWorg(),
    ...getCrossbows(),
  ];
}


// ============================================================
// 🌟 MAIN AURA PROCESSOR
// Call this ONCE per frame in updateGame(dt)
// ============================================================

export function applyGoblinAuras(delta, context = {}) {
  const dt = delta / 1000;
  const player = gameState.player;
  if (!player || player.dead) return;
  const bravery = gameState.bravery;
  const braveryImmune = player.invincible === true || bravery?.draining === true || bravery?.charged === true;

  const allEnemies = Array.isArray(context.enemies) ? context.enemies : getAllEnemies();
  const spatial = context.spatial;

  // Make sure spires know which enemies are shielded this frame.
  for (const e of allEnemies) e.insideVoidAura = false;

  // Auras only come from goblin variants:
  const ice      = getIceGoblins();
  const ember    = getEmberGoblins();
  const ash      = getAshGoblins();
  const voids    = getVoidGoblins();

  // ==========================================================
  // 🧊 ICE AURA — Slow the player if inside radius
  // ==========================================================

  if (!braveryImmune) {
    for (const g of ice) {
      if (!g.alive) continue;
      const dist = Math.hypot(player.pos.x - g.x, player.pos.y - g.y);
      if (dist < GOBLIN_AURA_RADIUS.iceGoblin) {
        player.slowAuraTimer = 120;            // ms duration resets each frame
        player.slowAuraFactor = PLAYER_SLOW_AMOUNT;
        const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
        if (!player._lastIceFx || now - player._lastIceFx > FX_THROTTLE_MS) {
          spawnFloatingText(player.pos.x, player.pos.y - 50, "❄️", "#cfe9ff", 18);
          player._lastIceFx = now;
        }
      }
    }
  } else {
    player.slowAuraTimer = 0;
  }


  // ==========================================================
  // 🔥 FIRE AURA — Burn the player over time
  // ==========================================================

  if (!player.fireAuraTick) player.fireAuraTick = 0;

  if (!braveryImmune) {
    let burnInside = false;

    for (const g of ember) {
      if (!g.alive) continue;
      const dist = Math.hypot(player.pos.x - g.x, player.pos.y - g.y);
      if (dist < GOBLIN_AURA_RADIUS.emberGoblin) {
        burnInside = true;
      }
    }

    if (burnInside) {
      player.fireAuraTick += delta;
      if (player.fireAuraTick >= FIRE_TICK_RATE) {
        player.fireAuraTick = 0;
        player.hp = Math.max(0, player.hp - FIRE_TICK_DAMAGE);

        spawnFloatingText(
          player.pos.x,
          player.pos.y - 40,
          `-${FIRE_TICK_DAMAGE}`,
          "#ff3f1e",
          22
        );
        const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
        if (!player._lastBurnFx || now - player._lastBurnFx > FX_THROTTLE_MS) {
          spawnFloatingText(player.pos.x, player.pos.y - 60, "🔥", "#ffa34f", 18);
          player._lastBurnFx = now;
        }

        updateHUD();
      }
    } else {
      player.fireAuraTick = 0;
    }
  } else {
    player.fireAuraTick = 0;
  }


  // ==========================================================
  // 🌫️ ASH AURA — Heal all enemies in radius
  // ==========================================================

  for (const g of ash) {
    if (!g.alive) continue;

    const nearby = spatial ? getNeighbors(spatial, g.x, g.y) : allEnemies;

    for (const e of nearby) {
      if (!e.alive || e.hp <= 0 || !e.maxHp) continue;

      const dist = Math.hypot(e.x - g.x, e.y - g.y);
      if (dist < GOBLIN_AURA_RADIUS.ashGoblin) {
        const healAmount = ASH_HEAL_PER_SEC * dt;
        const before = e.hp;
        if (before < e.maxHp) {
          e.hp = Math.min(e.maxHp, before + healAmount);
          // Show lightweight heal text, throttled per target to avoid spam
          const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
          if (!e._lastAshHealFx || now - e._lastAshHealFx > 250) {
            spawnFloatingText(e.x, e.y - 28, "+HP", "#9cff9c", 14);
            e._lastAshHealFx = now;
          }
        }
      }
    }
  }


  // ==========================================================
  // 🕳 VOID AURA — Disable spire targeting
  // ==========================================================

  for (const g of voids) {
    if (!g.alive) continue;

    const nearby = spatial ? getNeighbors(spatial, g.x, g.y) : allEnemies;

    for (const e of nearby) {
      const dist = Math.hypot(e.x - g.x, e.y - g.y);
      if (dist < GOBLIN_AURA_RADIUS.voidGoblin) {
        e.insideVoidAura = true;
      }
    }
  }
}


// ============================================================
// 🌟 END OF FILE — goblinAuras.js
// ============================================================
