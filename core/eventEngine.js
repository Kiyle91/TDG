// ============================================================
// 🌟 eventEngine.js — Global Event Core
// Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Responsibilities:
//
// 1) Global Event Bus (Events)
//    • Events.on(name, handler)
//    • Events.off(name, handler)
//    • Events.once(name, handler)
//    • Events.emit(name, payload)
//
// 2) Time-based Map Story Engine
//    • loadTimedEventsForMap(mapNumber, events, options)
//    • updateTimedEvents()  // call once per frame from game.js
//
// NOTE: This module is ENGINE-ONLY. It never touches UI directly.
// Map scripts ( bosses, waves, etc.) use this engine
// to plug in their own behaviours (speech bubbles, overlays, SFX).
// ============================================================

import { gameState } from "../utils/gameState.js";

// ============================================================
// 🔔 1. GLOBAL EVENT BUS
// ============================================================

export const Events = {
  _listeners: Object.create(null),

  /**
   * Register a handler for a given event name.
   * Example:
   *   Events.on("waveStart", ({ wave }) => { ... });
   */
  on(eventName, callback) {
    if (!eventName || typeof callback !== "function") return;
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(callback);
  },

  /**
   * Remove a previously registered handler.
   */
  off(eventName, callback) {
    const list = this._listeners[eventName];
    if (!list) return;
    this._listeners[eventName] = list.filter((cb) => cb !== callback);
  },

  /**
   * Register a handler that runs only once.
   */
  once(eventName, callback) {
    if (!eventName || typeof callback !== "function") return;
    const wrapper = (payload) => {
      this.off(eventName, wrapper);
      callback(payload);
    };
    this.on(eventName, wrapper);
  },

  /**
   * Emit an event with an optional payload.
   * Example:
   *   Events.emit("enemyKilled", { type: "goblin" });
   */
  emit(eventName, payload = {}) {
    const list = this._listeners[eventName];
    if (!list || !list.length) return;
    // Shallow copy in case handlers mutate the list
    for (const cb of [...list]) {
      const targetMap = cb && typeof cb.__mapId === "number"
        ? cb.__mapId
        : null;
      const currentMap =
        gameState.progress?.currentMap ?? gameState.currentMap ?? 1;
      if (targetMap !== null && currentMap !== targetMap) continue;

      try {
        cb(payload);
      } catch (err) {
        // Never let a bad handler crash the game loop
        // eslint-disable-next-line no-console
        console.error("[Events] handler error for", eventName, err);
      }
    }
  }
};

// Optional: centralised event-name hints (purely for consistency)
export const EVENT_NAMES = {
  waveStart: "waveStart",
  waveEnd: "waveEnd",
  enemySpawn: "enemySpawn",
  enemyKilled: "enemyKilled",
  bossSpawn: "bossSpawn",
  bossKilled: "bossKilled",
  bossHpThreshold: "bossHpThreshold",
  bossDefeated: "bossDefeated",
  mapComplete: "mapComplete",
  braveryFull: "braveryFull",
  braveryActivated: "braveryActivated",
  playerLowHP: "playerLowHP",
  playerLifeLost: "playerLifeLost",
  playerLevelUp: "playerLevelUp",
  echoHalf: "echoHalf",
  echoComplete: "echoComplete"
};

// Map-scoped helpers to tag handlers with a mapId
export function mapOn(mapId, eventName, callback) {
  if (typeof callback !== "function") return null;
  const wrapped = (payload) => callback(payload);
  wrapped.__mapId = mapId;
  Events.on(eventName, wrapped);
  return wrapped;
}

export function mapOnce(mapId, eventName, callback) {
  if (typeof callback !== "function") return null;
  const wrapped = (payload) => callback(payload);
  wrapped.__mapId = mapId;
  Events.once(eventName, wrapped);
  return wrapped;
}

// ============================================================
// ⏱️ 2. TIME-BASED MAP STORY ENGINE
// ============================================================
//
// Map scripts export arrays like:
//
// export default [
//   { id: "t_003", timeRequired: 3,  action: (gs) => { ... } },
//   { id: "t_008", timeRequired: 8,  action: (gs) => { ... } },
//   ...
// ];
//
// These are loaded per-map and fired once when
// gameState.elapsedTime >= timeRequired.
// ------------------------------------------------------------

let activeTimedEvents = [];
let timedEventsMapNumber = null;

/**
 * Load time-based events for the current map.
 *
 * @param {number} mapNumber        - Map index (1–9)
 * @param {Array}  events           - [{ id, timeRequired, action }, ...]
 * @param {Object} [options]
 *   - markCompletedUpTo: number    - If provided, marks any events whose
 *                                    timeRequired <= this value as already done.
 */
export function loadTimedEventsForMap(mapNumber, events, options = {}) {
  const currentMap =
    gameState.progress?.currentMap ?? gameState.currentMap ?? 1;

  if (currentMap !== mapNumber || !Array.isArray(events)) {
    activeTimedEvents = [];
    timedEventsMapNumber = null;
    return;
  }

  timedEventsMapNumber = mapNumber;

  // clone & reset
  activeTimedEvents = events.map((ev) => ({
    ...ev,
    done: false
  }));

  const markUpTo = options.markCompletedUpTo;
  if (markUpTo !== undefined && markUpTo !== null) {
    syncTimedEventsToTime(markUpTo);
  }
}

/**
 * Marks any timed events whose threshold is already behind us
 * as completed, so they won't fire again.
 *
 * Useful when continuing from a save where elapsedTime
 * is already > some tutorial/story beats.
 */
export function syncTimedEventsToTime(seconds = 0) {
  if (!activeTimedEvents.length) return;

  const t = Math.max(0, Number(seconds) || 0);

  for (const ev of activeTimedEvents) {
    const threshold = Number(ev.timeRequired) || 0;
    if (t >= threshold) {
      ev.done = true;
    }
  }
}

/**
 * Called once per frame from game.js
 * Evaluates all loaded time-based events for the current map.
 */
export function updateTimedEvents() {
  if (!activeTimedEvents.length) return;

  const t = gameState.elapsedTime ?? 0;
  const gs = gameState;

  for (const ev of activeTimedEvents) {
    if (ev.done) continue;

    const threshold = Number(ev.timeRequired) || 0;
    if (t >= threshold) {
      try {
        if (typeof ev.action === "function") {
          ev.action(gs);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[eventEngine] timed event error:", ev.id, err);
      }
      ev.done = true;
      // We fire only one per frame to avoid huge bursts of dialogue
      break;
    }
  }
}

// ------------------------------------------------------------
// 🕹️ Backwards-compat exports (old step-based API names)
// ------------------------------------------------------------
//
// These keep existing imports working, even though the engine
// is fully time-based now. You can gradually migrate to the
// new names where convenient.
// ------------------------------------------------------------

export const loadStepEventsForMap = loadTimedEventsForMap;
export const syncStepEventsToSteps = syncTimedEventsToTime;
export const updateStepEvents = updateTimedEvents;

// ============================================================
// 🌟 END OF FILE — eventEngine.js
// ============================================================
