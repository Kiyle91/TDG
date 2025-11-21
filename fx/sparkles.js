// ============================================================
// ✨ sparkles.js — Shared Sparkle & FX System
// ------------------------------------------------------------
// Used by: melee.js, playerController.js, spells, heals, etc.
// ============================================================

const sparkles = [];
const MAX_SPARKLES = 60;

// ------------------------------------------------------------
// 🌈 Burst of canvas sparkles
// ------------------------------------------------------------
export function spawnCanvasSparkleBurst(x, y, count = 50, radius = 140, colors) {
  colors ??= ["#ffd6eb", "#b5e2ff", "#fff2b3"];

  for (let i = 0; i < count; i++) {
    if (sparkles.length >= MAX_SPARKLES) {
      sparkles.shift();
    }

    const ang = Math.random() * Math.PI * 2;
    const speed = 140 + Math.random() * 160;

    sparkles.push({
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: 600 + Math.random() * 400,
      age: 0,
      size: 2 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

// ------------------------------------------------------------
// 🔁 Update & draw sparkles each frame
// ------------------------------------------------------------
export function updateAndDrawSparkles(ctx, delta) {
  if (!sparkles.length) return;

  const dt = delta / 1000;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.age += delta;

    if (s.age >= s.life) {
      sparkles.splice(i, 1);
      continue;
    }

    const t = s.age / s.life;

    s.vx *= 0.985;
    s.vy *= 0.985;
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    const alpha = (1 - t) * 0.9;
    const r = s.size * (1 + 0.4 * (1 - t));

    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ------------------------------------------------------------
// ❤️ Hit Sparkles (re-export)
// ------------------------------------------------------------
export function spawnDamageSparkles(x, y) {
  const palette = ["#ff7aa8", "#ff99b9", "#ffb3c6", "#ffccd5"];
  spawnCanvasSparkleBurst(x, y, 10, 50, palette);
}

// Legacy init hook retained for compatibility (sparkles are stateless)
export function initSparkles() {
  // No initialization required; sparkle storage is module-scoped.
}
