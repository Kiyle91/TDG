// ============================================================
// enemySpeech.js - Random Enemy Flavour Dialogue (Expanded)
// ------------------------------------------------------------
// - Each enemy type now has 15 personality lines
// - Still low chance to speak (unchanged logic)
// - Lines reinforce map/world lore without breaking tone
// ============================================================

import { spawnSpeechBubble } from "../../fx/speechBubble.js";

// -------------------------------------------
// Dialogue pools (15 lines each)
// -------------------------------------------

const ENEMY_LINES = {
  goblin: [
    "Gonna get ya!",
    "Shiny! Give it!",
    "You can't run forever!",
    "Stab stab stab!",
    "Mine! Mine! Mine!",

    // Added lines
    "Get back here!",
    "The chief wants your stuff!",
    "Goblins rule! You drool!",
    "So much shiny everywhere!",
    "Feet hurt! Still chasing!",
    "You look squishy!",
    "This place ours now!",
    "Heeheehee—chaos time!",
    "Watch me trip! (Don’t laugh!)",
    "Give us crystals or else!"
  ],

  emberGoblin: [
    "Feel the burn!",
    "Hot enough for ya!?",
    "I'll roast ya alive!",
    "Burn! Burn!",
    "Fire solves everything!",

    // Added lines
    "Everything’s better crispy!",
    "Flame tribe rise!",
    "Hot hot hot hot HOT!",
    "Your shoes look flammable!",
    "Fire makes me faster!",
    "Ember chief says charge!",
    "Smoke in your eyes yet?",
    "This land belongs to the flame!",
    "I’m basically a torch!",
    "Hope you like sizzle!"
  ],

  iceGoblin: [
    "Freeze where you stand!",
    "Cold enough?",
    "Shiver for me!",
    "Ice bite incoming!",
    "Brrr... heh heh heh!",

    // Added lines
    "Snow in your boots yet?",
    "Cold tribe marches!",
    "Your nose looks freezing!",
    "Ice makes everything better!",
    "Slip! Slip! Slip!",
    "Stay frosty!",
    "I’m not shivering—you’re shivering!",
    "Frozen toes don’t stop us!",
    "Crystal ice tastes yummy!",
    "Snowball to the FACE!"
  ],

  ashGoblin: [
    "Ashes to ashes!",
    "Rise again!",
    "We endure forever!",
    "The dust remembers!",
    "Mend and rise!",

    // Added lines
    "Dust heals all wounds!",
    "Ritual begins!",
    "Stand still! We’re helping!",
    "Glowing dust… don’t breathe it in!",
    "Heal the tribe!",
    "Light burns us! Stay close!",
    "Ash tribe protect!",
    "The rites demand victory!",
    "We glow in the dark!",
    "Our dust watches you!"
  ],

  voidGoblin: [
    "The void hungers...",
    "Silence your light...",
    "You are unmade...",
    "Collapse into void...",
    "We are infinite...",

    // Added lines
    "Your shape… bends wrong.",
    "Spire cannot see us.",
    "The shadows call your name.",
    "Light breaks here.",
    "We walk unseen.",
    "Nothingness whispers.",
    "Your fear tastes bright.",
    "The void sighs for home.",
    "Your spark is fragile.",
    "This land remembers darkness."
  ],

  troll: [
    "SMASH!!",
    "Crunch time!",
    "Troll hungry!",
    "Little human squish!",
    "This gonna hurt!",

    // Added lines
    "Troll strongest!",
    "Move or squish!",
    "Troll tired of walking!",
    "Where is snack?!",
    "You tiny. Troll big.",
    "Stomp stomp stomp!",
    "Road too small for troll!",
    "Troll protect tribe!",
    "Spires taste bad!",
    "Heavy club coming through!"
  ],

  elite: [
    "Hunt begins.",
    "You are prey.",
    "For the tribe!",
    "Swift and silent.",
    "Your fear smells sweet.",

    // Added lines
    "We track you.",
    "You cannot hide.",
    "The wind guides us.",
    "Strong prey. Good.",
    "Our arrows fly true.",
    "The hunt sharpens us.",
    "Your path ends here.",
    "The tribe watches.",
    "Move well… or fall.",
    "We strike without miss."
  ],

  crossbow: [
    "Take aim!",
    "Straight through!",
    "Bullseye!",
    "Don't blink.",
    "One shot, one drop.",

    // Added lines
    "Reload—fast!",
    "Crossbow troll best troll!",
    "Hold still! Makes aiming easier!",
    "Twang! Heehee!",
    "Long range means no walking!",
    "Troll’s got a bow! FEAR ME!",
    "Spires can't hide from arrows!",
    "Aim for shiny thing!",
    "Got you lined up!",
    "Arrow storm incoming!"
  ]
};

