// ============================================================
// map.js — Map loading, rendering, and caching
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
let preRenderedLayers = { all: null, ground: null, trees: null };
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

function getLayersForGroup(group = "all") {
  if (!Array.isArray(layers)) return [];

  if (group === "ground") {
    return layers.filter((l) => {
      const n = l.name?.toLowerCase?.() || "";
      return n.includes("ground") || n.includes("base") || n.includes("floor");
    });
  }

  if (group === "trees") {
    return layers.filter((l) => {
      const n = l.name?.toLowerCase?.() || "";
      return n.includes("tree") || n.includes("foliage") || n.includes("above");
    });
  }

  return layers;
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

function drawLayersDirect(ctx, targetLayers, cameraX, cameraY, viewportWidth, viewportHeight) {
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

  for (const layer of targetLayers) {
    if (!layer?.visible || layer.type !== "tilelayer") continue;

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

function ensurePreRendered(group = "all") {
  if (!mapData) return null;
  if (preRenderedLayers[group]) return preRenderedLayers[group];

  const canvas = createOffscreenCanvas(mapPixelWidth, mapPixelHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;

  const targetLayers = getLayersForGroup(group);
  for (const layer of targetLayers) {
    if (!layer?.visible || layer.type !== "tilelayer") continue;

    const data = layer.data;
    const width = layer.width;
    const height = layer.height;

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = row * width + col;
        const gid = data[idx];
        if (!gid) continue;

        const ts = getTilesetForGid(gid);
        if (!ts) continue;

        const localId = gid - ts.firstgid;
        const sx = (localId % ts.columns) * TILE_SIZE;
        const sy = Math.floor(localId / ts.columns) * TILE_SIZE;

        const dx = col * TILE_SIZE;
        const dy = row * TILE_SIZE;

        ctx.drawImage(ts.image, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy, TILE_SIZE, TILE_SIZE);
      }
    }
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
    preRenderedLayers = cached.preRenderedLayers;
    pathPoints = [];
    return;
  }

  tilesetCache = new Map();
  preRenderedLayers = { all: null, ground: null, trees: null };
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

  ensurePreRendered("ground");
  ensurePreRendered("trees");
  ensurePreRendered("all");

  mapCache.set(id, {
    mapData,
    layers,
    tilesets,
    mapPixelWidth,
    mapPixelHeight,
    tilesetCache,
    preRenderedLayers,
  });
}

// ------------------------------------------------------------
// Tileset lookup
// ------------------------------------------------------------

function getTilesetForGid(gid) {
  if (tilesetCache.has(gid)) {
    return tilesetCache.get(gid);
  }

  let chosen = null;
  for (const ts of tilesets) {
    if (gid >= ts.firstgid) chosen = ts;
  }

  tilesetCache.set(gid, chosen);
  return chosen;
}

// ------------------------------------------------------------
// Draw map (all layers)
// ------------------------------------------------------------

export function drawMap(ctx, cameraX, cameraY, viewportWidth, viewportHeight) {
  if (!mapData) return;
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
// Extract enemy path
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

// ============================================================
// END OF FILE
// ============================================================
