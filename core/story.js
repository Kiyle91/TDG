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
  1: "Princess Guardian… this confirms it. Goblins have returned to the Meadows. They’re searching for Crystal Echoes — and where there are goblins, corruption follows. Stop them before they spread across the Isles.",
  2: "Farmer Bragg’s fields are in chaos! The goblins are collecting crops and Echo shards for some twisted experiment. Protect the farm — and keep those Echoes out of their grubby claws!",
  3: "The Drylands feel weakened… drained. The goblins must be disrupting the Life magic holding this region together. Recover the Echoes here or the land may crumble.",
  4: "The Fire Realm is unstable — flames roar without heat, and magma flows strangely. Goblins are gathering Fire Echoes for their ‘Fire General’. This is dangerous.",
  5: "The Ice Kingdom trembles… the Frost Crystal is overreacting to imbalance. Goblins are harvesting shards to amplify the freeze. They have no idea what they’re risking.",
  6: "Light surges wildly across the realm. Even holy barriers flicker. Goblins don’t belong here — something is pulling them closer to the Light Crystal’s power.",
  7: "These mushroom growths… they shouldn’t exist. Wild magic blooms only when the balance is collapsing. Goblins are gathering spores mixed with Echo energy.",
  8: "Shadow currents swirl everywhere. The Void is waking… I feel it. Goblins here are being manipulated — shaped by something far greater. Be cautious.",
  9: "You’ve made it to the Keep — but something is deeply wrong. Goblins INSIDE the Crystal Keep means the Shadow Architect is close. Prepare for the worst.",
};


export const wave5Text = {
  1: "Excellent work, Princess. But this was only a scouting party. The goblins are searching desperately for the Life Echoes… someone is driving them. We must head deeper into the Isles.",
  2: "Brace yourself — the ground trembles. An ogre approaches Bragg’s farm, empowered by stolen Echo fragments. If it reaches the fields, the corruption will spread.",
  3: "Something ancient stirs beneath the sand… a creature infused with stolen Life Echoes. Defeating it may stabilize the Drylands — for now.",
  4: "Molten rumbling… the Fire General draws near. He seeks to corrupt the entire Fire Crystal. If he succeeds, the Isles will burn.",
  5: "The blizzard intensifies — an ancient frostbeast awakens, twisted by Void-tainted Ice Echoes. This may be your coldest battle yet.",
  6: "The Light Realm gathers itself… a holy champion descends, confused and corrupted. Its power must be restored before it tears the realm apart.",
  7: "The storm intensifies… a creature grown from pure wild magic is forming. Stop it before the Mushroom Bloom spreads to every island.",
  8: "Void constellations shift… the Architect’s avatar approaches. This fight will decide whether the Crystal Keep still stands.",
  9: "This is it, Princess. The final wave. The Crystal Heart weakens by the second — defeat the corruption or the Isles will fall.",
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

  Princess ${guardian}! Thank the Crystals… the Crystal Link still works!

  Listen carefully — something is terribly wrong across the Isles.

  Our scouts reported strange tremors coming from the Whispering Meadows…  
  and sightings of goblins.

  I KNOW. Goblins haven’t dared approach the Crystal Isles in generations.  
  Not since the old tales of the Goblin King…

  This can only mean one thing:  
  someone — or something — is stirring up trouble again.

  You may still be a trainee Guardian…  
  but you are the only one close enough to investigate.

  And… well… you’re my best friend.  
  So please be careful. Very careful.

  The Meadows might look peaceful…  
  but when goblins appear, disasters follow.

  Go now — find out what’s happening there.  
  I’ll contact you again once you arrive.

  The Crystals guide you, Princess ${guardian}.
    `.trim(),
    useAriana: true
  });


  // PAGE 2
  await showStory({
    text: `
  Before you go… there’s something I must tell you.

  The goblins aren’t after food or mischief this time.  
  They’re after **Crystal Echoes** — fragments of the Crystal Heart.

  Each Echo holds ancient elemental magic.  
  Life. Fire. Ice. Light. Void.

  If the goblins gather enough Echoes…  
  they could awaken forces far worse than their own king.

  Long ago, a Void entity known as the *Shadow Architect*  
  nearly twisted the Crystal Heart into a weapon.  
  If he returns…

  No. We cannot allow that.

  Collect every Echo you can.  
  Use them to grow stronger.  
  Use them to fuel the Spires only a true Guardian can command.

  I will guide you through the Crystal Link when you reach the Meadows.

  Go, Princess ${guardian}…  
  and may the Crystals protect you.
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
