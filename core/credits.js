import { showScreen } from "./screens.js";
import { initHub } from "./hub.js";

export function initCredits() {
    const btn = document.getElementById("credits-back-btn");
    if (!btn) return;

    btn.onclick = () => {
        showScreen("hub-screen");
        setTimeout(() => initHub(), 50);
    };

    console.log("🎬 Credits screen initialized.");
}

// Call when finishing Map 9
export function showCredits() {
    showScreen("credits-screen");
    console.log("🎉 Showing credits screen.");
}
