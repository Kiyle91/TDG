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

export function isCollisionAt(px, py, opts = {}) {
  const { ignoreBounds = false } = opts;
  if (!collisionLayer) return false;

  if (!ignoreBounds && (px < 0 || py < 0)) return true;

  const tileX = Math.floor(px / tileSize);
  const tileY = Math.floor(py / tileSize);

  if (
    tileX < 0 || tileY < 0 ||
    tileX >= collisionLayer.width ||
    tileY >= collisionLayer.height
  ) {
    return ignoreBounds ? false : true;
  }

  const idx = tileY * collisionLayer.width + tileX;
  return collisionLayer.data[idx] !== 0;
}

// ------------------------------------------------------------
// 📦 Check if a rectangle (player feet/body) hits collision
// ------------------------------------------------------------

export function isRectBlocked(x, y, w, h, opts = {}) {
  const points = [
    { x,          y },
    { x: x + w,   y },
    { x,          y: y + h },
    { x: x + w,   y: y + h },
    { x: x + w/2, y: y + h },
  ];
  return points.some(p => isCollisionAt(p.x, p.y, opts));
}

// ------------------------------------------------------------
// Sliding helper: axis-separated move with collision respect
// ------------------------------------------------------------
export function slideRect(x, y, w, h, dx, dy, opts = {}) {
  let nx = x + dx;
  let ny = y + dy;

  const blockedX = isRectBlocked(nx, y, w, h, opts);
  const blockedY = isRectBlocked(x, ny, w, h, opts);

  if (!blockedX && !blockedY) {
    return { x: nx, y: ny, blocked: false };
  }

  if (!blockedX && blockedY) {
    return { x: nx, y, blocked: false };
  }

  if (blockedX && !blockedY) {
    return { x, y: ny, blocked: false };
  }

  // Both axes blocked: attempt small lateral sidestep to escape tight corners
  const sidestep = [
    { x: x + dx, y },      // try X only
    { x, y: y + dy },      // try Y only
    { x: x + Math.sign(dx) * w * 0.3, y }, // small nudge along X
    { x, y: y + Math.sign(dy) * h * 0.3 }, // small nudge along Y
  ];

  for (const p of sidestep) {
    if (!isRectBlocked(p.x, p.y, w, h, opts)) {
      return { x: p.x, y: p.y, blocked: false };
    }
  }

  return { x, y, blocked: true };
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
