// ============================================================
// 🐸 map7Events.js — The Swamplands Story Script (Rewritten Final)
// ------------------------------------------------------------
// Map 7: The Swamplands
// Theme: muddy detour before the Voidlands,
//        Crossbow Trolls introduced, Seraphine returns angrier.
//
// Includes:
//   • Wave start flavour
//   • Wave end flavour
//   • First Crossbow Troll intro
//   • First Crossbow Troll kill
//   • Seraphine (Phase 3) introduction + mid-fight reactions
//   • Pickup lines (swamp-themed humour)
//   • Bravery Aura lines
//   • Life-loss lines (swamp panic)
//   • First spire depletion
//   • Echo completion (mushroom sparkle nonsense)
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

export function initMap7Events() {

  // ============================================================
  // 🐸 1) WAVE START — Swamp misery intensifies
  // ============================================================

  mapOn(7, E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {

      case 1:
        spawnSpeechBubble("Ugh… it squelched. I stepped in something ALIVE.", pos.x, pos.y, 4500);
        break;

      case 2:
        spawnSpeechBubble("This whole place smells like angry soup.", pos.x, pos.y, 4200);
        break;

      case 3:
        spawnSpeechBubble("The mushrooms are staring at me. I swear they blinked.", pos.x, pos.y, 4800);
        break;

      case 4:
        spawnSpeechBubble("Why do goblins like swamps so much?!", pos.x, pos.y, 4300);
        break;

      case 5:
        spawnSpeechBubble("Wait… is that a troll with— a CROSSBOW?!", pos.x, pos.y, 4800);
        break;

      case 6:
        spawnSpeechBubble("Those trolls can shoot! They’re moving all over the place!", pos.x, pos.y, 4800);
        break;

      case 7:
        spawnSpeechBubble("I hate this swamp. I hate these mushrooms. I hate ranged trolls.", pos.x, pos.y, 5000);
        break;

      case 8:
        spawnSpeechBubble("Nearly done… I can smell the Voidlands from here.", pos.x, pos.y, 4500);
        break;

      case 9:
        spawnSpeechBubble("A chill… Seraphine is near. And she sounds furious.", pos.x, pos.y, 4800);
        break;

      default:
        spawnSpeechBubble("I swear the mud moved—ON ITS OWN.", pos.x, pos.y, 4800);
    }
  });

  // ============================================================
  // 🐸 2) WAVE END — Swamp suffering continues
  // ============================================================

  mapOn(7, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {

      case 1:
        spawnSpeechBubble("My shoes are ruined. My soul is damp.", pos.x, pos.y, 4200);
        break;

      case 2:
        spawnSpeechBubble("This swamp is testing my patience… and my hygiene.", pos.x, pos.y, 4500);
        break;

      case 3:
        spawnSpeechBubble("Those mushrooms are DEFINITELY judging me.", pos.x, pos.y, 4600);
        break;

      case 4:
        spawnSpeechBubble("If another goblin splashes swamp water on me…", pos.x, pos.y, 4800);
        break;

      case 5:
        spawnSpeechBubble("Crossbow trolls?! Who gave trolls ranged weapons?!", pos.x, pos.y, 5000);
        break;

      case 6:
        spawnSpeechBubble("One down. A billion swamp creatures to go.", pos.x, pos.y, 4800);
        break;

      case 7:
        spawnSpeechBubble("My hair is frizzing. THIS IS A CRISIS.", pos.x, pos.y, 4600);
        break;

      case 8:
        spawnSpeechBubble("One more wave… then I am BATHING for a WEEK.", pos.x, pos.y, 5200);
        break;

      case 9:
        spawnSpeechBubble("Seraphine… I can feel her rage from here.", pos.x, pos.y, 5200);
        break;
    }
  });

  // ============================================================
  // 🐸 3) FIRST CROSSBOW TROLL INTRO
  // ============================================================

  let cbIntro = false;

  mapOn(7, E.enemySpawn, ({ type }) => {
    if (type !== "crossbow" || cbIntro) return;
    cbIntro = true;

    const pos = p();
    spawnSpeechBubble(
      "CROSSBOW trolls?! That’s ILLEGAL! They’re supposed to bonk, not snipe!",
      pos.x, pos.y, 5600
    );
  });

  // ============================================================
  // 🐸 4) FIRST CROSSBOW TROLL KILL
  // ============================================================

  let cbKill = false;

  mapOn(7, E.enemyKilled, ({ type }) => {
    if (type !== "crossbow" || cbKill) return;
    cbKill = true;

    const pos = p();
    spawnSpeechBubble(
      "Yes! One less sniper in this boggy nightmare!",
      pos.x, pos.y, 5200
    );
  });

  // ============================================================
  // 🐸 5) SERAPHINE (PHASE 3) — Furious confrontation
  // ============================================================

  mapOn(7, E.bossSpawn, ({ boss, phase }) => {
    if (boss !== "seraphine" || phase !== 3) return;

    const pos = p();

    setTimeout(() => {
      spawnSpeechBubble(
        "Seraphine… you look… angrier. MUCH angrier.",
        pos.x, pos.y, 5200
      );
    }, 600);

    setTimeout(() => {
      spawnSpeechBubble(
        "Why here though?! The swamp stinks already!",
        pos.x, pos.y, 5200
      );
    }, 2600);
  });

  // Mid-fight HP thresholds
  mapOn(7, E.bossHpThreshold, ({ boss, threshold }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    if (threshold === 75) {
      spawnSpeechBubble("She’s faster this time!", pos.x, pos.y, 4800);
    }
    if (threshold === 50) {
      spawnSpeechBubble("Why is she so MAD today?!", pos.x, pos.y, 4800);
    }
    if (threshold === 25) {
      spawnSpeechBubble("Stop dodging!! Fight properly!!", pos.x, pos.y, 4500);
    }
  });

  mapOn(7, E.bossDefeated, ({ boss, phase }) => {
    if (boss !== "seraphine" || phase !== 3) return;
    const pos = p();

    spawnSpeechBubble(
      "She escaped AGAIN?! SERAPHINE PLEASE.",
      pos.x, pos.y, 5400
    );
  });

  // ============================================================
  // 🐸 6) PICKUPS — Swamp-ified flavour
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

  mapOn(7, "resourceUpdate", () => {
    const pos = p();

    if (!saidDiamond && gameState.diamonds > lastDiamonds) {
      saidDiamond = true;
      spawnSpeechBubble("Shiny diamonds! A nice break from swamp muck.", pos.x, pos.y, 5000);
    }

    if (!saidShard && gameState.gold > lastGold) {
      saidShard = true;
      spawnSpeechBubble("Shards! Perfect—Spires hate swamp water as much as I do.", pos.x, pos.y, 5200);
    }

    if (!saidHeart && gameState.hearts > lastHearts) {
      saidHeart = true;
      spawnSpeechBubble("A Heart! Probably not swamp-contaminated!", pos.x, pos.y, 5200);
    }

    if (!saidMana && gameState.mana > lastMana) {
      saidMana = true;
      spawnSpeechBubble("Mana! Good. I need magic just to stay CLEAN.", pos.x, pos.y, 5200);
    }

    if (!saidBravery && gameState.bravery > lastBravery) {
      saidBravery = true;
      spawnSpeechBubble("Bravery shards! Finally something here that doesn’t smell weird!", pos.x, pos.y, 5200);
    }

    lastGold = gameState.gold;
    lastDiamonds = gameState.diamonds;
    lastHearts = gameState.hearts;
    lastMana = gameState.mana;
    lastBravery = gameState.bravery;
  });

  // ============================================================
  // 🐸 7) BRAVERY EVENTS — Aura, not form
  // ============================================================

  let braveFull = false;
  let braveUse = false;

  mapOn(7, E.braveryFull, () => {
    if (braveFull) return;
    braveFull = true;

    const pos = p();
    spawnSpeechBubble("Bravery charged—finally something pure in this bog.", pos.x, pos.y, 5000);
  });

  mapOn(7, E.braveryActivated, () => {
    if (braveUse) return;
    braveUse = true;

    const pos = p();
    spawnSpeechBubble(
      "Bravery Aura—push through the muck and fight harder!",
      pos.x, pos.y, 5200
    );
  });

  // ============================================================
  // 🐸 8) FIRST SPIRE DEPLETED
  // ============================================================

  let spireDepleted = false;

  mapOn(7, "spireDestroyed", () => {
    if (spireDepleted) return;
    spireDepleted = true;

    const pos = p();
    spawnSpeechBubble(
      "HEY! That Spire was the cleanest thing in this swamp!",
      pos.x, pos.y, 5200
    );
  });

  // ============================================================
  // 🐸 9) LIFE LOSS — Swamp Panic
  // ============================================================

  const swampLoss = {
    80: [
      "They got through—probably slipped in the mud!",
      "Oops—lost one. Blame the mushrooms."
    ],
    60: [
      "We’re losing ground! And probably sinking!",
      "Stay calm… even if the swamp isn’t!"
    ],
    40: [
      "This swamp is CURSED! I swear!",
      "Everything is moist AND dangerous!"
    ],
    20: [
      "We’re nearly done for! Move faster!!",
      "If we lose here I’m never entering a swamp again!"
    ]
  };

  const triggered = new Set();

  mapOn(7, E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of Object.keys(swampLoss).map(Number).sort((a,b)=>b-a)) {
      if (pct <= t && !triggered.has(t)) {
        triggered.add(t);
        const line = swampLoss[t][Math.floor(Math.random() * swampLoss[t].length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4500);
        break;
      }
    }
  });

  // ============================================================
  // 🐸 10) ALL CRYSTAL ECHOES — Swamp Sparkle Chaos
  // ============================================================

  mapOnce(7, "echoComplete", () => {
    const pos = p();

    spawnSpeechBubble(
      "All Crystal Echoes collected! They smell… slightly swampy?",
      pos.x, pos.y, 5500
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "They’re glowing through the muck. Proud of them.",
        pos.x, pos.y, 5000
      );
    }, 2500);
  });

}

export default initMap7Events;

// ============================================================
// END OF FILE
// ============================================================
