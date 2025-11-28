// ============================================================
// 🔥 map4Events.js — Ember Plains Chaos Script (Full)
// ------------------------------------------------------------
// Map 4: Firelands / Ember Plains
// Tone: Humorous, chaotic, fiery, high-energy
//
// Includes:
//   • Wave start/end spice
//   • First Ember Goblin intro
//   • First Ember Goblin kill (panic + sass)
//   • Seraphine’s 2nd appearance (taunting, confident)
//   • Pickup reinforces (shards, diamonds, hearts, mana, bravery)
//   • First spire destroyed (carried from Map 1)
//   • Full Echo collection reaction
//   • Life-loss callouts (same system)
//   • No tutorial lines — player already trained
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ============================================================
// 🔥 1) WAVE START LINES (Chaotic Ember Plains Energy)
// ============================================================

export function initMap4Events() {

  mapOn(4, E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Why is it SO hot? Did someone set the ground on fire?", pos.x, pos.y, 4000);
        break;

      case 2:
        spawnSpeechBubble("More goblins… and they’re sweating too!", pos.x, pos.y, 3800);
        break;

      case 3:
        spawnSpeechBubble("I swear the air itself is trying to cook me.", pos.x, pos.y, 3800);
        break;

      case 4:
        spawnSpeechBubble("These ones look… spicy. Too spicy.", pos.x, pos.y, 4000);
        break;

      case 5:
        spawnSpeechBubble("The plains are rumbling… this can't be good.", pos.x, pos.y, 4200);
        break;

      case 6:
        spawnSpeechBubble("A whole wave of angry fire-gremlins—fantastic!", pos.x, pos.y, 4000);
        break;

      case 7:
        spawnSpeechBubble("The heat’s warping the air… and my sanity.", pos.x, pos.y, 4200);
        break;

      case 8:
        spawnSpeechBubble("Okay Glitter, don’t combust. You’ve got this.", pos.x, pos.y, 4000);
        break;

      case 9:
        spawnSpeechBubble("Oh great, MORE flames. Just what I wanted.", pos.x, pos.y, 3800);
        break;

      case 10:
        spawnSpeechBubble("That aura… she’s here. Again.", pos.x, pos.y, 4000);
        break;

      default:
        spawnSpeechBubble("The Ember Plains never run out of trouble…", pos.x, pos.y, 3500);
        break;
    }
  });

  // ============================================================
  // 🔥 2) WAVE END LINES (Fire-themed humour)
  // ============================================================

  mapOn(4, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Warm-up done—literally warm.", pos.x, pos.y, 3500);
        break;

      case 2:
        spawnSpeechBubble("I am approximately… 40% cooked.", pos.x, pos.y, 3500);
        break;

      case 3:
        spawnSpeechBubble("Is everything here flammable? Including me??", pos.x, pos.y, 4000);
        break;

      case 4:
        spawnSpeechBubble("If my hair survives this map, it deserves its own reward.", pos.x, pos.y, 4200);
        break;

      case 5:
        spawnSpeechBubble("I smell burning… hope it’s not me.", pos.x, pos.y, 3800);
        break;

      case 6:
        spawnSpeechBubble("Fire goblins AND elites? Wonderful.", pos.x, pos.y, 3800);
        break;

      case 7:
        spawnSpeechBubble("It’s so hot my Spires are sweating.", pos.x, pos.y, 3800);
        break;

      case 8:
        spawnSpeechBubble("Nearly there… please let Map 5 be colder.", pos.x, pos.y, 4000);
        break;

      case 9:
        spawnSpeechBubble("Something huge is coming…", pos.x, pos.y, 4200);
        break;
    }
  });

  // ============================================================
  // 🔥 3) EMBER GOBLIN INTRO (FIRST TIME EVER)
  // ============================================================

  let emberIntroduced = false;

  mapOn(4, E.enemySpawn, ({ type }) => {
    if (type !== "emberGoblin" || emberIntroduced) return;
    emberIntroduced = true;

    const pos = p();
    spawnSpeechBubble(
      "Is that goblin on FIRE?! Nope. No thank you.",
      pos.x, pos.y, 4800
    );
  });

  // ============================================================
  // 🔥 4) FIRST EMBER GOBLIN KILL
  // ============================================================

  let emberKill = false;

  mapOn(4, E.enemyKilled, ({ type }) => {
    if (type !== "emberGoblin" || emberKill) return;
    emberKill = true;

    const pos = p();
    spawnSpeechBubble(
      "Yikes—burnt goblin smells… exactly like you’d expect.",
      pos.x, pos.y, 5000
    );
  });

  // ============================================================
  // 🔥 5) SERAPHINE RETURNS (Phase 2 Encounter)
  // ============================================================

  mapOn(4, E.bossSpawn, ({ boss }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    // Glitter reacts
    setTimeout(() => {
      spawnSpeechBubble(
        "Seraphine… you again?! Didn’t we do this already?",
        pos.x, pos.y, 4500
      );
    }, 700);

    // Seraphine line (handled by seraphineSpeech.js)  
    // Glitter additions:
  });

  mapOn(4, E.bossHpThreshold, ({ boss, threshold }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    if (threshold === 75) {
      spawnSpeechBubble("She’s stronger than last time… great.", pos.x, pos.y, 4000);
    }
    if (threshold === 50) {
      spawnSpeechBubble("Is she… enjoying this?!", pos.x, pos.y, 4000);
    }
    if (threshold === 25) {
      spawnSpeechBubble("Just fall already! I’m overheating!", pos.x, pos.y, 4200);
    }
  });

  mapOn(4, E.bossDefeated, ({ boss, phase }) => {
    if (boss !== "seraphine" || phase !== 2) return;

    const pos = p();
    spawnSpeechBubble(
      "She left AGAIN?! Does she even WANT to win?",
      pos.x, pos.y, 4500
    );
  });

  // ============================================================
  // 🔥 6) PICKUPS (Reinforced from Map 1/2)
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

  mapOn(4, "resourceUpdate", () => {
    const pos = p();

    if (!saidDiamond && gameState.diamonds > lastDiamonds) {
      saidDiamond = true;
      spawnSpeechBubble("Diamonds—yes please. Spire upgrades incoming!", pos.x, pos.y, 4500);
    }

    if (!saidShard && gameState.gold > lastGold) {
      saidShard = true;
      spawnSpeechBubble("Shards! Perfect for rebuilding my crispy Spires.", pos.x, pos.y, 4500);
    }

    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble("A Heart! Great, because these goblins hit HARD.", pos.x, pos.y, 4500);
    }

    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble("Mana! More spells to throw at the fire gremlins.", pos.x, pos.y, 4500);
    }

    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble("Bravery shards… my Guardian form LOVES these.", pos.x, pos.y, 4500);
    }

    lastGold = gameState.gold;
    lastDiamonds = gameState.diamonds;
    lastHearts = gameState.hearts;
    lastMana = gameState.mana;
    lastBravery = gameState.bravery;
  });

  // ============================================================
  // 🔥 7) FIRST BRAVERY FULL & ACTIVATION (Carried Over)
