// ============================================================
// 🌸 profile.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Player profile creation, selection, deletion
// ✦ Each profile contains full Glitter Guardian data
// ✦ Integrated with pastel modal system + hub transitions
// ============================================================
/* ------------------------------------------------------------
 * MODULE: profile.js
 * PURPOSE:
 *   Handles profile creation, selection, deletion, and loading.
 *   Each profile maintains its own player data, currencies,
 *   progress, and unlocked systems. This module manages the
 *   profile screen UI, modal interactions, and transitions
 *   into the Hub screen.
 *
 * SUMMARY:
 *   • initProfiles() — entry point for rendering slots, binding
 *     events, and loading stored profiles.
 *   • Profiles support: create, delete, select, persistence.
 *   • Creates a fresh Glitter Guardian (player.js) for each
 *     new profile.
 *   • Smooth pastel transitions + custom alert/confirm/input.
 *
 * FEATURES:
 *   • Up to 6 profiles stored in localStorage
 *   • Automatic activeProfileIndex tracking
 *   • Uses Hub UI updates immediately after selection
 *   • Fully integrated with skins, currencies, story system
 *
 * TECHNICAL NOTES:
 *   • saveProfiles() must be called after any modification
 *   • restorePlayer() reinstalls the saved player object
 *   • Profile name syncs directly to gameState.player.name
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import {
  gameState,
  addProfile,
  setProfile,
  saveProfiles,
  loadProfiles
} from "../utils/gameState.js";

import { createPlayer, restorePlayer } from "../core/player.js";
import { showAlert, showConfirm, showInput } from "../core/alert.js";
import {
  updateHubProfile,
  updateHubCurrencies,
  updateContinueButton
} from "./hub.js";
import { playFairySprinkle } from "./soundtrack.js";

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------

export function initProfiles() {
  const profileScreen = document.getElementById("profile-screen");
  const slotsContainer = document.querySelector(".profile-slots");
  const createBtn = document.getElementById("create-profile-btn");
  const hub = document.getElementById("hub-screen");

  if (!profileScreen || !slotsContainer || !createBtn) return;

  loadProfiles();
  renderProfileSlots(slotsContainer);

  // ------------------------------------------------------------
  // 💖 CREATE NEW PROFILE
  // ------------------------------------------------------------

  createBtn.addEventListener("click", () => {
    playFairySprinkle();

    showInput("Enter your profile name:", (name) => {
      if (!name) return;

      const profile = addProfile(name);

      if (profile === false) {
        showAlert("Maximum of 6 profiles reached.");
        playFairySprinkle();
        return;
      }

      if (profile === "duplicate") {
        showAlert(`A profile named "${name}" already exists!`);
        playFairySprinkle();
        return;
      }

      profile.player = createPlayer();
      saveProfiles();
      renderProfileSlots(slotsContainer);

      gameState.activeProfileIndex = gameState.profiles.length - 1;

      setProfile(profile);
      restorePlayer(profile.player);
      gameState.player.name = profile.name;

      playFairySprinkle();

      profileScreen.style.opacity = 0;

      setTimeout(() => {
        profileScreen.style.display = "none";
        hub.style.display = "flex";

        fadeIn(hub);
        updateHubProfile();
        updateHubCurrencies();
        updateContinueButton();

        
      }, 600);
    });
  });

  // ------------------------------------------------------------
  // ✨ PROFILE SLOT INTERACTIONS
  // ------------------------------------------------------------

  slotsContainer.addEventListener("click", (e) => {
    playFairySprinkle();

    // Delete
    if (e.target.classList.contains("profile-delete")) {
      const index = e.target.dataset.index;
      const profile = gameState.profiles[index];
      if (!profile) return;

      showConfirm(
        "Are you sure you want to DELETE this profile?",
        () => {
          gameState.profiles.splice(index, 1);
          saveProfiles();
          renderProfileSlots(slotsContainer);
          playFairySprinkle()
        },
        () => playFairySprinkle()
      );
      return;
    }

    // Select
    const slot = e.target.closest(".profile-slot");
    if (!slot || slot.classList.contains("empty")) return;

    const index = Number(slot.dataset.index);
    const profile = gameState.profiles[index];
    if (!profile) return;

    gameState.activeProfileIndex = index;

    setProfile(profile);
    restorePlayer(profile.player);
    gameState.player.name = profile.name;

    profileScreen.style.opacity = 0;

    setTimeout(() => {
      profileScreen.style.display = "none";
      hub.style.display = "flex";
      fadeIn(hub);
      updateHubProfile();
      updateHubCurrencies();
      updateContinueButton();
    }, 800);
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
// 🌈 FADE-IN UTILITY
// ------------------------------------------------------------

function fadeIn(element) {
  element.style.opacity = 0;
  element.style.transition = "opacity 0.8s ease";
  requestAnimationFrame(() => (element.style.opacity = 1));
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
