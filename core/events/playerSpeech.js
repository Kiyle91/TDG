// ============================================================
// playerSpeech.js — Player Dialogue (Spire Placement & Upgrades)
// ------------------------------------------------------------
// Provides short, personality-driven lines when the player
// places or upgrades a Spire. Low chance, cooldown-limited,
// and uses the same speech bubble system as enemies.
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

// -----------------------------------------------------------
// Dialogue pools
// -----------------------------------------------------------

export const PLAYER_LINES = {
  place: {
    fire: [
      "Burn bright, Flameheart!",
      "Heat it up!",
      "Let the flames guide us!",
      "Ignite the battlefield!",
      "Flameheart, stand with me!"
    ],
    ice: [
      "Freeze their charge!",
      "Let frost protect us!",
      "Cool and calm—perfect.",
      "Winter’s breath, hold them!",
      "Ice Spire, steady our ground!"
    ],
    light: [
      "Shine for me, Light Spire!",
      "Let purity scatter them!",
      "Light the way!",
      "Illuminate our path!",
      "Light Spire, protect us!"
    ],
    moon: [
      "Moonlight, guide our defense!",
      "Stun them still!",
      "Nightfall, help us here!",
      "Moon Spire ready!",
      "Stars above—aid me!"
    ],
    arcane: [
      "Arcane Spire deployed!",
      "Nothing hides from this one!",
      "Eyes sharp, Arcane guardian!",
      "Scry them out!",
      "Let the arcane reveal all!"
    ],
    default: [
      "Spire set!",
      "Right where we need it!",
      "Stand strong, little Spire!",
      "Let’s hold this ground!",
      "Guardians, help me!"
    ]
  },

  upgrade: {
    fire: [
      "Flameheart—burn hotter!",
      "Turn up the heat!",
      "Inferno rising!",
      "Stronger fire, stronger defense!",
      "Let’s scorch them back!"
    ],
    ice: [
      "Colder and sharper!",
      "Freeze even deeper!",
      "Winter grows stronger!",
      "Chill their advance!",
      "Frost reinforced!"
    ],
    light: [
      "Shine brighter!",
      "Light grows stronger!",
      "Purify the battlefield!",
      "Bless this upgrade!",
      "Radiance increased!"
    ],
    moon: [
      "Starlight intensified!",
      "Stun them harder!",
      "Night magic grows!",
      "Moonlight empowered!",
      "Stars guide this upgrade!"
    ],
    arcane: [
      "Sharper aim!",
      "Arcane power rising!",
      "Targeting enhanced!",
      "No shadow will hide now!",
      "Strike true, Arcane Spire!"
    ],
    default: [
      "Upgraded!",
      "Now we’re talking!",
      "Show them what you can do!",
      "Better already!",
      "More firepower!"
    ]
  }
};

// -----------------------------------------------------------
// Config
// -----------------------------------------------------------

const PLAYER_SPEECH_CHANCE = 0.18;   // ~1 in 5 actions
const PLAYER_COOLDOWN_MS = 1500;     // Prevent spam
const PLAYER_SPEECH_DURATION = 2400;

let playerSpeechActiveUntil = 0;

// -----------------------------------------------------------
// Trigger player speech
// -----------------------------------------------------------

export function tryPlayerSpeech(eventType, player, spireKey = "default") {
  const linesObj = PLAYER_LINES[eventType];
  if (!linesObj || !player) return;

  const key = spireKey || player.lastSpireType || "default";
  const pool = linesObj[key] || linesObj.default;
  if (!pool || !pool.length) return;

  const now = performance.now();

  // Global cooldown
  if (now < playerSpeechActiveUntil) return;

  // Chance roll
  if (Math.random() > PLAYER_SPEECH_CHANCE) return;

  const line = pool[Math.floor(Math.random() * pool.length)];

  spawnSpeechBubble(
    line,
    player.x,
    player.y - 60,
    PLAYER_SPEECH_DURATION,
    player,
    { category: "player", clearExisting: false }
  );

  playerSpeechActiveUntil = now + PLAYER_COOLDOWN_MS;
}
