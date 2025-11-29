// ============================================================
// 🏹 ranged.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Silver Bolt launcher with STAT-BASED multi-arrow perks
// ============================================================

import { updateHUD } from "../screenManagement/ui.js";
import { playArrowSwish } from "../core/soundtrack.js";
import { spawnArrow } from "./arrow.js";

// Damage multiplier
const DMG_RANGED = 0.9;

// Mana cost
const COST_RANGED = 2;

// ------------------------------------------------------------
// 🎯 PERFORM RANGED ATTACK
// ------------------------------------------------------------
export function performRanged(player, e, canvasRef) {
  if (!player || !canvasRef) return { ok: false };

  // Mana check
  if (player.mana < COST_RANGED) {
    return { ok: false, reason: "mana" };
  }

  // Spend mana
  player.mana -= COST_RANGED;
  updateHUD();

  // Damage
  const dmg = Math.max(1, (Number(player.rangedAttack) || 0) * DMG_RANGED);

  // Mouse → world coords
  const rect = canvasRef.getBoundingClientRect();
  const scaleX = window.canvasScaleX || (canvasRef.width / rect.width);
  const scaleY = window.canvasScaleY || (canvasRef.height / rect.height);

  const canvasX = (e.clientX - rect.left) * scaleX;
  const canvasY = (e.clientY - rect.top) * scaleY;

  const worldX = (window.cameraX || 0) + canvasX;
  const worldY = (window.cameraY || 0) + canvasY;

  // Base angle
  const dx = worldX - player.pos.x;
  const dy = worldY - player.pos.y;
  const baseAngle = Math.atan2(dy, dx);

  // ------------------------------------------------------------
  // 🎞 Update player facing
  // ------------------------------------------------------------
  const deg = ((baseAngle * 180) / Math.PI + 360) % 360;
  let facing;

  if (deg >= 330 || deg < 30) facing = "right";
  else if (deg >= 30 && deg < 90) facing = "bottomRight";
  else if (deg >= 90 && deg < 150) facing = "bottomLeft";
  else if (deg >= 150 && deg < 210) facing = "left";
  else if (deg >= 210 && deg < 270) facing = "topLeft";
  else if (deg >= 270 && deg < 330) facing = "topRight";
  else facing = "right";

  player.facing = facing;

  // ------------------------------------------------------------
  // 🏹 STAT-BASED MULTI-ARROW PERKS  (balanced progression)
  // ------------------------------------------------------------
  const stat = Number(player.rangedAttack || 0);
  let arrowCount = 1;

  if (stat >= 210) arrowCount = 9;
  else if (stat >= 160) arrowCount = 7;
  else if (stat >= 110) arrowCount = 5;
  else if (stat >= 60)  arrowCount = 3;

  // ------------------------------------------------------------
  // SINGLE ARROW
  // ------------------------------------------------------------
  if (arrowCount === 1) {
    const startX = player.pos.x + Math.cos(baseAngle) * 30;
    const startY = player.pos.y + Math.sin(baseAngle) * 30;

    spawnArrow(startX, startY, baseAngle, dmg);
    playArrowSwish();
    return { ok: true, facing, angle: baseAngle, dmg, arrows: 1 };
  }

  // ------------------------------------------------------------
  // MULTI-SPREAD ARROWS
  // ------------------------------------------------------------
  const spread = 0.22;
  const half = (arrowCount - 1) / 2;

  for (let i = 0; i < arrowCount; i++) {
    const offset = (i - half) * (spread / half);
    const angle = baseAngle + offset;

    const startX = player.pos.x + Math.cos(angle) * 30;
    const startY = player.pos.y + Math.sin(angle) * 30;

    spawnArrow(startX, startY, angle, dmg);
  }

  playArrowSwish();
  return { ok: true, facing, angle: baseAngle, dmg, arrows: arrowCount };
}
