// ============================================================
// 🧱 mapCollision.js — Tile-based Collision for Tiled
// ------------------------------------------------------------
// ✦ Parses "collision" tilelayer from Tiled JSON
// ✦ Helpers: initCollision, isCollisionAt, isRectBlocked
// ✦ Fully silent (no console logs)
// ============================================================

// ------------------------------------------------------------
// 🗺️ Module-level variables
// ------------------------------------------------------------ 

let collisionLayer = null;
let tileSize = 32;

// ------------------------------------------------------------
// 🌿 Initialize with full Tiled map JSON
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
// ⛔ Check if a pixel position is inside a blocking tile
// ------------------------------------------------------------

export function isCollisionAt(px, py) {
  if (!collisionLayer) return false;

  if (px < 0 || py < 0) return true; 

  const tileX = Math.floor(px / tileSize);
  const tileY = Math.floor(py / tileSize);

  if (
    tileX < 0 || tileY < 0 ||
    tileX >= collisionLayer.width ||
    tileY >= collisionLayer.height
  ) {
    return true;
  }

  const idx = tileY * collisionLayer.width + tileX;
  return collisionLayer.data[idx] !== 0;
}

// ------------------------------------------------------------
// 📦 Check if a rectangle (player feet/body) hits collision
// ------------------------------------------------------------

export function isRectBlocked(x, y, w, h) {
  const points = [
    { x,          y },
    { x: x + w,   y },
    { x,          y: y + h },
    { x: x + w,   y: y + h },
    { x: x + w/2, y: y + h }, 
  ];
  return points.some(p => isCollisionAt(p.x, p.y));
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
