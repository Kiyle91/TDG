// ============================================================
// 🔥 map4Events.js — Ember Plains Chaos Script (Final Polished)
// ------------------------------------------------------------
// Map 4: Ember Plains / Firelands
// Tone: Humorous, chaotic, fiery, high-energy
//
// Includes:
//   • Wave start/end lines
//   • First Ember Goblin intro
//   • First Ember Goblin kill
//   • Seraphine’s second appearance
//   • Pickups (Shards, Diamonds, Hearts, Mana, Bravery)
//   • First spire depletion
//   • Full Echo collection reaction
//   • Life-loss callouts
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ============================================================
// 🔥 1) WAVE START LINES — Ember Plains Energy
// ============================================================

export default function initMap4Events() {

  mapOn(4, E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Why is it SO hot? Is the ground… actually on fire?", pos.x, pos.y, 4000);
        break;

      case 2:
        spawnSpeechBubble("More goblins… and even they look overheated.", pos.x, pos.y, 3800);
        break;

      case 3:
        spawnSpeechBubble("I swear the air itself is trying to cook me.", pos.x, pos.y, 3800);
        break;

      case 4:
        spawnSpeechBubble("These ones look… spicy. Way too spicy.", pos.x, pos.y, 4000);
        break;

      case 5:
        spawnSpeechBubble("The plains are rumbling… that’s never good.", pos.x, pos.y, 4200);
        break;

      case 6:
        spawnSpeechBubble("A whole wave of angry Ember Goblins—fantastic!", pos.x, pos.y, 4000);
        break;

      case 7:
        spawnSpeechBubble("The heat’s warping the air… and maybe my sanity.", pos.x, pos.y, 4200);
        break;

      case 8:
        spawnSpeechBubble("Okay… don’t combust. Stay focused.", pos.x, pos.y, 4000);
        break;

      case 9:
        spawnSpeechBubble("More flames? Sure. Why not.", pos.x, pos.y, 3800);
        break;

      case 10:
        spawnSpeechBubble("That aura… she’s here again.", pos.x, pos.y, 4000);
        break;

      default:
        spawnSpeechBubble("The Ember Plains never stop throwing trouble.", pos.x, pos.y, 3500);
        break;
    }
  });

  // ============================================================
  // 🔥 2) WAVE END LINES — Fire-Themed Humour
  // ============================================================

  mapOn(4, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Warm-up done—literally warm.", pos.x, pos.y, 3500);
        break;

      case 2:
        spawnSpeechBubble("I think I’m about 40% roasted.", pos.x, pos.y, 3500);
        break;

      case 3:
        spawnSpeechBubble("Is EVERYTHING here flammable? Including me??", pos.x, pos.y, 4000);
        break;

      case 4:
        spawnSpeechBubble("If my hair survives this place, I’m celebrating.", pos.x, pos.y, 4200);
        break;

      case 5:
        spawnSpeechBubble("I smell burning… please let it not be me.", pos.x, pos.y, 3800);
        break;

      case 6:
        spawnSpeechBubble("Ember Goblins AND elites? Wonderful.", pos.x, pos.y, 3800);
        break;

      case 7:
        spawnSpeechBubble("The heat is making my spires sweat.", pos.x, pos.y, 3800);
        break;

      case 8:
        spawnSpeechBubble("Nearly through… hopefully somewhere cooler next.", pos.x, pos.y, 4000);
        break;

      case 9:
        spawnSpeechBubble("Something large is approaching…", pos.x, pos.y, 4200);
        break;
    }
  });

  // ============================================================
  // 🔥 3) FIRST EMBER GOBLIN INTRO
  // ============================================================

  let emberIntroduced = false;

  mapOn(4, E.enemySpawn, ({ type }) => {
    if (type !== "emberGoblin" || emberIntroduced) return;
    emberIntroduced = true;

    const pos = p();
    spawnSpeechBubble(
      "Is that goblin… on FIRE?! Absolutely not.",
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
      "Yep… burnt goblin smells exactly like you’d think.",
      pos.x, pos.y, 5000
    );
  });

  // ============================================================
  // 🔥 5) SERAPHINE RETURNS
  // ============================================================

  mapOn(4, E.bossSpawn, ({ boss }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    setTimeout(() => {
      spawnSpeechBubble(
        "Seraphine… again? Does she ever get tired?",
        pos.x, pos.y, 4500
      );
    }, 700);
  });

  mapOn(4, E.bossHpThreshold, ({ boss, threshold }) => {
    if (boss !== "seraphine") return;
    const pos = p();

    if (threshold === 75)
      spawnSpeechBubble("She’s stronger than before… great.", pos.x, pos.y, 4000);

    if (threshold === 50)
      spawnSpeechBubble("Is she… enjoying this?!", pos.x, pos.y, 4000);

    if (threshold === 25)
      spawnSpeechBubble("Just fall already—I'm overheating!", pos.x, pos.y, 4200);
  });

  mapOn(4, E.bossDefeated, ({ boss, phase }) => {
    if (boss !== "seraphine" || phase !== 2) return;

    const pos = p();
    spawnSpeechBubble(
      "She vanished again… does she even WANT to win?",
      pos.x, pos.y, 4500
    );
  });

  // ============================================================
  // 🔥 6) PICKUPS
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
      spawnSpeechBubble("Diamonds! Perfect—time to upgrade my spires.", pos.x, pos.y, 4500);
    }

    if (!saidShard && gameState.gold > lastGold) {
      saidShard = true;
      spawnSpeechBubble("Shards! Good—I'll need fresh spires constantly here.", pos.x, pos.y, 4500);
    }

    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble("A Heart! Thank goodness… Ember Goblins hit HARD.", pos.x, pos.y, 4500);
    }

    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble("Mana! Time to sling more spells at these fire pests.", pos.x, pos.y, 4500);
    }

    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble("Bravery shards… my aura feels hotter already.", pos.x, pos.y, 4500);
    }

    lastGold = gameState.gold;
    lastDiamonds = gameState.diamonds;
    lastHearts = gameState.hearts;
    lastMana = gameState.mana;
    lastBravery = gameState.bravery;
  });

  // ============================================================
  // 🔥 7) BRAVERY FULL & ACTIVATION (Map-specific flavour)
  // ============================================================

  let braveryFull = false;
  let braveryUsed = false;

  mapOn(4, E.braveryFull, () => {
    if (braveryFull) return;
    braveryFull = true;

    const pos = p();
    spawnSpeechBubble("My Bravery is full… press Q before I melt!", pos.x, pos.y, 4800);
  });

  mapOn(4, E.braveryActivated, () => {
    if (braveryUsed) return;
    braveryUsed = true;

    const pos = p();
    spawnSpeechBubble("Bravery Aura—ignite! Ember Plains, back off!", pos.x, pos.y, 4800);
  });

  // ============================================================
  // 🔥 8) FIRST SPIRE DEPLETION
  // ============================================================

  let spireDepleted = false;

  mapOn(4, "spireDestroyed", () => {
    if (spireDepleted) return;
    spireDepleted = true;

    const pos = p();
    spawnSpeechBubble(
      "HEY! That spire faded—and it wasn’t cheap!",
      pos.x, pos.y, 5000
    );
  });

  // ============================================================
  // 🔥 9) LIFE LOSS CALLOUTS — Fire Variant
  // ============================================================

  const lossLines = {
    80: ["Ouch! Someone’s getting toasted—oh wait, that’s me!", "Fire AND goblins? Rude."],
    60: ["They’re pushing way too close!", "I’m getting overwhelmed!"],
    40: ["Spire placement! Focus!", "My hair is in REAL danger here!"],
    20: ["Nearly out of room! Keep fighting!!"]
  };

  const used = new Set();

  mapOn(4, E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of Object.keys(lossLines).map(Number).sort((a, b) => b - a)) {
      if (pct <= t && !used.has(t)) {
        used.add(t);
        const arr = lossLines[t];
        spawnSpeechBubble(arr[Math.floor(Math.random() * arr.length)], pos.x, pos.y, 4200);
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
      "All the Echoes… glowing hotter than before.",
      pos.x, pos.y, 5200
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "Ariana better have answers soon.",
        pos.x, pos.y, 4800
      );
    }, 2600);
  });
}

// ============================================================
// END OF FILE
// ============================================================