// -------------------------------------------
// Attempt hit reaction speech
// -------------------------------------------

export function tryEnemyHitSpeech(e) {
  if (!e || !e.alive) return;
  const lines = ENEMY_HIT_LINES[e.type];
  if (!lines) return;

  const now = performance.now();
  if (now < enemyHitSpeechActiveUntil) return;
  if (e._nextHitSpeech && now < e._nextHitSpeech) return;
  if (Math.random() > HIT_SPEECH_CHANCE) return;

  const line = lines[Math.floor(Math.random() * lines.length)];

  spawnSpeechBubble(
    line,
    e.x,
    e.y - 70,
    HIT_SPEECH_DURATION,
    e,
    { category: "enemy-hit", clearExisting: false }
  );

  enemyHitSpeechActiveUntil = now + HIT_SPEECH_DURATION;
  e._nextHitSpeech = now + HIT_COOLDOWN_MS;
}

// -------------------------------------------
// CONFIG (unchanged)
// -------------------------------------------

const SPEECH_CHANCE = 0.00025;
const COOLDOWN_MS = 8000;
const SPEECH_DURATION = 5000;
let enemySpeechActiveUntil = 0;

// Hit reactions: short, rare barks when enemies take damage
const HIT_SPEECH_CHANCE = 0.06;
const HIT_COOLDOWN_MS = 2500;
const HIT_SPEECH_DURATION = 2800;
let enemyHitSpeechActiveUntil = 0;

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

  if (Math.random() > SPEECH_CHANCE) return;

  const lines = ENEMY_LINES[type];
  const line = lines[Math.floor(Math.random() * lines.length)];

  spawnSpeechBubble(
    line,
    e.x,
    e.y - 70,
    SPEECH_DURATION,
    e,
    { category: "enemy", clearExisting: false }
  );

  enemySpeechActiveUntil = now + SPEECH_DURATION;
  e._nextSpeechTime = now + COOLDOWN_MS;
}

const ENEMY_HIT_LINES = {
  goblin: [
    "Ow! Watch it!",
    "Hey! That hurt!",
    "Oof—my ribs!",
    "Stop poking me!",
    "Unfair hit!",
    "Ow ow ow!",
    "You’re mean!",
    "That one stung!",
    "Gonna tell the chief!",
    "My shiny spot!"
  ],

  emberGoblin: [
    "Hot—HEY!",
    "Ow! I'm burning ME now!",
    "That smarts!",
    "Quit it!",
    "Hey! Careful with that!",
    "Sparks in my eyes!",
    "Ow ow—fire bad?!",
    "Heat… wobbling…",
    "You hit ember tribe!",
    "I’ll roast you for that!"
  ],

  iceGoblin: [
    "Cold cracks!",
    "Ouch! Frost bruise!",
    "Ow! That’s not cool!",
    "My ice is chipped!",
    "Hey! No melting me!",
    "Brittle spot—HEY!",
    "Shiver—OW!",
    "My toes!!",
    "You’re warming me!",
    "Snowballs don’t hurt THAT much!"
  ],

  ashGoblin: [
    "Dust spills!",
    "The rites feel that!",
    "Healing! Healing!—Ow!",
    "Careful with the relics!",
    "That shook my dust!",
    "Agh—focus fading!",
    "The ashes tremble!",
    "My glow! You dimmed it!",
    "We endure… mostly!",
    "Dust not invincible!"
  ],

  voidGoblin: [
    "Reality… bends… OUCH.",
    "The void recoils!",
    "You fracture our shape!",
    "Light burns…",
    "You distort the shadow!",
    "Pain… interesting.",
    "That stings across timelines.",
    "Your spark cuts deep…",
    "The emptiness shakes.",
    "Fragments… slipping…"
  ],

  troll: [
    "OW! That hurt!",
    "Who hit troll?!",
    "Stop poking troll!",
    "Troll bruise now!",
    "Mean tiny human!",
    "That sting! BAD!",
    "OWW! No fair!",
    "Troll not like that!",
    "Hey! Troll sensitive!",
    "OW! Shoulder hurts!"
  ],

  elite: [
    "Hrr—solid hit.",
    "Good strike.",
    "I felt that.",
    "You’re skilled.",
    "Sharp pain… noted.",
    "You cut deep.",
    "Good form!",
    "Strike landed.",
    "Swift… but not enough.",
    "The hunt tests me."
  ],

  crossbow: [
    "Ow—bow slip!",
    "HEY! Watch the aim!",
    "My fingers!!",
    "That shook the bolt pouch!",
    "Unfair—range fighter!",
    "Oof—reload interrupted!",
    "Stop jostling troll archer!",
    "Arrow spilled everywhere!",
    "OW! My bow hand!",
    "Twang—ouch!"
  ]
};
