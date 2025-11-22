// ============================================================
// 🗺️ map.js — Olivia’s World: Crystal Keep (Multi-Map Loader)
// ------------------------------------------------------------
// ✦ Loads map_1.json → map_9.json automatically
// ✦ Supports TSX + JSON tilesets
// ✦ Extracts polyline “path” object for enemy movement
// ✦ Layered draw (ground/trees/all)
// ✦ Collision + Crystal Echo integration
// ============================================================
/* ------------------------------------------------------------
 * MODULE: map.js
 * PURPOSE:
 *   Loads, parses, and renders all Tiled JSON maps used in the
 *   game (map_one.json → map_nine.json), including tilesets,
 *   collision data, draw layers, paths for enemy movement, and
 *   collectible Crystal Echo positions.
 *
 * SUMMARY:
 *   This module handles all map-related loading: Tileset TSX/XML
 *   parsing, JSON map parsing, tile-layer rendering, path
 *   extraction, collision grid initialization, and layered
 *   rendering groups (ground / trees / all). It is the primary
 *   source of map dimensions and pathing data for enemies.
 *
 * FEATURES:
 *   • loadMap() — fetches correct map JSON, loads tilesets,
 *     initializes collision + crystal echoes
 *   • drawMap() — draws all tile layers visible in viewport
 *   • drawMapLayered() — filtered draw (ground / trees)
 *   • extractPathFromMap() — builds goblin/walk polyline path
 *   • getMapPixelSize() — returns map width/height in pixels
 *   • extractCrystalEchoes() — returns map-defined echo points
 *
 * TECHNICAL NOTES:
 *   • Supports external TSX tilesets (XML parsing)
 *   • Supports embedded JSON tilesets
 *   • Compatible with Tiled’s infinite/finite maps and layers
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------ 

import { TILE_SIZE, GRID_COLS, GRID_ROWS } from "../utils/constants.js";
import { initCollision } from "../utils/mapCollision.js";
import { gameState } from "../utils/gameState.js";
import { initCrystalEchoes } from "../core/crystalEchoes.js";


// ------------------------------------------------------------
// 🗺️ MODULE-LEVEL VARIABLES
// ------------------------------------------------------------

let mapData = null;
let layers = [];
let tilesets = [];
let mapPixelWidth = GRID_COLS * TILE_SIZE;
let mapPixelHeight = GRID_ROWS * TILE_SIZE;
let pathPoints = [];

// ------------------------------------------------------------
// 🔗 RELATIVE PATH RESOLUTION
// ------------------------------------------------------------
function resolveRelative(pathFromMap) {
  return pathFromMap.replace(/^..\//, "./");
}

// ------------------------------------------------------------
// 📦 LOAD TSX TILESET (XML)
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
// 🗺️ LOAD MAP JSON + TILESETS
// ------------------------------------------------------------

export async function loadMap() {
  const id = gameState.progress?.currentMap || 1;

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

  // 1️⃣ Load map JSON
  const res = await fetch(`./data/${mapFile}`);
  if (!res.ok) {
    throw new Error(`Map file not found: ${mapFile}`);
  }

  mapData = await res.json();
  layers = mapData.layers || [];

  // 2️⃣ Collision
  initCollision(mapData, TILE_SIZE);

  // 3️⃣ Map dimensions
  mapPixelWidth = (mapData.width || GRID_COLS) * TILE_SIZE;
  mapPixelHeight = (mapData.height || GRID_ROWS) * TILE_SIZE;

  // 4️⃣ Tilesets
  tilesets = [];
  for (const ts of mapData.tilesets) {
    if (ts.source) {
      const parsed = await loadTSX(resolveRelative(ts.source));
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

  // 5️⃣ Crystal Echoes
  initCrystalEchoes(mapData);
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
// 🎨 DRAW MAP (All tile layers)
// ------------------------------------------------------------

export function drawMap(ctx, cameraX, cameraY, viewportWidth, viewportHeight) {
  if (!mapData) return;

  const startCol = Math.floor(cameraX / TILE_SIZE);
  const endCol = Math.min(mapData.width - 1,
    Math.floor((cameraX + viewportWidth) / TILE_SIZE)
  );

  const startRow = Math.floor(cameraY / TILE_SIZE);
  const endRow = Math.min(mapData.height - 1,
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

        ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

// ------------------------------------------------------------
// 🛣️ EXTRACT ENEMY PATH (Polyline layer "path")
// ------------------------------------------------------------

export function extractPathFromMap() {
  if (!mapData) return [];

  const pathLayer = layers.find(
    (l) => l.type === "objectgroup" && l.name.toLowerCase() === "path"
  );
  if (!pathLayer) return [];

  const obj = pathLayer.objects.find((o) => o.polyline);
  if (!obj?.polyline) return [];

  pathPoints = obj.polyline.map((p) => ({
    x: obj.x + p.x,
    y: obj.y + p.y,
  }));

  return pathPoints;
}

// ------------------------------------------------------------
// 📏 MAP PIXEL SIZE
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
// 🪄 FILTERED LAYER RENDERER (ground/trees/all)
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
  const endCol = Math.min(mapData.width - 1,
    Math.floor((cameraX + viewportWidth) / TILE_SIZE)
  );

  const startRow = Math.floor(cameraY / TILE_SIZE);
  const endRow = Math.min(mapData.height - 1,
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

        ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

// ------------------------------------------------------------
// 💎 EXTRACT CRYSTAL ECHO POSITIONS (object layer "CrystalEchoes")
// ------------------------------------------------------------
   
export function extractCrystalEchoes() {
  if (!mapData) return [];

  const layer = mapData.layers.find(l => l.name === "CrystalEchoes");
  if (!layer || !Array.isArray(layer.objects)) return [];

  return layer.objects.map(obj => ({
    x: obj.x,
    y: obj.y,
    type: obj.type || "crystal"
  }));
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
