// ============================================================
// ✨ sparkles.js — Lightweight Sparkle Field Generator
// ------------------------------------------------------------
// Creates and animates random sparkles for any .magic-sparkle div
// Instant on load, reusable across screens
// ============================================================

export function initSparkles() {
  document.querySelectorAll(".magic-sparkle").forEach((container) => {
    const count = 80; // ✨ how many sparkles per screen
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement("div");
      sparkle.classList.add("magic-particle");

      // Random position
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.left = `${Math.random() * 100}%`;

      // Random size
      const size = 6 + Math.random() * 8;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;

      // Random animation timing
      sparkle.style.animationDuration = `${12 + Math.random() * 10}s`;
      sparkle.style.animationDelay = `${Math.random() * 2}s`;

      container.appendChild(sparkle);
    }
  });
  console.log("✨ Sparkles initialized on all screens");
}
