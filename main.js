// main.js — entry point and main game loop


import { initGame, updateGame, renderGame } from "./core/game.js";
import { initLanding } from "./core/landing.js";
import { initProfiles } from "./core/profile.js";
import { initHub } from "./core/hub.js";

let lastTime = 0;
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;

function gameLoop(timestamp) {
  const delta = timestamp - lastTime;
  if (delta >= FRAME_DURATION) {
    updateGame(delta);
    renderGame();
    lastTime = timestamp;
  }
  requestAnimationFrame(gameLoop);
}

initLanding();

window.addEventListener("DOMContentLoaded", () => {
  initLanding();
  initProfiles();
  initHub();
  
});
