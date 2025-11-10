// ============================================================
// 💬 story.js — Olivia’s World: Crystal Keep (RESTART-SAFE)
// ------------------------------------------------------------
// ✦ Works on every restart after defeat
// ✦ Always attaches a fresh Continue button
// ✦ Automatically recreates overlay if missing
// ✦ Smooth fade into gameplay
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";

// ------------------------------------------------------------
// 📜 STORY LINES
// ------------------------------------------------------------
const lines = [
  "🌸 Princess Ariana: Welcome, brave soul. I am Ariana, keeper of the Crystal Keep.",
  "Long have I watched over the Unicorn Isles, but the crystals are dimming...",
  "You have been chosen to defend our realm — your journey begins now."
];

// ------------------------------------------------------------
// 📖 START INTRO STORY
// ------------------------------------------------------------
export function startIntroStory() {
  // Remove any existing overlay to start truly fresh
  const old = document.getElementById("overlay-story");
  if (old) old.remove();

  // Build a new overlay from scratch each time
  const overlay = document.createElement("div");
  overlay.id = "overlay-story";
  overlay.className = "overlay active";
  overlay.innerHTML = `
    <div class="story-box">
      <div class="story-content">
        <img
          src="./assets/images/portraits/princess_ariana.png"
          alt="Princess Ariana"
          class="story-portrait"
          id="story-portrait"
        />
        <div class="story-text" id="story-text"></div>
      </div>
      <button id="story-next" class="story-next-btn">Continue</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // start first line
  let currentLine = 0;
  typeLine(currentLine);

  // add click handler for continue button
  const nextBtn = overlay.querySelector("#story-next");
  nextBtn.addEventListener("click", () => {
    currentLine++;
    if (currentLine < lines.length) {
      typeLine(currentLine);
    } else {
      endStoryIntro(overlay);
    }
  });
}

// ------------------------------------------------------------
// ✨ TYPEWRITER EFFECT
// ------------------------------------------------------------
function typeLine(i) {
  const textEl = document.getElementById("story-text");
  if (!textEl) return;
  textEl.textContent = "";
  const chars = [...lines[i]];
  let index = 0;
  const timer = setInterval(() => {
    textEl.textContent += chars[index];
    index++;
    if (index >= chars.length) clearInterval(timer);
  }, 45);
}

// ------------------------------------------------------------
// 🎮 END STORY → START GAME
// ------------------------------------------------------------
function endStoryIntro(overlay) {
  overlay.classList.remove("active");
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";

  setTimeout(() => {
    overlay.remove(); // remove it fully
    document.querySelectorAll("#end-screen, .end-overlay").forEach(el => el.remove());
    showScreen("game-container");
    startGameplay();
    console.log("📖 Story finished → gameplay started fresh.");
  }, 600);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
