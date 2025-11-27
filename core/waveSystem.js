// ============================================================
// waveSystem.js - Extracted wave progression logic
// ------------------------------------------------------------
// Handles:
//   - Wave configs and victory messaging
//   - Spawn queue management + difficulty scaling
//   - Autosave hooks and end-of-wave story beats
//   - Victory unlock flow and runtime snapshot helpers
// ============================================================

import { gameState, unlockMap, saveProfiles } from "../utils/gameState.js";
import { stopGameplay } from "../main.js";
import { triggerEndOfWave1Story, triggerEndOfWave5Story } from "./story.js";
import { getDifficultyHpMultiplier } from "../screenManagement/settings.js";
import { updateHUD } from "../screenManagement/ui.js";

import { spawnGoblin, getGoblins } from "../entities/goblin.js";

// NEW: elemental goblins
import {
  spawnGoblin as spawnIceGoblin,
  getGoblins as getIceGoblins,
} from "../entities/iceGoblin.js";

import {
  spawnGoblin as spawnEmberGoblin,
  getGoblins as getEmberGoblins,
} from "../entities/emberGoblin.js";

import {
  spawnGoblin as spawnAshGoblin,
  getGoblins as getAshGoblins,
} from "../entities/ashGoblin.js";

import {
  spawnGoblin as spawnVoidGoblin,
  getGoblins as getVoidGoblins,
} from "../entities/voidGoblin.js";

import { spawnWorg, getWorg } from "../entities/worg.js";
import { spawnElite, getElites } from "../entities/elite.js";
import { spawnTroll, getTrolls } from "../entities/troll.js";
import { spawnOgre, getOgres } from "../entities/ogre.js";
import { spawnCrossbow, getCrossbows } from "../entities/crossbow.js";
import { spawnSeraphineBoss, getSeraphines } from "../entities/seraphine.js";
import { Events, EVENT_NAMES as E } from "./eventEngine.js";

// ============================================================
// WAVE CONFIGS
// ============================================================

// ============================================================
// waveConfigs - Olivia's World: Crystal Keep
// ------------------------------------------------------------
// Fully rebalanced 1-9 campaign waves
// - Map 1 gentle & forgiving + elemental goblin test
// - Map 2 introduces Worgs mid-way
// - Map 3 patterned mixes + elite surprises
// - Map 4 escalates everything
// - Map 5 introduces Trolls
// - Map 6 introduces Ogres
// - Map 7 introduces Crossbows (1-2 MAX)
// - Map 8 Penultimate chaos
// - Map 9 Final all-out showdown
// All enemy counts doubled from baseline design
// ============================================================

