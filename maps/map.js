// ============================================================
// map.js — Map loading, rendering, and caching (FULL FIX)
// ============================================================

import { TILE_SIZE, GRID_COLS, GRID_ROWS } from "../utils/constants.js";
import { initCollision } from "../utils/mapCollision.js";
import { gameState } from "../utils/gameState.js";
import { initCrystalEchoes } from "../core/crystalEchoes.js";

// ------------------------------------------------------------
// Module state
// ------------------------------------------------------------

let mapData = null;
let layers = [];
let tilesets = [];
let mapPixelWidth = GRID_COLS * TILE_SIZE;
let mapPixelHeight = GRID_ROWS * TILE_SIZE;
let pathPoints = [];
let tilesetCache = new Map();
const EMPTY_PRE_RENDER = {
  all: null,
  ground: null,
  groundLayer: null,
  road: null,
  props: null,
  propsTwo: null,
  trees: null,
  clouds: null,
};
let preRenderedLayers = { ...EMPTY_PRE_RENDER };
const mapCache = new Map();

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function createOffscreenCanvas(width, height) {
  const canvas = typeof OffscreenCanvas !== "undefined"
    ? new OffscreenCanvas(width, height)
    : document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function resolveRelative(pathFromMap) {
  return pathFromMap.replace(/^..\//, "./");
}

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

// Layer grouping driven by explicit Tiled layer names so we can
// render each layer independently and preserve the authored order.
const LAYER_GROUPS = {
  groundLayer: ["ground layer"],
  road: ["road"],
  props: ["props"],
  propsTwo: ["props two"],
  ground: ["ground layer", "road", "props", "props two"],
  trees: ["trees"],
  clouds: ["clouds"],
};

// Ordered draw list matching the Tiled stack (bottom -> top) for tile layers
const LAYER_DRAW_SEQUENCE = [
  "groundLayer",
  "road",
  "props",
  "propsTwo",
  "trees",
  "clouds",
];

const FLIP_H = 0x80000000;
const FLIP_V = 0x40000000;
const FLIP_D = 0x20000000;
const FLIP_R = 0x10000000; // reserved/hex flag, still mask out
const FLIP_MASK = FLIP_H | FLIP_V | FLIP_D | FLIP_R;

function isCollisionLayer(layer) {
  const n = layer?.name?.toLowerCase?.() || "";
  return n === "collision";
}

function getLayersForGroup(group = "all") {
  if (!Array.isArray(layers)) return [];

  const allVisibleLayers = layers.filter(
    (l) => l && l.type === "tilelayer" && l.visible === true
  );

  // "all" = every visible layer except collision, honoring map order
  if (group === "all") {
    return allVisibleLayers.filter((l) => !isCollisionLayer(l));
  }

  const targets = LAYER_GROUPS[group];
  if (!targets) {
    return allVisibleLayers.filter((l) => !isCollisionLayer(l));
  }

  const wanted = new Set(targets.map((n) => n.toLowerCase()));

  // Preserve map draw order while picking only the requested layers
  return allVisibleLayers.filter((l) => wanted.has(l.name?.toLowerCase?.() || ""));
}

function drawFromPreRendered(ctx, group, cameraX, cameraY, viewportWidth, viewportHeight) {
  const pre = ensurePreRendered(group);
  if (!pre || !ctx) return false;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    pre,
    cameraX,
    cameraY,
    viewportWidth,
    viewportHeight,
    0,
    0,
    viewportWidth,
    viewportHeight
  );
  return true;
}

function decodeGid(rawGid) {
  return {
    gid: rawGid & ~FLIP_MASK,
    flipH: (rawGid & FLIP_H) !== 0,
    flipV: (rawGid & FLIP_V) !== 0,
    flipD: (rawGid & FLIP_D) !== 0,
  };
}

// Canvas transform that matches Tiled's flip/diagonal flags
// Matrix approach mirrors Tiled documentation for orthogonal maps
function drawTile(ctx, ts, sx, sy, dx, dy, flipFlags) {
  const { flipH, flipV, flipD } = flipFlags;

  let a = 1, b = 0, c = 0, d = 1;
  let tx = dx;
  let ty = dy;

  // Diagonal flag swaps axes (90deg CW) before H/V are applied
  if (flipD) {
    a = 0; b = 1;
    c = 1; d = 0;
    ty += TILE_SIZE;
  }

  // Horizontal flip
  if (flipH) {
    a = -a; c = -c;
    tx += TILE_SIZE;
  }

  // Vertical flip
  if (flipV) {
    b = -b; d = -d;
    ty += TILE_SIZE;
  }

  ctx.save();
  ctx.setTransform(a, b, c, d, tx, ty);
  ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
  ctx.restore();
}

function drawLayersDirect(ctx, targetLayers, cameraX, cameraY, viewportWidth, viewportHeight) {
  if (!mapData || !ctx || !targetLayers || targetLayers.length === 0) return;

  // Add buffer to prevent edge artifacts
  const bufferTiles = 1;
  
  const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE) - bufferTiles);
  const endCol = Math.min(
    mapData.width - 1,
    Math.floor((cameraX + viewportWidth) / TILE_SIZE) + bufferTiles
  );

  const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE) - bufferTiles);
  const endRow = Math.min(
    mapData.height - 1,
    Math.floor((cameraY + viewportHeight) / TILE_SIZE) + bufferTiles
  );

  ctx.imageSmoothingEnabled = false;

  for (const layer of targetLayers) {
    // Safety checks
    if (!layer || layer.type !== "tilelayer" || layer.visible !== true) continue;
    if (!layer.data || !Array.isArray(layer.data)) continue;

    const data = layer.data;
    const width = layer.width || mapData.width;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const idx = row * width + col;
        
        if (idx < 0 || idx >= data.length) continue;
        
        const rawGid = data[idx];
        if (!rawGid || rawGid === 0) continue;

        const { gid, flipH, flipV, flipD } = decodeGid(rawGid);
        if (!gid || gid === 0) continue;

        const ts = getTilesetForGid(gid);
        if (!ts || !ts.image) continue;

        const localId = gid - ts.firstgid;
        const sx = (localId % ts.columns) * TILE_SIZE;
        const sy = Math.floor(localId / ts.columns) * TILE_SIZE;

        const dx = col * TILE_SIZE - cameraX;
        const dy = row * TILE_SIZE - cameraY;

        drawTile(ctx, ts, sx, sy, dx, dy, { flipH, flipV, flipD });
      }
    }
  }
}

