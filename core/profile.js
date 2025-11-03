// profile.js — manages player profile selection

export function initProfiles() {
  const profileScreen = document.getElementById("profile-screen");
  const slots = document.querySelectorAll(".profile-slot");
  const createBtn = document.getElementById("create-profile-btn");
  const hub = document.getElementById("hub-screen");

  if (!profileScreen) return;

  slots.forEach((slot) => {
    slot.addEventListener("click", () => {
      console.log(`Selected ${slot.textContent}`);
      profileScreen.style.opacity = 0;
      setTimeout(() => {
        profileScreen.style.display = "none";
        hub.style.display = "flex";
        fadeIn(hub);
      }, 800);
    });
  });

  createBtn.addEventListener("click", () => {
    console.log("Create new profile clicked");
  });
}

function fadeIn(element) {
  element.style.opacity = 0;
  element.style.transition = "opacity 0.8s ease";
  requestAnimationFrame(() => (element.style.opacity = 1));
}
