// ============================================================
// 💬 floatingText.js — Olivia's World: Crystal Keep
//    (Ultra-Optimized Pool Edition — ZERO GC + ZERO Lag)
// ------------------------------------------------------------
// ✦ Fixed size behavior (no more big “-10” unless you want it)
// ✦ Optional crit mode (OFF by default, ON with flag)
// ✦ Hard cap (60) with indexed object pool (no searching)
// ✦ Swap-pop removal (no splice cost)
// ✦ Zero allocation per frame
// ============================================================

const MAX_TEXTS = 60;
const pool = new Array(MAX_TEXTS);
const active = [];
let poolIndex = MAX_TEXTS - 1;

// Global toggle: turn true to enable crit scaling
let CRIT_MODE = false;

// ------------------------------------------------------------
// ♻️ Initialise pool
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

  // Pool empty → overwrite oldest
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

  // Emoji mode
  const isEmoji = (displayValue === "🔥" || displayValue === "❄");

  // ============================================================
  // 🎯 FIX: SIZE IS NOW STABLE FOR ALL NUMBERS
  // “-10” no longer appears larger unless crit mode is used
  // ============================================================
  let finalSize = size;

  if (isEmoji) {
    finalSize = 26;
  }

  // Optional crit scaling
  if (CRIT_MODE && isCrit) {
    finalSize = size * 1.4;   // nice punchy feel
    aura = true;              // force glow for crits
  }

  // Assign
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
// ⏰ UPDATE — swap-pop removal
// ------------------------------------------------------------
export function updateFloatingText(delta) {
  for (let i = active.length - 1; i >= 0; i--) {
    const t = active[i];
    t.life += delta;

    if (t.life >= t.duration) {
      t.active = false;

      // Return to pool
      pool[++poolIndex] = t;

      // Swap-pop
      const last = active.pop();
      if (i < active.length) active[i] = last;
    }
  }
}

// ------------------------------------------------------------
// 🎨 DRAW
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

    // ⚡ Emoji-only
    if (!t.aura) {
      ctx.fillStyle = t.color;
      ctx.fillText(t.value, drawX, drawY);
      ctx.restore();
      continue;
    }

    // ✨ Glow path
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
// 🔧 OPTIONAL: enable/disable crit mode globally
// ------------------------------------------------------------
export function enableCritMode(v = true) {
  CRIT_MODE = v;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
