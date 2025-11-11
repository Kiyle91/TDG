// ============================================================
// 💬 floatingText.js — Olivia's World: Crystal Keep (Safe + Polished)
// ------------------------------------------------------------
// ✦ Displays floating numbers for damage, healing, XP, etc.
// ✦ NaN-safe rounding + smooth fade & rise
// ✦ Adds soft glow and easing for magical feel
// ============================================================

const texts = [];

// ------------------------------------------------------------
// 🌸 SPAWN FLOATING TEXT
// ------------------------------------------------------------
export function spawnFloatingText(x, y, value, color = "#ffffff", size = 18) {
  // 💎 Ensure numeric safety (avoid NaN from undefined or invalid values)
  let displayValue;
  const num = Number(value);

  if (isNaN(num)) {
    // If it's not a number (like "Level Up!" or "💀"), keep raw string
    displayValue = value;
  } else {
    // Round cleanly, no "-NaN" risk
    displayValue = num >= 0 ? `+${Math.round(num)}` : `${Math.round(num)}`;
  }

  texts.push({
    x,
    y,
    value: displayValue,
    color,
    size,
    life: 0,
    duration: 1000, // total lifetime in ms
    rise: 40,       // how high it floats
  });
}

// ------------------------------------------------------------
// ⏰ UPDATE TEXT LIFETIMES
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
// 🎨 DRAW FLOATING TEXTS
// ------------------------------------------------------------
export function drawFloatingText(ctx) {
  for (const t of texts) {
    const progress = Math.min(1, t.life / t.duration);

    // Soft easing for rise (ease-out)
    const eased = 1 - Math.pow(1 - progress, 2);

    // Fade out smoothly
    const alpha = 1 - progress;

    // Rising offset (with easing)
    const yOffset = -t.rise * eased;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Soft glow
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 10;

    ctx.font = `bold ${t.size}px "Comic Sans MS", cursive`;
    ctx.fillStyle = t.color;
    ctx.textAlign = "center";
    ctx.fillText(t.value, t.x, t.y + yOffset);

    ctx.restore();
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