export const waveConfigs = {

  // ============================================================
  // MAP 1 - Gentle Onboarding + Elemental Goblin Test
  // ------------------------------------------------------------
  // Wave 1: base goblins only
  // Wave 2: + 1 iceGoblin
  // Wave 3: + 1 emberGoblin
  // Wave 4: + 1 ashGoblin
  // Wave 5: + 1 voidGoblin
  // ============================================================
  1: [
    { goblins: 8,  worgs: 0 },   // Wave 1 - intro
    { goblins: 12, worgs: 0 },   // Wave 2
    { goblins: 16, worgs: 0 },   // Wave 3
    { goblins: 18, worgs: 1 },   // Wave 4 - first worg
    { goblins: 20, worgs: 2 },   // Wave 5
    { worgs: 20, delay: 3},
    { goblins: 24, worgs: 2 },   // Wave 6
    { goblins: 26, worgs: 3 },   // Wave 7
    { goblins: 20, worgs: 15 },
    { goblins: 15, worgs: 20, delay: 3 },
    { goblins: 34, worgs: 20 },   // Wave 9
    { boss: "seraphine", phase: 1, goblins: 20, worgs: 4 } // Wave 10 boss
  ],

  // ============================================================
  // MAP 2 - Early Worg Pressure (Introduced Mid-Map)
  // ============================================================
  2: [
    { goblins: 18, worgs: 0,  elites: 0 },
    { goblins: 22, worgs: 1,  elites: 0 },
    { goblins: 26, worgs: 2,  elites: 0 },
    { goblins: 30, worgs: 3,  elites: 1 }, // elite intro
    { goblins: 32, worgs: 3,  elites: 1 },
    { goblins: 34, worgs: 4,  elites: 1 },
    { goblins: 36, worgs: 4,  elites: 2 },
    { goblins: 40, worgs: 5,  elites: 2 },
    { goblins: 42, worgs: 5,  elites: 3 },
    { goblins: 44, worgs: 5,  elites: 3 },
    { goblins: 46, worgs: 6,  elites: 3 },
    { goblins: 50, worgs: 6,  elites: 4 },
  ],

  // ============================================================
  // MAP 3 - Pattern Mixing + Elite Ambushes
  // ============================================================
  3: [
    { goblins: 20, worgs: 2, elites: 0, trolls: 0, ogres: 0 },
    { goblins: 24, worgs: 2, elites: 0, trolls: 0, ogres: 0 },
    { goblins: 26, worgs: 3, elites: 1, trolls: 0, ogres: 0 },
    { goblins: 30, worgs: 3, elites: 1, trolls: 0, ogres: 0 },

    { goblins: 34, worgs: 4, elites: 1, trolls: 1, ogres: 0 }, // troll intro
    { goblins: 36, worgs: 4, elites: 2, trolls: 1, ogres: 0 },
    { goblins: 40, worgs: 5, elites: 2, trolls: 2, ogres: 0 },
    { goblins: 42, worgs: 5, elites: 3, trolls: 2, ogres: 0 },

    { goblins: 44, worgs: 6, elites: 3, trolls: 2, ogres: 1 }, // ogre intro
    { goblins: 46, worgs: 6, elites: 3, trolls: 2, ogres: 1 },
    { goblins: 48, worgs: 6, elites: 3, trolls: 3, ogres: 1 },
    { goblins: 50, worgs: 7, elites: 4, trolls: 3, ogres: 1 },

    { goblins: 55, worgs: 8, elites: 4, trolls: 3, ogres: 2 },
    { goblins: 60, worgs: 8, elites: 4, trolls: 4, ogres: 2 },
  ],

  // ============================================================
  // MAP 4 - Everything Tightens
  // ============================================================
  4: [
    { goblins: 22, worgs: 2, elites: 0, trolls: 0, ogres: 0, emberGoblins: 0 },

    { goblins: 28, worgs: 3, elites: 1, trolls: 0, ogres: 0, emberGoblins: 2 }, // ember intro
    { goblins: 32, worgs: 4, elites: 1, trolls: 0, ogres: 0, emberGoblins: 3 },
    { goblins: 36, worgs: 4, elites: 2, trolls: 1, ogres: 0, emberGoblins: 3 },
    { goblins: 40, worgs: 5, elites: 2, trolls: 1, ogres: 0, emberGoblins: 4 },
    { goblins: 42, worgs: 5, elites: 2, trolls: 1, ogres: 1, emberGoblins: 4 },

    { goblins: 44, worgs: 6, elites: 3, trolls: 1, ogres: 1, emberGoblins: 4 },
    { goblins: 48, worgs: 6, elites: 3, trolls: 2, ogres: 1, emberGoblins: 4 },
    { goblins: 52, worgs: 7, elites: 3, trolls: 2, ogres: 1, emberGoblins: 5 },
    { goblins: 55, worgs: 7, elites: 4, trolls: 2, ogres: 1, emberGoblins: 5 },

    { goblins: 58, worgs: 8, elites: 4, trolls: 2, ogres: 2, emberGoblins: 5 },
    { goblins: 60, worgs: 8, elites: 4, trolls: 3, ogres: 2, emberGoblins: 5 },

    { goblins: 65, worgs: 9, elites: 5, trolls: 3, ogres: 2, emberGoblins: 6 },
    { goblins: 70, worgs: 10, elites: 5, trolls: 3, ogres: 3, emberGoblins: 6 },

    { boss: "seraphine", phase: 2, goblins: 30, worgs: 8, elites: 3, trolls: 1, ogres: 1, emberGoblins: 6 },
  ],

  // ============================================================
  // MAP 5 - Trolls Arrive (High HP Disruptors)
  // ============================================================
  5: [
    // Ice Goblin Intro
    { goblins: 26, worgs: 3, elites: 0, trolls: 0, ogres: 0, iceGoblins: 1 },
    { goblins: 28, worgs: 3, elites: 1, trolls: 0, ogres: 0, iceGoblins: 2 },
    { goblins: 30, worgs: 4, elites: 1, trolls: 1, ogres: 0, iceGoblins: 2 },

    // Mixed Pressure
    { goblins: 32, worgs: 4, elites: 1, trolls: 1, ogres: 0, iceGoblins: 3 },
    { goblins: 34, worgs: 4, elites: 2, trolls: 1, ogres: 0, iceGoblins: 3 },
    { goblins: 36, worgs: 5, elites: 2, trolls: 1, ogres: 1, iceGoblins: 3 },

    // More Ice Integration
    { goblins: 38, worgs: 5, elites: 2, trolls: 2, ogres: 1, iceGoblins: 4 },
    { goblins: 40, worgs: 5, elites: 3, trolls: 2, ogres: 1, iceGoblins: 4 },
    { goblins: 42, worgs: 6, elites: 3, trolls: 2, ogres: 1, iceGoblins: 5 },

    // Bigger Waves
    { goblins: 44, worgs: 6, elites: 3, trolls: 3, ogres: 1, iceGoblins: 5 },
    { goblins: 46, worgs: 6, elites: 4, trolls: 3, ogres: 1, iceGoblins: 5 },
    { goblins:46, worgs: 7, elites: 4, trolls: 3, ogres: 2, iceGoblins: 6 },

    // Final Ice Assault
    { goblins: 48, worgs: 7, elites: 4, trolls: 3, ogres: 2, iceGoblins: 6 },
    { goblins: 50, worgs: 7, elites: 4, trolls: 4, ogres: 2, iceGoblins: 7 },
    { goblins: 52, worgs: 8, elites: 5, trolls: 4, ogres: 2, iceGoblins: 7 },
    { goblins: 55, worgs: 8, elites: 5, trolls: 4, ogres: 3, iceGoblins: 8 },
  ],


  // ============================================================
  // MAP 6 - Ogre Introduction (Slow, Heavy Hitters)
  // ============================================================
  6: [
    // Healer Intro
    { goblins: 26, worgs: 4, elites: 1, trolls: 0, ogres: 0, iceGoblins: 0, ashGoblins: 1 },
    { goblins: 28, worgs: 4, elites: 1, trolls: 0, ogres: 0, iceGoblins: 1, ashGoblins: 1 },
    { goblins: 30, worgs: 5, elites: 1, trolls: 1, ogres: 0, iceGoblins: 1, ashGoblins: 2 },

    // Combining Heals + Frost
    { goblins: 32, worgs: 5, elites: 2, trolls: 1, ogres: 0, iceGoblins: 1, ashGoblins: 2 },
    { goblins: 34, worgs: 5, elites: 2, trolls: 1, ogres: 0, iceGoblins: 2, ashGoblins: 2 },
    { goblins: 36, worgs: 6, elites: 2, trolls: 2, ogres: 0, iceGoblins: 2, ashGoblins: 3 },

    // Stronger Mix
    { goblins: 38, worgs: 6, elites: 3, trolls: 2, ogres: 1, iceGoblins: 2, ashGoblins: 3 },
    { goblins: 40, worgs: 6, elites: 3, trolls: 2, ogres: 1, iceGoblins: 3, ashGoblins: 3 },
    { goblins: 42, worgs: 7, elites: 3, trolls: 2, ogres: 1, iceGoblins: 3, ashGoblins: 4 },

    // Higher Tier Pressure
    { goblins: 44, worgs: 7, elites: 4, trolls: 3, ogres: 1, iceGoblins: 3, ashGoblins: 4 },
    { goblins: 46, worgs: 7, elites: 4, trolls: 3, ogres: 2, iceGoblins: 4, ashGoblins: 4 },
    { goblins: 48, worgs: 7, elites: 4, trolls: 3, ogres: 2, iceGoblins: 4, ashGoblins: 5 },

    // Final Build-Up
    { goblins: 50, worgs: 8, elites: 5, trolls: 3, ogres: 2, iceGoblins: 5, ashGoblins: 5 },
    { goblins: 52, worgs: 8, elites: 5, trolls: 4, ogres: 2, iceGoblins: 5, ashGoblins: 5 },
    { goblins: 54, worgs: 8, elites: 5, trolls: 4, ogres: 2, iceGoblins: 6, ashGoblins: 6 },
    { goblins: 56, worgs: 9, elites: 6, trolls: 4, ogres: 3, iceGoblins: 6, ashGoblins: 6 },
    { goblins: 60, worgs: 9, elites: 6, trolls: 4, ogres: 3, iceGoblins: 6, ashGoblins: 7 },
  ],

  // ============================================================
  // MAP 7 - Crossbows Introduced (1-2 MAX)
  // ============================================================
  7: [
    // Crossbow Intro
    { goblins: 34, worgs: 6, elites: 2, trolls: 1, ogres: 0, iceGoblins: 0, ashGoblins: 1, crossbows: 1 },
    { goblins: 36, worgs: 6, elites: 2, trolls: 1, ogres: 0, iceGoblins: 1, ashGoblins: 1, crossbows: 1 },
    { goblins: 38, worgs: 6, elites: 2, trolls: 2, ogres: 0, iceGoblins: 1, ashGoblins: 2, crossbows: 1 },

    // Mid Build
    { goblins: 40, worgs: 7, elites: 3, trolls: 2, ogres: 1, iceGoblins: 1, ashGoblins: 2, crossbows: 1 },
    { goblins: 42, worgs: 7, elites: 3, trolls: 2, ogres: 1, iceGoblins: 2, ashGoblins: 2, crossbows: 1 },
    { goblins: 44, worgs: 7, elites: 3, trolls: 3, ogres: 1, iceGoblins: 2, ashGoblins: 3, crossbows: 1 },

    // Strong Mix
    { goblins: 46, worgs: 7, elites: 4, trolls: 3, ogres: 1, iceGoblins: 2, ashGoblins: 3, crossbows: 2 },
    { goblins: 48, worgs: 8, elites: 4, trolls: 3, ogres: 2, iceGoblins: 3, ashGoblins: 3, crossbows: 2 },
    { goblins: 50, worgs: 8, elites: 4, trolls: 3, ogres: 2, iceGoblins: 3, ashGoblins: 4, crossbows: 2 },

    // Bigger Pressure
    { goblins: 52, worgs: 8, elites: 5, trolls: 4, ogres: 2, iceGoblins: 3, ashGoblins: 4, crossbows: 2 },
    { goblins: 54, worgs: 9, elites: 5, trolls: 4, ogres: 2, iceGoblins: 4, ashGoblins: 4, crossbows: 2 },
    { goblins: 56, worgs: 9, elites: 5, trolls: 4, ogres: 3, iceGoblins: 4, ashGoblins: 5, crossbows: 2 },

    // Final Mixed Waves
    { goblins: 58, worgs: 10, elites: 6, trolls: 4, ogres: 3, iceGoblins: 5, ashGoblins: 5, crossbows: 2 },
    { goblins: 60, worgs: 10, elites: 6, trolls: 4, ogres: 3, iceGoblins: 5, ashGoblins: 5, crossbows: 2 },
    { goblins: 62, worgs: 10, elites: 6, trolls: 4, ogres: 3, iceGoblins: 5, ashGoblins: 6, crossbows: 2 },

    // Boss build-up
    { goblins: 64, worgs: 10, elites: 6, trolls: 5, ogres: 3, iceGoblins: 5, ashGoblins: 6, crossbows: 2 },
    { goblins: 70, worgs: 12, elites: 7, trolls: 5, ogres: 3, iceGoblins: 6, ashGoblins: 6, crossbows: 2 },

    // Seraphine Form III
    { boss: "seraphine", phase: 3, goblins: 40, worgs: 10, elites: 5, trolls: 4, ogres: 2, iceGoblins: 4, ashGoblins: 4, crossbows: 2 }
  ],

  // ============================================================
  // MAP 8 - Penultimate Chaos
  // ============================================================
  8: [
    // Void Intro
    { goblins: 40, worgs: 8, elites: 3, trolls: 2, ogres: 1, iceGoblins: 2, ashGoblins: 1, crossbows: 1, voidGoblins: 1 },
    { goblins: 42, worgs: 8, elites: 3, trolls: 2, ogres: 1, iceGoblins: 2, ashGoblins: 1, crossbows: 1, voidGoblins: 2 },
    { goblins: 44, worgs: 8, elites: 4, trolls: 2, ogres: 1, iceGoblins: 3, ashGoblins: 2, crossbows: 1, voidGoblins: 2 },

    // Mid Voids
    { goblins: 46, worgs: 8, elites: 4, trolls: 3, ogres: 1, iceGoblins: 3, ashGoblins: 2, crossbows: 1, voidGoblins: 3 },
    { goblins: 48, worgs: 8, elites: 4, trolls: 3, ogres: 2, iceGoblins: 3, ashGoblins: 2, crossbows: 1, voidGoblins: 3 },
    { goblins: 50, worgs: 9, elites: 4, trolls: 3, ogres: 2, iceGoblins: 4, ashGoblins: 2, crossbows: 1, voidGoblins: 3 },

    // Building Void Pressure
    { goblins: 52, worgs: 9, elites: 5, trolls: 3, ogres: 2, iceGoblins: 4, ashGoblins: 3, crossbows: 2, voidGoblins: 4 },
    { goblins: 54, worgs: 9, elites: 5, trolls: 4, ogres: 2, iceGoblins: 4, ashGoblins: 3, crossbows: 2, voidGoblins: 4 },
    { goblins: 56, worgs: 9, elites: 5, trolls: 4, ogres: 2, iceGoblins: 4, ashGoblins: 3, crossbows: 2, voidGoblins: 5 },

    // Harder Variants
    { goblins: 58, worgs: 10, elites: 5, trolls: 4, ogres: 3, iceGoblins: 4, ashGoblins: 4, crossbows: 2, voidGoblins: 5 },
    { goblins: 60, worgs: 10, elites: 6, trolls: 4, ogres: 3, iceGoblins: 5, ashGoblins: 4, crossbows: 2, voidGoblins: 5 },
    { goblins: 62, worgs: 10, elites: 6, trolls: 4, ogres: 3, iceGoblins: 5, ashGoblins: 4, crossbows: 2, voidGoblins: 6 },
    { goblins: 64, worgs: 10, elites: 6, trolls: 4, ogres: 3, iceGoblins: 5, ashGoblins: 4, crossbows: 2, voidGoblins: 6 },

    // Larger Swarm Build-Up
    { goblins: 66, worgs: 11, elites: 6, trolls: 4, ogres: 3, iceGoblins: 6, ashGoblins: 5, crossbows: 2, voidGoblins: 6 },
    { goblins: 70, worgs: 11, elites: 6, trolls: 5, ogres: 3, iceGoblins: 6, ashGoblins: 5, crossbows: 2, voidGoblins: 7 },

    // Final Void Overload
    { goblins: 72, worgs: 12, elites: 7, trolls: 5, ogres: 3, iceGoblins: 6, ashGoblins: 5, crossbows: 2, voidGoblins: 7 },
    { goblins: 74, worgs: 12, elites: 7, trolls: 5, ogres: 4, iceGoblins: 6, ashGoblins: 5, crossbows: 2, voidGoblins: 7 },
    { goblins: 76, worgs: 12, elites: 7, trolls: 5, ogres: 4, iceGoblins: 7, ashGoblins: 5, crossbows: 2, voidGoblins: 7 },
    { goblins: 80, worgs: 12, elites: 7, trolls: 6, ogres: 4, iceGoblins: 7, ashGoblins: 5, crossbows: 2, voidGoblins: 8 }
  ],

  // ============================================================
  // MAP 9 - Ultimate Final Showdown
  // ============================================================
  9: [
    // The Drums Begin
    { goblins: 40, worgs: 10, elites: 3, trolls: 2, ogres: 1, iceGoblins: 2, ashGoblins: 1, emberGoblins: 1, voidGoblins: 1, crossbows: 1 },
    { goblins: 42, worgs: 10, elites: 3, trolls: 2, ogres: 1, iceGoblins: 2, ashGoblins: 1, emberGoblins: 1, voidGoblins: 1, crossbows: 1 },
    { goblins: 44, worgs: 10, elites: 4, trolls: 2, ogres: 1, iceGoblins: 2, ashGoblins: 2, emberGoblins: 1, voidGoblins: 1, crossbows: 1 },

    // Building Up
    { goblins: 46, worgs: 10, elites: 4, trolls: 3, ogres: 1, iceGoblins: 2, ashGoblins: 2, emberGoblins: 2, voidGoblins: 1, crossbows: 2 },
    { goblins: 48, worgs: 11, elites: 4, trolls: 3, ogres: 1, iceGoblins: 3, ashGoblins: 2, emberGoblins: 2, voidGoblins: 1, crossbows: 2 },
    { goblins: 50, worgs: 11, elites: 4, trolls: 3, ogres: 2, iceGoblins: 3, ashGoblins: 2, emberGoblins: 2, voidGoblins: 1, crossbows: 2 },

    // Mid-Pressure
    { goblins: 52, worgs: 11, elites: 5, trolls: 3, ogres: 2, iceGoblins: 3, ashGoblins: 3, emberGoblins: 2, voidGoblins: 2, crossbows: 2 },
    { goblins: 54, worgs: 11, elites: 5, trolls: 4, ogres: 2, iceGoblins: 4, ashGoblins: 3, emberGoblins: 2, voidGoblins: 2, crossbows: 2 },
    { goblins: 56, worgs: 12, elites: 5, trolls: 4, ogres: 2, iceGoblins: 4, ashGoblins: 3, emberGoblins: 2, voidGoblins: 2, crossbows: 2 },

    // Heat Rises
    { goblins: 58, worgs: 12, elites: 6, trolls: 4, ogres: 2, iceGoblins: 4, ashGoblins: 3, emberGoblins: 2, voidGoblins: 3, crossbows: 2 },
    { goblins: 60, worgs: 12, elites: 6, trolls: 4, ogres: 2, iceGoblins: 4, ashGoblins: 3, emberGoblins: 3, voidGoblins: 3, crossbows: 2 },
    { goblins: 62, worgs: 12, elites: 6, trolls: 4, ogres: 3, iceGoblins: 4, ashGoblins: 3, emberGoblins: 3, voidGoblins: 3, crossbows: 2 },

    // Swarm Approaches
    { goblins: 65, worgs: 12, elites: 6, trolls: 5, ogres: 3, iceGoblins: 4, ashGoblins: 4, emberGoblins: 3, voidGoblins: 3, crossbows: 2 },
    { goblins: 68, worgs: 12, elites: 6, trolls: 5, ogres: 3, iceGoblins: 5, ashGoblins: 4, emberGoblins: 3, voidGoblins: 3, crossbows: 2 },
    { goblins: 70, worgs: 12, elites: 6, trolls: 5, ogres: 3, iceGoblins: 5, ashGoblins: 4, emberGoblins: 3, voidGoblins: 4, crossbows: 2 },

    // Pre-Final Assault
    { goblins: 72, worgs: 12, elites: 7, trolls: 5, ogres: 3, iceGoblins: 5, ashGoblins: 4, emberGoblins: 4, voidGoblins: 4, crossbows: 2 },
    { goblins: 75, worgs: 12, elites: 7, trolls: 5, ogres: 3, iceGoblins: 5, ashGoblins: 4, emberGoblins: 4, voidGoblins: 4, crossbows: 2 },
    { goblins: 78, worgs: 13, elites: 7, trolls: 5, ogres: 4, iceGoblins: 6, ashGoblins: 4, emberGoblins: 4, voidGoblins: 4, crossbows: 2 },

    // The Army of the Architect
    { goblins: 82, worgs: 14, elites: 7, trolls: 6, ogres: 4, iceGoblins: 6, ashGoblins: 4, emberGoblins: 4, voidGoblins: 4, crossbows: 2 },
    { goblins: 85, worgs: 14, elites: 8, trolls: 6, ogres: 4, iceGoblins: 6, ashGoblins: 5, emberGoblins: 4, voidGoblins: 5, crossbows: 2 },
    { goblins: 90, worgs: 14, elites: 8, trolls: 6, ogres: 4, iceGoblins: 6, ashGoblins: 5, emberGoblins: 4, voidGoblins: 5, crossbows: 2 },

    // Final Boss Wave (Form IV)
    { boss: "seraphine", phase: 4, goblins: 50, worgs: 12, elites: 6, trolls: 5, ogres: 4, iceGoblins: 4, ashGoblins: 3, emberGoblins: 3, voidGoblins: 3, crossbows: 2 }
  ],
};


