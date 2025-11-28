// ============================================================
// ⭐ map6Events.js — Lightlands Story Script (Full)
// ------------------------------------------------------------
// Map 6: The Lightlands
// Tone: Sparkly sarcasm, "too bright", holy magic humour,
//       furious Glitter dealing with healer goblins.
//
// Includes:
//   • Wave start flavour
//   • Wave end flavour
//   • First Ash Goblin intro
//   • First Ash Goblin kill
//   • Pickup lines reflavoured for Lightlands
//   • Bravery events (kept)
//   • Spire destruction (kept)
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
  // ⭐ 1) WAVE START — Glitter blinded & annoyed
  // ============================================================

  mapOn(6, E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Ow—this light is SO aggressive.", pos.x, pos.y, 4000);
        break;

      case 2:
        spawnSpeechBubble("Bright goblins? Really? Really??", pos.x, pos.y, 3800);
        break;

      case 3:
        spawnSpeechBubble("I didn’t bring sunscreen for this!", pos.x, pos.y, 4200);
        break;

      case 4:
        spawnSpeechBubble("Okay who turned the saturation to 300%?", pos.x, pos.y, 3800);
        break;

      case 5:
        spawnSpeechBubble("Something’s glowing… and healing… that’s not allowed.", pos.x, pos.y, 4200);
        break;

      case 6:
        spawnSpeechBubble("Ash Goblins! Illegal medics! Stop healing each other!", pos.x, pos.y, 4800);
        break;

      case 7:
        spawnSpeechBubble("It's so bright I can’t even see my own panic.", pos.x, pos.y, 4000);
        break;

      case 8:
        spawnSpeechBubble("Hold on Glitter… just pretend the light isn’t judging you.", pos.x, pos.y, 4200);
        break;

      case 9:
        spawnSpeechBubble("Last wave! Then I’m buying sunglasses the size of my face.", pos.x, pos.y, 4500);
        break;

      default:
        spawnSpeechBubble("Lightlands? More like Eye-Strain Lands.", pos.x, pos.y, 3800);
        break;
    }
  });

  // ============================================================
  // ⭐ 2) WAVE END — Sparkly exhaustion
  // ============================================================

  mapOn(6, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Even the shadows here glow. HOW.", pos.x, pos.y, 4500);
        break;

      case 2:
        spawnSpeechBubble("I miss the forest. At least trees don’t blind you.", pos.x, pos.y, 4000);
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
        spawnSpeechBubble("STOP HEALING! STOP BEING HELPFUL! FOR THE ENEMY!", pos.x, pos.y, 5200);
        break;

      case 7:
        spawnSpeechBubble("My eyes hurt. My soul hurts. My everything hurts.", pos.x, pos.y, 4200);
        break;

      case 8:
        spawnSpeechBubble("Nearly done… stay strong Glitter… literally.", pos.x, pos.y, 4500);
        break;

      case 9:
        spawnSpeechBubble("Okay… deep breaths… last sparkle-infused nightmare.", pos.x, pos.y, 4500);
        break;
    }
  });

  // ============================================================
  // ⭐ 3) FIRST ASH GOBLIN INTRO — Healer panic
  // ============================================================

  let ashIntro = false;

  mapOn(6, E.enemySpawn, ({ type }) => {
    if (type !== "ashGoblin" || ashIntro) return;
    ashIntro = true;

    const pos = p();
    spawnSpeechBubble(
      "WAIT—are they healing each other?! No. No healing!!",
      pos.x, pos.y, 5400
    );
  });

  // ============================================================
  // ⭐ 4) FIRST ASH GOBLIN KILL — Glitter is DONE
  // ============================================================

  let ashKill = false;

  mapOn(6, E.enemyKilled, ({ type }) => {
    if (type !== "ashGoblin" || ashKill) return;
    ashKill = true;

    const pos = p();
    spawnSpeechBubble(
      "Finally! Take THAT, you glow-in-the-dark nurse gremlin!",
      pos.x, pos.y, 5200
    );
  });

  // ============================================================
  // ⭐ 5) PICKUPS — Lightlands variants
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
      spawnSpeechBubble("Diamonds! Even brighter than this whole region!", pos.x, pos.y, 4800);
    }

    if (!saidShard && gameState.gold > lastGold) {
      saidShard = true;
      spawnSpeechBubble("Shards! Perfect—my Spires need divine assistance.", pos.x, pos.y, 4800);
    }

    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble("A Heart! Finally, something warm in this glowing nightmare.", pos.x, pos.y, 5000);
    }

    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble("Mana essence! I could really use some holy fire.", pos.x, pos.y, 4800);
    }

    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble("Bravery shards! They sparkle less than this place… thank goodness.", pos.x, pos.y, 5000);
    }

    lastGold = gameState.gold;
    lastDiamonds = gameState.diamonds;
    lastHearts = gameState.hearts;
    lastMana = gameState.mana;
    lastBravery = gameState.bravery;
  });

  // ============================================================
  // ⭐ 6) BRAVERY — Holy empowerment
  // ============================================================

  let braveryFull = false;
  let braveryUse = false;

  mapOn(6, E.braveryFull, () => {
    if (braveryFull) return;
    braveryFull = true;

    const pos = p();
    spawnSpeechBubble("Bravery is full—time for Glitter to shine brighter!", pos.x, pos.y, 4800);
  });

  mapOn(6, E.braveryActivated, () => {
    if (braveryUse) return;
    braveryUse = true;

    const pos = p();
    spawnSpeechBubble("Guardian Form! LET’S OUT-SHINE THEM!", pos.x, pos.y, 4500);
  });

  // ============================================================
  // ⭐ 7) FIRST SPIRE DESTROYED — Lightlands sass
  // ============================================================

  let spireDestroyed = false;

  mapOn(6, "spireDestroyed", () => {
    if (spireDestroyed) return;
    spireDestroyed = true;

    const pos = p();
    spawnSpeechBubble(
      "HEY! That Spire was glowing beautifully! Rude!",
      pos.x, pos.y, 5200
    );
  });

  // ============================================================
  // ⭐ 8) LIFE LOSS — Holy panic
  // ============================================================

  const lightLoss = {
    80: [
      "They got through! I blame the blinding sunlight!",
      "Oops—lost one! The Lightlands giveth and taketh!"
    ],
    60: [
      "We’re losing ground—LIGHTLY losing ground!",
      "They’re pushing through! This light is distracting!"
    ],
    40: [
      "This is bad—VERY shiny and VERY bad!",
      "We’re slipping—HOLY HELP!"
    ],
    20: [
      "We're nearly out! Glitter in distress! SEND HELP!",
      "If we lose here I’m haunting the sun!"
    ]
  };

  const triggered = new Set();

  mapOn(6, E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of Object.keys(lightLoss).map(Number).sort((a,b)=>b-a)) {
      if (pct <= t && !triggered.has(t)) {
        triggered.add(t);
        const line = lightLoss[t][Math.floor(Math.random() * lightLoss[t].length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4300);
        break;
      }
    }
  });

  // ============================================================
  // ⭐ 9) ALL CRYSTAL ECHOES COLLECTED — Holy resonance
  // ============================================================

  mapOnce(6, "echoComplete", () => {
    const pos = p();

    spawnSpeechBubble(
      "All Echoes collected… they’re glowing like tiny suns…",
      pos.x, pos.y, 5200
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "I can feel the Lightlands humming through them… beautiful.",
        pos.x, pos.y, 5000
      );
    }, 2600);
  });

}

export default initMap6Events;

// ============================================================
// END OF FILE
// ============================================================
