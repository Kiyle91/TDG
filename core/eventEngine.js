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
export function loadStepEventsForMap(mapNumber, events, options = {}) {
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

  const markUpTo = options.markCompletedUpTo;
  if (markUpTo !== undefined && markUpTo !== null) {
    syncStepEventsToSteps(markUpTo);
  }
}

export function syncStepEventsToSteps(steps = 0) {
  if (!activeEvents.length) return;

  const s = Math.max(0, Number(steps) || 0);

  for (const ev of activeEvents) {
    const threshold = Number(ev.stepsRequired) || 0;
    const alreadyPassed = s > threshold;
    const reachedNonZero = s === threshold && threshold > 0;
    ev.done = alreadyPassed || reachedNonZero;
  }
}

/**
 * Called each frame by game.js
 */
export function updateStepEvents() {
  if (!activeEvents.length) return;

  const t = gameState.elapsedTime ?? 0;

  for (const ev of activeEvents) {
    if (ev.done) continue;

    if (t >= ev.timeRequired) {
      if (t >= ev.timeRequired && t - ev.timeRequired < 1) {
        ev.action(gameState);
        ev.done = true;
        break;
      }  
    }
  }
}
