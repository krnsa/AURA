export function getAvatarHTML(username) {
  console.log("getAvatarHTML called with username:", username);

  const parts = username.split(" ").filter(Boolean);
  const initials =
    parts.length > 1
      ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
      : username.slice(0, 2).toUpperCase();

  const color = stringToColor(username);

  return `
      <div class="avatar-text" style="background-color: ${color};">
        ${initials}
      </div>
    `;
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}
