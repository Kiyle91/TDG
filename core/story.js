// ============================================================
// 💬 story.js — Olivia’s World: Crystal Keep (Wave Story System)
// ------------------------------------------------------------
// ✦ Unified cinematic story box for all story moments
// ✦ No typewriter animation (instant text)
// ✦ NEW: Automatic story triggers on Wave 2 and Wave 4 for all maps
// ✦ Placeholder text ready to be replaced later
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// 🧚‍♀️ UNIVERSAL STORY BOX (Instant Text)
// ------------------------------------------------------------
async function showStory({ portrait, text, autoStart = false }) {
  return new Promise((resolve) => {
    document.getElementById("overlay-story")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "overlay-story";
    overlay.className = "overlay active";
    overlay.innerHTML = `
      <div class="story-box">
        <div class="story-content">
          <img
            src="${portrait}"
            alt="Princess Ariana"
            class="story-portrait"
            id="story-portrait"
          />
          <div class="story-text" id="story-text">${text}</div>
        </div>
        <button id="story-next" class="story-next-btn">Continue</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const nextBtn = overlay.querySelector("#story-next");
    nextBtn.disabled = false;
    nextBtn.style.opacity = "1";
    nextBtn.style.pointerEvents = "auto";

    nextBtn.addEventListener("click", () => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        overlay.remove();
        if (autoStart) {
          showScreen("game-container");
          startGameplay();
        }
        resolve();
      }, 400);
    });
  });
}

// ------------------------------------------------------------
// 📘 STORY TRIGGER MAP (per map)
// ------------------------------------------------------------
// Example: { "1": {2: false, 4: false}, "2": {2: false, 4: false}, ... }
export const waveStoryFlags = {};

for (let i = 1; i <= 9; i++) {
  waveStoryFlags[i] = { 2: false, 4: false };
}

// ------------------------------------------------------------
// 🎭 TRIGGER STORY FOR WAVE 2 & 4
// ------------------------------------------------------------
export async function triggerWaveStory(mapId, wave) {
  if (wave !== 2 && wave !== 4) return; 
  if (!waveStoryFlags[mapId]) return;

  // Already played?
  if (waveStoryFlags[mapId][wave]) return;

  waveStoryFlags[mapId][wave] = true;

  gameState.paused = true;

  const portrait = "./assets/images/portraits/princess_ariana.png";

  // Placeholder text (we will rewrite later)
  const waveStoryText = {
    2: `🌸 *Placeholder for Map ${mapId} — Wave 2 story*\n\nAriana senses the battle shifting...`,
    4: `⚔️ *Placeholder for Map ${mapId} — Wave 4 story*\n\nAriana warns you: the enemy grows stronger.`,
  };

  await showStory({
    portrait,
    text: waveStoryText[wave],
    autoStart: false,
  });

  gameState.paused = false;
  console.log(`🎬 Wave ${wave} story for Map ${mapId} finished.`);
}

// ------------------------------------------------------------
// 🏹 EXISTING STORIES (still active & unchanged)
// ------------------------------------------------------------


export async function startGoblinIntroStory() {
  console.log("🎬 Goblin scout intro story triggered!");
  gameState.paused = true;

  const goblinText = `  
  Use WASD to move across the Crystal Plains.
  Press SPACE to strike with your glitter blade.  
  Press F to cast a glitter spell.  
  Press R to heal your wounds.  
  Press E to unleash a silver arrow.  
`;

  await showStory({
    portrait: "./assets/images/portraits/controller.png",
    text: goblinText.trim(),
    autoStart: false,
  });

  gameState.paused = false;
}

export async function showVictoryStory() {
  const victoryText = `
  💎 The final goblin falls, and peace returns — for now.
  The crystals glow once again under your protection.
  `;
  await showStory({
    portrait: "./assets/images/portraits/princess_ariana.png",
    text: victoryText.trim(),
    autoStart: false,
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
