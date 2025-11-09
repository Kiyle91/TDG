// ============================================================
// 🗺️ map.js — Olivia’s World: Crystal Keep (Real Map Loader)
// ------------------------------------------------------------
// ✦ Loads data/map_one.json
// ✦ Resolves external .tsx tilesets
// ✦ Draws visible area for current viewport
// ============================================================

import { TILE_SIZE, GRID_COLS, GRID_ROWS } from "../utils/constants.js";

let mapData = null;
let layers = [];
let tilesets = [];
let mapPixelWidth = GRID_COLS * TILE_SIZE;
let mapPixelHeight = GRID_ROWS * TILE_SIZE;

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

// ------------------------------------------------------------
// 🌷 LOAD MAP
// ------------------------------------------------------------
export async function loadMap() {
  const res = await fetch("./data/map_one.json");
  mapData = await res.json();
  layers = mapData.layers || [];

  mapPixelWidth = (mapData.width || GRID_COLS) * TILE_SIZE;
  mapPixelHeight = (mapData.height || GRID_ROWS) * TILE_SIZE;

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

  console.log(
    `✅ Loaded map_one.json — ${mapData.width}×${mapData.height} tiles @ ${TILE_SIZE}px`
  );
}

function getTilesetForGid(gid) {
  let chosen = null;
  for (const ts of tilesets) {
    if (gid >= ts.firstgid) chosen = ts;
  }
  return chosen;
}

// ------------------------------------------------------------
// 🎨 DRAW MAP
// ------------------------------------------------------------
export function drawMap(ctx, cameraX, cameraY, viewportWidth, viewportHeight) {
  if (!mapData) return;

  const startCol = Math.floor(cameraX / TILE_SIZE);
  const endCol = Math.min(mapData.width - 1, Math.floor((cameraX + viewportWidth) / TILE_SIZE));
  const startRow = Math.floor(cameraY / TILE_SIZE);
  const endRow = Math.min(mapData.height - 1, Math.floor((cameraY + viewportHeight) / TILE_SIZE));

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
// 📏 SIZE HELPER
// ------------------------------------------------------------
export function getMapPixelSize() {
  return { width: mapPixelWidth, height: mapPixelHeight };
}
