// ============================================================
// ⭐ map6Events.js — Lightlands Story Script (Rewritten Final)
// ------------------------------------------------------------
// Map 6: The Lightlands
// Tone: Sparkly sarcasm, "too bright", holy magic humour,
//       furious hero dealing with healer goblins.
//
// Includes:
//   • Wave start flavour
//   • Wave end flavour
//   • First Ash Goblin intro
//   • First Ash Goblin kill
//   • Pickup lines reflavoured for Lightlands
//   • Bravery Aura events
//   • Spire depletion callout
//   • Life-loss with light-themed panic
//   • Echo Complete messages (holy flare)
// No Seraphine.
// No tutorials.
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

export function initMap6Events() {

  // ============================================================
  // ⭐ 1) WAVE START — Blinded & Annoyed
  // ============================================================

  mapOn(6, E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Ow—this light is SO aggressive.", pos.x, pos.y, 4000);
        break;

      case 2:
        spawnSpeechBubble("More goblins… and somehow it’s even brighter out here.", pos.x, pos.y, 3800);
        break;

      case 3:
        spawnSpeechBubble("I didn’t bring sunscreen for this!", pos.x, pos.y, 4200);
        break;

      case 4:
        spawnSpeechBubble("Okay, who turned the saturation up to 300%?", pos.x, pos.y, 3800);
        break;

      case 5:
        spawnSpeechBubble("Something’s glowing… and healing… that’s not allowed.", pos.x, pos.y, 4200);
        break;

      case 6:
        spawnSpeechBubble("Ash Goblins. Rituals AND healing? Absolutely not.", pos.x, pos.y, 4800);
        break;

      case 7:
        spawnSpeechBubble("It’s so bright I can barely see my own panic.", pos.x, pos.y, 4000);
        break;

      case 8:
        spawnSpeechBubble("Hold on… just pretend the light isn’t judging.", pos.x, pos.y, 4200);
        break;

      case 9:
        spawnSpeechBubble("Last wave! Then it’s sunglasses and a very long nap.", pos.x, pos.y, 4500);
        break;

      default:
        spawnSpeechBubble("Lightlands? More like Eye-Strain Lands.", pos.x, pos.y, 3800);
        break;
    }
  });

  // ============================================================
  // ⭐ 2) WAVE END — Sparkly Exhaustion
  // ============================================================

  mapOn(6, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Even the shadows here glow. HOW.", pos.x, pos.y, 4500);
        break;

      case 2:
        spawnSpeechBubble("Miss the forest already. At least trees don’t blind you.", pos.x, pos.y, 4000);
        break;

      case 3:
        spawnSpeechBubble("Everything is so clean. It’s unsettling.", pos.x, pos.y, 4000);
        break;

      case 4:
        spawnSpeechBubble("If this place gets any brighter I’ll evaporate.", pos.x, pos.y, 4200);
        break;

      case 5:
        spawnSpeechBubble("Whoever invented healer goblins deserves jail.", pos.x, pos.y, 4800);
        break;

      case 6:
        spawnSpeechBubble("STOP HEALING! Stop helping the wrong side!", pos.x, pos.y, 5200);
        break;

      case 7:
        spawnSpeechBubble("My eyes hurt. My soul hurts. My everything hurts.", pos.x, pos.y, 4200);
        break;

      case 8:
        spawnSpeechBubble("Nearly done… stay strong… just a little longer.", pos.x, pos.y, 4500);
        break;

      case 9:
        spawnSpeechBubble("Okay… deep breaths… last sparkle-infused nightmare.", pos.x, pos.y, 4500);
        break;
    }
  });

  // ============================================================
  // ⭐ 3) FIRST ASH GOBLIN INTRO — Healer Panic
  // ============================================================

  let ashIntro = false;

  mapOn(6, E.enemySpawn, ({ type }) => {
    if (type !== "ashGoblin" || ashIntro) return;
    ashIntro = true;

    const pos = p();
    spawnSpeechBubble(
      "Wait—are those goblins healing each other? No. No healing.",
      pos.x, pos.y, 5400
    );
  });

  // ============================================================
  // ⭐ 4) FIRST ASH GOBLIN KILL — Done With Medics
  // ============================================================

  let ashKill = false;

  mapOn(6, E.enemyKilled, ({ type }) => {
    if (type !== "ashGoblin" || ashKill) return;
    ashKill = true;

    const pos = p();
    spawnSpeechBubble(
      "Finally! Take that, you creepy little ritual nurse goblin.",
      pos.x, pos.y, 5200
    );
  });

  // ============================================================
  // ⭐ 5) PICKUPS — Lightlands Variants
  // ============================================================

  let lastGold = 0;
  let lastDiamonds = 0;
  let lastHearts = 0;
  let lastMana = 0;
  let lastBravery = 0;

  let saidShard = false;
  let saidDiamond = false;
  let saidHeart = false;
  let saidMana = false;
  let saidBravery = false;

  mapOn(6, "resourceUpdate", () => {
    const pos = p();

    if (!saidDiamond && gameState.diamonds > lastDiamonds) {
      saidDiamond = true;
      spawnSpeechBubble(
        "Diamonds! Somehow they’re less blinding than this place.",
        pos.x, pos.y, 4800
      );
    }

    if (!saidShard && gameState.gold > lastGold) {
      saidShard = true;
      spawnSpeechBubble(
        "Shards! Perfect—Spires need all the help they can get here.",
        pos.x, pos.y, 4800
      );
    }

    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble(
        "A Heart! Finally, something warm in this glowing nightmare.",
        pos.x, pos.y, 5000
      );
    }

    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble(
        "Mana essence—yes please. Holy fire spells, coming right up.",
        pos.x, pos.y, 4800
      );
    }

    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble(
        "Bravery shards… steady, calm, and not nearly as flashy as this sky.",
        pos.x, pos.y, 5000
      );
    }

    lastGold = gameState.gold;
    lastDiamonds = gameState.diamonds;
    lastHearts = gameState.hearts;
    lastMana = gameState.mana;
    lastBravery = gameState.bravery;
  });

  // ============================================================
  // ⭐ 6) BRAVERY — Lightlands Aura
  // ============================================================

  let braveryFull = false;
  let braveryUse = false;

  mapOn(6, E.braveryFull, () => {
    if (braveryFull) return;
    braveryFull = true;

    const pos = p();
    spawnSpeechBubble(
      "Bravery is full… time to let this aura shine.",
      pos.x, pos.y, 4800
    );
  });

  mapOn(6, E.braveryActivated, () => {
    if (braveryUse) return;
    braveryUse = true;

    const pos = p();
    spawnSpeechBubble(
      "Bravery Aura—outshine their rituals and push them back!",
      pos.x, pos.y, 4600
    );
  });

  // ============================================================
  // ⭐ 7) FIRST SPIRE DEPLETED — Lightlands Sass
  // ============================================================

  let spireDepleted = false;

  mapOn(6, "spireDestroyed", () => {
    if (spireDepleted) return;
    spireDepleted = true;

    const pos = p();
    spawnSpeechBubble(
      "Hey! That Spire just burned through all its light… I’ll need another.",
      pos.x, pos.y, 5200
    );
  });

  // ============================================================
  // ⭐ 8) LIFE LOSS — Holy Panic
  // ============================================================

  const lightLoss = {
    80: [
      "They got through! I blame the blinding sunlight!",
      "Oops—lost one! The Lightlands giveth and taketh!"
    ],
    60: [
      "We’re losing ground—brightly losing ground!",
      "They’re pushing through! This light is distracting!"
    ],
    40: [
      "This is bad—very shiny and very bad!",
      "We’re slipping—could use a miracle right about now!"
    ],
    20: [
      "We’re nearly out! This is not the place to fail!",
      "If this goes wrong, I’m haunting the nearest sunbeam."
    ]
  };

  const triggered = new Set();

  mapOn(6, E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of Object.keys(lightLoss).map(Number).sort((a, b) => b - a)) {
      if (pct <= t && !triggered.has(t)) {
        triggered.add(t);
        const line = lightLoss[t][Math.floor(Math.random() * lightLoss[t].length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4300);
        break;
      }
    }
  });

  // ============================================================
  // ⭐ 9) ALL CRYSTAL ECHOES COLLECTED — Holy Resonance
  // ============================================================

  mapOnce(6, "echoComplete", () => {
    const pos = p();

    spawnSpeechBubble(
      "All the Echoes collected… they’re glowing like gentle suns.",
      pos.x, pos.y, 5200
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "The Lightlands are humming through them… calm and steady.",
        pos.x, pos.y, 5000
      );
    }, 2600);
  });

}

export default initMap6Events;

// ============================================================
// END OF FILE
// ============================================================
