// ============================================================
// 💬 speechBubble.js — In-world speech bubble system
// ============================================================

import { gameState } from "../utils/gameState.js";

export const speechBubbles = [];

export function spawnSpeechBubble(text, x, y, duration = 5000, anchor = null) {
  const resolvedAnchor = anchor ?? gameState?.player ?? null;

  speechBubbles.push({
    text,
    x,
    y,
    anchor: resolvedAnchor,
    life: duration,
    age: 0
  });
}

export function updateAndDrawSpeechBubbles(ctx, delta) {
  for (let i = speechBubbles.length - 1; i >= 0; i--) {
    const b = speechBubbles[i];
    b.age += delta;

    if (b.age >= b.life) {
      speechBubbles.splice(i, 1);
      continue;
    }

    const t = b.age / b.life;
    const alpha = Math.min(1, 1 - t + 0.2);

    ctx.globalAlpha = alpha;

    const anchorX = b.anchor?.pos?.x ?? b.x;
    const anchorY = b.anchor?.pos?.y ?? b.y;

    drawSpeechBubble(ctx, b.text, anchorX, anchorY - 50); // adjust offset for head height

    ctx.globalAlpha = 1;
  }
}

function drawSpeechBubble(ctx, text, x, y) {
  ctx.font = "20px Poppins";
  const padding = 14;
  const metrics = ctx.measureText(text);
  const w = metrics.width + padding * 2;
  const h = 40;

  // Background bubble
  const radius = 12;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;

  roundRect(ctx, x - w/2, y - h, w, h, radius);
  ctx.fill();
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x + 10, y);
  ctx.lineTo(x, y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = "#444";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y - h/2);
}

// Rounded rectangle helper
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
