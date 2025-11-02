// landing.js — handles landing screen and transition to main game

export function initLanding() {
  const startBtn = document.getElementById("start-button");
  const landing = document.getElementById("landing-screen");
  const gameContainer = document.getElementById("game-container");

  if (!startBtn || !landing || !gameContainer) return;

  startBtn.addEventListener("click", () => {
    startBtn.disabled = true;
    startBtn.textContent = "Loading...";
    landing.style.opacity = 0;

    setTimeout(() => {
      landing.style.display = "none";
      gameContainer.style.display = "block";
      fadeIn(gameContainer);
    }, 800);
  });
}

function fadeIn(element) {
  element.style.opacity = 0;
  element.style.transition = "opacity 0.8s ease";
  requestAnimationFrame(() => {
    element.style.opacity = 1;
  });
}
