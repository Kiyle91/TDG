// ============================================================
// 🌟 eventEngine.js — Step-based event trigger engine
// Olivia’s World: Crystal Keep
// ============================================================

import { gameState } from "../utils/gameState.js";

let activeEvents = [];

/**
 * Loads a step-event script for the current map.
 * events = [ { id, stepsRequired, action }, ... ]
 */
export function loadStepEventsForMap(mapNumber, events) {
  const currentMap = gameState.progress?.currentMap ?? gameState.currentMap ?? 1;

  if (currentMap !== mapNumber) {
    activeEvents = [];
    return;
  }

  // clone & reset
  activeEvents = events.map(ev => ({
    ...ev,
    done: false
  }));
}

/**
 * Called each frame by game.js
 */
export function updateStepEvents() {
  if (!activeEvents.length) return;

  const state = gameState;
  const p = state.player;
  if (!p) return;

  const steps = p.steps ?? 0;

  for (const ev of activeEvents) {
    if (ev.done) continue;

    if (steps >= ev.stepsRequired) {
      ev.action(state);
      ev.done = true;
      break;
    }
  }
}
