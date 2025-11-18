// ============================================================
// 🗺️ map.js — Olivia’s World: Crystal Keep (Multi-Map Loader)
// ------------------------------------------------------------
// ✦ Automatically loads map_1.json → map_9.json
// ✦ Supports TSX tilesets + JSON tilesets
// ✦ Extracts "path" polyline for goblin movement
// ✦ Handles collision layer + layered draw
// ✦ Fully compatible with all engine systems
// ============================================================

import { TILE_SIZE, GRID_COLS, GRID_ROWS } from "../utils/constants.js";
import { initCollision } from "../utils/mapCollision.js";
import { gameState } from "../utils/gameState.js";
import { initCrystalEchoes } from "./crystalEchoes.js";

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

export async function loadMap() {
  // Current map ID from gameState
  let id = gameState.progress?.currentMap || 1;

  // File name mapping to match your actual files
  const fileMap = {
    1: "map_one.json",
    2: "map_two.json",
    3: "map_three.json",
    4: "map_four.json",
    5: "map_five.json",
    6: "map_six.json",
    7: "map_seven.json",
    8: "map_eight.json",
    9: "map_nine.json",
  };

  const mapFile = fileMap[id] || "map_one.json";

  console.log(`🗺️ Loading map ID ${id} → ${mapFile}`);

  // ===========================
  // 1️⃣ Load map JSON
  // ===========================
  const res = await fetch(`./data/${mapFile}`);
  if (!res.ok) {
    console.error(`❌ Failed to load map file: ${mapFile}`);
    throw new Error(`Map file not found: ${mapFile}`);
  }

  mapData = await res.json();
  layers = mapData.layers || [];

  // ===========================
  // 2️⃣ Init collision
  // ===========================
  initCollision(mapData, TILE_SIZE);

  // ===========================
  // 3️⃣ Set pixel size
  // ===========================
  mapPixelWidth = (mapData.width || GRID_COLS) * TILE_SIZE;
  mapPixelHeight = (mapData.height || GRID_ROWS) * TILE_SIZE;

  // ===========================
  // 4️⃣ Load tilesets
  // ===========================
  tilesets = [];

  for (const ts of mapData.tilesets) {
    if (ts.source) {
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

  // ===========================
  // ⭐ 5️⃣ Init Crystal Echoes
  // ===========================
  initCrystalEchoes(mapData);

  console.log(`✅ Loaded ${mapFile} — ${mapData.width}×${mapData.height} tiles`);
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

export function extractCrystalEchoes() {
  if (!mapData) {
    console.warn("⚠️ extractCrystalEchoes(): mapData is not set yet.");
    return [];
  }

  const layer = mapData.layers.find(l => l.name === "CrystalEchoes");
  if (!layer || !Array.isArray(layer.objects)) {
    return [];
  }

  return layer.objects.map(obj => ({
    x: obj.x,
    y: obj.y,
    type: obj.type || "crystal"
  }));
}