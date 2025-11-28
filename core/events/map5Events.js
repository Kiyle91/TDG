// ============================================================
// ❄️ map5Events.js — Frosted Vale Story Script (Full)
// ------------------------------------------------------------
// Map 5: The Frosted Vale
// Tone: Cold humour, chilled sarcasm, irritated Glitter
//
// Includes:
//   • Wave start / wave end lines
//   • First Ice Goblin intro
//   • First Ice Goblin kill
//   • Pickup reinforcements (snowy alternatives)
//   • First spire destroyed (carried over)
//   • Bravery events (carried over)
//   • Life-loss callouts with ice theme
//   • Full Echo collection flavour
//
// No Seraphine.
// No tutorials.
// Glitter is cold, annoyed, and done with life.
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

export function initMap5Events() {

  // ============================================================
  // ❄️ 1) WAVE START LINES — Cold, Irritated Glitter
  // ============================================================

  mapOn(5, E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("I swear my eyelashes are freezing together…", pos.x, pos.y, 4200);
        break;

      case 2:
        spawnSpeechBubble("More goblins… now with frostbite!", pos.x, pos.y, 3800);
        break;

      case 3:
        spawnSpeechBubble("This cold is illegal. Someone arrest the weather.", pos.x, pos.y, 4000);
        break;

      case 4:
        spawnSpeechBubble("Trolls… in the snow. Great. Snow trolls.", pos.x, pos.y, 4000);
        break;

      case 5:
        spawnSpeechBubble("Okay okay, calm down Glitter. Pretend it’s… refreshing.", pos.x, pos.y, 4200);
        break;

      case 6:
        spawnSpeechBubble("If one more goblin breathes cold air at me, I’m leaving.", pos.x, pos.y, 4000);
        break;

      case 7:
        spawnSpeechBubble("Why is everything slippery?! INCLUDING ME—", pos.x, pos.y, 4000);
        break;

      case 8:
        spawnSpeechBubble("Almost done… almost thawed…", pos.x, pos.y, 4200);
        break;

      case 9:
        spawnSpeechBubble("Last wave! Someone bring me a blanket!", pos.x, pos.y, 4500);
        break;

      default:
        spawnSpeechBubble("Cold goblins. Cold trolls. Cold Glitter.", pos.x, pos.y, 3500);
        break;
    }
  });

  // ============================================================
  // ❄️ 2) WAVE END LINES — More Humour, More Suffering
  // ============================================================

  mapOn(5, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("If the goblins don’t get me, hypothermia will.", pos.x, pos.y, 4500);
        break;

      case 2:
        spawnSpeechBubble("Do Ice Goblins ever… melt?", pos.x, pos.y, 3800);
        break;

      case 3:
        spawnSpeechBubble("I’d kill for a hot chocolate. Preferably WITHOUT goblins.", pos.x, pos.y, 4200);
        break;

      case 4:
        spawnSpeechBubble("Snow trolls hit harder. Great.", pos.x, pos.y, 4200);
        break;

      case 5:
        spawnSpeechBubble("My fingers are numb. My soul is numb.", pos.x, pos.y, 4200);
        break;

      case 6:
        spawnSpeechBubble("Even my spires look cold.", pos.x, pos.y, 3800);
        break;

      case 7:
        spawnSpeechBubble("If I slip again I swear I’m suing the Frosted Vale.", pos.x, pos.y, 4200);
        break;

      case 8:
        spawnSpeechBubble("Almost there Glitter… almost thawed…", pos.x, pos.y, 4200);
        break;

      case 9:
        spawnSpeechBubble("Warm thoughts… warm thoughts… warm thoughts…", pos.x, pos.y, 4500);
        break;
    }
  });

  // ============================================================
  // ❄️ 3) FIRST ICE GOBLIN INTRODUCTION
  // ============================================================

  let iceIntro = false;

  mapOn(5, E.enemySpawn, ({ type }) => {
    if (type !== "iceGoblin" || iceIntro) return;
    iceIntro = true;

    const pos = p();
    spawnSpeechBubble(
      "Oh look—goblins that make you cold AND angry. Perfect.",
      pos.x, pos.y, 4800
    );
  });

  // ============================================================
  // ❄️ 4) FIRST ICE GOBLIN KILL
  // ============================================================

  let iceKill = false;

  mapOn(5, E.enemyKilled, ({ type }) => {
    if (type !== "iceGoblin" || iceKill) return;
    iceKill = true;

    const pos = p();
    spawnSpeechBubble(
      "And stay down, frosty! No more chilly hugs for you.",
      pos.x, pos.y, 4800
    );
  });

  // ============================================================
  // ❄️ 5) PICKUPS — Reflavoured for Frost Map
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

  mapOn(5, "resourceUpdate", () => {
    const pos = p();

    if (!saidDiamond && gameState.diamonds > lastDiamonds) {
      saidDiamond = true;
      spawnSpeechBubble(
        "Diamonds! Cold, sparkly, and extremely useful.",
        pos.x, pos.y, 4800
      );
    }

    if (!saidShard && gameState.gold > lastGold) {
      saidShard = true;
      spawnSpeechBubble(
        "Shards! Perfect for rebuilding frozen Spires.",
        pos.x, pos.y, 4800
      );
    }

    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble(
        "A Heart! Good—I was starting to turn blue.",
        pos.x, pos.y, 4800
      );
    }

    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble(
        "Mana essence—warm spells, coming right up!",
        pos.x, pos.y, 4800
      );
    }

    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble(
        "Bravery shards! They feel warm… or maybe I’m hallucinating.",
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
  // ❄️ 6) BRAVERY FULL + ACTIVATION
  // ============================================================

  let braveryFull = false;
  let braveryUse = false;

  mapOn(5, E.braveryFull, () => {
    if (braveryFull) return;
    braveryFull = true;

    const pos = p();
    spawnSpeechBubble("Bravery charged—finally something WARM!", pos.x, pos.y, 4800);
  });

  mapOn(5, E.braveryActivated, () => {
    if (braveryUse) return;
    braveryUse = true;

    const pos = p();
    spawnSpeechBubble("Guardian Form! Melt the frostlings!", pos.x, pos.y, 4500);
  });

  // ============================================================
  // ❄️ 7) FIRST SPIRE DESTROYED
  // ============================================================

  let spireDestroyed = false;

  mapOn(5, "spireDestroyed", () => {
    if (spireDestroyed) return;
    spireDestroyed = true;

    const pos = p();
    spawnSpeechBubble(
      "HEY! That Spire was keeping me warm! …ish.",
      pos.x, pos.y, 5000
    );
  });

  // ============================================================
  // ❄️ 8) LIFE LOSS CALLOUTS (Ice-themed panic)
// ============================================================

  const lossLines = {
    80: [
      "Oof—one slipped through! I blame the ice!",
      "My toes are freezing off AND they’re getting past!? Rude."
    ],
    60: [
      "We’re losing ground! Or we’re just slipping on it!",
      "They’re pushing too hard—like a snowstorm of problems!"
    ],
    40: [
      "Spire placement! Glitter!! Focus before you freeze!",
      "We’re sliding downhill fast!"
    ],
    20: [
      "We're almost out! I AM THE WRONG TEMPERATURE FOR THIS!",
      "If we lose, bury me somewhere warm!"
    ]
  };

  const triggered = new Set();

  mapOn(5, E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of Object.keys(lossLines).map(Number).sort((a,b)=>b-a)) {
      if (pct <= t && !triggered.has(t)) {
        triggered.add(t);
        const line = lossLines[t][Math.floor(Math.random() * lossLines[t].length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4300);
        break;
      }
    }
  });

  // ============================================================
  // ❄️ 9) ALL CRYSTAL ECHOES COLLECTED
  // ============================================================

  mapOnce(5, "echoComplete", () => {
    const pos = p();
    spawnSpeechBubble(
      "All the Echoes… they feel cold but calm. Like winter magic.",
      pos.x, pos.y, 5200
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "Ariana said the Frosted Vale was ancient… I can feel it.",
        pos.x, pos.y, 5000
      );
    }, 2600);
  });

}

export default initMap5Events;
// ============================================================
// END OF FILE
// ============================================================
