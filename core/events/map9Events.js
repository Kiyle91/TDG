// ============================================================
// 🟣 map9Events.js — The Crystal Keep (FINAL MAP) Script (Expanded)
// ------------------------------------------------------------
// Map 9: Full enemy roster + Seraphine Phase IV
// The Architect’s final attempt to seize the Crystal Heart.
//
// Tone:
//   • Epic, high-stakes, emotional
//   • The Princess Guardian is fully confident in her role
//   • Seraphine reveals her motives, her tragedy, and her plan
//   • Humour still present, but lighter — this is the final battle
//
// Covers:
//   • Wave start/end flavour (all-out assault)
//   • First Void->Mixed swarm reactions
//   • Seraphine arrival + mid-fight HP threshold lines
//   • Final “defeat but escape” bittersweet lore beat
//   • Crystal Heart references
//   • Life-loss callouts (intense version)
//   • Resource flavour (Keep-boosted)
//   • Bravery Aura + spire pressure
// ============================================================

import { Events, EVENT_NAMES as E } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

// ============================================================
// PLAYER POSITION
// ============================================================

const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

// ============================================================
// LIFE LOSS CALLOUTS — FINAL MAP VARIANTS
// ============================================================

const lifeLossLines = {
  80: [
    "One slipped through—stay focused!",
    "Don’t let the pressure shake you now!"
  ],
  60: [
    "We’re getting overwhelmed—move, move!",
    "Paths are buckling—reinforce faster!"
  ],
  40: [
    "We can’t lose now… not this close!",
    "The Crystal Keep is depending on this battle!"
  ],
  20: [
    "Please… if this falls, the Isles fall with it!",
    "Hold the line! The Crystal Heart is right behind you!"
  ]
};

// ============================================================
// INIT
// ============================================================

export default function initMap9Events() {

  // ------------------------------------------------------------
  // 1) WAVE START — escalating chaos
  // ------------------------------------------------------------
  Events.on(E.waveStart, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble(
          "Crystal Keep… home. If this falls… everything falls.",
          pos.x, pos.y, 4800
        );
        break;

      case 2:
        spawnSpeechBubble(
          "They’re coming harder now… all tribes pushing together.",
          pos.x, pos.y, 4500
        );
        break;

      case 3:
        spawnSpeechBubble(
          "Elites, Worgs, Voidlings—this is a full assault.",
          pos.x, pos.y, 4500
        );
        break;

      case 4:
        spawnSpeechBubble(
          "The Architect is close. It feels like she’s breathing through the crystal walls.",
          pos.x, pos.y, 5000
        );
        break;

      case 5:
        spawnSpeechBubble(
          "That rumble… that’s not footsteps. That’s her power waking up.",
          pos.x, pos.y, 4800
        );
        break;

      case 6:
        spawnSpeechBubble(
          "This wave is huge—Spire placement is everything now!",
          pos.x, pos.y, 4500
        );
        setTimeout(() => {
          const pos2 = p();
          spawnSpeechBubble(
            "Every path needs cover. No gaps. Not here. Not today.",
            pos2.x, pos2.y, 4500
          );
        }, 2600);
        break;

      case 7:
        spawnSpeechBubble(
          "They’re hitting every path at once—classic Seraphine move.",
          pos.x, pos.y, 4500
        );
        setTimeout(() => {
          const pos2 = p();
          spawnSpeechBubble(
            "Fine. We’ll answer with every Spire we’ve got.",
            pos2.x, pos2.y, 4500
          );
        }, 2600);
        break;

      case 8:
        spawnSpeechBubble(
          "The Crystal Heart is pulsing… like it's afraid.",
          pos.x, pos.y, 4800
        );
        setTimeout(() => {
          const pos2 = p();
          spawnSpeechBubble(
            "Don’t worry… you’re not falling today.",
            pos2.x, pos2.y, 4200
          );
        }, 2600);
        break;

      case 9:
        spawnSpeechBubble(
          "Last wave before she comes. Deep breath…",
          pos.x, pos.y, 4800
        );
        setTimeout(() => {
          const pos2 = p();
          spawnSpeechBubble(
            "You’ve beaten every map to reach this moment. You can do this.",
            pos2.x, pos2.y, 5000
          );
        }, 2600);
        break;

      case 10:
        spawnSpeechBubble(
          "She’s here.",
          pos.x, pos.y, 4000
        );
        setTimeout(() => {
          const pos2 = p();
          spawnSpeechBubble(
            "The Crystal Heart is watching… don’t look away now.",
            pos2.x, pos2.y, 4800
          );
        }, 2600);
        break;
    }
  });

  // ------------------------------------------------------------
  // 2) WAVE END — short, tense reactions
  // ------------------------------------------------------------
  Events.on(E.waveEnd, ({ wave }) => {
    const pos = p();

    switch (wave) {
      case 1:
        spawnSpeechBubble("The Keep still stands. Good.", pos.x, pos.y, 3500);
        break;

      case 2:
        spawnSpeechBubble("They’re testing every weak spot.", pos.x, pos.y, 3800);
        break;

      case 3:
        spawnSpeechBubble("Every tribe is here… all for the Heart.", pos.x, pos.y, 3800);
        break;

      case 4:
        spawnSpeechBubble("Seraphine’s magic is brushing against reality.", pos.x, pos.y, 4000);
        break;

      case 5:
        spawnSpeechBubble("She wants the Heart… but not just to take it.", pos.x, pos.y, 4200);
        break;

      case 6:
        spawnSpeechBubble("Not backing down. Not after coming this far.", pos.x, pos.y, 3800);
        break;

      case 7:
        spawnSpeechBubble("Almost… almost… the Keep can feel it too.", pos.x, pos.y, 3800);
        break;

      case 8:
        spawnSpeechBubble("The Heart is… crying. It doesn’t want to choose sides.", pos.x, pos.y, 4800);
        break;

      case 9:
        spawnSpeechBubble("Last chance to breathe before she arrives.", pos.x, pos.y, 4500);
        setTimeout(() => {
          const pos2 = p();
          spawnSpeechBubble(
            "Whatever happens next… the Isles will remember this fight.",
            pos2.x, pos2.y, 5200
          );
        }, 2600);
        break;
    }
  });

  // ------------------------------------------------------------
  // 3) FIRST KILLS — Void gets special here
  // ------------------------------------------------------------
  let firstVoid = false;

  Events.on(E.enemyKilled, ({ type }) => {
    if (type === "voidGoblin" && !firstVoid) {
      firstVoid = true;
      const pos = p();
      spawnSpeechBubble(
        "Even here, Void Goblins twist the light…",
        pos.x, pos.y, 4800
      );

      setTimeout(() => {
        const pos2 = p();
        spawnSpeechBubble(
          "But the Crystal Heart shines brighter. Remember that.",
          pos2.x, pos2.y, 4800
        );
      }, 2600);
    }
  });

  // ------------------------------------------------------------
  // 4) LIFE LOSS CALLOUTS
  // ------------------------------------------------------------
  const thresholds = Object.keys(lifeLossLines)
    .map(Number)
    .sort((a, b) => b - a);

  const done = new Set();

  Events.on(E.playerLifeLost, ({ lives }) => {
    const pct = (lives / 10) * 100;
    const pos = p();

    for (const t of thresholds) {
      if (pct <= t && !done.has(t)) {
        done.add(t);
        const options = lifeLossLines[t];
        const line = options[Math.floor(Math.random() * options.length)];
        spawnSpeechBubble(line, pos.x, pos.y, 4500);
        break;
      }
    }
  });

  // ------------------------------------------------------------
  // 5) BOSS ENCOUNTER — SERAPHINE (FINAL FORM)
