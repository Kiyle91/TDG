// ============================================================
// 🌿 map1Events.js — Example Story + Event Hooks for Map 1
// ------------------------------------------------------------
// Demonstrates how to use:
//   ✔ time-based triggers
//   ✔ wave-based triggers
//   ✔ enemy spawn triggers
//   ✔ enemy kill triggers
//   ✔ Seraphine triggers
//   ✔ bravery triggers
//   ✔ low HP triggers
//
// NOTE:
//   All speech/UI functions live OUTSIDE the engine.
//   This file only *reacts* to engine events.
// ============================================================

import { Events, EVENT_NAMES as E } from "../eventEngine.js";
import { spawnSpeechBubble } from "../../fx/speechBubble.js";
import { gameState } from "../../utils/gameState.js";

export function initMap1Events() {
  const p = () => gameState.player?.pos ?? { x: 0, y: 0 };

  // ============================================================
  // ⏱ 1. TIME-BASED EVENTS
  // ------------------------------------------------------------

  Events.once("time:3s", () => {
    const pos = p();
    spawnSpeechBubble(
      "Okay… stay calm Guardian… The meadows are quiet but dangerous.",
      pos.x, pos.y, 4500
    );
  });

  Events.once("time:10s", () => {
    const pos = p();
    spawnSpeechBubble(
      "Those crystals… I should collect any I see.",
      pos.x, pos.y, 3500
    );
  });


  // ============================================================
  // 🌊 2. WAVE-BASED EVENTS
  // ------------------------------------------------------------

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
  // 👹 3. ENEMY SPAWN EVENTS
  // ------------------------------------------------------------

  Events.on(E.enemySpawn, ({ type }) => {
    const pos = p();

    if (type === "ogre") {
      spawnSpeechBubble("An ogre!? Focus… stay mobile!", pos.x, pos.y, 4000);
    }

    if (type === "elite") {
      spawnSpeechBubble("That one looks stronger… ", pos.x, pos.y, 3500);
    }
  });


  // ============================================================
  // 💀 4. ENEMY KILL EVENTS
  // ------------------------------------------------------------

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
  // 🟣 5. SERAPHINE EVENTS
  // ------------------------------------------------------------

  Events.on(E.bossSpawn, ({ phase }) => {
    const pos = p();
    spawnSpeechBubble(
      "What is that…? Something powerful is here…",
      pos.x, pos.y, 4500
    );
  });

  Events.on(E.bossKilled, ({ phase }) => {
    const pos = p();
    spawnSpeechBubble(
      "It’s over… for now.",
      pos.x, pos.y, 4000
    );
  });


  // ============================================================
  // 🔥 6. BRAVERY EVENTS
  // ------------------------------------------------------------

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
  // ❤️ 7. PLAYER LOW HP EVENTS
  // ------------------------------------------------------------

  Events.on(E.playerLowHP, ({ hp, maxHp }) => {
    const pos = p();
    spawnSpeechBubble(
      "I… need… healing…",
      pos.x, pos.y, 3500
    );
  });


  // ============================================================
  // 📌 8. EXTRA: CUSTOM EVENT EXAMPLE
  // ------------------------------------------------------------
  // You can fire your own events from ANY file:
  //   Events.emit("myCustomEvent", { ... });
  // And listen here:
  //
  // Events.on("myCustomEvent", (data) => { ... });

}
