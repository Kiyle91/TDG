// profile.js — manages player profile creation and selection

import { gameState, addProfile, setProfile, loadProfiles } from "../utils/gameState.js";

export function initProfiles() {
  const profileScreen = document.getElementById("profile-screen");
  const slotsContainer = document.querySelector(".profile-slots");
  const createBtn = document.getElementById("create-profile-btn");
  const hub = document.getElementById("hub-screen");

  if (!profileScreen || !slotsContainer) return;

  loadProfiles(); // load saved profiles
  renderProfileSlots(slotsContainer);

  createBtn.addEventListener("click", () => {
    const name = prompt("Enter profile name:");
    if (!name) return;
    const profile = addProfile(name);
    if (!profile) {
      alert("Maximum of 5 profiles reached.");
      return;
    }
    renderProfileSlots(slotsContainer);
  });

  slotsContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("profile-slot")) return;
    const index = e.target.dataset.index;
    const profile = gameState.profiles[index];
    if (!profile) return;

    setProfile(profile);
    console.log(`Profile selected: ${profile.name}`);
    profileScreen.style.opacity = 0;

    setTimeout(() => {
      profileScreen.style.display = "none";
      hub.style.display = "flex";
      fadeIn(hub);
    }, 800);
  });
}

function renderProfileSlots(container) {
  container.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const profile = gameState.profiles[i];
    const slot = document.createElement("div");
    slot.classList.add("profile-slot");
    slot.dataset.index = i;

    if (profile) {
      const date = new Date(profile.created).toLocaleDateString();
      slot.innerHTML = `
        <strong>${profile.name}</strong><br>
        <small>Created: ${date}</small>
      `;
    } else {
      slot.textContent = "Empty Slot";
      slot.style.opacity = 0.5;
    }

    container.appendChild(slot);
  }
}

function fadeIn(element) {
  element.style.opacity = 0;
  element.style.transition = "opacity 0.8s ease";
  requestAnimationFrame(() => (element.style.opacity = 1));
}
