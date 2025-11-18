// ============================================================
// 🪽 pegasus.js — Olivia’s World: Crystal Keep (Dynamic Flight + Healing Drop)
// ------------------------------------------------------------
// ✦ Pegasus glides gracefully across the sky every few seconds
// ✦ Random altitude, speed, wave amplitude & direction
// ✦ Always drops a magical healing gem once per flight (for testing)
// ============================================================

import { gameState } from "../utils/gameState.js";
import { spawnLoot } from "./loot.js";
import { playPegasusSpawn } from "./soundtrack.js";


let ctx = null;
let pegasusImg = null;
let active = false;
let flightTimer = 0;
let nextFlightDelay = 30000 + Math.random() * 90000; 

let pegasus = {
  x: -500,
  y: 0,
  baseY: 0,
  opacity: 0,
  waveTime: 0,
  direction: 1, // 1 = →, -1 = ←
  speed: 500,
  waveHeight: 40,
  waveSpeed: 0.005,
  hasDropped: false, // ✅ prevents multiple drops per flight
};

// ------------------------------------------------------------
// 🌈 LOAD PEGASUS SPRITE
// ------------------------------------------------------------
export async function loadPegasus() {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = "./assets/images/characters/pegasus_glide.png";
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
// 🔁 UPDATE — called from game.js each frame
// ------------------------------------------------------------
export function updatePegasus(delta = 16) {
  if (!ctx || !pegasusImg || gameState.paused) return;

  flightTimer += delta;

  // 🕒 Trigger a new flight on a random timer (1–3 minutes)
  if (!active && flightTimer >= nextFlightDelay) {
    startPegasusFlight();
    playPegasusSpawn();
    
    // Reset timer + generate NEW random interval
    flightTimer = 0;
    nextFlightDelay = 60000 + Math.random() * 120000; 
    // 60,000ms = 1 minute
    // 180,000ms = 3 minutes
  }

  if (active) {
    const canvas = ctx.canvas;
    const fadeSpeed = 0.02;

    // Horizontal movement + sine-wave path
    pegasus.x += (pegasus.speed * pegasus.direction * delta) / 1000;
    pegasus.waveTime += delta;
    const curve = Math.sin(pegasus.waveTime * pegasus.waveSpeed) * pegasus.waveHeight;
    pegasus.y = pegasus.baseY + curve;

    // ✨ Fade in/out smoothly at screen edges
    if (pegasus.direction === 1) {
      if (pegasus.x < canvas.width * 0.15)
        pegasus.opacity = Math.min(1, pegasus.opacity + fadeSpeed);
      else if (pegasus.x > canvas.width * 0.85)
        pegasus.opacity = Math.max(0, pegasus.opacity - fadeSpeed);
    } else {
      if (pegasus.x > canvas.width * 0.85)
        pegasus.opacity = Math.min(1, pegasus.opacity + fadeSpeed);
      else if (pegasus.x < canvas.width * 0.15)
        pegasus.opacity = Math.max(0, pegasus.opacity - fadeSpeed);
    }

    const halfway = ctx.canvas.width * 0.5;
    if (!pegasus.hasDropped && (
        (pegasus.direction === 1 && pegasus.x > halfway) ||
        (pegasus.direction === -1 && pegasus.x < halfway)
    )) {
      // Unified loot: Pegasus always drops from its own table
      spawnLoot("pegasus", pegasus.x, pegasus.y + 80);
      pegasus.hasDropped = true;
      console.log("💎 Pegasus dropped a magical loot gem mid-flight!");
    }

    // 🚫 End flight when completely off-screen
    if (
      (pegasus.direction === 1 && pegasus.x > canvas.width + 400) ||
      (pegasus.direction === -1 && pegasus.x < -400)
    ) {
      active = false;
      pegasus.opacity = 0;
    }
  }
}


// ------------------------------------------------------------
// 🕊️ START FLIGHT — randomized motion setup
// ------------------------------------------------------------
function startPegasusFlight() {
  if (!ctx) return;
  const canvas = ctx.canvas;

  // Random direction (50% chance to reverse)
  pegasus.direction = Math.random() < 0.5 ? 1 : -1;

  // Start off-screen
  pegasus.x = pegasus.direction === 1 ? -400 : canvas.width + 400;

  // Random altitude between 10%–50% of screen height
  const minY = canvas.height * 0.1;
  const maxY = canvas.height * 0.5;
  pegasus.baseY = minY + Math.random() * (maxY - minY);
  pegasus.y = pegasus.baseY;

  // Random motion parameters
  pegasus.speed = 400 + Math.random() * 250; // 400–650 px/sec
  pegasus.waveHeight = 20 + Math.random() * 80; // swoop amplitude
  pegasus.waveSpeed = 0.003 + Math.random() * 0.005; // sine frequency

  pegasus.opacity = 0;
  pegasus.waveTime = 0;
  pegasus.hasDropped = false; // reset drop state
  active = true;

  console.log(
    `🌠 Pegasus flight started — dir: ${pegasus.direction === 1 ? "→" : "←"}, y=${Math.round(
      pegasus.baseY
    )}, speed=${pegasus.speed.toFixed(0)}, wave=${pegasus.waveHeight.toFixed(0)}`
  );
}

// ------------------------------------------------------------
// 🎨 DRAW — rendered from renderGame()
// ------------------------------------------------------------
export function drawPegasusFrame(context) {
  if (!active || !pegasusImg) return;

  context.save();
  context.globalAlpha = pegasus.opacity;
  context.shadowColor = "#ffffff";
  context.shadowBlur = 25;

  // 🪽 40% scale for subtle appearance
  const scale = 0.2;
  const width = pegasusImg.width * scale;
  const height = pegasusImg.height * scale;

  if (pegasus.direction === -1) {
    // Flip horizontally when flying left
    context.scale(-1, 1);
    context.drawImage(pegasusImg, -pegasus.x - width, pegasus.y, width, height);
  } else {
    context.drawImage(pegasusImg, pegasus.x, pegasus.y, width, height);
  }

  context.restore();
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
