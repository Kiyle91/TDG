// ============================================================
// 🎵 soundtrack.js — Olivia’s World: Crystal Keep (Extended SFX)
// ------------------------------------------------------------
// ✦ Handles background music and sound effects volume
// ✦ Waits for first click/tap to unlock audio context
// ✦ Includes Fairy Sparkle, Chest Open, Cancel, and Combat SFX
// ============================================================

let musicAudio = null;
let sfxVolume = 0.8;
let musicUnlocked = false;

// ------------------------------------------------------------
// 🌸 Initialize background music (safe, user-triggered)
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
  sfxVolume = Math.max(0, Math.min(1, value));
}

// ------------------------------------------------------------
// 💥 Generic One-Shot SFX (safe play after unlock)
// ------------------------------------------------------------
export function playSfx(path) {
  if (!musicUnlocked) return;
  const sfx = new Audio(path);
  sfx.volume = Math.pow(sfxVolume, 0.7);
  sfx.play().catch(() => {});
}

// ------------------------------------------------------------
// 🧚‍♀️ Fairy Sparkle Menu / Alert SFX
// ------------------------------------------------------------
const fairySparklePath = "./assets/sounds/fairy-sparkle.mp3";
export function playFairySprinkle() {
  playSfx(fairySparklePath);
}

// ------------------------------------------------------------
// 💰 Chest Opening SFX
// ------------------------------------------------------------
const chestOpenPath = "./assets/sounds/chest-open.mp3";
export function playChestOpen() {
  playSfx(chestOpenPath);
}

// ------------------------------------------------------------
// 🚫 Cancel / No Button SFX
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
// 💥 Goblin Attack SFX
// ------------------------------------------------------------
const goblinAttackPath = "./assets/sounds/goblin_attack.mp3";
export function playGoblinAttack() {
  playSfx(goblinAttackPath);
}

// ------------------------------------------------------------
// 💀 Goblin Death SFX
// ------------------------------------------------------------
const goblinDeathPath = "./assets/sounds/goblin_death.mp3";
export function playGoblinDeath() {
  playSfx(goblinDeathPath);
}

// ------------------------------------------------------------
// ❤️ Player Damage SFX
// ------------------------------------------------------------
const playerDamagePath = "./assets/sounds/player_damage.mp3";
export function playPlayerDamage() {
  playSfx(playerDamagePath);
}

// ------------------------------------------------------------
// 💢 Goblin Damage (when hit, not killed)
// ------------------------------------------------------------
const goblinDamagePath = "./assets/sounds/goblin_damage.mp3";
export function playGoblinDamage() {
  playSfx(goblinDamagePath);
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

// ============================================================
// 🌟 END OF FILE
// ============================================================
