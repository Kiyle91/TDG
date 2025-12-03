// ============================================================
// 🌸 profile.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Profile creation, selection and deletion
// ✦ Works with new stable gameState.js
// ✦ Zero side-effects, fully isolated profiles
// ✦ Smooth UI transitions + pastel modals
// ============================================================

// ------------------------------------------------------------
// Imports
// ------------------------------------------------------------
import {
  gameState,
  addProfile,
  setProfile,
  saveProfiles,
  initProfiles as loadProfileData
} from "../utils/gameState.js";

import { createPlayer, restorePlayer } from "../player/player.js";
import { clearProfileSaves } from "../save/saveSystem.js";

import { showAlert, showConfirm, showInput } from "./alert.js";
import {
  updateHubProfile,
  updateHubCurrencies,
  updateContinueButton
} from "./hub.js";

import { playFairySprinkle } from "../core/soundtrack.js";

// ------------------------------------------------------------
// INITIALISATION ENTRY POINT
// ------------------------------------------------------------
export function initProfiles() {
  const profileScreen = document.getElementById("profile-screen");
  const slotsContainer = document.querySelector(".profile-slots");
  const createBtn = document.getElementById("create-profile-btn");
  const hub = document.getElementById("hub-screen");

  if (!profileScreen || !slotsContainer || !createBtn) return;

  let deleteConfirmOpen = false;

  const lockProfileScreen = () => {
    deleteConfirmOpen = true;
    profileScreen.style.pointerEvents = "none";
  };

  const unlockProfileScreen = () => {
    deleteConfirmOpen = false;
    profileScreen.style.pointerEvents = "";
  };

  const isAlertModalVisible = () => {
    const modalEl = document.getElementById("ow-alert-modal");
    return modalEl && modalEl.style.display === "flex";
  };

  // 🔥 LOAD SAVED PROFILES FROM STORAGE
  loadProfileData();

  // 🔥 Populate UI
  renderProfileSlots(slotsContainer);

  // ------------------------------------------------------------
  // CREATE NEW PROFILE
  // ------------------------------------------------------------
  createBtn.addEventListener("click", () => {
    if (deleteConfirmOpen) return;
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

      // Assign a player to profile
      profile.player = createPlayer();
      saveProfiles();

      // Re-render slots to show new profile
      renderProfileSlots(slotsContainer);

      // Activate new profile
      gameState.activeProfileIndex = gameState.profiles.length - 1;
      setProfile(profile);

      restorePlayer(profile.player);
      gameState.player.name = profile.name;

      playFairySprinkle();

      // Transition into Hub
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
  // PROFILE SLOT INTERACTION
  // ------------------------------------------------------------
  slotsContainer.addEventListener("click", (e) => {
    if (deleteConfirmOpen || isAlertModalVisible()) return;

    playFairySprinkle();

    // DELETE PROFILE
    if (e.target.classList.contains("profile-delete")) {
      const index = Number(e.target.dataset.index);
      const profile = gameState.profiles[index];
      if (!profile) return;

      lockProfileScreen();

      try {
        showConfirm(
          "Are you sure you want to DELETE this profile?",
          () => {
            try {
              clearProfileSaves(profile);
              gameState.profiles.splice(index, 1);

              // Clear runtime references if needed
              if (gameState.profile === profile) {
                gameState.profile = null;
                gameState.player = null;
              }

              // Fix active index
              if (gameState.profiles.length === 0) {
                gameState.activeProfileIndex = -1;
              } else if (gameState.activeProfileIndex >= gameState.profiles.length) {
                gameState.activeProfileIndex = gameState.profiles.length - 1;
              }

              saveProfiles();
              renderProfileSlots(slotsContainer);
              playFairySprinkle();

              // Stay on profile screen after deletion; do not auto-navigate to hub
              profileScreen.style.display = "flex";
              profileScreen.style.opacity = 1;
            } finally {
              unlockProfileScreen();
            }
          },
          () => {
            unlockProfileScreen();
            playFairySprinkle();
          }
        );
      } catch (err) {
        unlockProfileScreen();
        throw err;
      }
      return;
    }

    // SELECT PROFILE
    const slot = e.target.closest(".profile-slot");
    if (!slot || slot.classList.contains("empty")) return;

    const index = Number(slot.dataset.index);
    const profile = gameState.profiles[index];
    if (!profile) return;

    gameState.activeProfileIndex = index;

    setProfile(profile);
    saveProfiles();
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
// RENDER PROFILE LIST
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
// FADE-IN
// ------------------------------------------------------------
function fadeIn(element) {
  element.style.opacity = 0;
  element.style.transition = "opacity 0.8s ease";
  requestAnimationFrame(() => (element.style.opacity = 1));
}

// ============================================================
// END OF FILE
// ============================================================
