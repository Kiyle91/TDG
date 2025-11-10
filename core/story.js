// ============================================================
// 💬 story.js — Story Narration Overlay (CLEAN FIX)
// ------------------------------------------------------------
// Typewriter-style intro text for "New Story" launch
// Ensures overlays are cleared before gameplay begins
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
  const overlay = document.getElementById("overlay-story");

  // 💡 Re-create or re-show if missing
  if (!overlay) {
    console.warn("⚠️ Story overlay missing — recreating element.");
    const newOverlay = document.createElement("div");
    newOverlay.id = "overlay-story";
    newOverlay.className = "overlay active";
    newOverlay.innerHTML = `
      <div class="story-box">
        <div class="story-content">
          <img src="./assets/images/portraits/princess_ariana.png"
               alt="Princess Ariana"
               class="story-portrait"
               id="story-portrait"/>
          <div class="story-text" id="story-text"></div>
        </div>
        <button id="story-next" class="story-next-btn">Continue</button>
      </div>`;
    document.body.appendChild(newOverlay);
  }

  // Now safe to call showOverlay
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

function endStoryIntro() {
  // 🔹 1. Hard-remove any lingering end screen overlay(s)
  document.querySelectorAll("#end-screen").forEach(el => {
    el.remove();
  });

  // 🔹 2. Also remove any duplicate overlays left in memory
  document.querySelectorAll(".end-overlay").forEach(el => {
    el.remove();
  });

  // 🔹 3. Clean up story overlay itself
  const overlay = document.getElementById("overlay-story");
  if (overlay) {
    overlay.classList.remove("active");
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";

    // wait one animation frame so styles apply, then hide completely
    setTimeout(() => {
      overlay.style.display = "none";

      // 🔹 4. Absolutely guarantee nothing is sitting above canvas
      const anyOverlays = document.querySelectorAll(".overlay, .end-overlay");
      anyOverlays.forEach(o => (o.style.display = "none"));

      // 🔹 5. Show game screen and start gameplay cleanly
      showScreen("game-container"); // matches your HTML id
      startGameplay();

      console.log("📖 Story ended → overlays cleared → gameplay started.");
    }, 300);
  } else {
    // Fallback safety if overlay already gone
    document.querySelectorAll("#end-screen,.end-overlay").forEach(el => el.remove());
    showScreen("game-container");
    startGameplay();
  }
}


// ============================================================
// 🌟 END OF FILE
// ============================================================
