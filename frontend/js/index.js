import animateText from "./components/animateText.js";
import createBackgroundElements from "./components/createBackgroundElements.js";

document.addEventListener("DOMContentLoaded", main);
const token = localStorage.getItem("token");
const userNameEl = document.querySelector(".username");
const userNameIdEl = document.querySelector(".user-id");
const loadingScreen = document.getElementById("loading-screen");
const menu = document.querySelector(".menu");

async function main() {
  // Display username and ID
  const res = await fetch(`${window.CONFIG.API_URL}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  userNameEl.textContent = data.user.username;
  userNameIdEl.textContent = `@${data.user.username}`;

  // Simulate loading time
  await new Promise((resolve) => setTimeout(resolve, 400));
  loadingScreen.style.opacity = "0";

  // Wait for the fade-out transition to finish
  await new Promise((resolve) => setTimeout(resolve, 200));
  loadingScreen.style.display = "none";
  menu.classList.add("show");

  // Initialize the text animation and background elements after loading
  animateText();
  createBackgroundElements();
}
