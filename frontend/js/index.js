document.addEventListener("DOMContentLoaded", main);

async function main() {
  const loadingScreen = document.getElementById("loading-screen");
  const menu = document.querySelector(".menu");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  loadingScreen.style.opacity = "0";

  await new Promise((resolve) => setTimeout(resolve, 500));

  loadingScreen.style.display = "none";
  menu.classList.add("show");

  animateText();
}

const phrases = [
    "Creators",
    "Entrepreneurs",
    "Communities",
    "Students",
    "Startups",
    "Businesses",
    "Influencers",
    "Brands",
    "Designers",
    "Developers"
];

async function typePhrase(phrase, element) {
    for (let i = 0; i < phrase.length; i++) {
        element.textContent += phrase[i];
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

async function deletePhrase(element) {
    const phrase = element.textContent;
    for (let i = phrase.length; i > 0; i--) {
        element.textContent = phrase.substring(0, i - 1);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

async function animateText() {
    const dynamicText = document.querySelector('.dynamic-text');
    let currentIndex = 0;

    while (true) {
        await typePhrase(phrases[currentIndex], dynamicText);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await deletePhrase(dynamicText);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        currentIndex = (currentIndex + 1) % phrases.length;
    }
}


function createBackgroundElements() {
  const bg = document.querySelector('.transparent-particle-bg');
  
  // Add trails
  for (let i = 0; i < 5; i++) {
      const trail = document.createElement('div');
      trail.className = 'particle-trail';
      trail.style.setProperty('--start-x', `${Math.random() * 100}%`);
      trail.style.setProperty('--end-x', `${Math.random() * 100}%`);
      bg.appendChild(trail);
  }
  
  // Add orbs
  for (let i = 0; i < 3; i++) {
      const orb = document.createElement('div');
      orb.className = 'orb';
      orb.style.left = `${Math.random() * 100}%`;
      orb.style.top = `${Math.random() * 100}%`;
      bg.appendChild(orb);
  }
  
  // Add connections
  for (let i = 0; i < 8; i++) {
      const connection = document.createElement('div');
      connection.className = 'particle-connection';
      connection.style.setProperty('--y-pos', `${Math.random() * 100}%`);
      bg.appendChild(connection);
  }
}

// Add mousemove effect
document.addEventListener('mousemove', (e) => {
  const particles = document.querySelectorAll('.particle');
  particles.forEach(particle => {
      const rect = particle.getBoundingClientRect();
      const x = (e.clientX - rect.left) * 0.1;
      const y = (e.clientY - rect.top) * 0.1;
      particle.style.transform = `translate(${x}px, ${y}px)`;
  });
});

createBackgroundElements();