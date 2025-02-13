setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('container').classList.remove('hidden');
}, 4000);  // Changed to 4000ms (4 seconds)