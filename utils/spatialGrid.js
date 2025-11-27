// Lightweight spatial grid for reducing O(n^2) scans on enemies.
// Build once per frame and reuse across collision, aura, and proximity checks.

export function buildSpatialGrid(entities, cellSize = 128) {
  const grid = new Map();
  const indexMap = new WeakMap();

  if (!Array.isArray(entities)) {
    return { grid, indexMap, cellSize };
  }

  for (let i = 0; i < entities.length; i++) {
    const e = entities[i];
    if (!e || !e.alive || typeof e.x !== "number" || typeof e.y !== "number") continue;
    const cellX = Math.floor(e.x / cellSize);
    const cellY = Math.floor(e.y / cellSize);
    const key = `${cellX},${cellY}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(e);
    indexMap.set(e, i);
  }

  return { grid, indexMap, cellSize };
}

export function getNeighbors(spatial, x, y) {
  const { grid, cellSize } = spatial || {};
  if (!grid || typeof cellSize !== "number") return [];

  const cellX = Math.floor(x / cellSize);
  const cellY = Math.floor(y / cellSize);
  const nearby = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const bucket = grid.get(`${cellX + dx},${cellY + dy}`);
      if (bucket) nearby.push(...bucket);
    }
  }

  return nearby;
}

export function getIndex(spatial, entity) {
  return spatial?.indexMap?.get(entity);
}
