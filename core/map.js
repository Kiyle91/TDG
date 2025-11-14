// ============================================================
// 🗺️ map.js — Olivia’s World: Crystal Keep (Multi-Map Loader)
// ------------------------------------------------------------
// ✦ Loads data/map_one.json or data/map_two.json dynamically
// ✦ Resolves external .tsx tilesets
// ✦ Draws visible area for current viewport
// ✦ Extracts enemy path polyline from Tiled "path" layer
// ✦ Supports group-filtered drawMapLayered()
// ============================================================

import { TILE_SIZE, GRID_COLS, GRID_ROWS } from "../utils/constants.js";
import { initCollision } from "../utils/mapCollision.js";
import { gameState } from "../utils/gameState.js";

let mapData = null;
let layers = [];
let tilesets = [];
let mapPixelWidth = GRID_COLS * TILE_SIZE;
let mapPixelHeight = GRID_ROWS * TILE_SIZE;
let pathPoints = [];

// ------------------------------------------------------------
// 🔗 PATH UTILITIES
// ------------------------------------------------------------
function resolveRelative(pathFromMap) {
  // convert "../" to "./" so assets load correctly
  return pathFromMap.replace(/^..\//, "./");
}

// ------------------------------------------------------------
// 📦 LOAD TSX FILE (external tileset XML)
// ------------------------------------------------------------
async function loadTSX(tsxUrl) {
  const res = await fetch(tsxUrl);
  const xml = await res.text();

  const columns = parseInt(xml.match(/columns="(\d+)"/)?.[1] || "0", 10);
  const imageSrc = xml.match(/<image[^>]*source="([^"]+)"/)?.[1] || "";
  const iw = parseInt(xml.match(/<image[^>]*width="(\d+)"/)?.[1] || "0", 10);
  const ih = parseInt(xml.match(/<image[^>]*height="(\d+)"/)?.[1] || "0", 10);

  const base = tsxUrl.substring(0, tsxUrl.lastIndexOf("/") + 1);
  const pngUrl = base + imageSrc;

  const image = new Image();
  image.src = pngUrl;
  await new Promise((r) => (image.onload = r));

  return { columns, image, imageWidth: iw, imageHeight: ih };
}

// ------------------------------------------------------------
// 🌷 LOAD MAP (supports Map 1 + Map 2)
// ------------------------------------------------------------
export async function loadMap() {
  // 1️⃣ Choose correct map based on profile progress
  let id = gameState.progress?.currentMap || 1;
  let mapFile = "map_one.json";

  if (id === 2) mapFile = "map_two.json";

  console.log(`🗺️ Loading map ID ${id} → ${mapFile}`);

  // 2️⃣ Load the JSON file
  const res = await fetch(`./data/${mapFile}`);
  mapData = await res.json();
  layers = mapData.layers || [];

  // 3️⃣ Collision layer
  initCollision(mapData, TILE_SIZE);

  // 4️⃣ Pixel dimensions
  mapPixelWidth = (mapData.width || GRID_COLS) * TILE_SIZE;
  mapPixelHeight = (mapData.height || GRID_ROWS) * TILE_SIZE;

  // 5️⃣ Load tilesets (TSX or inline PNG)
  tilesets = [];

  for (const ts of mapData.tilesets) {
    if (ts.source) {
      // TSX tileset
      const tsxUrl = resolveRelative(ts.source);
      const parsed = await loadTSX(tsxUrl);
      tilesets.push({
        firstgid: ts.firstgid,
        columns: parsed.columns,
        image: parsed.image,
        imageWidth: parsed.imageWidth,
        imageHeight: parsed.imageHeight,
      });
    } else {
      // JSON-included tileset
      const image = new Image();
      image.src = resolveRelative(ts.image);
      await new Promise((r) => (image.onload = r));

      tilesets.push({
        firstgid: ts.firstgid,
        columns: ts.columns,
        image,
        imageWidth: ts.imagewidth,
        imageHeight: ts.imageheight,
      });
    }
  }

  console.log(
    `✅ Loaded ${mapFile} — ${mapData.width}×${mapData.height} tiles @ ${TILE_SIZE}px`
  );
}

// ------------------------------------------------------------
// 🔍 FIND TILESET FOR GID
// ------------------------------------------------------------
function getTilesetForGid(gid) {
  let chosen = null;
  for (const ts of tilesets) {
    if (gid >= ts.firstgid) chosen = ts;
  }
  return chosen;
}

