export default function createBackgroundElements() {
  const bg = document.querySelector(".transparent-particle-bg");

  // Add trails
  for (let i = 0; i < 5; i++) {
    const trail = document.createElement("div");
    trail.className = "particle-trail";
    trail.style.setProperty("--start-x", `${Math.random() * 100}%`);
    trail.style.setProperty("--end-x", `${Math.random() * 100}%`);
    bg.appendChild(trail);
  }

  // Add orbs
  for (let i = 0; i < 3; i++) {
    const orb = document.createElement("div");
    orb.className = "orb";
    orb.style.left = `${Math.random() * 100}%`;
    orb.style.top = `${Math.random() * 100}%`;
    bg.appendChild(orb);
  }

  // Add connections
  for (let i = 0; i < 8; i++) {
    const connection = document.createElement("div");
    connection.className = "particle-connection";
    connection.style.setProperty("--y-pos", `${Math.random() * 100}%`);
    bg.appendChild(connection);
  }
}
