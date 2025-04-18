document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const menu = document.querySelector(".menu");

  const hideLoadingScreen = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    loadingScreen.style.opacity = "0";

    await new Promise((resolve) => setTimeout(resolve, 500));

    loadingScreen.style.display = "none";
    menu.classList.add("show");
  };

  hideLoadingScreen();

  document.querySelector('a[href="/search.html"]').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = './search.html';
  });
});
