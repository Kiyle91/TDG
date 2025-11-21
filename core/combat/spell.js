// ============================================================
// 🔮 spell.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Pastel AoE Burst Spell (modular version)
// Extracted from playerController.js
// ------------------------------------------------------------

import { updateHUD } from "../ui.js";
import { spawnCanvasSparkleBurst } from "../fx/sparkles.js";

import { damageGoblin, getGoblins } from "../goblin.js";
import { damageElite, getElites } from "../elite.js";
import { damageOgre, getOgres } from "../ogre.js";
import { getWorg } from "../worg.js";
import { getTrolls } from "../troll.js";
import { getCrossbows } from "../crossbow.js";
import { gameState } from "../../utils/gameState.js";
import { playSpellCast } from "../soundtrack.js";
// ------------------------------------------------------------
// 🔮 Crystal Seeker Orbs (homes to enemies)
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
    ...getOgres(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getCrossbows()
  ].filter(e => e.alive);

  if (all.length === 0) return null;
  return all[Math.floor(Math.random() * all.length)];
}


// ------------------------------------------------------------
// 🌟 Radiating Pulse Ring
// ------------------------------------------------------------

function spawnPulseRing(x, y, radius, color = "rgba(255,200,255,0.8)") {
  // Store a temporary pulse object in gameState.fx.pulses (we'll render in game.js)
  if (!gameState.fx) gameState.fx = {};
  if (!gameState.fx.pulses) gameState.fx.pulses = [];

  gameState.fx.pulses.push({
    x, y,
    radius,
    age: 0,
    life: 500,      // ms
    color
  });
}

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------

const COST_SPELL = 10;
const DMG_SPELL = 4;          // multiplier on spellPower
const RADIUS_SPELL = 150;
const CHARGE_TIME = 350;      // ms
const EXPLODE_TIME = 400;     // ms after charge
const ANIM_TOTAL = 900;       // ms (animation duration)

// ------------------------------------------------------------
// Unified enemy list
// ------------------------------------------------------------
function getAllTargets() {
  return [
    ...getGoblins(),
    ...getOgres(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getCrossbows()
  ];
}

// ------------------------------------------------------------
// 🔮 PERFORM SPELL ATTACK
// ------------------------------------------------------------
export function performSpell(player) {
  if (!player) return { ok: false };

  // Mana check
  if (player.mana < COST_SPELL) {
    return { ok: false, reason: "mana" };
  }

  player.mana -= COST_SPELL;
  updateHUD();

  // Animation data returned to controller
  const anim = {
    type: "spell",
    chargeTime: CHARGE_TIME,
    explodeTime: EXPLODE_TIME,
    totalTime: ANIM_TOTAL,
  };

  // Start charge phase
  anim.state = "charging";

  // -------------------------------------
  // After CHARGE_TIME → trigger explosion
  // -------------------------------------
  setTimeout(() => {
    anim.state = "explode";

    const dmg = Math.max(1, (player.spellPower || 0) * DMG_SPELL);

    let hits = 0;
    for (const t of getAllTargets()) {
      if (!t.alive) continue;

      const dx = t.x - player.pos.x;
      const dy = t.y - player.pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < RADIUS_SPELL) {
        if (t.type === "elite") damageElite(t, dmg, "spell");
        else if (t.type === "ogre" || t.maxHp >= 400) damageOgre(t, dmg, "spell");
        else damageGoblin(t, dmg);
        hits++;
      }
    }


    // Sparkle burst effect
    spawnCanvasSparkleBurst(
      player.pos.x,
      player.pos.y,
      26,
      160,
      ["#ffb3e6", "#b3ecff", "#fff2b3", "#cdb3ff", "#b3ffd9", "#ffffff"]
    );

    spawnPulseRing(player.pos.x, player.pos.y, 120, "rgba(255,150,255,0.8)");

    // seekers (3 homing balls)
    for (let i = 0; i < 3; i++) {
    setTimeout(() => {
        spawnSeekerOrb(player.pos.x, player.pos.y, dmg);
    }, 120 + i * 120);  // cool staggered launch
    }

    playSpellCast();
    updateHUD();

  }, CHARGE_TIME);

  // ---------------------------------------------
  // Full animation ends after ANIM_TOTAL duration
  // ---------------------------------------------
  setTimeout(() => {
    anim.state = "done";
  }, ANIM_TOTAL);

  return {
    ok: true,
    anim,
  };
}
