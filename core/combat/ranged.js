// ============================================================
// 🏹 ranged.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Silver Bolt physical projectile launcher
// Uses arrow.js for movement + collisions
// Clean modular system extracted from playerController
// ============================================================

import { updateHUD } from "../ui.js";
import { playArrowSwish } from "../soundtrack.js";
import { spawnArrow } from "./arrow.js";

// Damage multiplier
const DMG_RANGED = 0.9;

// Mana cost
const COST_RANGED = 2;

// ------------------------------------------------------------
// 🎯 PERFORM RANGED ATTACK (Physical Silver Bolt)
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

  // Damage calculation
  const dmg = Math.max(1, (Number(player.rangedAttack) || 0) * DMG_RANGED);

  // Convert mouse → world coords
  const rect = canvasRef.getBoundingClientRect();
  const scaleX = window.canvasScaleX || (canvasRef.width / rect.width);
  const scaleY = window.canvasScaleY || (canvasRef.height / rect.height);

  const canvasX = (e.clientX - rect.left) * scaleX;
  const canvasY = (e.clientY - rect.top) * scaleY;
  const worldX = (window.cameraX || 0) + canvasX;
  const worldY = (window.cameraY || 0) + canvasY;

  // Compute angle
  const dx = worldX - player.pos.x;
  const dy = worldY - player.pos.y;
  const angle = Math.atan2(dy, dx);

  // ------------------------------------------------------------
  // 🎞 Update facing for player shooting animation
  // ------------------------------------------------------------
  const deg = ((angle * 180) / Math.PI + 360) % 360;
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
  // 🏹 Spawn the physical Silver Bolt
  // ------------------------------------------------------------
  const startX = player.pos.x + Math.cos(angle) * 30;
  const startY = player.pos.y + Math.sin(angle) * 30;

  spawnArrow(startX, startY, angle, dmg);

  // SFX
  playArrowSwish();

  return {
    ok: true,
    facing,
    angle,
    dmg,
    startX,
    startY
  };
}
