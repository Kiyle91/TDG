// ============================================================
// 💬 story.js — Olivia’s World: Crystal Keep (Dynamic Portraits)
// ------------------------------------------------------------
// PURPOSE:
//   Central narrative system controlling all in-game story events.
//   Displays story overlays with portraits + text, pauses gameplay,
//   and resumes when the player continues.
//
// FEATURES:
//   • Portrait automatically matches the player's current skin
//   • Optional Ariana override for lore moments
//   • Story triggers for Wave 1, Wave 5, Goblin Intro, Victory
//   • Prevents repeated firing using per-map story flags
//
// USED BY:
//   game.js → triggers end-of-wave stories
//   gameplay start → goblin intro
//   victory → optional victory story
//
// UI:
//   Uses #overlay-story injected directly into DOM
// ============================================================

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------ 

import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { gameState } from "../utils/gameState.js";
import { SKINS, ensureSkin } from "./skins.js";

// ------------------------------------------------------------
// 🌟 RESOLVE PORTRAIT (player skin OR Ariana override)
// ------------------------------------------------------------

function resolvePortrait(useAriana = false) {
  if (useAriana) {
    return "./assets/images/portraits/princess_ariana.png";
  }

  const player = gameState.player || {};
  ensureSkin(player);

  const key = player.skin || "glitter";
  const skin = SKINS[key];

  // Fallback protection
  return `./assets/images/portraits/${skin?.portrait || "portrait_glitter.png"}`;
}

// ------------------------------------------------------------
// 📜 UNIVERSAL STORY BOX OVERLAY HANDLER
// ------------------------------------------------------------

async function showStory({ text, useAriana = false, autoStart = false }) {
  return new Promise((resolve) => {
    // Remove any existing story overlay (safety)
    document.getElementById("overlay-story")?.remove();

    const portrait = resolvePortrait(useAriana);

    // Build DOM
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

    // Button handling
    const nextBtn = overlay.querySelector("#story-next");
    nextBtn.disabled = false;

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
// 📜 MAP-SPECIFIC STORY TEXT (Wave 1 & 5)
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
// ⭐ WAVE STORY FLAGS (prevents repeat triggers)
// ------------------------------------------------------------

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

  await showStory({
    text: wave1Text[mapId] || "The battle continues...",
    useAriana: false,
  });

  gameState.paused = false;
}

// ------------------------------------------------------------
// ⭐ END OF WAVE 5 STORY
// ------------------------------------------------------------

export async function triggerEndOfWave5Story(mapId) {
  if (!waveStoryFlags[mapId] || waveStoryFlags[mapId][5]) return;

  waveStoryFlags[mapId][5] = true;
  gameState.paused = true;

  await showStory({
    text: wave5Text[mapId] || "You stand victorious, Guardian.",
    useAriana: true,
  });

  gameState.paused = false;
}

// ------------------------------------------------------------
// 💖 OPENING STORY (2-PAGE INTRO)
// ------------------------------------------------------------

export async function showOpeningStory() {
  // PAGE 1
  await showStory({
    text: `
🌸 *Princess Ariana:*  
Guardian… thank goodness you've arrived.

The Crystal Isles are trembling.  
Darkness stirs beneath the goblin hordes,  
and our ancient defenses are weakening.
    `.trim(),
    useAriana: true
  });

  // PAGE 2
  await showStory({
    text: `
🌙 The Crystal Heart — source of all light in the Isles —  
has begun to fade.  
Only you can reignite its power.

Seek out the Crystal Echoes.  
Reclaim the Spires.  
And protect our home, Guardian.
    `.trim(),
    useAriana: true
  });
}

// ------------------------------------------------------------
// 🏆 VICTORY STORY (Optional)
// ------------------------------------------------------------

export async function showVictoryStory() {
  await showStory({
    text: `
💎 The final goblin falls, and peace returns — for now.
The crystals glow once again under your protection.
    `.trim(),
    useAriana: false,
  });

}

// ============================================================
// 🌟 END OF FILE
// ============================================================
