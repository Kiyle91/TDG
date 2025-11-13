// ============================================================
// 💬 floatingText.js — Olivia's World: Crystal Keep
//    (Ultra-Optimized Pool Edition — No Lag, No Congestion)
// ------------------------------------------------------------
// ✦ Hard cap + object pool (max 60 active texts)
// ✦ Elemental emojis get ultra-light rendering (no aura)
// ✦ Big numbers still glow beautifully
// ✦ Prevents input lag + tower placement freezing
// ============================================================

const MAX_TEXTS = 60;
const textPool = [];
const texts = [];

// ------------------------------------------------------------
// ♻️ PRE-FILL POOL
// ------------------------------------------------------------
for (let i = 0; i < MAX_TEXTS; i++) {
  textPool.push({
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
  });
}

// ------------------------------------------------------------
// 🌸 SPAWN FLOATING TEXT (POOL + LIGHTWEIGHT ELEMENTALS)
// ------------------------------------------------------------
export function spawnFloatingText(x, y, value, color = "#ffffff", size = 22, aura = true) {

  // ⚡ If no free objects, drop oldest instead of blocking UI
  let t = textPool.find(o => !o.active);
  if (!t) {
    t = texts.shift(); // remove oldest active
  }

  // 💎 Numeric safety
  let displayValue;
  const num = Number(value);
  if (isNaN(num)) {
    displayValue = value;
  } else {
    displayValue = num >= 0 ? `+${Math.round(num)}` : `${Math.round(num)}`;
  }

  // 🌡 Detect lightweight elemental emojis and reduce cost
  const isEmoji = (displayValue === "🔥" || displayValue === "❄");

  t.active = true;
  t.x = x;
  t.y = y;
  t.value = displayValue;
  t.color = color;
  t.size = isEmoji ? 26 : size;         // small, crisp emoji
  t.duration = isEmoji ? 600 : 1200;    // emojis vanish quicker
  t.rise = isEmoji ? 28 : 50;           // lower rise for emojis
  t.aura = isEmoji ? false : aura;      // ❗ emojis get *no glow*
  t.life = 0;

  texts.push(t);
}

// ------------------------------------------------------------
// ⏰ UPDATE
// ------------------------------------------------------------
export function updateFloatingText(delta) {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    if (!t.active) continue;

    t.life += delta;
    if (t.life >= t.duration) {
      t.active = false;
      texts.splice(i, 1);
    }
  }
}

// ------------------------------------------------------------
// 🎨 DRAW (ULTRA-LIGHT FOR EMOJIS)
// ------------------------------------------------------------
export function drawFloatingText(ctx) {
  for (const t of texts) {
    if (!t.active) continue;

    const p = Math.min(1, t.life / t.duration);
    const eased = 1 - Math.pow(1 - p, 2);
    const alpha = 1 - p;
    const yOffset = -t.rise * eased;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${t.size}px "Comic Sans MS", cursive`;
    ctx.textAlign = "center";

    // ⚡ Ultra-fast draw for emojis (no shadow, no stroke)
    if (!t.aura) {
      ctx.fillStyle = t.color;
      ctx.fillText(t.value, t.x, t.y + yOffset);
      ctx.restore();
      continue;
    }

    // ✨ Glow enabled for big hits only
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 20;

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.strokeText(t.value, t.x, t.y + yOffset);

    ctx.fillStyle = t.color;
    ctx.fillText(t.value, t.x, t.y + yOffset);

    ctx.restore();
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
