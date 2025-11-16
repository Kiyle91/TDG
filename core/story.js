// ============================================================
// 💬 story.js — Olivia’s World: Crystal Keep (Wave Story System)
// ------------------------------------------------------------
// ✦ Unified cinematic story box for all story moments
// ✦ No typewriter animation (instant text)
// ✦ Wave 1 end story
// ✦ Wave 5 end story (final wave)
// ✦ Goblin Intro kept as requested
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { gameState } from "../utils/gameState.js";



// ------------------------------------------------------------
// 📜 MAP-SPECIFIC STORY TEXT
// ------------------------------------------------------------

export const wave1Text = {
  1: "Guardian, the goblins test our borders. Stay sharp — this is only the beginning.",
  2: "These woods hide old magic — and darker creatures. Even the goblins seem wary.",
  3: "A cold breeze sweeps through the frostfields… something stirs beyond the snow.",
  4: "Heat rises from beneath the scorched earth. The goblins fear what sleeps here.",
  5: "The seaside winds whisper warnings… the goblins move strangely near the shore.",
  6: "The caverns hum with ancient echoes — and the goblins follow those whispers.",
  7: "The cliffs tremble slightly… the storm ahead feels alive.",
  8: "The crystal gardens react to your presence — and the corruption of the goblins.",
  9: "We are close to the Crystal Heart. Each battle here shifts the balance of the Isles.",
};

export const wave5Text = {
  1: "They regroup in the shadows… something drives them onward. This was no random attack.",
  2: "The forest shakes — an ogre approaches. Brace yourself, Guardian.",
  3: "The blizzard roars… an ancient frostbeast stirs beneath the ice.",
  4: "Molten rumbling echoes below — the magma fields awaken.",
  5: "The tides twist unnaturally… the ocean itself recoils from the coming threat.",
  6: "Stone cracks deep below… the caverns shift as something massive moves.",
  7: "Lightning gathers above — the storm prepares a champion.",
  8: "Constellations shimmer violently… an astral guardian descends.",
  9: "This is it, Guardian. The final wave before the heart of the Isles reveals itself.",
};

// ------------------------------------------------------------
// 🧚‍♀️ UNIVERSAL STORY BOX (Instant Text)
// ------------------------------------------------------------
async function showStory({ portrait, text, autoStart = false }) {
  return new Promise((resolve) => {
    // Remove any existing overlay
    document.getElementById("overlay-story")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "overlay-story";
    overlay.className = "overlay active";
    overlay.innerHTML = `
      <div class="story-box">
        <div class="story-content">
          <img
            src="${portrait}"
            alt="Story Portrait"
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
// ⭐ WAVE STORY FLAGS (per map)
// ------------------------------------------------------------
// Each map tracks whether Wave 1 and Wave 5 stories have played
export const waveStoryFlags = {};

for (let i = 1; i <= 9; i++) {
  waveStoryFlags[i] = { 1: false, 5: false };
}

// ------------------------------------------------------------
// ⭐ END OF WAVE 1 STORY
// ------------------------------------------------------------
export async function triggerEndOfWave1Story(mapId) {
  if (!waveStoryFlags[mapId] || waveStoryFlags[mapId][1]) return;

  waveStoryFlags[mapId][1] = true;
  gameState.paused = true;

  const text = wave1Text[mapId] || "The battle continues...";

  await showStory({
    portrait: "./assets/images/portraits/princess_ariana.png",
    text,
    autoStart: false,
  });

  gameState.paused = false;
  console.log(`🎬 End-of-Wave-1 story finished for map ${mapId}`);
}

// ------------------------------------------------------------
// ⭐ END OF WAVE 5 STORY (Final Wave)
// ------------------------------------------------------------
export async function triggerEndOfWave5Story(mapId) {
  if (!waveStoryFlags[mapId] || waveStoryFlags[mapId][5]) return;

  waveStoryFlags[mapId][5] = true;
  gameState.paused = true;

  const text = wave5Text[mapId] || "You stand victorious, Guardian.";

  await showStory({
    portrait: "./assets/images/portraits/princess_ariana.png",
    text,
    autoStart: false,
  });

  gameState.paused = false;
  console.log(`🎬 End-of-Wave-5 story finished for map ${mapId}`);
}

// ------------------------------------------------------------
// 🏹 GOBLIN INTRO STORY (kept exactly as requested)
// ------------------------------------------------------------
export async function startGoblinIntroStory() {
  console.log("🎬 Goblin scout intro story triggered!");
  gameState.paused = true;

  const goblinText = `  
  Use WASD to move across the Crystal Plains.
  Press SPACE to strike with your glitter blade.  
  Press F to cast a glitter spell.  
  Press R to heal your wounds.  
  Press E to fire a silver arrow.  
`;

  await showStory({
    portrait: "./assets/images/portraits/controller.png",
    text: goblinText.trim(),
    autoStart: false,
  });

  gameState.paused = false;
  console.log("🏹 Goblin intro story finished.");
}

// ------------------------------------------------------------
// 🏆 OPTIONAL VICTORY STORY (still available)
// ------------------------------------------------------------
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

  console.log("🏰 Victory story finished.");
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
