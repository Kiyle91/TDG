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
    const offsetX = -20; // left offset
    const offsetY = -50; // above cursor
    tooltipEl.style.left = `${e.pageX + offsetX}px`;
    tooltipEl.style.top = `${e.pageY + offsetY}px`;
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
  tooltipEl.style.opacity = 1;
  visible = true;
}

export function hideTooltip() {
  if (!tooltipEl) return;
  tooltipEl.style.opacity = 0;
  visible = false;
  setTimeout(() => {
    tooltipEl.style.display = "none";
  }, 250);
}
