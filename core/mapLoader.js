// ============================================================
// 🧱 mapCollision.js — Tile-based Collision for Tiled
// ------------------------------------------------------------
// ✦ Parses "collision" tilelayer from Tiled JSON
// ✦ Helpers: initCollision, isCollisionAt, isRectBlocked
// ============================================================

let collisionLayer = null; // { width, height, data } from Tiled
let tileSize = 32;

// ------------------------------------------------------------
// 🌿 Initialize with full Tiled map JSON
// ------------------------------------------------------------
export function initCollision(mapData, providedTileSize = 32) {
  tileSize = providedTileSize;
  collisionLayer = null;

  if (!mapData || !mapData.layers) {
    console.warn("mapCollision: initCollision called with invalid mapData");
    return;
  }
  collisionLayer = mapData.layers.find(
    (l) => l.type === "tilelayer" && l.name.toLowerCase() === "collision"
  );
  if (!collisionLayer) {
    console.warn('mapCollision: no "collision" tilelayer found — non-blocking.');
  }
}

// ------------------------------------------------------------
// ⛔ Is a pixel position inside a blocking tile?
// ------------------------------------------------------------
export function isCollisionAt(px, py) {
  if (!collisionLayer) return false;

  if (px < 0 || py < 0) return true; // treat out-of-bounds as blocked
  const tileX = Math.floor(px / tileSize);
  const tileY = Math.floor(py / tileSize);

  if (
    tileX < 0 || tileY < 0 ||
    tileX >= collisionLayer.width ||
    tileY >= collisionLayer.height
  ) return true;

  const idx = tileY * collisionLayer.width + tileX;
  return collisionLayer.data[idx] !== 0;
}

// ------------------------------------------------------------
// 📦 Check a small rectangle (player feet) against collision
// ------------------------------------------------------------
export function isRectBlocked(x, y, w, h) {
  // sample 4 corners + center bottom
  const points = [
    { x,           y },
    { x: x + w,    y },
    { x,           y: y + h },
    { x: x + w,    y: y + h },
    { x: x + w/2,  y: y + h } // feet center
  ];
  return points.some(p => isCollisionAt(p.x, p.y));
}

