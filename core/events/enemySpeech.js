// ============================================================
// enemySpeech.js - Random Enemy Flavour Dialogue
// ------------------------------------------------------------
// - Each enemy type has 5 personality lines
// - Small chance to speak every few seconds
// - Uses speechBubble FX for rendering
// ============================================================
import { spawnSpeechBubble } from "../../fx/speechBubble.js";

// -------------------------------------------
// Dialogue pools
// -------------------------------------------

const ENEMY_LINES = {
  goblin: [
    "Gonna get ya!",
    "Shiny! Give it!",
    "You can't run forever!",
    "Stab stab stab!",
    "Mine! Mine! Mine!"
  ],

  emberGoblin: [
    "Feel the burn!",
    "Hot enough for ya!?",
    "I'll roast ya alive!",
    "Burn! Burn!",
    "Fire solves everything!"
  ],

  iceGoblin: [
    "Freeze where you stand!",
    "Cold enough?",
    "Shiver for me!",
    "Ice bite incoming!",
    "Brrr... heh heh heh!"
  ],

  ashGoblin: [
    "Ashes to ashes!",
    "Rise again!",
    "We endure forever!",
    "The dust remembers!",
    "Mend and rise!"
  ],

  voidGoblin: [
    "The void hungers...",
    "Silence your light...",
    "You are unmade...",
    "Collapse into void...",
    "We are infinite..."
  ],

  troll: [
    "SMASH!!",
    "Crunch time!",
    "Troll hungry!",
    "Little human squish!",
    "This gonna hurt!"
  ],

  elite: [
    "Hunt begins.",
    "You are prey.",
    "For the tribe!",
    "Swift and silent.",
    "Your fear smells sweet."
  ],

  crossbow: [
    "Take aim!",
    "Straight through!",
    "Bullseye!",
    "Don't blink.",
    "One shot, one drop."
  ]
};


// -------------------------------------------
// CONFIG
// -------------------------------------------

// 1 in 800 chance per update tick (~1.3%/sec at 60fps)
const SPEECH_CHANCE = 0.00025;

// Enemy cooldown so each one doesn't spam
const COOLDOWN_MS = 8000;

// Keep only one enemy speech alive at a time; others wait their turn
const SPEECH_DURATION = 5000;
let enemySpeechActiveUntil = 0;


// -------------------------------------------
// Attempt speech for one enemy
// -------------------------------------------

export function tryEnemySpeech(e) {
  if (!e || !e.alive) return;

  const type = e.type;
  if (!ENEMY_LINES[type]) return;

  const now = performance.now();
  if (now < enemySpeechActiveUntil) return;
  if (e._nextSpeechTime && now < e._nextSpeechTime) return;

  // Random trigger
  if (Math.random() > SPEECH_CHANCE) return;

  // Pick a random line
  const lines = ENEMY_LINES[type];
  const line = lines[Math.floor(Math.random() * lines.length)];

  spawnSpeechBubble(
    line,
    e.x,
    e.y - 70,
    SPEECH_DURATION,    // fade duration
    e,                  // anchor to THIS enemy
    { category: "enemy", clearExisting: false } // keep other speakers intact
  );

  // Block other enemy speech until this one finishes
  enemySpeechActiveUntil = now + SPEECH_DURATION;

  // Set cooldown on the enemy itself
  e._nextSpeechTime = now + COOLDOWN_MS;
}