// ============================================================
// VICTORY MESSAGES / SUBTITLES
// ============================================================

export const VICTORY_MESSAGES = {
  1: "Map One Complete! The goblins scatter before your growing power!",
  2: "Map Two Cleared! The Hollow Woods fall silent once more.",
  3: "Map Three Victorious! The Ember Plains glow in your honour.",
  4: "Map Four Defeated! Shadows tremble at your presence.",
  5: "Map Five Purified! Even the frost bows to the Princess.",
  6: "Map Six Triumphed! The Arcane Crystals resonate with power.",
  7: "Map Seven Won! You stand unmatched in the Crystal Isles!",
  8: "Map Eight Cleared! Magic ripples through the realm!",
  9: "Final Map Conquered! The Crystal Keep is safe once more!"
};

export const VICTORY_SUBTITLES = {
  1: "Peace returns to the training fields.",
  2: "The Hollow Woods breathe a calm sigh.",
  3: "The Ember Plains cool under your light.",
  4: "Shadows retreat from your presence.",
  5: "The Frosted Vale grows quiet once more.",
  6: "Arcane storms settle in your wake.",
  7: "Crystal Isles shimmer with renewed hope.",
  8: "Magic ripples across the realm in harmony.",
  9: "The Crystal Keep stands protected - your legend complete."
};

