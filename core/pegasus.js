// ============================================================
// 🪽 pegasus.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Ambient flying creature with healing gem drop
// ✦ Random altitude, speed, direction, wave pattern
// ✦ Fully integrated with unified loot + soundtrack
// ============================================================
/* ------------------------------------------------------------
 * MODULE: pegasus.js
 * PURPOSE:
 *   Provides the ambient flying Pegasus system that periodically
 *   crosses the screen with randomized altitude, direction,
 *   sine-wave motion, fade-in/out behaviour, and a guaranteed
 *   mid-flight healing gem drop via the unified loot table.
 *
 * SUMMARY:
 *   When active, the Pegasus glides across the sky after a
 *   random cooldown interval (1–3 minutes). Its flight uses
 *   randomized speed, wave amplitude, and altitude. While
 *   crossing the midpoint of the screen, it drops one loot
 *   reward (“pegasus” entry from LOOT_TABLE). It fades in at
 *   screen entry and fades out when leaving.
 *
 * FEATURES:
 *   • loadPegasus() — loads Pegasus sprite
 *   • initPegasus(ctx) — prepares ambient flight manager
 *   • updatePegasus(delta) — motion + spawn timing
 *   • drawPegasusFrame(ctx) — renders flying sprite
 *
 * TECHNICAL NOTES:
 *   • Pegasus never interacts with collision
 *   • Always drops exactly once per flight (hasDropped flag)
 *   • Safe if disabled, no crashes when sprite missing
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";
import { spawnLoot } from "./loot.js";
import { playPegasusSpawn } from "./soundtrack.js";

// ------------------------------------------------------------
// 🗺️ MODULE-LEVEL VARIABLES
// ------------------------------------------------------------ 

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
  direction: 1,
  speed: 500,
  waveHeight: 40,
  waveSpeed: 0.005,
  hasDropped: false,
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
      resolve();
    };
    img.onerror = () => resolve();
  });
}

// ------------------------------------------------------------
// ✨ INIT — Ambient flight system
// ------------------------------------------------------------

export function initPegasus(canvasContext) {
  ctx = canvasContext;
  flightTimer = 0;
}

// ------------------------------------------------------------
// 🔁 UPDATE — called every frame from game.js
// ------------------------------------------------------------

export function updatePegasus(delta = 16) {
  if (!ctx || !pegasusImg || gameState.paused) return;

  flightTimer += delta;

  // New flight (random 1–3 minutes)
  if (!active && flightTimer >= nextFlightDelay) {
    startPegasusFlight();
    playPegasusSpawn();

    flightTimer = 0;
    nextFlightDelay = 60000 + Math.random() * 120000;
  }

  if (!active) return;

  const canvas = ctx.canvas;
  const fadeSpeed = 0.02;

  // Horizontal movement + sine wave
  pegasus.x += (pegasus.speed * pegasus.direction * delta) / 1000;
  pegasus.waveTime += delta;
  const curve = Math.sin(pegasus.waveTime * pegasus.waveSpeed) * pegasus.waveHeight;
  pegasus.y = pegasus.baseY + curve;

  // Fade in / fade out
  if (pegasus.direction === 1) {
    if (pegasus.x < canvas.width * 0.15) pegasus.opacity = Math.min(1, pegasus.opacity + fadeSpeed);
    else if (pegasus.x > canvas.width * 0.85) pegasus.opacity = Math.max(0, pegasus.opacity - fadeSpeed);
  } else {
    if (pegasus.x > canvas.width * 0.85) pegasus.opacity = Math.min(1, pegasus.opacity + fadeSpeed);
    else if (pegasus.x < canvas.width * 0.15) pegasus.opacity = Math.max(0, pegasus.opacity - fadeSpeed);
  }

  // Mid-flight loot drop (once)
  const mid = canvas.width * 0.5;
  if (
    !pegasus.hasDropped &&
    ((pegasus.direction === 1 && pegasus.x > mid) ||
      (pegasus.direction === -1 && pegasus.x < mid))
  ) {
    spawnLoot("pegasus", pegasus.x, pegasus.y + 80);
    pegasus.hasDropped = true;
  }

  // End flight
  if (
    (pegasus.direction === 1 && pegasus.x > canvas.width + 400) ||
    (pegasus.direction === -1 && pegasus.x < -400)
  ) {
    active = false;
    pegasus.opacity = 0;
  }
}

// ------------------------------------------------------------
// 🕊️ START NEW RANDOMIZED FLIGHT
// ------------------------------------------------------------

function startPegasusFlight() {
  if (!ctx) return;
  const canvas = ctx.canvas;

  pegasus.direction = Math.random() < 0.5 ? 1 : -1;
  pegasus.x = pegasus.direction === 1 ? -400 : canvas.width + 400;

  const minY = canvas.height * 0.1;
  const maxY = canvas.height * 0.5;
  pegasus.baseY = minY + Math.random() * (maxY - minY);
  pegasus.y = pegasus.baseY;

  pegasus.speed = 400 + Math.random() * 250;
  pegasus.waveHeight = 20 + Math.random() * 80;
  pegasus.waveSpeed = 0.003 + Math.random() * 0.005;

  pegasus.opacity = 0;
  pegasus.waveTime = 0;
  pegasus.hasDropped = false;

  active = true;
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

  const scale = 0.2;
  const width = pegasusImg.width * scale;
  const height = pegasusImg.height * scale;

  if (pegasus.direction === -1) {
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
