// ============================================================
// 🔮 spell.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Pastel AoE Burst Spell with STAT-BASED seeker scaling
// Level 30 balanced version
// ============================================================

import { updateHUD } from "../screenManagement/ui.js";
import { spawnCanvasSparkleBurst } from "../fx/sparkles.js";

import { damageGoblin, getGoblins } from "../entities/goblin.js";
import { damageGoblin as damageIceGoblin, getGoblins as getIceGoblins } from "../entities/iceGoblin.js";
import { damageGoblin as damageEmberGoblin, getGoblins as getEmberGoblins } from "../entities/emberGoblin.js";
import { damageGoblin as damageAshGoblin, getGoblins as getAshGoblins } from "../entities/ashGoblin.js";
import { damageGoblin as damageVoidGoblin, getGoblins as getVoidGoblins } from "../entities/voidGoblin.js";
import { damageElite, getElites } from "../entities/elite.js";
import { damageOgre, getOgres } from "../entities/ogre.js";
import { getWorg, damageWorg } from "../entities/worg.js";
import { getTrolls, damageTroll } from "../entities/troll.js";
import { getCrossbows, damageCrossbow } from "../entities/crossbow.js";

import { gameState } from "../utils/gameState.js";
import { playSpellCast } from "../core/soundtrack.js";
import { getSeraphines, damageSeraphine } from "../entities/seraphine.js";

// ------------------------------------------------------------
// ⭐ Tier calculation (AoE radius only, NOT seekers)
// ------------------------------------------------------------
function getSpellTier() {
  const lvl = Number(gameState.player?.level || 1);

  if (lvl < 5) return 1;
  if (lvl < 10) return 2;
  if (lvl < 15) return 3;
  if (lvl < 20) return 4;
  return 5;
}

// ------------------------------------------------------------
// 🔮 Crystal Seeker Orbs
// ------------------------------------------------------------
function spawnSeekerOrb(x, y, dmg) {
  if (!gameState.fx) gameState.fx = {};
  if (!gameState.fx.seekers) gameState.fx.seekers = [];

  const t = getRandomAliveTarget();
  if (!t) return;

  gameState.fx.seekers.push({
    x, y,
    target: t,
    speed: 450,
    dmg,
    alive: true,
    size: 14,
    color: "#ffccff"
  });
}

function getRandomAliveTarget() {
  const all = [
    ...getGoblins(),
    ...getIceGoblins(),
    ...getEmberGoblins(),
    ...getAshGoblins(),
    ...getVoidGoblins(),
    ...getOgres(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getCrossbows(),
    ...getSeraphines()
  ].filter(e => e.alive);

  if (all.length === 0) return null;
  return all[Math.floor(Math.random() * all.length)];
}

// ------------------------------------------------------------
// 🌟 Radiating Pulse Ring
// ------------------------------------------------------------
function spawnPulseRing(x, y, radius, color = "rgba(255,150,255,0.8)") {
  if (!gameState.fx) gameState.fx = {};
  if (!gameState.fx.pulses) gameState.fx.pulses = [];

  gameState.fx.pulses.push({
    x, y,
    radius,
    age: 0,
    life: 500,
    color
  });
}

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------
const COST_SPELL = 10;
const DMG_SPELL = 4;
const BASE_RADIUS = 150;
const CHARGE_TIME = 350;
const EXPLODE_TIME = 400;
const ANIM_TOTAL = 900;

// ------------------------------------------------------------
// Unified enemy list
// ------------------------------------------------------------
function getAllTargets() {
  return [
    ...getGoblins(),
    ...getIceGoblins(),
    ...getEmberGoblins(),
    ...getAshGoblins(),
    ...getVoidGoblins(),
    ...getOgres(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getSeraphines(),
    ...getCrossbows()
  ];
}

// ------------------------------------------------------------
// 🔮 PERFORM SPELL ATTACK
// ------------------------------------------------------------
export function performSpell(player) {
  if (!player) return { ok: false };

  const tier = getSpellTier();

  if (player.mana < COST_SPELL) {
    return { ok: false, reason: "mana" };
  }

  player.mana -= COST_SPELL;
  updateHUD();

  const anim = {
    type: "spell",
    chargeTime: CHARGE_TIME,
    explodeTime: EXPLODE_TIME,
    totalTime: ANIM_TOTAL,
  };

  anim.state = "charging";

  // ------------------------------------------------------------
  // 💥 EXPLOSION
  // ------------------------------------------------------------
  setTimeout(() => {
    anim.state = "explode";

    const dmg = Math.max(1, (player.spellPower || 0) * DMG_SPELL);
    const radius = BASE_RADIUS + tier * 40;

    // AoE damage
    for (const t of getAllTargets()) {
      if (!t.alive) continue;

      const dx = t.x - player.pos.x;
      const dy = t.y - player.pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        switch (t.type) {
          case "elite":     damageElite(t, dmg, "spell"); break;
          case "iceGoblin": damageIceGoblin(t, dmg); break;
          case "emberGoblin": damageEmberGoblin(t, dmg); break;
          case "ashGoblin": damageAshGoblin(t, dmg); break;
          case "voidGoblin": damageVoidGoblin(t, dmg); break;
          case "seraphine": damageSeraphine(t, dmg); break;
          case "ogre":      damageOgre(t, dmg, "spell"); break;
          case "worg":      damageWorg(t, dmg); break;
          case "troll":     damageTroll(t, dmg); break;
          case "crossbow":  damageCrossbow(t, dmg); break;
          default:
            if (t.maxHp >= 400 && t.type !== "goblin") damageOgre(t, dmg, "spell");
            else damageGoblin(t, dmg);
        }
      }
    }

    // Sparkle burst
    spawnCanvasSparkleBurst(
      player.pos.x,
      player.pos.y,
      26 + tier * 6,
      160 + tier * 30,
      ["#ffb3e6", "#b3ecff", "#fff2b3", "#cdb3ff", "#b3ffd9", "#ffffff"]
    );

    // Pulse ring
    spawnPulseRing(
      player.pos.x,
      player.pos.y,
      120 + tier * 40,
      "rgba(255,150,255,0.8)"
    );

    // ------------------------------------------------------------
    // 🔮 STAT-BASED SEEKER COUNT (wide balanced progression)
    // ------------------------------------------------------------
    let seekerCount = 3;
    const sp = Number(player.spellPower || 0);

    if (sp >= 210) seekerCount = 12;
    else if (sp >= 160) seekerCount = 9;
    else if (sp >= 110) seekerCount = 7;
    else if (sp >= 60)  seekerCount = 5;

    // Timed orb releases (pretty)
    for (let i = 0; i < seekerCount; i++) {
      setTimeout(() => {
        spawnSeekerOrb(player.pos.x, player.pos.y, dmg);
      }, 120 + i * 80);
    }

    playSpellCast();
    updateHUD();

  }, CHARGE_TIME);

  setTimeout(() => {
    anim.state = "done";
  }, ANIM_TOTAL);

  return { ok: true, anim };
}
