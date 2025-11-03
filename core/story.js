// ============================================================
// 💬 story.js — Story Narration Overlay
// ------------------------------------------------------------
// Typewriter-style intro text for "New Story" launch
// ============================================================

import { showOverlay } from "./ui.js";
import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";

let lines = [
  "In the heart of the Unicorn Isles stands the Crystal Keep — a tower woven from dreams and light.",
  "For centuries it has guarded the realm’s balance, until a shadow crept through the veil...",
  "Now, as the crystals fade, Olivia must rise to defend her world once more."
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
