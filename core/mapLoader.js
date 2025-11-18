// ============================================================
// 🧱 mapCollision.js — Tile-based Collision for Tiled
// ------------------------------------------------------------
// ✦ Parses "collision" tilelayer from Tiled JSON
// ✦ Provides map-wide collision helpers
// ✦ Used by player + enemy movement systems
// ============================================================
/* ------------------------------------------------------------
 * MODULE: mapCollision.js
 * PURPOSE:
 *   Supplies collision detection helpers for Tiled-based maps.
 *   This module parses the “collision” tilelayer from Tiled
 *   (JSON format) and exposes simple functions to test whether
 *   a pixel or rectangle intersects blocking tiles.
 *
 * SUMMARY:
 *   After a map is loaded, initCollision() is called with the
 *   JSON data. This module then stores the collision grid and
 *   tile size. The helper functions isCollisionAt() and
 *   isRectBlocked() are used by movement systems (player,
 *   enemies, projectiles) to prevent movement into blocked areas.
 *
 * FEATURES:
 *   • initCollision(mapData, tileSize)
 *   • isCollisionAt(px, py)
 *   • isRectBlocked(x, y, w, h)
 *
 * TECHNICAL NOTES:
 *   • Out-of-bounds is treated as blocking (safety-first)
 *   • Collision layer must be a Tiled “tilelayer” named
 *     “Collision” (case-insensitive)
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// 🗺️ MODULE-LEVEL VARIABLES
// ------------------------------------------------------------ 

let collisionLayer = null; 
let tileSize = 32;

// ------------------------------------------------------------
// 🌿 INITIALISE COLLISION FROM TILED MAP JSON
// ------------------------------------------------------------

export function initCollision(mapData, providedTileSize = 32) {
  tileSize = providedTileSize;
  collisionLayer = null;

  if (!mapData || !mapData.layers) return;

  collisionLayer = mapData.layers.find(
    (l) => l.type === "tilelayer" && l.name.toLowerCase() === "collision"
  );
}

// ------------------------------------------------------------
// ⛔ CHECK A SINGLE PIXEL AGAINST COLLISION GRID
// ------------------------------------------------------------

export function isCollisionAt(px, py) {
  if (!collisionLayer) return false;

  if (px < 0 || py < 0) return true;

  const tileX = Math.floor(px / tileSize);
  const tileY = Math.floor(py / tileSize);

  if (
    tileX < 0 ||
    tileY < 0 ||
    tileX >= collisionLayer.width ||
    tileY >= collisionLayer.height
  ) {
    return true;
  }

  const idx = tileY * collisionLayer.width + tileX;
  return collisionLayer.data[idx] !== 0;
}

// ------------------------------------------------------------
// 📦 CHECK A RECTANGLE (PLAYER FEET, ENEMY HITBOXES)
// ------------------------------------------------------------

export function isRectBlocked(x, y, w, h) {
  const points = [
    { x,         y },
    { x: x + w,  y },
    { x,         y: y + h },
    { x: x + w,  y: y + h },
    { x: x + w / 2, y: y + h }, // center-bottom (feet)
  ];

  return points.some((p) => isCollisionAt(p.x, p.y));
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
