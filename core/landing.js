// ============================================================
// 🌸 landing.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles landing screen logic and transition to main hub
// ✦ Adds soft pastel fade between title and profile screen
// ✦ Entry point for player journey initialization
// ============================================================

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initLanding() {
  const startBtn = document.getElementById("start-button");
  const landing = document.getElementById("landing-screen");
  const gameContainer = document.getElementById("profile-screen");

  if (!startBtn || !landing || !gameContainer) return;

  // 🌸 Start Button Logic
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

// ------------------------------------------------------------
// 🌈 FADE-IN UTILITY
// ------------------------------------------------------------
function fadeIn(element) {
  element.style.opacity = 0;
  element.style.transition = "opacity 0.8s ease";
  requestAnimationFrame(() => {
    element.style.opacity = 1;
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
