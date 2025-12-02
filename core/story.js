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

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;

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
    const autoCloseTimer = setTimeout(finish, 45000);

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
  // Map 1 — Whispering Meadows (Goblins, Worgs, first Seraphine)
  1: `
Princess Guardian… the Whispering Meadows are no longer quiet.

Our scrying crystals show goblins swarming the paths — and they’re
not just raiding. They’re hunting for Crystal Echoes.

If they gather enough, they could awaken forces that should never
leave the Void. Hold the line, collect every Echo you can… and
if you see anything that doesn’t look like goblin magic?

Run first. Then tell me.
  `.trim(),

  // Map 2 — Bragg’s Farm (Elites introduced, organised raids)
  2: `
Princess, you’ve reached Bragg’s Farm — and not a moment too soon.

The goblins here are… organised. Someone has taught them to raid
for Echo shards, crops, and anything that shines.

Worse, my readings show Elite signatures on the field. These are not
village rabble. They’re trained hunters sent to test you.

Fortify the farm. Keep the Echoes out of their hands. Bragg would
never forgive us if his cabbages become corrupted goblin currency.
  `.trim(),

  // Map 3 — Drylands (Trolls & Ogres, land being drained)
  3: `
You made it to the Drylands — and the land is hurting.

Life magic here is thin, like someone is draining the colour out
of the soil. Goblins, trolls, even ogres are moving in patterns,
as if pushed by the same invisible hand.

Someone is using the Echoes to hollow these lands out.

If they succeed, the Drylands will crumble… and the fracture could
spread all the way back to the Crystal Keep.
  `.trim(),

  // Map 4 — Ember Realm (Ember goblins, Seraphine returns)
  4: `
The Ember Realm responds to every Echo you touch.

Flames without heat, magma that flows uphill — the Fire Crystal
is unstable. Goblins are forging Ember Echoes into something else,
twisting the element into weapons.

And my link is picking up a familiar pattern… the same signature
that flashed when you first encountered that strange woman
in the Meadows.

If Seraphine is here, she is not just watching anymore.
  `.trim(),

  // Map 5 — Ice Kingdom (Ice goblins, frost imbalance)
  5: `
Welcome to the Ice Kingdom… or what’s left of it.

The Frost Crystal is howling — blizzards surging, then stopping,
like it’s arguing with itself. Goblins are chipping shards from
ancient glaciers, harvesting Ice Echoes they don’t understand.

If they overcharge the frost, it will spread beyond this kingdom
and freeze entire isles solid.

Stop their mining runs. Collect every Echo you can. The cold you
feel isn’t just weather — it’s the Crystal panicking.
  `.trim(),

  // Map 6 — Light Realm (Ash goblins as healers, light imbalance)
  6: `
Princess, the Light Realm should feel safe. It doesn’t.

Holy barriers are flickering, beams of sunlight are bending the
wrong way, and yet… goblins stroll around as if invited.

These Ash Goblins — my readings say they’re siphoning damage and
throwing it back as healing. Void-tainted medics.

Light itself is being rewritten here. If they turn the Light Crystal
against us, nowhere in the Isles will be safe.
  `.trim(),

  // Map 7 — Swamp (Crossbow trolls, wild mushroom magic)
  7: `
Detour confirmed — you’re in the Mirewood Swamp.

These mushroom blooms aren’t natural. Wild magic only erupts this
strongly when the balance is collapsing.

Crossbow trolls, goblins, corrupted spores… something is mixing
Life, Void, and Echo energy in ways even our scholars can’t predict.

Clear a path through this chaos, Princess. If the Mirewood spreads,
the roads to the Voidlands — and the Crystal Keep — will be strangled.
  `.trim(),

  // Map 8 — Voidlands (Void goblins, Seraphine’s home)
  8: `
You’ve reached the edge of the Voidlands.

Shadow currents swirl around every stone. The Void Echoes here
aren’t just fragments — they’re memories of what the Crystals
used to be, before the Heart was divided.

The goblins you face now aren’t just corrupted… they’re being
rewritten. Void Goblins. Brilliant, terrifying, and loyal to
whoever commands the Void.

This was once the domain of the Void Guardians.

And Seraphine… was one of them.
  `.trim(),

  // Map 9 — Crystal Keep (final assault, Architect’s shadow)
  9: `
Princess… you’re inside the Crystal Keep.

Every Echo you found, every spire you raised, every wave you survived…
it all led here.

The goblins are no longer raiding — they’re marching as an army.
Elites, trolls, ogres, crossbow hunters, Void-touched goblins…
all converging on the Crystal Heart.

My instruments are filled with one repeating pattern:
the Architect’s shadow… and Seraphine, standing in front of it.

Whatever happens now will decide the future of the Isles.
  `.trim(),
};

