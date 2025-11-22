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

import { showScreen } from "../screenManagement/screens.js";
import { startGameplay } from "../main.js";
import { gameState } from "../utils/gameState.js";
import { SKINS, ensureSkin } from "../screenManagement/skins.js";

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
  1: "Oh my! That was actually a goblin! It was sooo ugly! Ew Ew Ew Ew! Ok, this is serious now. We need to prepare as quickly we as can. Goblins are not very strong but we they lack in strentgh, they make up for in sheer amounts of numbers. If one thing is sure, if there is one goblin.. there are more nearby. Prepare yourself, this could be trouble. Oh it was sooo ugly.. I think im going to be sick. You need to grab as many Crystal Echos from around the Meadow as you can before the Goblins arrive. We can't let them fall into their hands!",
  2: "So the goblins have made their way to farmer braggs! oh no, we must do what we can to protect him. its your duty as a guardian of course! get some spires down, and most importantly, get the crstal echos before the goblins overwhelm yhou and take control!",
  3: "A cold breeze sweeps through the frostfields… something stirs beyond the snow.",
  4: "Heat rises from beneath the scorched earth. The goblins fear what sleeps here.",
  5: "The seaside winds whisper warnings… the goblins move strangely near the shore.",
  6: "The caverns hum with ancient echoes — and the goblins follow those whispers.",
  7: "The cliffs tremble slightly… the storm ahead feels alive.",
  8: "The crystal gardens react to your presence — and the corruption of the goblins.",
  9: "We are close to the Crystal Heart. Each battle here shifts the balance of the Isles.",
};

export const wave5Text = {
  1: "Yuck. Well I think I did fantstically there. Yes.. i mean you did do the work, but i managed to watch you and not throw up! How you can stand to even look at them makes you much braver than me. This was only a scouting party. W'eve spent our whole lives in crystal keep.. the ancient tales say that even small raiding parties of goblins number in the 1000s. We should head to Farmer Braggs farm to make sure hes ok.",
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
    useAriana: true,
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
  const guardian = gameState?.player?.name || "Guardian";

  // PAGE 1
  await showStory({
    text: `
<div style="text-align:center; font-size:2rem;"><u><b>PRINCESS ARIANA</b></u></div>

Princess ${guardian}… I can finally reach you through the Crystal Link!

Can you hear me??

Fantastic!

I can’t believe these old conduits still work…

We’ve had urgent reports from our scouts near The Whispering Meadows.  
And—this might sound silly—but they claim to have seen goblins.

You may still be a recruit, but you are a Princess Guardian…  
and my best friend!

I need you to head over there as soon as you can and investigate.  
I’m sure it’s just Farmer Bragg and his wild imagination,  
but we can never be too careful when goblins are involved!

…

Don’t worry—I'm here to help you.  
What could go wrong?

…  
So much.  
So, so much could go wrong…
    `.trim(),
    useAriana: true
  });

  // PAGE 2
  await showStory({
    text: `
Before you go, Princess ${guardian}… there’s something you must know.

You’ve heard the tales—goblins, ogres, and their terrible king.  
They crave the crystals that dot our islands.  
Most crystals are harmless and pretty…  
but some are far more powerful.

Some are Crystal Echoes — fragments of magic,  
shards of the Crystal Heart itself.

The goblins don’t understand the power they play with.  F
It can be dangerous… very dangerous.

Many years ago, the Goblin King nearly destroyed the entire Unicorn Isles  
with one of his schemes.  
He is not to be underestimated!

If there truly are goblins in The Whispering Meadows,  
you must collect as many Crystal Echoes as you can.

Remember:  
As a Princess Guardian, you can create powerful Spires from crystals  
to defend our lands.  
But only with more Crystal Echoes  
can you unlock their true potential.

Go now, Princess ${guardian}.  

I’ll contact you again once you arrive at The Whispering Meadows!

Good Luck!!


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
