document.addEventListener("DOMContentLoaded", () => {
  const userNameEl = document.querySelector(".user-name");
  const postsCountEl = document.getElementById("posts-count");
  const followersCountEl = document.getElementById("followers-count");
  const followingCountEl = document.getElementById("following-count");
  const postsListEl = document.querySelector(".posts-list");
  const token = localStorage.getItem("token");
  let currentUserId;

  async function findUser() {
    const result1 = await fetch(`${window.CONFIG.API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data1 = await result1.json();
    userNameEl.textContent = data1.user.username;

    const result2 = await fetch(
      `${window.CONFIG.API_URL}/api/findUser?username=${data1.user.username}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data2 = await result2.json();
    currentUserId = data2.id;
    console.log(data2);
  }

  async function fetchPosts() {
    const res = await fetch(`${window.CONFIG.API_URL}/api/getPosts?user_id=${currentUserId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    postsListEl.innerHTML = "";
    if (!res.ok) {
      postsListEl.innerHTML = "<p>Error loading posts</p>";
      return;
    }
    const posts = await res.json();
    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
        ${post.url ? `<img src="${post.url}" alt="Post image">` : ""}
        ${post.body ? `<div class="post-text">${post.body}</div>` : ""}
      `;
      postsListEl.appendChild(card);
    });
  }

  async function init() {
    await findUser();
    await fetchPosts();
  }

  init().catch(console.error);
});
