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
//   • Story triggers for Wave 1 + Wave 5 per map
//   • Prevents repeated firing using per-map story flags
//   • Fully aligned with current campaign + Seraphine lore:
//       - Map 1: Meadows, goblin/echo discovery, Seraphine teased
//       - Map 2: Bragg’s Farm, Elites + organised raids
//       - Map 3: Drylands, trolls/ogres, lands being drained
//       - Map 4: Ember Realm, Ember goblins, Seraphine returns
//       - Map 5: Ice Kingdom, Ice goblins, frost imbalance
//       - Map 6: Light Realm, Ash goblins (Void-tainted healers)
//       - Map 7: Swamp detour, Crossbow trolls, wild magic
//       - Map 8: Voidlands, Void goblins, Seraphine’s home
//       - Map 9: Crystal Keep, final all-out assault
//
// LORE PILLAR:
//   Seraphine is a fallen Void Guardian — once a protector of the
//   Voidlands, now half-bound to the Shadow Architect’s will.
//   She always escapes, never truly dies, and the sequel writes itself.
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

    // Auto-close when player opens any overlay/hub or we lose the game screen
    const closeWatcher = (evt) => {
      const targetId = evt.detail || evt.type;
      if (targetId && typeof targetId === "string") {
        const lower = targetId.toLowerCase();
        if (lower.includes("overlay") || lower.includes("hub")) {
          finish();
        }
      }
    };

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;

      window.removeEventListener("showScreen", closeWatcher);
      window.removeEventListener("showOverlay", closeWatcher);

      overlay.classList.add("fade-out");

      setTimeout(() => {
        overlay.remove();

        if (autoStart) {
          showScreen("game-container");
          startGameplay();
        }

        resolve();
      }, 400);
    };

    // Auto-close safeguard after 45 seconds
    const autoCloseTimer = setTimeout(finish, 15000000);

    window.addEventListener("showScreen", closeWatcher);
    window.addEventListener("showOverlay", closeWatcher);

    nextBtn.addEventListener("click", () => {
      clearTimeout(autoCloseTimer);
      finish();
    });
  });
}

// ------------------------------------------------------------
// 📜 MAP-SPECIFIC STORY TEXT (Wave 1 & 5)
// ------------------------------------------------------------
//
// Wave 1 text: "You’ve just proven this place matters."
// Wave 5 text: Mid-map escalation / Ariana update.
// Both are Ariana talking to Glitter via the Crystal Link,
// unless a map’s flavour implies otherwise.
// ------------------------------------------------------------

export const wave1Text = {
  1: `
Something’s wrong in the Meadows.
Goblins are carrying Echoes.
Stop them before something wakes.
  `.trim(),

  2: `
Bragg’s Farm is under organised raid.
Elites are here testing you.
Hold the line and guard the Echoes.
  `.trim(),

  3: `
The Drylands are being drained.
Creatures move with one purpose.
Stop this before it reaches the Keep.
  `.trim(),

  4: `
The Ember Realm is unstable.
Ember Echoes are being twisted.
And Seraphine’s presence is here.
  `.trim(),

  5: `
The Ice Kingdom is fracturing.
Goblins are overcharging the frost.
Steady the Crystal before it spreads.
  `.trim(),

  6: `
The Light Realm feels corrupted.
Ash Goblins are redirecting damage.
Stop them before Light turns on us.
  `.trim(),

  7: `
Mirewood magic is spiraling.
Life and Void are mixing wildly.
Clear a path before it consumes the roads.
  `.trim(),

  8: `
You’ve reached the Voidlands.
The goblins here are rewritten.
This was Seraphine’s home once.
  `.trim(),

  9: `
You’re inside the Crystal Keep.
All forces converge on the Heart.
Seraphine stands at the center.
  `.trim(),
};


