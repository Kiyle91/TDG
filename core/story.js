// ============================================================
// 💬 story.js — Olivia’s World: Crystal Keep (Crystal Dialogue Edition — No Typewriter)
// ------------------------------------------------------------
// ✦ Unified cinematic story box for all story moments
// ✦ No typewriter animation (instant text display)
// ✦ Centered crystal box layout matching Ariana’s intro style
// ✦ Smooth fade transitions + single Continue button
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// 🧚‍♀️ UNIVERSAL STORY BOX FUNCTION (Instant Text)
// ------------------------------------------------------------
async function showStory({ portrait, text, autoStart = false }) {
  return new Promise((resolve) => {
    // Remove any existing story overlay
    document.getElementById("overlay-story")?.remove();

    // Create new overlay
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

    // Enable Continue button immediately (no typing delay)
    nextBtn.disabled = false;
    nextBtn.classList.remove("disabled");
    nextBtn.style.opacity = "1";
    nextBtn.style.pointerEvents = "auto";

    // Continue button event
    nextBtn.addEventListener("click", () => {
      if (nextBtn.disabled) return;
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
// 🌸 INTRO STORY — Ariana summons the player
// ------------------------------------------------------------
export async function startIntroStory() {
  const introText = `
  🌸 Welcome, Guardian. I am Ariana, keeper of the Crystal Keep.

  The crystals are fading and darkness gathers.
  You alone can restore their light — defend our realm and protect the Isles!
  `;

  await showStory({
    portrait: "./assets/images/portraits/princess_ariana.png",
    text: introText.trim(),
    autoStart: true,
  });

  console.log("📖 Intro story complete — gameplay started fresh.");
}

// ------------------------------------------------------------
// 🏹 GOBLIN INTRO STORY — before first map battle
// ------------------------------------------------------------
export async function startGoblinIntroStory() {
  console.log("🎬 Goblin scout intro story triggered!");
  gameState.paused = true;

  const goblinText = `
  🌙 Goblin scouts have found the paths to our Keep!

  Fifty march under the moonlight — the first wave of many.
  Stand firm, Princess. The light of the crystals is your weapon.
  `;

  await showStory({
    portrait: "./assets/images/portraits/princess_ariana.png",
    text: goblinText.trim(),
    autoStart: false,
  });

  gameState.paused = false;
  console.log("🏹 Goblin scout story finished — gameplay resumes!");
}

// ------------------------------------------------------------
// ⚔️ MID-BATTLE STORY — after 10 goblins spawned
// ------------------------------------------------------------
export async function triggerMidBattleStory() {
  console.log("🎬 Mid-battle story triggered!");
  gameState.paused = true;

  const midText = `
  ⚔️ More goblins pour from the shadows!

  Their reinforcements are endless — hold fast, Guardian.
  The Crystal Keep stands only if you do.
  `;

  await showStory({
    portrait: "./assets/images/portraits/princess_ariana.png",
    text: midText.trim(),
    autoStart: false,
  });

  gameState.paused = false;
  console.log("⚔️ Mid-battle story finished — gameplay resumes!");
}

// ------------------------------------------------------------
// 🕊️ OPTIONAL END STORY — after victory or map completion
// ------------------------------------------------------------
export async function showVictoryStory() {
  console.log("🎇 Victory story triggered!");
  gameState.paused = true;

  const victoryText = `
  💎 The final goblin falls, and peace returns — for now.

  The crystals glow once again under your protection.
  The Isles are safe, Guardian... until the next battle.
  `;

  await showStory({
    portrait: "./assets/images/portraits/princess_ariana.png",
    text: victoryText.trim(),
    autoStart: false,
  });

  gameState.paused = false;
  console.log("🏰 Victory story finished — gameplay resumes!");
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
