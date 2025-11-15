export function updateHUD() {
  if (!waveDisplay || !goldDisplay || !diamondDisplay || !livesDisplay) return;

  const { gold, diamonds } = getCurrencies();
  const p = gameState.player || {};

  // 🌊 Wave (REAL wave engine values)
  const wave = gameState.wave ?? 1;
  const total = gameState.totalWaves ?? 1;
  waveDisplay.textContent = `Wave ${wave} / ${total}`;

  // 💰 Gold / Diamonds
  goldDisplay.textContent = `Gold: ${gold}`;
  diamondDisplay.textContent = `Diamonds: ${diamonds}`;

  // ❤️ Lives
  const playerLives = p.lives ?? 10;
  livesDisplay.textContent = `Lives: ${playerLives}`;

  // 💖 HP + MANA BARS
  const hpBar = document.getElementById("hp-bar");
  const manaBar = document.getElementById("mana-bar");
  const hpText = document.getElementById("hp-text");
  const manaText = document.getElementById("mana-text");

  if (hpBar && manaBar) {
    const hp = Number(p.hp) || 0;
    const maxHp = Number(p.maxHp) || 100;
    const mana = Number(p.mana) || 0;
    const maxMana = Number(p.maxMana) || 50;

    const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    const manaPct = Math.max(0, Math.min(100, (mana / maxMana) * 100));

    hpBar.style.setProperty("--fill", `${hpPct}%`);
    manaBar.style.setProperty("--fill", `${manaPct}%`);

    if (hpText) hpText.textContent = `${Math.round(hp)} / ${Math.round(maxHp)}`;
    if (manaText)
      manaText.textContent = `${Math.round(mana)} / ${Math.round(maxMana)}`;
  }

  updateTurretBar();
}