function ensurePreRendered(group = "all") {
  if (!mapData) return null;
  if (preRenderedLayers[group]) return preRenderedLayers[group];

  const canvas = createOffscreenCanvas(mapPixelWidth, mapPixelHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;

  const targetLayers = getLayersForGroup(group);
  
  console.log(`🎨 Rendering ${group} group with ${targetLayers.length} layers:`);
  
  for (const layer of targetLayers) {
    // Only render visible tile layers
    if (!layer || layer.type !== "tilelayer" || layer.visible !== true) continue;
    if (!layer.data || !Array.isArray(layer.data)) continue;

    const data = layer.data;
    const width = layer.width || mapData.width;
    const height = layer.height || mapData.height;
    
    let tilesDrawn = 0;

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = row * width + col;
        
        if (idx < 0 || idx >= data.length) continue;
        
        const rawGid = data[idx];
        if (!rawGid || rawGid === 0) continue;

        const { gid, flipH, flipV, flipD } = decodeGid(rawGid);
        if (!gid || gid === 0) continue;

        const ts = getTilesetForGid(gid);
        if (!ts || !ts.image) {
          console.warn(`⚠️ No tileset found for GID ${gid} in layer "${layer.name}"`);
          continue;
        }

        const localId = gid - ts.firstgid;
        const sx = (localId % ts.columns) * TILE_SIZE;
        const sy = Math.floor(localId / ts.columns) * TILE_SIZE;

        const dx = col * TILE_SIZE;
        const dy = row * TILE_SIZE;

        drawTile(ctx, ts, sx, sy, dx, dy, { flipH, flipV, flipD });
        tilesDrawn++;
      }
    }
    
    console.log(`  ✓ "${layer.name}": Drew ${tilesDrawn} tiles`);
  }

  preRenderedLayers[group] = canvas;
  return canvas;
}

// ------------------------------------------------------------
// Load map JSON + tilesets
// ------------------------------------------------------------

