// ============================================================
// 🌸 profile.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Manages player profile creation, selection, and deletion
// ✦ Supports up to 6 profile slots in a glowing pastel grid
// ✦ Uses custom pastel alert, confirm, and input modals
// ✦ Handles smooth fade transitions to the hub screen
// ============================================================

import {
  gameState,
  addProfile,
  setProfile,
  saveProfiles,
  loadProfiles
} from "../utils/gameState.js";

import { showAlert, showConfirm, showInput } from "../core/alert.js";

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initProfiles() {
  const profileScreen = document.getElementById("profile-screen");
  const slotsContainer = document.querySelector(".profile-slots");
  const createBtn = document.getElementById("create-profile-btn");
  const hub = document.getElementById("hub-screen");

  if (!profileScreen || !slotsContainer) return;

  // 🌸 Load profiles from localStorage
  loadProfiles();
  renderProfileSlots(slotsContainer);

  // ------------------------------------------------------------
  // 💖 CREATE NEW PROFILE (custom input modal)
  // ------------------------------------------------------------
  createBtn.addEventListener("click", () => {
    showInput("Enter your profile name:", (name) => {
      if (!name) return;

      const profile = addProfile(name);
      if (!profile) {
        showAlert("Maximum of 6 profiles reached.");
        return;
      }

      renderProfileSlots(slotsContainer);
      showAlert(`Profile "${name}" created successfully!`);
    });
  });

  // ------------------------------------------------------------
  // ✨ PROFILE SLOT INTERACTIONS
  // ------------------------------------------------------------
  slotsContainer.addEventListener("click", (e) => {
    // 🗑️ DELETE PROFILE (with pastel confirm)
    if (e.target.classList.contains("profile-delete")) {
      const index = e.target.dataset.index;
      const profile = gameState.profiles[index];
      if (!profile) return;

      showConfirm(
        `Are you sure you want to delete "${profile.name}"?`,
        () => {
          gameState.profiles.splice(index, 1);
          saveProfiles();
          renderProfileSlots(slotsContainer);
          showAlert(`Profile "${profile.name}" deleted successfully.`);
          console.log(`🗑️ Deleted profile: ${profile.name}`);
        },
        () => {
          console.log("❎ Deletion cancelled");
        }
      );

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

    profileScreen.style.opacity = 0;
    setTimeout(() => {
      profileScreen.style.display = "none";
      hub.style.display = "flex";
      fadeIn(hub);
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