// ============================================================
// WAVE STATE
// ============================================================

let currentWaveIndex = 0;
let waveActive = false;
let waveCleared = false;
let justStartedWave = false;
let waveTransitionInProgress = false;

let firstWaveStarted = false;
window.firstWaveStarted = false;

window.betweenWaveTimerActive = false;

const FIRST_WAVE_DELAY = 5000;
const BETWEEN_WAVES_DELAY = 5000;
const VICTORY_DELAY = 50;

let betweenWaveTimer = 0;

if (typeof gameState.victoryPending !== "boolean") {
  gameState.victoryPending = false;
}

const SPAWN_INTERVAL = 4000;
let spawnQueue = [];
let spawnTimer = 0;

// ============================================================
// RESET / SNAPSHOT HELPERS
// ============================================================

export function resetWaveSystem() {
  currentWaveIndex = 0;
  waveActive = false;
  waveCleared = false;
  justStartedWave = true;
  waveTransitionInProgress = false;

  window.betweenWaveTimerActive = true;

  spawnQueue.length = 0;
  spawnTimer = 0;

  gameState.victoryPending = false;
  gameState.wave = 1;
  const mapId = gameState.progress?.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  gameState.totalWaves = Array.isArray(waves) ? waves.length : 0;
  firstWaveStarted = false;
  window.firstWaveStarted = false;

  if (mapId === 1) {
    betweenWaveTimer = 45000; // 30 seconds intro delay for Map 1
  } else {
    betweenWaveTimer = 30000;  // default 5 seconds for other maps
  }
}

