import { initGame, updateGame, renderGame } from "./core/game.js";

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

window.addEventListener("DOMContentLoaded", () => {
  initGame();
  requestAnimationFrame(gameLoop);
});