export async function loadMap(mode = "runtime") {
  const id = gameState.progress?.currentMap || 1;

  const cached = mapCache.get(id);
  if (cached) {
    mapData = cached.mapData;
    layers = cached.layers;
    tilesets = cached.tilesets;
    mapPixelWidth = cached.mapPixelWidth;
    mapPixelHeight = cached.mapPixelHeight;
    tilesetCache = cached.tilesetCache;
    preRenderedLayers = { ...EMPTY_PRE_RENDER, ...cached.preRenderedLayers };
    pathPoints = [];
    return;
  }

  // Clear caches on new map
  tilesetCache.clear();
  preRenderedLayers = { ...EMPTY_PRE_RENDER };
  pathPoints = [];

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

  const res = await fetch(`./data/${mapFile}`);
  if (!res.ok) {
    throw new Error(`Map file not found: ${mapFile}`);
  }

  mapData = await res.json();
  layers = mapData.layers || [];

  // 🔍 DEBUG: Log all layers to verify what's loaded
  console.log("📋 All layers in map:");
  layers.forEach((layer, i) => {
    if (layer.type === "tilelayer") {
      console.log(`  ${i}: "${layer.name}" - visible: ${layer.visible}, type: ${layer.type}`);
    }
  });

  console.log("\n🌿 Ground layers:", getLayersForGroup("ground").map(l => l.name));
  console.log("🌲 Tree layers:", getLayersForGroup("trees").map(l => l.name));
  console.log("☁️ Cloud layers:", getLayersForGroup("clouds").map(l => l.name));

  initCollision(mapData, TILE_SIZE);

  mapPixelWidth = (mapData.width || GRID_COLS) * TILE_SIZE;
  mapPixelHeight = (mapData.height || GRID_ROWS) * TILE_SIZE;

  tilesets = await Promise.all(
    mapData.tilesets.map(async (ts) => {
      if (ts.source) {
        const parsed = await loadTSX(resolveRelative(ts.source));
        return {
          firstgid: ts.firstgid,
          columns: parsed.columns,
          image: parsed.image,
          imageWidth: parsed.imageWidth,
          imageHeight: parsed.imageHeight,
        };
      }

      const image = new Image();
      image.src = resolveRelative(ts.image);
      await new Promise((r) => (image.onload = r));
      return {
        firstgid: ts.firstgid,
        columns: ts.columns,
        image,
        imageWidth: ts.imagewidth,
        imageHeight: ts.imageheight,
      };
    })
  );

  initCrystalEchoes(mapData);

  // Pre-render each named layer plus the legacy combined groups
  console.log("🎨 Pre-rendering layers...");
  const groupsToPreRender = [...LAYER_DRAW_SEQUENCE, "ground", "all"];
  groupsToPreRender.forEach((g) => ensurePreRendered(g));
  console.log("✅ Pre-rendering complete!");

  mapCache.set(id, {
    mapData,
    layers,
    tilesets,
    mapPixelWidth,
    mapPixelHeight,
    tilesetCache: new Map(tilesetCache),
    preRenderedLayers: { ...preRenderedLayers },
  });
}

// ------------------------------------------------------------
// Tileset lookup
// ------------------------------------------------------------

function getTilesetForGid(gid) {
  const normalized = gid & ~FLIP_MASK;

  if (tilesetCache.has(normalized)) {
    return tilesetCache.get(normalized);
  }

  let chosen = null;
  for (const ts of tilesets) {
    if (normalized >= ts.firstgid) chosen = ts;
  }

  tilesetCache.set(normalized, chosen);
  return chosen;
}

// ------------------------------------------------------------
// Draw map (all layers)
// ------------------------------------------------------------

export function drawMap(ctx, cameraX, cameraY, viewportWidth, viewportHeight) {
  if (!mapData || !ctx) return;
  
  if (drawFromPreRendered(ctx, "all", cameraX, cameraY, viewportWidth, viewportHeight)) {
    return;
  }

  drawLayersDirect(ctx, getLayersForGroup("all"), cameraX, cameraY, viewportWidth, viewportHeight);
}

// ------------------------------------------------------------
// Filtered layer renderer (ground/trees/all)
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

  if (drawFromPreRendered(ctx, group, cameraX, cameraY, viewportWidth, viewportHeight)) {
    return;
  }

  const targetLayers = getLayersForGroup(group);
  drawLayersDirect(ctx, targetLayers, cameraX, cameraY, viewportWidth, viewportHeight);
}

// ------------------------------------------------------------
// Extract ALL enemy paths from map
// ------------------------------------------------------------
export function extractPathsFromMap() {
  if (!mapData) return [];

  const pathLayer = layers.find(
    (l) => l.type === "objectgroup" && l.name.toLowerCase() === "paths"
  );
  if (!pathLayer) return [];

  const allPaths = [];

  for (const obj of pathLayer.objects) {
    if (!obj.polyline) continue;

    const pts = obj.polyline.map((p) => ({
      x: obj.x + p.x,
      y: obj.y + p.y,
    }));

    allPaths.push(pts);
  }

  return allPaths;
}

export function getMapPixelSize() {
  return { width: mapPixelWidth, height: mapPixelHeight };
}

export function getPathPoints() {
  return pathPoints;
}

// ------------------------------------------------------------
// Extract Crystal Echo positions
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

export function getAllPaths() {
  return extractPathsFromMap();
}

// ============================================================
// END OF FILE
// ============================================================
