// ============================================================
// ✨ sparkles.js — Lightweight Sparkle Field Generator
// ============================================================
/* ------------------------------------------------------------
 * MODULE: sparkles.js
 * PURPOSE:
 *   Provides a lightweight sparkle-field visual effect for any
 *   element marked with the `.magic-sparkle` class. Designed to
 *   give screens a soft magical ambience without relying on
 *   canvas rendering or heavy animation loops.
 *
 * SUMMARY:
 *   • initSparkles() — scans for all `.magic-sparkle` containers
 *     and populates each with floating particles.
 *
 * DESIGN NOTES:
 *   • Pure DOM/CSS animation (zero JS per-frame)
 *   • Automatically randomizes size, position, duration & delay
 *   • Safe to call multiple times (rebuilds each container once)
 *
 * USED BY:
 *   Landing screen, profile screen, hub overlays, etc.
 * ------------------------------------------------------------ */

export function initSparkles() {
  document.querySelectorAll(".magic-sparkle").forEach(container => {
    const count = 20;

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement("div");
      sparkle.classList.add("magic-particle");

      // Random position within container
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.left = `${Math.random() * 100}%`;

      // Random size
      const size = 12 + Math.random() * 8;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;

      // Random animation timing
      sparkle.style.animationDuration = `${12 + Math.random() * 10}s`;
      sparkle.style.animationDelay = `${Math.random() * 2}s`;

      container.appendChild(sparkle);
    }
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
