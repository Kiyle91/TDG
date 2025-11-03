document.querySelectorAll(".map-tile").forEach(tile => {
  tile.addEventListener("click", () => {
    if (!tile.classList.contains("unlocked")) return;
    const level = tile.dataset.level;
    console.log(`🎯 Loading Level ${level}...`);
    // future: show confirmation overlay or load scene
  });
});
