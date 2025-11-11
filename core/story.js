// ============================================================
// 💬 story.js — Olivia’s World: Crystal Keep (Final Polished)
// ------------------------------------------------------------
// ✦ Restart-safe cinematic story system
// ✦ Typewriter dialogue with delayed Continue button
// ✦ Portrait fixed left, smooth fade transitions
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";

// ------------------------------------------------------------
// 📜 INTRO STORY LINES
// ------------------------------------------------------------
const lines = [
  "🌸 Welcome, brave soul. I am Ariana, keeper of the Crystal Keep.",
  "Long have I watched over the Unicorn Isles, but the crystals are dimming...",
  "You have been chosen to defend our realm — your journey begins now."
];

// ------------------------------------------------------------
// 📖 START INTRO STORY
// ------------------------------------------------------------
export function startIntroStory() {
  const old = document.getElementById("overlay-story");
  if (old) old.remove();

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
      <button id="story-next" class="story-next-btn disabled" disabled>Continue</button>
    </div>
  `;
  document.body.appendChild(overlay);

  let currentLine = 0;
  typeLine(currentLine);

  const nextBtn = overlay.querySelector("#story-next");
  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return; // ignore clicks during typing
    currentLine++;
    if (currentLine < lines.length) {
      typeLine(currentLine);
    } else {
      endStoryIntro(overlay);
    }
  });
}

// ------------------------------------------------------------
// ✨ TYPEWRITER EFFECT (with button lock)
// ------------------------------------------------------------
function typeLine(i) {
  const textEl = document.getElementById("story-text");
  const nextBtn = document.getElementById("story-next");
  if (!textEl || !nextBtn) return;

  textEl.textContent = "";
  nextBtn.disabled = true;
  nextBtn.classList.add("disabled");
  nextBtn.style.opacity = "0.5";
  nextBtn.style.pointerEvents = "none";

  const chars = [...lines[i]];
  let index = 0;

  const timer = setInterval(() => {
    textEl.textContent += chars[index];
    index++;
    if (index >= chars.length) {
      clearInterval(timer);
      // 🔓 Re-enable Continue button
      nextBtn.disabled = false;
      nextBtn.classList.remove("disabled");
      nextBtn.style.opacity = "1";
      nextBtn.style.pointerEvents = "auto";
    }
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
    overlay.remove();
    document.querySelectorAll("#end-screen, .end-overlay").forEach(el => el.remove());
    showScreen("game-container");
    startGameplay();
    console.log("📖 Story finished → gameplay started fresh.");
  }, 600);
}

// ============================================================
// 🧭 Goblin Scout Encounter — Opening Mission Story
// ------------------------------------------------------------
// ✦ Uses typewriter text + locked Continue until complete
// ✦ Matches intro layout (portrait left, text right)
// ============================================================

async function showDialogueBox({ portrait, text }) {
  return new Promise((resolve) => {
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
          <div class="story-text" id="story-text">
            <span id="story-line"></span>
          </div>
        </div>
        <button id="story-next" class="story-next-btn disabled" disabled>Continue</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const textEl = overlay.querySelector("#story-line");
    const nextBtn = overlay.querySelector("#story-next");

    // ⌨️ Typewriter with button disable
    let i = 0;
    const speed = 35;
    nextBtn.disabled = true;
    nextBtn.classList.add("disabled");
    nextBtn.style.opacity = "0.5";
    nextBtn.style.pointerEvents = "none";

    function typeWriter() {
      if (i < text.length) {
        textEl.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      } else {
        // 🔓 Re-enable Continue button after typing ends
        nextBtn.disabled = false;
        nextBtn.classList.remove("disabled");
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "auto";
      }
    }
    typeWriter();

    nextBtn.addEventListener("click", () => {
      if (nextBtn.disabled) return;
      overlay.classList.add("fade-out");
      setTimeout(() => overlay.remove(), 300);
      resolve();
    });
  });
}

export async function startGoblinIntroStory() {
  const dialogues = [
    {
      portrait: "./assets/images/portraits/princess_ariana.png",
      text: "You are patrolling the moonlit woods when you stumble upon goblin scouts lurking in the shadows...",
    },
    {
      portrait: "./assets/images/portraits/princess_ariana.png",
      text: "It’s clear they are scouting out the Crystal Keep — our home. Their numbers are growing fast, at least fifty of them by your count...",
    },
    {
      portrait: "./assets/images/portraits/princess_ariana.png",
      text: "You are the Princess of the Unicorn Isles — sworn protector of the Keep. Hold the line, Guardian. Don’t let them through!",
    },
  ];

  for (const d of dialogues) {
    await showDialogueBox(d);
  }

  console.log("📖 Goblin scout story finished — gameplay begins!");
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
