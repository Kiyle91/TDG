// ============================================================
// 🌑 map8Events.js — The Voidlands Story Script (Final)
// ------------------------------------------------------------
// Map 8: Seraphine’s homeland. Forbidden magic. Gravity warps.
// Introduces:
//   • Void Goblins (disable spires, distort magic, gravity slips)
//   • Everyone fears this type of magic — even Glitter
//   • Seraphine’s homeland, heavy lore hints
//   • No tutorials — atmospheric, unsettling, but still funny
//
// Covers:
//   • Wave start/end flavour
//   • First Void Goblin kill (ONE TIME)
//   • Life loss callouts
//   • Void-flavoured resource lines
//   • Seraphine cameo (Phase 4 foreshadowing but not a fight)
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap, mapOn, mapOnce } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

// ============================================================
// PLAYER POSITION HELPER
// ============================================================

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ============================================================
// LIFE LOSS CALLOUTS (void-panic flavoured)
// ============================================================

const lifeLossLines = {
  80: [
    "That one bent around the spire—how?!",
    "Void tricks… stay sharp!"
  ],
  60: [
    "They're scrambling space itself—keep moving!",
    "My spires can’t track them when they do that!"
  ],
  40: [
    "This place is warping around me—ugh!",
    "Void creatures… why does it feel like it's watching?"
  ],
  20: [
    "Princess—don’t let the Void take you!",
    "Glitter… focus! Don’t lose yourself!"
  ]
};

// ============================================================
// INIT
// ============================================================