export function getWaveSnapshotState() {
  return {
    currentWaveIndex,
    waveActive,
    waveCleared,
    firstWaveStarted,
    betweenWaveTimer,
    betweenWaveTimerActive: window.betweenWaveTimerActive === true,
  };
}

export function restoreWaveFromSnapshot(meta, snapshot) {
  if (!meta) return;

  waveTransitionInProgress = false;

  if (typeof meta.wave === "number") {
    currentWaveIndex = Math.max(0, meta.wave - 1);
    gameState.wave = meta.wave;
  }

  window.currentWaveIndex = currentWaveIndex;

  const waveState = meta.waveState || {};
  const hasSavedEnemies = snapshot
    ? [
        snapshot.goblins,
        snapshot.worgs,
        snapshot.elites,
        snapshot.ogres,
        snapshot.trolls,
        snapshot.crossbows,
        snapshot.seraphines,
      ].some(arr => Array.isArray(arr) && arr.length > 0)
    : false;

  const resolvedFirstWave =
    typeof waveState.firstWaveStarted === "boolean"
      ? waveState.firstWaveStarted
      : (meta.firstWaveStarted ??
        (hasSavedEnemies || false));

  firstWaveStarted = !!resolvedFirstWave;
  window.firstWaveStarted = firstWaveStarted;

  waveActive =
    typeof waveState.waveActive === "boolean"
      ? waveState.waveActive
      : hasSavedEnemies;
  waveCleared =
    typeof waveState.waveCleared === "boolean"
      ? waveState.waveCleared
      : (!waveActive && firstWaveStarted);
  justStartedWave = false;

  spawnQueue.length = 0;
  spawnTimer = 0;

  let restoredTimer = 0;
  if (!waveActive) {
    if (typeof waveState.betweenWaveTimer === "number") {
      restoredTimer = Math.max(0, waveState.betweenWaveTimer);
    } else if (!firstWaveStarted) {
      restoredTimer = FIRST_WAVE_DELAY;
    }
  }

  betweenWaveTimer = waveActive ? 0 : restoredTimer;

  let restoredTimerActive =
    waveActive
      ? false
      : (typeof waveState.betweenWaveTimerActive === "boolean"
          ? waveState.betweenWaveTimerActive
          : betweenWaveTimer > 0);

  if (!waveActive && betweenWaveTimer <= 0) {
    if (!firstWaveStarted) {
      betweenWaveTimer = FIRST_WAVE_DELAY;
      restoredTimerActive = true;
    } else {
      restoredTimerActive = false;
    }
  }

  window.betweenWaveTimerActive = restoredTimerActive;

  gameState.victoryPending = false;
}

