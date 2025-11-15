// ============================================================
// 👹 enemies.js — Compatibility shim (Goblin module split)
// ------------------------------------------------------------
// All real goblin logic now lives in goblin.js.
// This file simply re-exports the same API so older imports keep working.
// ============================================================

export {
  setEnemyPath,
  initEnemies,
  updateEnemies,
  damageEnemy,
  drawEnemies,
  getEnemies,
  spawnGoblin,
} from "./goblin.js";