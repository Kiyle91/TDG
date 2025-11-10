// ============================================================
// 💬 tooltip.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Pastel crystal tooltip with hover delay + cursor offset
// ✦ Appears 0.7s after hover, tracks cursor smoothly
// ✦ Respects Settings toggle (tooltipsEnabled)
// ============================================================

import { getTooltipSetting } from "./settings.js";

let tooltipEl = null;
let hoverTimer = null;
let visible = false;
let currentTarget = null;

// ------------------------------------------------------------
// 🌸 Initialize tooltip element (once)
// ------------------------------------------------------------
export function initTooltipSystem() {
  if (tooltipEl) return;

  tooltipEl = document.createElement("div");
  tooltipEl.classList.add("tooltip-box");
  tooltipEl.style.display = "none";
  document.body.appendChild(tooltipEl);

  // Track cursor globally for smooth follow
  document.addEventListener("mousemove", (e) => {
    if (!visible) return;
    const offsetX = 12;
    const offsetY = -24;

    // 🩵 Use clientX/clientY for fixed-position tracking
    tooltipEl.style.left = `${e.clientX + offsetX}px`;
    tooltipEl.style.top = `${e.clientY + offsetY}px`;
  });



  console.log("💫 Tooltip system initialized");
}

// ------------------------------------------------------------
// 💎 Smart hover-based tooltip (delayed activation)
// ------------------------------------------------------------
export function attachTooltip(element, text, delay = 700) {
  if (!element) return;

  element.addEventListener("mouseenter", () => {
    if (!getTooltipSetting()) return;

    clearTimeout(hoverTimer);
    currentTarget = element;

    // wait before showing tooltip
    hoverTimer = setTimeout(() => {
      if (currentTarget === element) {
        showTooltip(text);
      }
    }, delay);
  });

  element.addEventListener("mouseleave", () => {
    currentTarget = null;
    clearTimeout(hoverTimer);
    hideTooltip();
  });
}

// ------------------------------------------------------------
// 💬 Manual show / hide (for compatibility)
// ------------------------------------------------------------
export function showTooltip(text) {
  if (!getTooltipSetting()) return;
  if (!tooltipEl) initTooltipSystem();

  tooltipEl.textContent = text;
  tooltipEl.style.display = "block";

  requestAnimationFrame(() => {
    tooltipEl.style.opacity = 1;
    tooltipEl.style.transform = "scale(1)";
  });

  visible = true;
}

export function hideTooltip() {
  if (!tooltipEl) return;

  tooltipEl.style.opacity = 0;
  tooltipEl.style.transform = "scale(0.95)";

  visible = false;
  setTimeout(() => {
    if (!visible) tooltipEl.style.display = "none";
  }, 250);
}

// ============================================================
// 💎 Fixed Tooltip Box Controls
// ============================================================

export function showFixedTooltip(text, duration = 4000) {
  const box = document.getElementById("tooltip-box-fixed");
  const textEl = document.getElementById("tooltip-fixed-text");
  if (!box || !textEl) return;

  textEl.textContent = text;
  box.classList.remove("hidden");
  requestAnimationFrame(() => box.classList.add("visible"));

  if (duration > 0) {
    setTimeout(() => hideFixedTooltip(), duration);
  }
}

export function hideFixedTooltip() {
  const box = document.getElementById("tooltip-box-fixed");
  if (!box) return;
  box.classList.remove("visible");
  setTimeout(() => box.classList.add("hidden"), 500);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================