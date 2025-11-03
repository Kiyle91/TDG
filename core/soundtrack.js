// ============================================================
// 🎵 soundtrack.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Handles background music and sound effects volume
// ============================================================

let musicAudio = null;
let sfxVolume = 0.8;

// ------------------------------------------------------------
// 🌸 Initialize background music
// ------------------------------------------------------------
export function initMusic() {
  musicAudio = new Audio("./assets/sounds/soundtrack.mp3");
  musicAudio.loop = true;
  musicAudio.volume = 0.8;
  musicAudio.play().catch(err => console.warn("Music autoplay blocked:", err));
}

// ------------------------------------------------------------
// 🎚️ Adjust volumes dynamically
// ------------------------------------------------------------
export function setMusicVolume(value) {
  if (musicAudio) musicAudio.volume = value;
}

export function setSfxVolume(value) {
  sfxVolume = value;
}

// ------------------------------------------------------------
// 💥 Play one-shot SFX (future hook)
// ------------------------------------------------------------
export function playSfx(path) {
  const sfx = new Audio(path);
  sfx.volume = sfxVolume;
  sfx.play();
}