// ------------------------------------------------------------
// 🎨 DRAW MAP (all tile layers)
// ------------------------------------------------------------
export function drawMap(ctx, cameraX, cameraY, viewportWidth, viewportHeight) {
  if (!mapData) return;

  const startCol = Math.floor(cameraX / TILE_SIZE);
  const endCol = Math.min(
    mapData.width - 1,
    Math.floor((cameraX + viewportWidth) / TILE_SIZE)
  );

  const startRow = Math.floor(cameraY / TILE_SIZE);
  const endRow = Math.min(
    mapData.height - 1,
    Math.floor((cameraY + viewportHeight) / TILE_SIZE)
  );

  ctx.imageSmoothingEnabled = false;

  for (const layer of layers) {
    if (!layer.visible || layer.type !== "tilelayer") continue;
    const data = layer.data;
    const width = layer.width;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const idx = row * width + col;
        const gid = data[idx];
        if (!gid) continue;

        const ts = getTilesetForGid(gid);
        if (!ts) continue;

        const localId = gid - ts.firstgid;
        const sx = (localId % ts.columns) * TILE_SIZE;
        const sy = Math.floor(localId / ts.columns) * TILE_SIZE;
        const dx = col * TILE_SIZE - cameraX;
        const dy = row * TILE_SIZE - cameraY;

        ctx.drawImage(
          ts.image,
          sx,
          sy,
          TILE_SIZE,
          TILE_SIZE,
          dx,
          dy,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }
  }
}

// ------------------------------------------------------------
// 🛣️ EXTRACT PATH (Polyline Layer "path")
// ------------------------------------------------------------
export function extractPathFromMap() {
  if (!mapData) {
    console.warn("⚠️ Map not loaded — cannot extract path");
    return [];
  }

  const pathLayer = layers.find(
    (l) => l.type === "objectgroup" && l.name.toLowerCase() === "path"
  );
  if (!pathLayer) {
    console.warn("⚠️ No 'path' layer found in map JSON");
    return [];
  }

  const obj = pathLayer.objects.find((o) => o.polyline);
  if (!obj || !obj.polyline) {
    console.warn("⚠️ No polyline object found in path layer");
    return [];
  }

  pathPoints = obj.polyline.map((p) => ({
    x: obj.x + p.x,
    y: obj.y + p.y,
  }));

  console.log(`✅ Extracted ${pathPoints.length} path points from map`);
  return pathPoints;
}

// ------------------------------------------------------------
// 📏 SIZE HELPER
// ------------------------------------------------------------
export function getMapPixelSize() {
  return { width: mapPixelWidth, height: mapPixelHeight };
}

// ------------------------------------------------------------
// 🧭 PATH GETTER
// ------------------------------------------------------------
export function getPathPoints() {
  return pathPoints;
}

// ------------------------------------------------------------
// 🪄 drawMapLayered — safe filtered rendering
// ------------------------------------------------------------
export function drawMapLayered(
  ctx,
  group = "all",
  cameraX = 0,
  cameraY = 0,
  viewportWidth = 1920,
  viewportHeight = 1080
) {
  if (!mapData || !ctx) return;

  const startCol = Math.floor(cameraX / TILE_SIZE);
  const endCol = Math.min(
    mapData.width - 1,
    Math.floor((cameraX + viewportWidth) / TILE_SIZE)
  );

  const startRow = Math.floor(cameraY / TILE_SIZE);
  const endRow = Math.min(
    mapData.height - 1,
    Math.floor((cameraY + viewportHeight) / TILE_SIZE)
  );

  ctx.imageSmoothingEnabled = false;

  // Filter by group keyword
  let filteredLayers = layers;
  if (group === "ground") {
    filteredLayers = layers.filter((l) => {
      const n = l.name.toLowerCase();
      return n.includes("ground") || n.includes("base") || n.includes("floor");
    });
  } else if (group === "trees") {
    filteredLayers = layers.filter((l) => {
      const n = l.name.toLowerCase();
      return n.includes("tree") || n.includes("foliage") || n.includes("above");
    });
  }

  for (const layer of filteredLayers) {
    if (!layer.visible || layer.type !== "tilelayer") continue;

    const data = layer.data;
    const width = layer.width;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const idx = row * width + col;
        const gid = data[idx];
        if (!gid) continue;

        const ts = getTilesetForGid(gid);
        if (!ts) continue;

        const localId = gid - ts.firstgid;
        const sx = (localId % ts.columns) * TILE_SIZE;
        const sy = Math.floor(localId / ts.columns) * TILE_SIZE;
        const dx = col * TILE_SIZE - cameraX;
        const dy = row * TILE_SIZE - cameraY;

        ctx.drawImage(
          ts.image,
          sx,
          sy,
          TILE_SIZE,
          TILE_SIZE,
          dx,
          dy,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
