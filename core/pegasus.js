// ============================================================
// 🪽 pegasus.js — Olivia’s World: Crystal Keep (Fast Glide Version)
// ------------------------------------------------------------
// ✦ Elegant Pegasus flies across the upper sky every few minutes
// ✦ Faster, smaller, high-altitude ambient animation
// ============================================================

import { gameState } from "../utils/gameState.js";

let ctx = null;
let pegasusImg = null;
let active = false;
let flightTimer = 0;
let pegasus = { x: -500, y: 0, opacity: 0 };

// ------------------------------------------------------------
// 🌈 LOAD PEGASUS SPRITE
// ------------------------------------------------------------
export async function loadPegasus() {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = "./assets/images/characters/pegasus_glide.png"; // ✅ correct path
    img.onload = () => {
      pegasusImg = img;
      console.log("🪽 Pegasus sprite loaded successfully.");
      resolve();
    };
    img.onerror = () => {
      console.error("⚠️ Failed to load Pegasus sprite at:", img.src);
      resolve();
    };
  });
}

// ------------------------------------------------------------
// ✨ INIT — prepares ambient flight system
// ------------------------------------------------------------
export function initPegasus(canvasContext) {
  ctx = canvasContext;
  flightTimer = 0;
  console.log("🪽 Pegasus ambient system initialized.");
}

// ------------------------------------------------------------
// 🔁 UPDATE — called by game.js once per frame
// ------------------------------------------------------------
export function updatePegasus(delta = 16) {
  if (!ctx || !pegasusImg || gameState.paused) return;

  flightTimer += delta;

  // Every 5 seconds (testing)
  if (!active && flightTimer >= 120000) {
    startPegasusFlight();
    flightTimer = 0;
  }

  if (active) {
    const canvas = ctx.canvas;
    const speed = 500; // 💨 faster glide (px/sec)
    const fadeSpeed = 0.02; // slightly quicker fade

    pegasus.x += (speed * delta) / 1000;

    // Fade in/out smoothly
    if (pegasus.x < canvas.width * 0.15) {
      pegasus.opacity = Math.min(1, pegasus.opacity + fadeSpeed);
    } else if (pegasus.x > canvas.width * 0.85) {
      pegasus.opacity = Math.max(0, pegasus.opacity - fadeSpeed);
    }

    // End flight when offscreen
    if (pegasus.x > canvas.width + 300) {
      active = false;
      pegasus.opacity = 0;
    }
  }
}

// ------------------------------------------------------------
// 🕊️ START FLIGHT — triggered periodically
// ------------------------------------------------------------
function startPegasusFlight() {
  if (!ctx) return;
  const canvas = ctx.canvas;
  pegasus.x = -400;

  // ☁️ high in the sky (top 10–30% of screen)
  pegasus.y = canvas.height * (0.1 + Math.random() * 0.2);

  pegasus.opacity = 0;
  active = true;
  console.log("🌠 Pegasus flight started high in the sky!");
}

// ------------------------------------------------------------
// 🎨 DRAW — called from renderGame()
// ------------------------------------------------------------
export function drawPegasusFrame(context) {
  if (!active || !pegasusImg) return;

  context.save();
  context.globalAlpha = pegasus.opacity;
  context.shadowColor = "#ffffff";
  context.shadowBlur = 25;

  // 🪽 smaller Pegasus (40% scale)
  const scale = 0.2;
  const width = pegasusImg.width * scale;
  const height = pegasusImg.height * scale;

  context.drawImage(pegasusImg, pegasus.x, pegasus.y, width, height);
  context.restore();
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