// ============================================================
// WAVE CONTROL
// ============================================================

function startNextWave() {
  firstWaveStarted = true;
  window.firstWaveStarted = true;
  window.betweenWaveTimerActive = false;
  betweenWaveTimer = 0;

  const mapId = gameState.progress?.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  if (!waves) return;

  const wave = waves[currentWaveIndex];
  if (!wave) return;

  spawnQueue.length = 0;

  waveActive = true;
  waveCleared = false;
  justStartedWave = true;

  gameState.wave = currentWaveIndex + 1;
  gameState.totalWaves = waves.length;
  updateHUD();
  Events.emit(E.waveStart, { wave: gameState.wave });

  const hpMult = getDifficultyHpMultiplier();
  const spawnScaled = (fn) => {
    const enemy = fn();
    if (enemy) {
      enemy.hp = Math.round(enemy.hp * hpMult);
      enemy.maxHp = Math.round(enemy.maxHp * hpMult);
    }
    return enemy;
  };
  const spawnAndEmit = (type, fn) => {
    const enemy = spawnScaled(fn);
    if (enemy) {
      applySpawnSeparation(enemy);
      Events.emit(E.enemySpawn, { type, wave: gameState.wave });
    }
    return enemy;
  };

  if (wave.boss === "seraphine") {

    // spawn boss immediately (apply difficulty scaling)
    spawnSeraphineBoss(wave.phase || 1, undefined, undefined, { hpMultiplier: hpMult });

    // goblin escorts
    const escorts = wave.goblins || 0;
    for (let i = 0; i < escorts; i++) {
      spawnQueue.push(() => spawnAndEmit("goblin", spawnGoblin));
    }

    return; // IMPORTANT so normal enemies don't spawn
  }

  const iceCount   = wave.iceGoblins   || 0;
  const emberCount = wave.emberGoblins || 0;
  const ashCount   = wave.ashGoblins   || 0;
  const voidCount  = wave.voidGoblins  || 0;

  for (let i = 0; i < wave.goblins; i++) {
    spawnQueue.push(() => {
      spawnAndEmit("goblin", spawnGoblin);

      if (i < iceCount)   spawnAndEmit("iceGoblin",   spawnIceGoblin);
      if (i < emberCount) spawnAndEmit("emberGoblin", spawnEmberGoblin);
      if (i < ashCount)   spawnAndEmit("ashGoblin",   spawnAshGoblin);
      if (i < voidCount)  spawnAndEmit("voidGoblin",  spawnVoidGoblin);

      if (i < wave.worgs)      spawnAndEmit("worg",      spawnWorg);
      if (i < wave.elites)     spawnAndEmit("elite",     spawnElite);
      if (i < wave.trolls)     spawnAndEmit("troll",     spawnTroll);
      if (i < wave.ogres) {
        spawnAndEmit("ogre", () => spawnOgre({ skipDifficultyScaling: true }));
      }
      if (i < wave.crossbows)  spawnAndEmit("crossbow",  spawnCrossbow);
    });
  }

  // In case any counts exceed goblins, top up the queue with the extras:

  for (let i = wave.goblins; i < iceCount; i++) {
    spawnQueue.push(() => spawnAndEmit("iceGoblin", spawnIceGoblin));
  }

  for (let i = wave.goblins; i < emberCount; i++) {
    spawnQueue.push(() => spawnAndEmit("emberGoblin", spawnEmberGoblin));
  }

  for (let i = wave.goblins; i < ashCount; i++) {
    spawnQueue.push(() => spawnAndEmit("ashGoblin", spawnAshGoblin));
  }

  for (let i = wave.goblins; i < voidCount; i++) {
    spawnQueue.push(() => spawnAndEmit("voidGoblin", spawnVoidGoblin));
  }

  for (let i = wave.goblins; i < wave.worgs; i++) {
    spawnQueue.push(() => spawnAndEmit("worg", spawnWorg));
  }

  for (let i = wave.goblins; i < wave.elites; i++) {
    spawnQueue.push(() => spawnAndEmit("elite", spawnElite));
  }

  for (let i = wave.goblins; i < wave.trolls; i++) {
    spawnQueue.push(() => spawnAndEmit("troll", spawnTroll));
  }

  for (let i = wave.goblins; i < wave.crossbows; i++) {
    spawnQueue.push(() => spawnAndEmit("crossbow", spawnCrossbow));
  }
}

