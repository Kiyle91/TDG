// ============================================================
// 🌸 screens.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Centralized screen visibility management
// ✦ Ensures only one screen is visible at any time
// ✦ Works with .active class for consistency
// ============================================================

export function showScreen(id) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((s) => {
    s.classList.remove("active");
    s.style.display = "none";
  });

  const next = document.getElementById(id);
  if (next) {
    next.classList.add("active");
    next.style.display = "flex";
    next.style.opacity = 0;
    next.style.transition = "opacity 0.8s ease";
    requestAnimationFrame(() => (next.style.opacity = 1));
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
