// ============================================================
// 🌸 profile.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Manages player profile creation, selection, and deletion
// ✦ Uses consistent screen management via screens.js
// ✦ Ensures only one screen visible at any time
// ============================================================

import {
  gameState,
  addProfile,
  setProfile,
  saveProfiles,
  loadProfiles
} from "../utils/gameState.js";

import { showScreen } from "../core/screens.js";

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initProfiles() {
  const profileScreen = document.getElementById("profile-screen");
  const slotsContainer = document.querySelector(".profile-slots");
  const createBtn = document.getElementById("create-profile-btn");

  if (!profileScreen || !slotsContainer) return;

  // 🌸 Load existing profiles
  loadProfiles();
  renderProfileSlots(slotsContainer);

  // ------------------------------------------------------------
  // 💖 CREATE NEW PROFILE
  // ------------------------------------------------------------
  createBtn.addEventListener("click", () => {
    const name = prompt("Enter profile name:");
    if (!name) return;

    const profile = addProfile(name);
    if (!profile) {
      alert("Maximum of 6 profiles reached.");
      return;
    }

    renderProfileSlots(slotsContainer);
  });

  // ------------------------------------------------------------
  // ✨ PROFILE SLOT INTERACTIONS
  // ------------------------------------------------------------
  slotsContainer.addEventListener("click", (e) => {
    // 🗑️ DELETE PROFILE
    if (e.target.classList.contains("profile-delete")) {
      const index = e.target.dataset.index;
      gameState.profiles.splice(index, 1);
      saveProfiles();
      renderProfileSlots(slotsContainer);
      return;
    }

    // 👑 SELECT PROFILE
    const slot = e.target.closest(".profile-slot");
    if (!slot || slot.classList.contains("empty")) return;

    const index = slot.dataset.index;
    const profile = gameState.profiles[index];
    if (!profile) return;

    setProfile(profile);
    console.log(`👑 Profile selected: ${profile.name}`);
    fadeOut(profileScreen, () => showScreen("hub-screen"));
  });
}

// ------------------------------------------------------------
// 🧩 RENDER PROFILE SLOTS
// ------------------------------------------------------------
function renderProfileSlots(container) {
  container.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const profile = gameState.profiles[i];
    const slot = document.createElement("div");
    slot.classList.add("profile-slot");
    slot.dataset.index = i;

    if (profile) {
      const date = new Date(profile.created).toLocaleDateString();
      slot.innerHTML = `
        <strong>${profile.name}</strong><br>
        <small>Created: ${date}</small>
        <button class="profile-delete" data-index="${i}">×</button>
      `;
    } else {
      slot.classList.add("empty");
      slot.textContent = "Empty Slot";
    }

    container.appendChild(slot);
  }
}

// ------------------------------------------------------------
// 🌈 FADE HELPERS
// ------------------------------------------------------------
function fadeOut(element, callback) {
  element.style.transition = "opacity 0.8s ease";
  element.style.opacity = 0;

  setTimeout(() => {
    element.classList.remove("active");
    element.style.display = "none";
    if (callback) callback();
  }, 800);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
