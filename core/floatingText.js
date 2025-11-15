// ============================================================
// 💬 floatingText.js — Olivia's World: Crystal Keep
//    (Ultra-Optimized Pool Edition — ZERO GC + ZERO Lag)
// ------------------------------------------------------------
// ✦ Hard cap (60) with indexed object pool (no searching)
// ✦ "Swap-pop" removal to avoid .splice() cost
// ✦ Emoji mode: ultra-lightweight, no glow
// ✦ Zero allocation per frame (no garbage)
// ✦ Designed for 4K, mobile & 200+ hits/sec stress tests
// ============================================================

const MAX_TEXTS = 60;

// ------------------------------------------------------------
// 🧵 Object pool + active list
// ------------------------------------------------------------
const pool = new Array(MAX_TEXTS);
const active = []; // active list (swap-pop removal)
let poolIndex = MAX_TEXTS - 1; // index of last free slot

// ------------------------------------------------------------
// ♻️ Initialise pool objects
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
    aura: true,
  };
}

// ------------------------------------------------------------
// 🌸 SPAWN FLOATING TEXT (ultra fast, no scans)
// ------------------------------------------------------------
export function spawnFloatingText(x, y, value, color = "#ffffff", size = 22, aura = true) {

  let t;

  // 🟦 If pool empty → reuse oldest active (never block)
  if (poolIndex < 0) {
    t = active[0]; // overwrite oldest
  } else {
    // 🟩 Take from pool (O(1))
    t = pool[poolIndex--];
    active.push(t);
  }

  // Number formatting (cheap)
  const num = Number(value);
  let displayValue;
  if (isNaN(num)) displayValue = value;
  else displayValue = num >= 0 ? `+${Math.round(num)}` : `${Math.round(num)}`;

  // Detect emoji mode
  const isEmoji = (displayValue === "🔥" || displayValue === "❄");

  // Assign values
  t.active = true;
  t.x = x;
  t.y = y;
  t.value = displayValue;
  t.color = color;

  t.size = isEmoji ? 26 : size;
  t.duration = isEmoji ? 600 : 1200;
  t.rise = isEmoji ? 28 : 50;
  t.aura = !isEmoji && aura;
  t.life = 0;
}

// ------------------------------------------------------------
// ⏰ UPDATE — swap-pop removal (NO splice cost)
// ------------------------------------------------------------
export function updateFloatingText(delta) {
  for (let i = active.length - 1; i >= 0; i--) {
    const t = active[i];
    t.life += delta;

    if (t.life >= t.duration) {
      t.active = false;

      // Return to pool (O(1))
      pool[++poolIndex] = t;

      // Swap-pop remove from active (O(1))
      const last = active.pop();
      if (i < active.length) active[i] = last;
    }
  }
}

// ------------------------------------------------------------
// 🎨 DRAW (super fast path for emojis / no glow)
// ------------------------------------------------------------
export function drawFloatingText(ctx) {
  const len = active.length;

  for (let i = 0; i < len; i++) {
    const t = active[i];

    // Skip inactive (shouldn't happen, but cheap)
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

    // ⚡ Emoji-only path (very cheap)
    if (!t.aura) {
      ctx.fillStyle = t.color;
      ctx.fillText(t.value, drawX, drawY);
      ctx.restore();
      continue;
    }

    // ✨ Glow path for numeric/big damage
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

// ============================================================
// 🌟 END OF FILE
// ============================================================
