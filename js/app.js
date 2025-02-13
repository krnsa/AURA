document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const menu = document.querySelector('.menu');

    const hideLoadingScreen = async () => {
        await new Promise(resolve => setTimeout(resolve, 3500));
        loadingScreen.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, 500));
        loadingScreen.style.display = 'none';
        menu.classList.add('show');
    };

    hideLoadingScreen();

});