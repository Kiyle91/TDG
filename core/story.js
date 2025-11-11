// ============================================================
// 💬 story.js — Olivia’s World: Crystal Keep (Compact Dialogue Edition)
// ------------------------------------------------------------
// ✦ One cinematic story box for all story moments
// ✦ Typewriter effect + single Continue button
// ✦ Short, clean text that fits within one story-box view
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// 🧚‍♀️ UNIVERSAL STORY BOX FUNCTION
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
          <div class="story-text" id="story-text"></div>
        </div>
        <button id="story-next" class="story-next-btn disabled" disabled>Continue</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const textEl = overlay.querySelector("#story-text");
    const nextBtn = overlay.querySelector("#story-next");

    // ✨ Typewriter effect
    const chars = [...text];
    let i = 0;
    const speed = 35;

    function typeNext() {
      if (i < chars.length) {
        textEl.textContent += chars[i++];
        setTimeout(typeNext, speed);
      } else {
        nextBtn.disabled = false;
        nextBtn.classList.remove("disabled");
        nextBtn.style.opacity = "1";
      }
    }
    typeNext();

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

// ============================================================
// 🌟 END OF FILE
// ============================================================
