// ============================================================
// 💬 floatingText.js — Olivia's World: Crystal Keep (Crystal Glow Edition)
// ------------------------------------------------------------
// ✦ Larger, brighter floating numbers with magical aura
// ✦ Safe rounding + unified XP fix hook
// ✦ Smooth ease-out rise + soft halo effect
// ============================================================

const texts = [];

// ------------------------------------------------------------
// 🌸 SPAWN FLOATING TEXT
// ------------------------------------------------------------
export function spawnFloatingText(x, y, value, color = "#ffffff", size = 22, aura = true) {
  // 💎 Numeric safety
  let displayValue;
  const num = Number(value);

  if (isNaN(num)) {
    displayValue = value;
  } else {
    displayValue = num >= 0 ? `+${Math.round(num)}` : `${Math.round(num)}`;
  }

  texts.push({
    x,
    y,
    value: displayValue,
    color,
    size,
    life: 0,
    duration: 1200, // stay visible slightly longer
    rise: 50,       // float higher
    aura,
  });
}

// ------------------------------------------------------------
// ⏰ UPDATE
// ------------------------------------------------------------
export function updateFloatingText(delta) {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.life += delta;
    if (t.life >= t.duration) {
      texts.splice(i, 1);
    }
  }
}

// ------------------------------------------------------------
// 🎨 DRAW
// ------------------------------------------------------------
export function drawFloatingText(ctx) {
  for (const t of texts) {
    const progress = Math.min(1, t.life / t.duration);
    const eased = 1 - Math.pow(1 - progress, 2); // ease-out
    const alpha = 1 - progress;
    const yOffset = -t.rise * eased;

    ctx.save();
    ctx.globalAlpha = alpha;

    // ✨ Magical aura glow
    if (t.aura) {
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 20;
    }

    // 💫 Add faint white outline for brightness
    ctx.font = `bold ${t.size}px "Comic Sans MS", cursive`;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.textAlign = "center";
    ctx.strokeText(t.value, t.x, t.y + yOffset);

    // 🩵 Fill main text
    ctx.fillStyle = t.color;
    ctx.fillText(t.value, t.x, t.y + yOffset);

    ctx.restore();
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
