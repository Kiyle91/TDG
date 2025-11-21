# Crystal Keep: Flow Overview

## Core Loop (main.js -> core/game.js)
- Fixed-step loop at 60 Hz: `updateGame(FIXED_DT)` then `renderGame()` while `gameActive` is true.
- `startGameplay` starts the loop; `stopGameplay` halts and shows overlays (victory/defeat/exit).
- `initGame(mode)` wires map/path, player seed, enemies/spires/projectiles, FX, UI, then resets waves (unless loading).

```mermaid
sequenceDiagram
  participant Loop as main.js gameLoop
  participant Game as core/game.updateGame
  participant Render as core/game.renderGame

  Loop->>Game: updateGame(FIXED_DT)
  Game->>Enemies: update* (goblins, worgs, elites, trolls, ogres, crossbows)
  Game->>Spires: updateSpires / projectiles / arrows
  Game->>Player: updatePlayer
  Game->>FX: floatingText / healFX / seekers / pegasus / loot
  Game->>Wave: updateWaveSystem (spawns, timers)
  Game-->>Render: renderGame()
  Render->>Map: drawMapLayered (ground)
  Render->>Entities: draw spires/enemies/player/projectiles/arrows/loot/text
  Render->>FX: sparkles/healFX/seekers
  Render->>Map: drawMapLayered (trees) + pegasus frame
```

## Wave System (maps 1-9)
- Config: `waveConfigs` in `core/game.js` + difficulty HP multiplier from `core/settings.js`.
- Spawn queue: global array, one spawn every 4s; bonus ogre every 100 goblins via `incrementGoblinDefeated`.
- Story hooks on wave 1 and 5 endings (`triggerEndOfWave1Story/5`).

```mermaid
flowchart TD
  A[resetWaveSystem] --> B[firstWave delay 5s]
  B --> C[startNextWave]
  C --> D[spawnQueue (4s spacing)]
  D -->|enemies alive| D
  D -->|all dead| E[waveCleared=true; betweenWaveTimer=5s]
  E -->|more waves| C
  E -->|last wave| F[victoryPending -> stopGameplay("victory")]
```

## Module Map (who owns what)
- Map/layers/path: `core/map.js` (load, draw layered, extract path/echo points, size).
- Enemies: `goblin.js`, `worg.js`, `elite.js`, `ogre.js`, `troll.js`, `crossbow.js` (init/update/draw/spawn, damage per type).
- Towers & shots: `spires.js`, `projectiles.js`, `combat/arrow.js`.
- Player: `playerController.js` (input/movement/attacks), `player.js` (base data).
- Loot & FX: `loot.js`, `floatingText.js`, `fx/sparkles.js`, `combat/heal.js`, `crystalEchoes.js`, `pegasus.js`.
- UI/HUD: `ui.js`, `navbar.js`, `screens.js`, `settings.js` (difficulty).
- Progress/state: `utils/gameState.js`, `saveSystem.js`, `saveSlots.js`, `profile.js`, `hub.js` (map unlock flow).
- Story/music: `story.js`, `soundtrack.js`, `credits.js`.

## Key Data & Behavior
- Central store: `gameState` (player stats, map id, wave counters, FX arrays, paused flags, map dimensions).
- Camera follows player and clamps to map bounds; caches `getBoundingClientRect` to reduce DOM cost.
- HUD throttled to 100 ms; pause short-circuits `updateGame`.
- Defeat: HP<=0 or lives<=0 triggers `stopGameplay("defeat"/"lives")`; victory scheduled after final wave.

---
Feel free to add screenshots or more map-specific notes. Paste diagrams into GitHub/VS Code preview to render.