function getSpawnRadiusByType(type) {
  switch (type) {
    case "ogre": return 60;
    case "troll": return 52;
    case "elite": return 46;
    case "worg": return 46;
    case "crossbow": return 42;
    case "seraphine": return 72;
    case "goblin":
    case "iceGoblin":
    case "emberGoblin":
    case "ashGoblin":
    case "voidGoblin":
    default:
      return 40;
  }
}

function applySpawnSeparation(enemy) {
  if (!enemy || typeof enemy.x !== "number" || typeof enemy.y !== "number") return;

  const groups = [
    getGoblins(),
    getIceGoblins(),
    getEmberGoblins(),
    getAshGoblins(),
    getVoidGoblins(),
    getWorg(),
    getElites(),
    getTrolls(),
    getOgres(),
    getCrossbows(),
    getSeraphines(),
  ];

  const radius = getSpawnRadiusByType(enemy.type);

  for (let attempts = 0; attempts < 8; attempts++) {
    let overlapped = false;

    for (const group of groups) {
      if (!Array.isArray(group)) continue;

      for (const other of group) {
        if (!other || other === enemy) continue;
        const dx = enemy.x - other.x;
        const dy = enemy.y - other.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) {
          overlapped = true;
          enemy.x += (Math.random() - 0.5) * 12;
          enemy.y += (Math.random() - 0.5) * 12;
          continue;
        }

        const minDist = radius + getSpawnRadiusByType(other.type);
        if (dist < minDist) {
          overlapped = true;
          const push = (minDist - dist) * 0.6;
          enemy.x += (dx / dist) * push;
          enemy.y += (dy / dist) * push;
        }
      }
    }

    if (!overlapped) break;
  }
}

