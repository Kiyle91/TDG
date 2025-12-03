// ============================================================
// 💬 speechBubble.js — In-world speech bubble system
// ============================================================

import { gameState } from "../utils/gameState.js";
import { getSettings } from "../screenManagement/settings.js";

export const speechBubbles = [];

export function clearSpeechBubbles() {
  speechBubbles.length = 0;
}

export function spawnSpeechBubble(text, x, y, duration = 10000, anchor, options = {}) {
  const opts = options && typeof options === "object" ? options : {};
  const category = opts.category || "generic";
  const clearExisting = opts.clearExisting !== undefined ? opts.clearExisting : true;

  // Either clear everything (default) or just clear bubbles in the same category
  if (clearExisting) {
    clearSpeechBubbles();
  } else if (category) {
    for (let i = speechBubbles.length - 1; i >= 0; i--) {
      if (speechBubbles[i].category === category) {
        speechBubbles.splice(i, 1);
      }
    }
  }

  // If an anchor is explicitly provided, use it; otherwise default to player
  const resolvedAnchor = anchor !== undefined ? anchor : gameState?.player ?? null;

  speechBubbles.push({
    text,
    x,
    y,
    anchor: resolvedAnchor,
    life: duration,
    age: 0,
    cachedWidth: null,
    category
  });
}

export function updateAndDrawSpeechBubbles(ctx, delta) {
  const paused = gameState.paused === true;

  for (let i = speechBubbles.length - 1; i >= 0; i--) {
    const b = speechBubbles[i];

    // If the bubble is anchored to a non-Seraphine entity that has died, drop it immediately
    const anchor = b.anchor;
    const anchorDead =
      anchor &&
      anchor.type !== "seraphine" &&
      anchor.alive === false;
    if (anchorDead) {
      speechBubbles.splice(i, 1);
      continue;
    }

    if (!paused) {
      b.age += delta;
    }

    if (b.age >= b.life) {
      speechBubbles.splice(i, 1);
      continue;
    }

    const t = b.age / b.life;
    const fadeStart = 0.9; // show fully for most of life
    const fadeProgress = Math.max(0, (t - fadeStart) / (1 - fadeStart));
    const alpha = Math.max(0, 1 - fadeProgress); // gentle fade near the end

    ctx.globalAlpha = alpha;

    // Support anchors that expose either pos.x/pos.y or plain x/y
    const anchorX = b.anchor?.pos?.x ?? b.anchor?.x ?? b.x;
    const anchorY = b.anchor?.pos?.y ?? b.anchor?.y ?? b.y;

    drawSpeechBubble(ctx, b, anchorX, anchorY - 70); // adjust offset for head height

    ctx.globalAlpha = 1;
  }
}

function wrapText(ctx, text, maxWidth) {
  if (typeof text !== "string") return [];
  const words = text.split(" ");
  const lines = [];
  let current = "";

  for (const w of words) {
    const test = current ? current + " " + w : w;
    const width = ctx.measureText(test).width;

    if (width > maxWidth) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }

  if (current) lines.push(current);
  return lines;
}


function drawSpeechBubble(ctx, bubble, x, y) {
  const settings = getSettings ? getSettings() : {};
  const large = settings.largeSpeechText === true;

  const fontSize = large ? 24 : 20;
  const lineHeight = large ? 28 : 22;
  const padding = 14;
  ctx.font = `${fontSize}px Poppins`;
  const maxWidth = 280; // maximum bubble width before wrapping

  // --- WORD WRAP ---
  const lines = wrapText(ctx, bubble.text, maxWidth);

  // Measure width of longest line
  let longest = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > longest) longest = w;
  }

  const w = longest + padding * 2;
  const h = lines.length * lineHeight + padding * 2;

  // Bubble background
  const radius = 12;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
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

  // Draw each line
  ctx.fillStyle = "#444";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let startY = y - h + padding + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, x, startY);
    startY += lineHeight;
  }
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
