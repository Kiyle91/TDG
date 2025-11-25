// ============================================================
// 🌸 map1Events.js — Unified Story + Timed + Gameplay Events
// ------------------------------------------------------------
// • ALL Map 1 story logic now lives in this file
// • Time-based tutorial events
// • Wave start/end dialogue
// • Enemy spawn/kill commentary
// • Seraphine / boss reactions
// • Bravery triggers
// • Low HP warnings
// ============================================================

import { Events, EVENT_NAMES as E, loadTimedEventsForMap } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

// ============================================================
// 🌟 TIME-BASED TUTORIAL EVENTS
// ============================================================

const TIMED_EVENTS = [

  // ⭐ 3 seconds — Wake up tutorial
  {
    id: "t_003",
    timeRequired: 3,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Okay Glitter… deep breath. The Whispering Meadows. WASD to move… I remember this part.",
        p.pos.x, p.pos.y,
        4500
      );
    }
  },

  // ⭐ 10 seconds — Crystal comment
  {
    id: "t_010",
    timeRequired: 10,
    action: (gs) => {
      const p = gs.player;
      spawnSpeechBubble(
        "Those crystals… I should collect any I see.",
        p.pos.x, p.pos.y,
        3500
      );
    }
  },

  // ⭐ Add more timed events here…
];

// ============================================================
// 🌟 MAIN HOOK — Called by initGame() when Map 1 loads
// ============================================================

export function initMap1Events() {

  // Load time-based story beats
  loadTimedEventsForMap(1, TIMED_EVENTS);

  const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

  // ============================================================
  // 1. WAVE START EVENTS
  // ============================================================
  Events.on(E.waveStart, ({ wave }) => {
    const pos = p();

    if (wave === 1) {
      spawnSpeechBubble("Here they come…", pos.x, pos.y, 3000);
    }
    if (wave === 2) {
      spawnSpeechBubble("More goblins… I can handle this.", pos.x, pos.y, 3000);
    }
    if (wave === 3) {
      spawnSpeechBubble("Something feels… wrong…", pos.x, pos.y, 4000);
    }
  });

  // ============================================================
  // 2. WAVE END EVENTS
  // ============================================================
  Events.on(E.waveEnd, ({ wave }) => {
    const pos = p();

    if (wave === 1) {
      spawnSpeechBubble("Nice… I'm getting the hang of this.", pos.x, pos.y, 3000);
    }
    if (wave === 3) {
      spawnSpeechBubble("Is it finally over…?", pos.x, pos.y, 3000);
    }
  });

  // ============================================================
  // 3. ENEMY SPAWN EVENTS
  // ============================================================
  Events.on(E.enemySpawn, ({ type }) => {
    const pos = p();

    if (type === "ogre") {
      spawnSpeechBubble("An ogre!? Focus… stay mobile!", pos.x, pos.y, 4000);
    }
    if (type === "elite") {
      spawnSpeechBubble("That one looks stronger…", pos.x, pos.y, 3500);
    }
  });

  // ============================================================
  // 4. ENEMY KILL EVENTS
  // ============================================================
  let firstKill = false;

  Events.on(E.enemyKilled, ({ type }) => {
    const pos = p();

    if (!firstKill) {
      firstKill = true;
      spawnSpeechBubble(
        "That wasn’t too bad… I think I can do this.",
        pos.x, pos.y, 3500
      );
    }

    if (type === "ogre") {
      spawnSpeechBubble("And stay down…", pos.x, pos.y, 3000);
    }
  });

  // ============================================================
  // 5. BOSS / SERAPHINE EVENTS
  // ============================================================
  Events.on(E.bossSpawn, () => {
    const pos = p();
    spawnSpeechBubble("What is that…? Something powerful is here…", pos.x, pos.y, 4500);
  });

  Events.on(E.bossHpThreshold, ({ threshold }) => {
    const pos = p();

    if (threshold === 75) {
      spawnSpeechBubble("I can hurt it… keep pushing!", pos.x, pos.y, 3500);
    }
    if (threshold === 50) {
      spawnSpeechBubble("Halfway there… don’t lose focus!", pos.x, pos.y, 3500);
    }
    if (threshold === 25) {
      spawnSpeechBubble("It’s weakening! Finish this!", pos.x, pos.y, 3500);
    }
  });

  Events.on(E.bossDefeated, () => {
    const pos = p();
    spawnSpeechBubble("It’s over… for now.", pos.x, pos.y, 4000);
  });

  // ============================================================
  // 6. BRAVERY EVENTS
  // ============================================================
  Events.on(E.braveryFull, () => {
    const pos = p();
    spawnSpeechBubble(
      "My Bravery is charged… I feel unstoppable.",
      pos.x, pos.y, 3500
    );
  });

  Events.on(E.braveryActivated, () => {
    const pos = p();
    spawnSpeechBubble(
      "Here we go!",
      pos.x, pos.y, 3000
    );
  });

  // ============================================================
  // 7. LOW HP WARNING
  // ============================================================
  Events.on(E.playerLowHP, () => {
    const pos = p();
    spawnSpeechBubble(
      "I… need… healing…",
      pos.x, pos.y,
      3500
    );
  });

  // ============================================================
  // 8. CUSTOM EVENT EXAMPLE
  // ============================================================
  // Events.on("myEvent", (data) => { ... });

}
