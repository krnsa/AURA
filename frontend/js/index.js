document.addEventListener("DOMContentLoaded", main);

async function main() {
  const loadingScreen = document.getElementById("loading-screen");
  const menu = document.querySelector(".menu");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  loadingScreen.style.opacity = "0";

  await new Promise((resolve) => setTimeout(resolve, 500));

  loadingScreen.style.display = "none";
  menu.classList.add("show");
}