function noEnemiesAlive() {
  const g  = getGoblins();
  const gi = getIceGoblins();
  const ge = getEmberGoblins();
  const ga = getAshGoblins();
  const gv = getVoidGoblins();
  const w  = getWorg();
  const o  = getOgres();
  const e  = getElites();
  const t  = getTrolls();
  const x  = getCrossbows();
  const s  = getSeraphines();

  const aliveG  = g.filter(e => e.alive).length;
  const aliveGi = gi.filter(e => e.alive).length;
  const aliveGe = ge.filter(e => e.alive).length;
  const aliveGa = ga.filter(e => e.alive).length;
  const aliveGv = gv.filter(e => e.alive).length;
  const aliveW  = w.filter(e => e.alive).length;
  const aliveO  = o.filter(e => e.alive).length;
  const aliveE  = e.filter(e => e.alive).length;
  const aliveT  = t.filter(e => e.alive).length;
  const aliveX  = x.filter(e => e.alive).length;
  const aliveS  = s.filter(e => e.alive).length;

  const totalAlive =
    aliveG + aliveGi + aliveGe + aliveGa + aliveGv +
    aliveW + aliveO + aliveE + aliveT + aliveX + aliveS;

  const totalSpawnedSoFar =
    g.length + gi.length + ge.length + ga.length + gv.length +
    w.length + o.length + e.length + t.length + x.length + s.length;

  if (spawnQueue.length > 0) return false;
  if (totalSpawnedSoFar === 0) return false;

  return totalAlive === 0;
}

export async function updateWaveSystem(delta) {
  if (!firstWaveStarted) {
    betweenWaveTimer -= delta;

    if (betweenWaveTimer <= 0) {
      firstWaveStarted = true;
      startNextWave();
    }

    return;
  }

  if (justStartedWave) {
    justStartedWave = false;
    return;
  }

  if (waveTransitionInProgress) {
    return;
  }

  spawnTimer -= delta;
  if (spawnQueue.length > 0 && spawnTimer <= 0) {
    const spawnFn = spawnQueue.shift();
    spawnFn();
    spawnTimer = SPAWN_INTERVAL;
  }

  if (gameState.victoryPending) return;

  const mapId = gameState.progress?.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  if (!waves) return;

  if (waveActive) {
    if (!noEnemiesAlive()) return;

    if (!waveCleared) {
      waveCleared = true;
      waveActive = false;
      waveTransitionInProgress = true;

      const waveNumber = currentWaveIndex + 1;

      handleWaveCleared(waveNumber, mapId);
      return;
    }
  }

  if (betweenWaveTimer > 0) {
    window.betweenWaveTimerActive = true;
    betweenWaveTimer -= delta;
    return;
  }

  window.betweenWaveTimerActive = false;

  if (currentWaveIndex + 1 < waves.length) {
    currentWaveIndex++;
    startNextWave();
    return;
  }

  gameState.victoryPending = true;

  const nextMap = Math.min(mapId + 1, 9);

  if (gameState.progress?.currentMap > 9) {
    gameState.progress.currentMap = 9;
  }
  if (gameState.profile?.progress?.currentMap > 9) {
    gameState.profile.progress.currentMap = 9;
  }

  Events.emit(E.mapComplete, { map: mapId });

  if (mapId < 9) {
    unlockMap(nextMap);
    saveProfiles();
  }

  setTimeout(() => {
    stopGameplay("victory");

    if (mapId === 9) {
      setTimeout(() => {
        import("../screenManagement/credits.js")
          .then(mod => mod.showCredits())
          .catch(err => console.warn("Credits display failed:", err));
      }, 300);
    }
  }, VICTORY_DELAY);
}

async function handleWaveCleared(waveNumber, mapId) {
  Events.emit(E.waveEnd, { wave: waveNumber });

  try {
    if (waveNumber === 1) {
      await triggerEndOfWave1Story(mapId);
    }
    if (waveNumber === 5) {
      await triggerEndOfWave5Story(mapId);
    }
  } catch (err) {
    console.warn("Wave-end sequence failed:", err);
  } finally {
    betweenWaveTimer = BETWEEN_WAVES_DELAY;
    window.betweenWaveTimerActive = true;
    waveTransitionInProgress = false;
  }
}

// ============================================================
