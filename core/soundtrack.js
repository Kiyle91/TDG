// ============================================================
// 🎵 soundtrack.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles background music and sound effects volume
// ✦ Waits for first click/tap to unlock audio context
// ✦ Includes Fairy Sparkle, Chest Open, and Cancel SFX
// ============================================================

let musicAudio = null;
let sfxVolume = 0.8;
let musicUnlocked = false;

// ------------------------------------------------------------
// 🌸 Initialize background music (safe, user-triggered)
// ------------------------------------------------------------
export function initMusic() {
  if (musicAudio) return; // already initialized

  musicAudio = new Audio("./assets/sounds/soundtrack.mp3");
  musicAudio.loop = true;
  musicAudio.volume = 0.8;

  // Wait until user interacts before playback
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
// 🎚️ Volume Controls (linked to settings.js sliders)
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
  if (!musicUnlocked) return; // prevents blocked play
  const sfx = new Audio(path);
  sfx.volume = Math.pow(sfxVolume, 0.7);
  sfx.play().catch(() => {});
}

// ------------------------------------------------------------
// 🧚‍♀️ Fairy Sparkle Menu / Alert SFX
// ------------------------------------------------------------
const fairySparklePath = "./assets/sounds/fairy-sparkle.mp3";

export function playFairySprinkle() {
  if (!musicUnlocked) return;
  const sparkle = new Audio(fairySparklePath);
  sparkle.volume = Math.pow(sfxVolume, 0.7);
  sparkle.play().catch(() => {});
}

// ------------------------------------------------------------
// 💰 Chest Opening SFX
// ------------------------------------------------------------
const chestOpenPath = "./assets/sounds/chest-open.mp3";

export function playChestOpen() {
  if (!musicUnlocked) return;
  const chest = new Audio(chestOpenPath);
  chest.volume = Math.pow(sfxVolume, 0.7);
  chest.play().catch(() => {});
}

// ------------------------------------------------------------
// 🚫 Cancel / No Button SFX
// ------------------------------------------------------------
const cancelButtonPath = "./assets/sounds/cancel-button.mp3";

export function playCancelSound() {
  if (!musicUnlocked) return;
  const cancel = new Audio(cancelButtonPath);
  cancel.volume = Math.pow(sfxVolume, 0.7);
  cancel.play().catch(() => {});
}

// ------------------------------------------------------------
// 🛑 Stop Music (optional helper)
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