export const wave5Text = {
  // Map 1 — Meadows mid-arc: confirms this isn’t random
  1: `
Excellent work, Princess. But this was only a probing force.

The goblins aren’t scattering — they’re regrouping, searching,
testing your reach.

Something — or someone — is guiding them toward Echo clusters.
And that strange woman you saw… her signature brushed the Crystal Link
again.

This is not a simple invasion. It’s a rehearsal.
  `.trim(),

  // Map 2 — Farm: escalation + oops Elites are here on purpose
  2: `
You’re holding Bragg’s Farm admirably.

Our scouts confirm what you already felt: the Elites here weren’t
an accident. They were sent to intercept you before you could reach
the deeper isles.

They’re adapting, learning where your Spires are strongest,
stealing Echoes whenever they slip through.

Keep pushing them back. Every shard you protect here is one less
they can feed into whatever ritual they’re preparing.
  `.trim(),

  // Map 3 — Drylands: trolls/ogres + draining ritual
  3: `
The Drylands’ pulse is stabilising… for now.

Trolls and ogres don’t usually work together. Whatever is driving
them is strong enough to override old grudges.

Our readings show a ritual pattern — they’re using Echoes to draw
life OUT of the land and channel it somewhere else.

If we don’t cut this off entirely, that “somewhere else” is almost
certainly the Void.
  `.trim(),

  // Map 4 — Ember Realm: Seraphine clearly involved
  4: `
I felt that surge from here. That was not goblin work.

The flames that answered your last wave carried a familiar echo…
Seraphine’s. Not as an enemy general — as someone shaping the fire
to test you.

I’ve found records in the old archives. There once were Void Guardians,
protectors of the Shadow currents that flow between crystals.

If Seraphine truly was one of them, then her presence in the Ember Realm
means one thing: she’s gathering the elements for something bigger.
  `.trim(),

  // Map 5 — Ice Kingdom: deeper Void taint creeping in
  5: `
The storm is easing. You did it… but the Ice Crystal still shivers.

The Echoes you recovered feel… conflicted. Part frost, part Void.
Someone is stitching elements together in ways even the ancient
Guardians refused to try.

If Seraphine is using Ice as well as Fire, she’s building towards
balance of a very different kind.

Stay sharp, Princess. Cold things crack — including plans.
  `.trim(),

  // Map 6 — Light Realm: Light vs Void tension
  6: `
The Light here is fighting back.

Those Ash Goblins you just faced were carrying fractures of both
Light and Void. Healing, purifying, corrupting… all at once.

This isn’t random experiment any more. This is design.

A fallen Void Guardian, with access to all the Crystals of the Isles,
could build something powerful enough to rival the Heart itself.

We cannot let Seraphine finish whatever she’s drawing on the
other side of this Realm.
  `.trim(),

  // Map 7 — Swamp: wild magic creature / swamp as filter
  7: `
You’re carving a path through chaos, Princess.

The swamp is acting like a cauldron, mixing Echo dust, wild spores,
and Void fragments from every battle you’ve fought so far.

Crossbow trolls, mushroom growths, unstable magic… this place is a
messy map of everything that’s gone wrong.

But that also means something hopeful: if you can stabilise the Mire,
the path to the Voidlands — and to Seraphine — becomes clear.
  `.trim(),

  // Map 8 — Voidlands: direct prelude to Architect/Keep
  8: `
The Voidlands are reacting to your presence.

Every Echo you’ve collected hums when you move. The land remembers
you — and it remembers Seraphine.

Our scholars always believed the Void Guardians vanished to protect
the Isles from the Architect’s return.

If Seraphine has turned from guardian to herald, she may be using
the goblins to finish what the Architect started.

One more push, Princess. After this… the Crystal Keep.
  `.trim(),

  // Map 9 — Crystal Keep: final prep speech
  9: `
This is it, Princess.

The Crystal Heart is straining — every beat echoes across the Isles.
Seraphine stands between you and the Heart, half-Guardian, half-shadow.

I don’t think she truly wants to destroy us… but the Architect’s will
is wrapped around her like chains.

Break the assault. Protect the Crystal Heart. And if you can… reach
the part of Seraphine that remembers what it meant to guard,
not to conquer.
  `.trim(),
};

// ------------------------------------------------------------
// ⭐ WAVE STORY FLAGS (prevents repeat triggers)
// ------------------------------------------------------------

export const waveStoryFlags = {};
for (let i = 1; i <= 9; i++) {
  waveStoryFlags[i] = { 1: false, 5: false };
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



// ============================================================
// 🌟 END OF FILE
// ============================================================