//      Bittersweet, not pure evil
  // ------------------------------------------------------------
  Events.on(E.bossSpawn, ({ boss }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    // Seraphine entrance
    setTimeout(() => {
      spawnSpeechBubble(
        "Princess… step aside. The Heart belongs to my people.",
        pos.x, pos.y, 5200
      );
    }, 700);

    // Hero answers
    setTimeout(() => {
      const pos2 = p();
      spawnSpeechBubble(
        "Seraphine… you can’t take it. If you tear it free, the Isles will collapse.",
        pos2.x, pos2.y, 5200
      );
    }, 3800);

    // Seraphine reveals motive
    setTimeout(() => {
      const pos3 = p();
      spawnSpeechBubble(
        "The Voidlands are fading into dust. My home is dying. The Heart is the only chance we have.",
        pos3.x, pos3.y, 5800
      );
    }, 7200);

    // Hero’s resolve
    setTimeout(() => {
      const pos4 = p();
      spawnSpeechBubble(
        "You want to save your home… but I have to protect mine too.",
        pos4.x, pos4.y, 5200
      );
    }, 11000);

    // One last exchange before the fight fully begins
    setTimeout(() => {
      const pos5 = p();
      spawnSpeechBubble(
        "Then prove your strength, Princess. Show me a path I haven’t seen.",
        pos5.x, pos5.y, 5800
      );
    }, 14200);
  });

  // ------------------------------------------------------------
  // 6) MID-BATTLE SERAPHINE THRESHOLDS
  // ------------------------------------------------------------
  Events.on(E.bossHpThreshold, ({ boss, threshold }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    if (threshold === 75) {
      spawnSpeechBubble(
        "You’re strong… but the Voidlands are stronger than your fear.",
        pos.x, pos.y, 5200
      );
    }

    if (threshold === 50) {
      setTimeout(() => {
        const pos2 = p();
        spawnSpeechBubble(
          "Why resist? I’m trying to save an entire realm!",
          pos2.x, pos2.y, 5200
        );
      }, 200);

      setTimeout(() => {
        const pos3 = p();
        spawnSpeechBubble(
          "And I’m trying to save two.",
          pos3.x, pos3.y, 4800
        );
      }, 2600);
    }

    if (threshold === 25) {
      setTimeout(() => {
        const pos2 = p();
        spawnSpeechBubble(
          "I’ve already lost so much… I won’t lose my home as well!",
          pos2.x, pos2.y, 5400
        );
      }, 200);

      setTimeout(() => {
        const pos3 = p();
        spawnSpeechBubble(
          "Then stop fighting alone. There’s another way—you just can’t see it yet.",
          pos3.x, pos3.y, 5600
        );
      }, 2800);
    }
  });

  // ------------------------------------------------------------
  // 7) SERAPHINE “DEFEAT” — ESCAPES (BITTERSWEET SEQUEL HOOK)
