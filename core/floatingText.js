// ============================================================
// 💬 floatingText.js — Olivia's World: Crystal Keep
//    (Ultra-Optimized Pool Edition — ZERO GC + ZERO Lag)
// ------------------------------------------------------------
// ✦ Fixed size behavior (stable, predictable numbers)
// ✦ Optional crit mode (OFF by default)
// ✦ Hard cap (60) with indexed pool
// ✦ Swap-pop removal (no splice cost)
// ✦ Zero allocation per frame
// ============================================================
/* ------------------------------------------------------------
 * MODULE: floatingText.js
 * PURPOSE:
 *   Provides an extremely optimized floating text system used
 *   for damage numbers, healing, elemental icons, XP bursts,
 *   and all feedback elements that rise and fade over time.
 *
 * SUMMARY:
 *   This module uses a fixed-size object pool (60 entries) to
 *   eliminate garbage collection and avoid per-frame allocations.
 *   Text objects are recycled using a swap-pop removal strategy,
 *   ensuring stable performance even when hundreds of events
 *   occur at once (e.g., large waves or DoT effects).
 *
 * FEATURES:
 *   • Zero-allocation runtime (object pool only)
 *   • Constant-time spawn & removal (swap-pop)
 *   • Optional CRIT mode with size scaling + forced glow
 *   • Emoji support (“🔥”, “❄”) with special rules
 *   • Independent of enemies/towers — can be used globally
 *
 * PERFORMANCE NOTES:
 *   This is one of the core systems that keeps the game feeling
 *   responsive during heavy fights. It is intentionally low-level
 *   and does *not* handle gameplay logic — only visuals.
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// 🗺️ MODULE-LEVEL VARIABLES
// ------------------------------------------------------------


const MAX_TEXTS = 60;
const pool = new Array(MAX_TEXTS);
const active = [];
let poolIndex = MAX_TEXTS - 1;

// Global toggle for crit scaling
let CRIT_MODE = false;

// ------------------------------------------------------------
// ♻️ Initialise object pool
// ------------------------------------------------------------
for (let i = 0; i < MAX_TEXTS; i++) {
  pool[i] = {
    active: false,
    x: 0,
    y: 0,
    value: "",
    color: "#ffffff",
    size: 22,
    life: 0,
    duration: 1000,
    rise: 40,
    aura: true
  };
}

// ------------------------------------------------------------
// 🌸 SPAWN FLOATING TEXT
// ------------------------------------------------------------
export function spawnFloatingText(
  x,
  y,
  value,
  color = "#ffffff",
  size = 22,
  aura = true,
  isCrit = false
) {
  let t;

  // Pool empty → overwrite oldest active text
  if (poolIndex < 0) {
    t = active[0];
  } else {
    t = pool[poolIndex--];
    active.push(t);
  }

  // Format value
  const num = Number(value);
  let displayValue;

  if (isNaN(num)) {
    displayValue = value;
  } else {
    displayValue = num >= 0 ? `+${Math.round(num)}` : `${Math.round(num)}`;
  }

  const isEmoji = (displayValue === "🔥" || displayValue === "❄");

  // Keep size stable (no more big “-10” bug)
  let finalSize = size;

  if (isEmoji) {
    finalSize = 26;
  }

  // Optional crit scaling
  if (CRIT_MODE && isCrit) {
    finalSize = size * 1.4;
    aura = true;
  }

  // Assign properties
  t.active = true;
  t.x = x;
  t.y = y;
  t.value = displayValue;
  t.color = color;
  t.size = finalSize;
  t.duration = isEmoji ? 600 : 1200;
  t.rise = isEmoji ? 28 : 50;
  t.aura = !isEmoji && aura;
  t.life = 0;
}

// ------------------------------------------------------------
// ⏰ UPDATE — Automatic expiration (swap-pop removal)
// ------------------------------------------------------------
export function updateFloatingText(delta) {
  for (let i = active.length - 1; i >= 0; i--) {
    const t = active[i];
    t.life += delta;

    if (t.life >= t.duration) {
      t.active = false;

      // Return to pool
      pool[++poolIndex] = t;

      // Swap-pop removal
      const last = active.pop();
      if (i < active.length) {
        active[i] = last;
      }
    }
  }
}

// ------------------------------------------------------------
// 🎨 DRAW FLOATING TEXT
// ------------------------------------------------------------
export function drawFloatingText(ctx) {
  const len = active.length;

  for (let i = 0; i < len; i++) {
    const t = active[i];
    if (!t.active) continue;

    const p = t.life / t.duration;
    const eased = 1 - (1 - p) * (1 - p);
    const alpha = 1 - p;
    const yOffset = -t.rise * eased;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${t.size}px "Comic Sans MS", cursive`;
    ctx.textAlign = "center";

    const drawX = t.x;
    const drawY = t.y + yOffset;

    // Emoji mode — no glow
    if (!t.aura) {
      ctx.fillStyle = t.color;
      ctx.fillText(t.value, drawX, drawY);
      ctx.restore();
      continue;
    }

    // Glow for normal text
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 20;

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.strokeText(t.value, drawX, drawY);

    ctx.fillStyle = t.color;
    ctx.fillText(t.value, drawX, drawY);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 🔧 OPTIONAL: Enable/Disable crit mode
// ------------------------------------------------------------
export function enableCritMode(v = true) {
  CRIT_MODE = v;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
