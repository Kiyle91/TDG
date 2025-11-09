// ============================================================
// 🗺️ mapLoader.js — TDG Tiled Map Loader
// ------------------------------------------------------------
// ✦ Loads Tiled JSON + external TSX tilesets
// ✦ Draws tile layers (ground/props/trees)
// ✦ Extracts 'path' object layer (polyline/points) → pathPoints
// ✦ Fallback if TSX image path is outside repo
// ============================================================

import { TILE_SIZE } from "../utils/constants.js";

let mapData = null;

/** Loaded tilesets: { firstgid, columns, tilecount, image, imgEl }[] */
let tilesets = [];

export let pathPoints = [];     // tile coords (x,y)
export let mapWidthTiles = 0;   // tiles
export let mapHeightTiles = 0;  // tiles
export let mapPixelWidth = 0;   // px
export let mapPixelHeight = 0;  // px

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function resolvePath(baseUrl, rel) {
  // normalize "./data/TDG_map_one.json" + "../assets/..." → "./assets/..."
  const base = baseUrl.split("/").slice(0, -1); // drop filename
  const parts = rel.split("/");
  for (const p of parts) {
    if (!p || p === ".") continue;
    if (p === "..") base.pop();
    else base.push(p);
  }
  return base.join("/");
}

function basename(p) {
  const i = p.lastIndexOf("/");
  return i >= 0 ? p.slice(i + 1) : p;
}

async function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function parseTsx(tsxText) {
  const imgMatch = tsxText.match(/<image[^>]*source="([^"]+)"/i);
  const cols = tsxText.match(/columns="(\d+)"/i);
  const count = tsxText.match(/tilecount="(\d+)"/i);
  return {
    image: imgMatch ? imgMatch[1] : null,
    columns: cols ? parseInt(cols[1], 10) : null,
    tilecount: count ? parseInt(count[1], 10) : null,
  };
}

// ------------------------------------------------------------
// Load map + tilesets
// ------------------------------------------------------------
export async function loadMap() {
  const jsonUrl = "./data/TDG_map_one.json";
  const res = await fetch(jsonUrl);
  mapData = await res.json();

  mapWidthTiles = mapData.width;
  mapHeightTiles = mapData.height;
  mapPixelWidth = mapWidthTiles * TILE_SIZE;
  mapPixelHeight = mapHeightTiles * TILE_SIZE;

  tilesets = [];

  // Load each TSX and the referenced image
  for (const ts of mapData.tilesets) {
    const tsxUrl = resolvePath(jsonUrl, ts.source);
    const tsxRes = await fetch(tsxUrl);
    const tsxText = await tsxRes.text();

    const { image, columns, tilecount } = parseTsx(tsxText);

    // Primary attempt: resolve relative to the TSX file
    let imgUrl = resolvePath(tsxUrl, image);

    // If the TSX points outside the repo (e.g. "../../../../Texture/..."),
    // try falling back to our bundled path: ./assets/images/tilesets/<filename>
    let imgEl = await loadImage(imgUrl);
    if (!imgEl) {
      const alt = "./assets/images/tilesets/" + basename(image);
      imgEl = await loadImage(alt);
      if (imgEl) imgUrl = alt;
    }

    if (!imgEl) {
      console.warn("⚠️ Tileset image failed to load:", image, "→ tried:", imgUrl);
    }

    tilesets.push({
      firstgid: ts.firstgid,
      columns,
      tilecount,
      image: imgUrl,
      imgEl,
    });
  }

  extractPathPoints();
  console.log(`✅ Map loaded: ${mapWidthTiles}×${mapHeightTiles} tiles @ ${TILE_SIZE}px`);
  console.log(`✅ Path points: ${pathPoints.length}`);
}

// ------------------------------------------------------------
// Extract object layer named 'path' (polyline or points)
// ------------------------------------------------------------
function extractPathPoints() {
  const layer = mapData.layers.find(
    (l) => l.type === "objectgroup" && l.name.toLowerCase().includes("path")
  );
  pathPoints = [];

  if (!layer) {
    console.warn("⚠️ No object layer named 'path' found.");
    return;
  }

  for (const obj of layer.objects) {
    if (obj.polyline && obj.polyline.length) {
      for (const p of obj.polyline) {
        pathPoints.push({
          x: (obj.x + p.x) / TILE_SIZE,
          y: (obj.y + p.y) / TILE_SIZE,
        });
      }
    } else {
      // single point objects
      pathPoints.push({ x: obj.x / TILE_SIZE, y: obj.y / TILE_SIZE });
    }
  }
}

// ------------------------------------------------------------
// Draw all tile layers (non-object)
// ------------------------------------------------------------
export function drawMap(ctx) {
  if (!mapData) return;
  for (const layer of mapData.layers) {
    if (layer.type === "tilelayer") drawTileLayer(ctx, layer);
  }
}

function findTileset(gid) {
  let best = null;
  for (const ts of tilesets) {
    if (gid >= ts.firstgid && gid < ts.firstgid + ts.tilecount) best = ts;
  }
  return best;
}

function drawTileLayer(ctx, layer) {
  const { width, height, data } = layer;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gid = data[y * width + x];
      if (gid === 0) continue;

      const ts = findTileset(gid);
      if (!ts) continue;

      const localId = gid - ts.firstgid;
      const sx = (localId % ts.columns) * TILE_SIZE;
      const sy = Math.floor(localId / ts.columns) * TILE_SIZE;

      if (ts.imgEl) {
        ctx.drawImage(
          ts.imgEl,
          sx, sy, TILE_SIZE, TILE_SIZE,
          x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE
        );
      } else {
        // subtle fallback square so you can still run
        ctx.fillStyle = "#8da3";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
