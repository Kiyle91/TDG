// ============================================================
// 💬 floatingText.js — Olivia's World: Crystal Keep
// ------------------------------------------------------------
// ✦ Displays floating numbers for damage, healing, XP, etc.
// ✦ Smooth fade + rise animation
// ============================================================

const texts = [];

export function spawnFloatingText(x, y, value, color = "#fff", size = 18) {
  texts.push({
    x,
    y,
    value,
    color,
    size,
    life: 0,
    duration: 1000, // 1 second
    rise: 40,       // pixels upward
  });
}

export function updateFloatingText(delta) {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.life += delta;
    if (t.life >= t.duration) {
      texts.splice(i, 1);
      continue;
    }
  }
}

export function drawFloatingText(ctx) {
  for (const t of texts) {
    const progress = t.life / t.duration;
    const alpha = 1 - progress;
    const yOffset = -t.rise * progress;
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${t.size}px Comic Sans MS`;
    ctx.fillStyle = t.color;
    ctx.textAlign = "center";
    ctx.fillText(t.value, t.x, t.y + yOffset);
    ctx.globalAlpha = 1;
  }
}