export const wave5Text = {
  1: `
This wasn’t random at all.
They’re regrouping on Echo points.
Something larger is guiding them.
  `.trim(),

  2: `
The Elites were sent deliberately.
They’re studying your defenses.
Keep pushing them back.
  `.trim(),

  3: `
Their ritual is nearly active.
Echoes drain toward the Void.
End it while you can.
  `.trim(),

  4: `
That surge was Seraphine’s mark.
She’s shaping Ember flames herself.
She’s gathering elements for something.
  `.trim(),

  5: `
The Ice Crystal still trembles.
These Echoes mix frost and Void.
Seraphine is forcing a new balance.
  `.trim(),

  6: `
Light and Void are clashing here.
Ash Goblins wield both at once.
Seraphine’s design is intentional.
  `.trim(),

  7: `
The Mire is stabilizing slowly.
Magic here is chaotic and wild.
You’re close to the Voidlands now.
  `.trim(),

  8: `
The Voidlands respond to you.
Echoes remember Seraphine’s touch.
Only the Crystal Keep remains.
  `.trim(),

  9: `
This is the final stand.
The Heart is under immense strain.
Break the assault and save it.
  `.trim(),
};


// ------------------------------------------------------------
// ⭐ WAVE STORY FLAGS (prevents repeat triggers)
// ------------------------------------------------------------

export const waveStoryFlags = {};
for (let i = 1; i <= 9; i++) {
  waveStoryFlags[i] = { 1: false, 5: false, 9: false };
}

export function resetWaveStoryFlags(mapId) {
  if (typeof mapId === "number" && waveStoryFlags[mapId]) {
    waveStoryFlags[mapId][1] = false;
    waveStoryFlags[mapId][5] = false;
    return;
  }

  Object.keys(waveStoryFlags).forEach((key) => {
    waveStoryFlags[key][1] = false;
    waveStoryFlags[key][5] = false;
  });
}

export const wave9Text = {
  1: `
This is the last wave here.
Finish the Meadows strong.
Show them we protect the Isles.
  `.trim(),

  2: `
Final push at Bragg’s Farm.
Don’t let the Elites break through.
End their raid for good.
  `.trim(),

  3: `
The Drylands can’t take much more.
Break this last assault.
Restore life to this place.
  `.trim(),

  4: `
The Ember Realm is flaring wildly.
Hold steady through this final wave.
Seraphine is definitely watching.
  `.trim(),

  5: `
The Ice Kingdom is at its limit.
Freeze their advance one last time.
Protect the Frost Crystal.
  `.trim(),

  6: `
Light is flickering dangerously.
Stop the final Ash Goblin surge.
Keep the realm from collapsing.
  `.trim(),

  7: `
The Mire is boiling with magic.
One last wave to clear the swamp.
Make the path to the Voidlands safe.
  `.trim(),

  8: `
The Voidlands tremble around you.
This last wave is the strongest yet.
Push through to reach the Keep.
  `.trim(),

  9: `
Everything leads to this moment.
Defend the Heart with everything.
The Isles depend on you.
  `.trim(),
};


// ------------------------------------------------------------
// ⭐ END OF WAVE 1 STORY
// ------------------------------------------------------------

export async function triggerEndOfWave1Story(mapId) {
  if (!waveStoryFlags[mapId] || waveStoryFlags[mapId][1]) return;

  waveStoryFlags[mapId][1] = true;

  showStory({
    text: wave1Text[mapId] || "The battle continues...",
    useAriana: true,
    autoStart: false,
  });
}

export async function triggerEndOfWave5Story(mapId) {
  if (!waveStoryFlags[mapId] || waveStoryFlags[mapId][5]) return;

  waveStoryFlags[mapId][5] = true;

  showStory({
    text: wave5Text[mapId] || "You stand victorious, Guardian.",
    useAriana: true,
    autoStart: false,
  });
}


export async function triggerEndOfWave9Story(mapId) {
  if (!waveStoryFlags[mapId] || waveStoryFlags[mapId][9]) return;

  waveStoryFlags[mapId][9] = true;

  showStory({
    text: wave9Text[mapId] || "Final wave, Princess.",
    useAriana: true,
    autoStart: false,
  });
}
// ============================================================
// 🌟 END OF FILE
// ============================================================