// ============================================================

  let braveryFull = false;
  let braveryUse = false;

  mapOn(4, E.braveryFull, () => {
    if (braveryFull) return;
    braveryFull = true;

    const pos = p();
    spawnSpeechBubble("Bravery charged—time to fry some firelings!", pos.x, pos.y, 4800);
  });

  mapOn(4, E.braveryActivated, () => {
    if (braveryUse) return;
    braveryUse = true;

    const pos = p();
    spawnSpeechBubble("Guardian Form—engaged! Time to shine!", pos.x, pos.y, 4500);
  });

  // ============================================================
  // 🔥 8) SPIRE DESTROYED (ONE TIME)
// ============================================================

  let spireDestroyed = false;

  mapOn(4, "spireDestroyed", () => {
    if (spireDestroyed) return;
    spireDestroyed = true;

    const pos = p();
    spawnSpeechBubble(
      "HEY! That was expensive! And on fire! And expensive!!",
      pos.x, pos.y, 5000
    );
  });

  // ============================================================
  // 🔥 9) LIFE LOSS CALLOUTS (Reused from Map 1)
// ============================================================

  const lossLines = {
    80: ["Ouch! Someone's getting toasted—me!", "Fire AND goblins? Rude."],
    60: ["They’re pushing too close!", "We’re getting overwhelmed!"],
    40: ["Spire placement! Glitter! Focus!", "My hair is at risk here!"],
    20: ["We’re nearly out! Keep it together!!"]
  };

  const done = new Set();

  mapOn(4, E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of Object.keys(lossLines).map(Number).sort((a,b)=>b-a)) {
      if (pct <= t && !done.has(t)) {
        done.add(t);
        const line = lossLines[t][Math.floor(Math.random() * lossLines[t].length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4200);
        break;
      }
    }
  });

  // ============================================================
  // 🔥 10) ALL CRYSTAL ECHOES COLLECTED
  // ============================================================

  mapOnce(4, "echoComplete", () => {
    const pos = p();
    spawnSpeechBubble(
      "All the Echoes… they feel hotter than before. Like… alive?",
      pos.x, pos.y, 5200
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "Ariana better have answers when I get back.",
        pos.x, pos.y, 4800
      );
    }, 2600);
  });
}

export default initMap4Events;

// ============================================================
// END OF FILE
// ============================================================
