// ============================================================
// 🎵 soundtrack.js — Olivia’s World: Crystal Keep (Extended SFX)
// ============================================================
/* ------------------------------------------------------------
 * MODULE: soundtrack.js
 * PURPOSE:
 *   Central audio hub for Olivia’s World: Crystal Keep.
 *   Manages background music, global SFX volume, and all
 *   one-shot sound effects used across the game.
 *
 * SUMMARY:
 *   • initMusic() — safe user-gesture unlock + BGM loop
 *   • setMusicVolume(), setSfxVolume() — global volume control
 *   • playSfx(path) — universal one-shot SFX
 *   • Named helpers: Fairy, Chest, Combat, Goblin, Ogre, Pegasus
 *
 * AUDIO POLICY:
 *   • Music must be unlocked by first user gesture (browser rule)
 *   • All SFX respect global SFX volume
 *   • Every SFX is a standalone Audio instance to avoid overlap issues
 *
 * NOTES:
 *   • Uses power curve on SFX volume for smoother low-volume behaviour
 *   • All assets live under ./assets/sounds/
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// 🪂 MODULE-LEVEL VARIABLES
// ------------------------------------------------------------

let musicAudio = null;
let sfxVolume = 0.8;
let musicUnlocked = false;
const sfxPool = new Map();
const POOL_SIZE = 6;

// ------------------------------------------------------------
// 🌸 Initialize background music (gesture-unlocked)
// ------------------------------------------------------------

export function initMusic() {
  if (musicAudio) return;

  musicAudio = new Audio("./assets/sounds/soundtrack.mp3");
  musicAudio.loop = true;
  musicAudio.volume = 0.8;

  const unlockAudio = () => {
    if (musicUnlocked) return;
    musicUnlocked = true;

    musicAudio.play().catch(err => {
      console.warn("🎵 Music still locked:", err);
    });

    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
  };

  document.addEventListener("click", unlockAudio, { once: true });
  document.addEventListener("touchstart", unlockAudio, { once: true });
}

// ------------------------------------------------------------
// 🎚️ Volume Controls
// ------------------------------------------------------------

export function setMusicVolume(value) {
  if (musicAudio) musicAudio.volume = value;
}

export function setSfxVolume(value) {
  // Clamp 0–1
  sfxVolume = Math.max(0, Math.min(1, value));
}

// ------------------------------------------------------------
// 💥 Universal one-shot SFX helper
// ------------------------------------------------------------

export function playSfx(path) {
  if (!musicUnlocked) return;       // block until user unlocks

  let pool = sfxPool.get(path);
  if (!pool) {
    pool = [];
    sfxPool.set(path, pool);
  }

  let sfx = pool.find(a => a.__idle);
  if (!sfx) {
    if (pool.length >= POOL_SIZE) {
      // Reuse the oldest if we hit the cap
      sfx = pool.shift();
    } else {
      sfx = new Audio(path);
      sfx.__idle = true;
      pool.push(sfx);
    }
  }

  sfx.__idle = false;
  sfx.currentTime = 0;
  sfx.volume = Math.pow(sfxVolume, 0.7);  // smoother curve
  sfx.onended = () => { sfx.__idle = true; };
  sfx.play().catch(() => { sfx.__idle = true; });
}

// ------------------------------------------------------------
// 🧚‍♀️ Fairy Sparkle Menu / Alert SFX
// ------------------------------------------------------------

const fairySparklePath = "./assets/sounds/fairy-sparkle.mp3";
export function playFairySprinkle() {
  playSfx(fairySparklePath);
}

// ------------------------------------------------------------
// 💰 Chest Opening
// ------------------------------------------------------------

const chestOpenPath = "./assets/sounds/chest-open.mp3";
export function playChestOpen() {
  playSfx(chestOpenPath);
}

// ------------------------------------------------------------
// 🚫 Cancel Button
// ------------------------------------------------------------

const cancelButtonPath = "./assets/sounds/cancel-button.mp3";
export function playCancelSound() {
  playSfx(cancelButtonPath);
}

// ------------------------------------------------------------
// ⚔️ Combat SFX
// ------------------------------------------------------------

const meleePath = "./assets/sounds/melee_swing.mp3";
const arrowPath = "./assets/sounds/arrow_swish.mp3";
const spellPath = "./assets/sounds/spell_cast.mp3";

export function playMeleeSwing() { playSfx(meleePath); }
export function playArrowSwish() { playSfx(arrowPath); }
export function playSpellCast()  { playSfx(spellPath); }

// ------------------------------------------------------------
// 👺 Goblin SFX
// ------------------------------------------------------------

const goblinAttackPath = "./assets/sounds/goblin_attack.mp3";
const goblinDeathPath  = "./assets/sounds/goblin_death.mp3";
const goblinDamagePath = "./assets/sounds/goblin_damage.mp3";

export function playGoblinAttack() { playSfx(goblinAttackPath); }
export function playGoblinDeath()  { playSfx(goblinDeathPath); }
export function playGoblinDamage() { playSfx(goblinDamagePath); }

// ------------------------------------------------------------
// 👹 Ogre SFX
// ------------------------------------------------------------

const ogreEnterPath  = "./assets/sounds/ogre_enter.mp3";
const ogreAttackPath = "./assets/sounds/ogre_attack.mp3";
const ogreSlainPath  = "./assets/sounds/ogre_slain.mp3";

export function playOgreEnter()  { playSfx(ogreEnterPath); }
export function playOgreAttack() { playSfx(ogreAttackPath); }
export function playOgreSlain()  { playSfx(ogreSlainPath); }

// ------------------------------------------------------------
// 🕊️ Pegasus Spawn (summon chime)
// ------------------------------------------------------------

const pegasusSpawnPath = "./assets/sounds/pegasus.mp3";
export function playPegasusSpawn() {
  playSfx(pegasusSpawnPath);
}

// ------------------------------------------------------------
// 🛑 Stop Music
// ------------------------------------------------------------
export function stopMusic() {
  if (musicAudio) {
    musicAudio.pause();
    musicAudio.currentTime = 0;
  }
}

// ------------------------------------------------------------
// ❤️ Player Damage SFX
// ------------------------------------------------------------

const playerDamagePath = "./assets/sounds/player_damage.mp3";
export function playPlayerDamage() {
  playSfx(playerDamagePath);
}

// ------------------------------------------------------------
// 🟣 Seraphine (Boss) SFX
// ------------------------------------------------------------

const seraphineSpawnPath = "./assets/sounds/seraphine.mp3";
export function playSeraphineSpawn() {
  playSfx(seraphineSpawnPath);
}

// ------------------------------------------------------------
// 🐺 Worg SFX
// ------------------------------------------------------------

// Use a distinct clip so it doesn't overlap the goblin death sound.
const worgDeathPath = "./assets/sounds/worg.mp3";
export function playWorgDeath() {
  playSfx(worgDeathPath);
}

// ------------------------------------------------------------
// 💎 Crystal Echo Pickup
// ------------------------------------------------------------

const echoCollectPath = "./assets/sounds/echoes.mp3";
export function playEchoCollect() {
  playSfx(echoCollectPath);
}

// ------------------------------------------------------------
// 🔥 Bravery Charge SFX
// ------------------------------------------------------------

const braveryChargePath = "./assets/sounds/bravery.mp3";
export function playBraveryCharge() {
  playSfx(braveryChargePath);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
