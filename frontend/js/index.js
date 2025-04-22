import animateText from "./components/animateText.js";
import createBackgroundElements from "./components/createBackgroundElements.js";

document.addEventListener("DOMContentLoaded", main);

async function main() {
  const loadingScreen = document.getElementById("loading-screen");
  const menu = document.querySelector(".menu");

  // Simulate loading time
  await new Promise((resolve) => setTimeout(resolve, 1000));
  loadingScreen.style.opacity = "0";

  // Wait for the fade-out transition to finish
  await new Promise((resolve) => setTimeout(resolve, 500));
  loadingScreen.style.display = "none";
  menu.classList.add("show");

  // Initialize the text animation and background elements after loading
  animateText();
  createBackgroundElements();
}
