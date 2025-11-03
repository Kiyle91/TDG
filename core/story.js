// ============================================================
// 💬 story.js — Story Narration Overlay
// ------------------------------------------------------------
// Typewriter-style intro text for "New Story" launch
// ============================================================

import { showOverlay } from "./ui.js";
import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";

let lines = [
  "🌸 Princess Ariana: Welcome, brave soul. I am Ariana, keeper of the Crystal Keep.",
  "Long have I watched over the Unicorn Isles, but the crystals are dimming...",
  "You have been chosen to defend our realm — your journey begins now."
];

let currentLine = 0;
let typingInterval = null;

// ------------------------------------------------------------
// 📖 Start the story overlay
// ------------------------------------------------------------
export function startIntroStory() {
  showOverlay("overlay-story");
  typeLine();
  setupStoryControls();
}

// ------------------------------------------------------------
// ✨ Typewriter effect for each line
// ------------------------------------------------------------
function typeLine() {
  const textEl = document.getElementById("story-text");
  if (!textEl) return;

  textEl.innerHTML = "";
  let chars = [...lines[currentLine]];
  let index = 0;

  clearInterval(typingInterval);
  typingInterval = setInterval(() => {
    textEl.innerHTML += chars[index];
    index++;
    if (index >= chars.length) clearInterval(typingInterval);
  }, 45);
}

// ------------------------------------------------------------
// 🩵 Handle "Continue" button clicks
// ------------------------------------------------------------
export function setupStoryControls() {
  const nextBtn = document.getElementById("story-next");
  if (!nextBtn) return;

  nextBtn.onclick = () => {
    if (currentLine < lines.length - 1) {
      currentLine++;
      typeLine();
    } else {
      endStoryIntro();
    }
  };
}

// ------------------------------------------------------------
// 🎮 End of story — fade overlay → start game
// ------------------------------------------------------------
function endStoryIntro() {
  const overlay = document.getElementById("overlay-story");
  overlay.classList.remove("active");

  setTimeout(() => {
    overlay.style.display = "none";
    showScreen("game-container");
    startGameplay();
  }, 600);
}