export default function initMap9Events() {

  // ------------------------------------------------------------
  // 1) WAVE START
  // ------------------------------------------------------------
  mapOn(9, E.waveStart, ({ wave }) => {
    const pos = p();
    switch (wave) {
      case 1:
        spawnSpeechBubble(
          "This air… it’s thick. Like I'm walking through someone else’s dream.",
          pos.x, pos.y, 4500
        );
        break;
      case 2:
        spawnSpeechBubble(
          "Void Goblins… even the regular ones look nervous around them.",
          pos.x, pos.y, 4500
        );
        break;
      case 3:
        spawnSpeechBubble(
          "My Spires—are they… flickering? Void magic is terrifying.",
          pos.x, pos.y, 4500
        );
        break;
      case 4:
        spawnSpeechBubble(
          "Gravity shifted—nope nope nope I hate this map.",
          pos.x, pos.y, 4500
        );
        break;
      case 5:
        spawnSpeechBubble(
          "Seraphine was born here… is she watching me?",
          pos.x, pos.y, 4500
        );
        break;
      case 6:
        spawnSpeechBubble(
          "The void energy is pulsing… stronger than the Ember Plains.",
          pos.x, pos.y, 4500
        );
        break;
      case 7:
        spawnSpeechBubble(
          "My arrows are curving—how do physics even WORK here?!",
          pos.x, pos.y, 4500
        );
        break;
      case 8:
        spawnSpeechBubble(
          "Okay Glitter… don’t freak out. Just… pretend this is normal.",
          pos.x, pos.y, 4500
        );
        break;
      case 9:
        spawnSpeechBubble(
          "Something big is stirring beneath this place…",
          pos.x, pos.y, 4500
        );
        break;
      case 10:
        spawnSpeechBubble(
          "Seraphine… I can feel you nearby. Are you still my enemy?",
          pos.x, pos.y, 5000
        );
        break;
    }
  });

  // ------------------------------------------------------------
  // 2) WAVE END
  // ------------------------------------------------------------
  mapOn(9, E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("Okay. I survived the welcome party. Nice.", pos.x, pos.y, 4000);
        break;
      case 2:
        spawnSpeechBubble("Void Goblins are cheating. I swear they’re cheating.", pos.x, pos.y, 4200);
        break;
      case 3:
        spawnSpeechBubble("My spires hate this place. I hate this place.", pos.x, pos.y, 4200);
        break;
      case 4:
        spawnSpeechBubble("If gravity flips again I’m filing a complaint.", pos.x, pos.y, 4200);
        break;
      case 5:
        spawnSpeechBubble("Seraphine grew up here? That explains… a lot.", pos.x, pos.y, 4500);
        break;
      case 6:
        spawnSpeechBubble("Even the Echoes sound nervous.", pos.x, pos.y, 4000);
        break;
      case 7:
        spawnSpeechBubble("The shadows have… depth. Too much depth.", pos.x, pos.y, 4500);
        break;
      case 8:
        spawnSpeechBubble("Almost done, Glitter. Don’t fall into the void.", pos.x, pos.y, 4500);
        break;
      case 9:
        spawnSpeechBubble("Did the ground just breathe?", pos.x, pos.y, 4200);
        break;
    }
  });

  // ------------------------------------------------------------
  // 3) FIRST VOID GOBLIN KILL
  // ------------------------------------------------------------
  let firstVoidKill = false;

  mapOn(9, E.enemyKilled, ({ type }) => {
    if (type !== "voidGoblin") return;
    if (firstVoidKill) return;

    firstVoidKill = true;
    const pos = p();

    spawnSpeechBubble(
      "Void Goblin down… and it felt like it stared straight into me.",
      pos.x, pos.y, 5000
    );

    setTimeout(() => {
      spawnSpeechBubble(
        "No wonder the Spires can’t see them… they’re bending light.",
        pos.x, pos.y, 4800
      );
    }, 2400);
  });

  // ------------------------------------------------------------
  // 4) LIFE LOSS CALLOUTS
  // ------------------------------------------------------------
  const thresholds = Object.keys(lifeLossLines)
    .map(Number)
    .sort((a, b) => b - a);

  const done = new Set();

  mapOn(9, E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of thresholds) {
      if (pct <= t && !done.has(t)) {
        done.add(t);
        const lines = lifeLossLines[t];
        const line = lines[Math.floor(Math.random() * lines.length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4500);
        break;
      }
    }
  });

  // ------------------------------------------------------------
  // 5) SERAPHINE — NOT A FIGHT, JUST A PRESENCE
  // ------------------------------------------------------------
  mapOn(9, E.bossSpawn, ({ boss }) => {
    if (boss !== "seraphine") return;

    const pos = p();
    setTimeout(() => {
      spawnSpeechBubble(
        "Seraphine… this is your home, isn’t it?",
        pos.x, pos.y, 4800
      );
    }, 700);

    setTimeout(() => {
      spawnSpeechBubble(
        "Why does it feel like… you don’t want me here?",
        pos.x, pos.y, 4800
      );
    }, 3500);
  });

  // ------------------------------------------------------------
  // 6) RESOURCE PICKUPS — VOID FLAVOUR
  // ------------------------------------------------------------
  let lastD = 0, lastG = 0, lastH = 0, lastM = 0, lastB = 0;
  let saidD = false, saidG = false, saidH = false, saidM = false, saidB = false;

  mapOn(9, "resourceUpdate", () => {
    const pos = p();

    if (!saidD && gameState.diamonds > lastD) {
      saidD = true;
      spawnSpeechBubble(
        "Even the diamonds hum… this land is alive.",
        pos.x, pos.y, 4800
      );
    }

    if (!saidG && gameState.gold > lastG) {
      saidG = true;
      spawnSpeechBubble(
        "Shards… warped by void light, but still spendable.",
        pos.x, pos.y, 4600
      );
    }

    if (!saidH && gameState.hearts > lastH) {
      saidH = true;
      spawnSpeechBubble(
        "A Heart… glowing faintly purple. I really hope that’s fine.",
        pos.x, pos.y, 5000
      );
    }

    if (!saidM && gameState.mana > lastM) {
      saidM = true;
      spawnSpeechBubble(
        "Void mana… it crackles when I hold it.",
        pos.x, pos.y, 4800
      );
    }

    if (!saidB && gameState.bravery > lastB) {
      saidB = true;
      spawnSpeechBubble(
        "Bravery shards… they vibrate like they’re warning me.",
        pos.x, pos.y, 4800
      );
    }

    lastD = gameState.diamonds;
    lastG = gameState.gold;
    lastH = gameState.hearts;
    lastM = gameState.mana;
    lastB = gameState.bravery;
  });

}
