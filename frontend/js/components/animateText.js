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
  "Developers",
];

async function typePhrase(phrase, element) {
  for (let i = 0; i < phrase.length; i++) {
    element.textContent += phrase[i];
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function deletePhrase(element) {
  const phrase = element.textContent;
  for (let i = phrase.length; i > 0; i--) {
    element.textContent = phrase.substring(0, i - 1);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

export default async function animateText() {
  const dynamicText = document.querySelector(".dynamic-text");
  let currentIndex = 0;

  while (true) {
    await typePhrase(phrases[currentIndex], dynamicText);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await deletePhrase(dynamicText);
    await new Promise((resolve) => setTimeout(resolve, 500));

    currentIndex = (currentIndex + 1) % phrases.length;
  }
}