//      No hatred. Future redemption is possible.
// ------------------------------------------------------------
  Events.on(E.bossDefeated, ({ boss, phase }) => {
    if (boss !== "seraphine") return;

    const pos = p();

    // Seraphine falling back
    setTimeout(() => {
      spawnSpeechBubble(
        "No… not again… I was so close...",
        pos.x, pos.y,
        5500
      );
    }, 500);

    // Vulnerable confession
    setTimeout(() => {
      const pos2 = p();
      spawnSpeechBubble(
        "Do you have any idea what it’s like to watch your sky fade away?",
        pos2.x, pos2.y,
        5600
      );
    }, 3500);

    // Hero response — no hatred
    setTimeout(() => {
      const pos3 = p();
      spawnSpeechBubble(
        "I don’t want your world to die either. But stealing the Heart will break everything.",
        pos3.x, pos3.y,
        6200
      );
    }, 7000);

    // Seraphine’s promise
    setTimeout(() => {
      const pos4 = p();
      spawnSpeechBubble(
        "Then next time… show me a way to save both.",
        pos4.x, pos4.y,
        5800
      );
    }, 10400);

    // Soft exit, not hatred
    setTimeout(() => {
      const pos5 = p();
      spawnSpeechBubble(
        "Until then, Princess… I fight for my home. You fight for yours.",
        pos5.x, pos5.y,
        6200
      );
    }, 13600);

    // Final hopeful beat
    setTimeout(() => {
      const pos6 = p();
      spawnSpeechBubble(
        "One day… maybe we’ll fight side by side instead.",
        pos6.x, pos6.y,
        6200
      );
    }, 16800);
  });

  // ------------------------------------------------------------
  // 8) RESOURCE PICKUPS (subtle, final-map version)
//      The Keep itself is helping you.
// ------------------------------------------------------------
  let lastD = 0, lastG = 0, lastH = 0, lastM = 0, lastB = 0;
  let saidD = false, saidG = false, saidH = false, saidM = false, saidB = false;

  Events.on("resourceUpdate", () => {
    const pos = p();

    if (!saidD && gameState.diamonds > lastD) {
      saidD = true;
      spawnSpeechBubble(
        "The crystals here sing with the Heart… they want these Spires to stand.",
        pos.x, pos.y, 5200
      );
    }

    if (!saidG && gameState.gold > lastG) {
      saidG = true;
      spawnSpeechBubble(
        "Shards flow faster here… the Keep is feeding the fight.",
        pos.x, pos.y, 4800
      );
    }

    if (!saidH && gameState.hearts > lastH) {
      saidH = true;
      spawnSpeechBubble(
        "A Heart—no time to waste it now.",
        pos.x, pos.y, 4200
      );
    }

    if (!saidM && gameState.mana > lastM) {
      saidM = true;
      spawnSpeechBubble(
        "Mana surges through the walls… spells feel sharper here.",
        pos.x, pos.y, 4600
      );
    }

    if (!saidB && gameState.bravery > lastB) {
      saidB = true;
      spawnSpeechBubble(
        "Bravery shards… the Crystal Heart believes in you.",
        pos.x, pos.y, 5000
      );
    }

    lastD = gameState.diamonds;
    lastG = gameState.gold;
    lastH = gameState.hearts;
    lastM = gameState.mana;
    lastB = gameState.bravery;
  });

  // ------------------------------------------------------------
  // 9) BRAVERY AURA — Final Map Flavour
  // ------------------------------------------------------------
  let braveryFull = false;
  let braveryUsed = false;

  Events.on(E.braveryFull, () => {
    if (braveryFull) return;
    braveryFull = true;

    const pos = p();
    spawnSpeechBubble(
      "Bravery is full… the Heart’s light is flowing straight through you.",
      pos.x, pos.y, 5600
    );
  });

  Events.on(E.braveryActivated, () => {
    if (braveryUsed) return;
    braveryUsed = true;

    const pos = p();
    spawnSpeechBubble(
      "Bravery Aura—this is for every isle, every home, every friend.",
      pos.x, pos.y, 5600
    );
  });

  // ------------------------------------------------------------
  // 10) SPIRE PRESSURE — Final Map Callout
  // ------------------------------------------------------------
  let spireDepleted = false;

  Events.on("spireDestroyed", () => {
    if (spireDepleted) return;
    spireDepleted = true;

    const pos = p();
    spawnSpeechBubble(
      "A Spire’s run dry—replace it fast! The Heart has no shield without them!",
      pos.x, pos.y, 5600
    );
  });

}
