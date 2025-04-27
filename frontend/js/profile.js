document.addEventListener("DOMContentLoaded", () => {
  const userNameEl = document.querySelector(".user-name");
  const postsCountEl = document.getElementById("posts-count");
  const followersCountEl = document.getElementById("followers-count");
  const followingCountEl = document.getElementById("following-count");
  const postsListEl = document.querySelector(".posts-list");
  const token = localStorage.getItem("token");
  let currentUserId;

  async function fetchUsername() {
    const res = await fetch(`${window.CONFIG.API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    userNameEl.textContent = json.user.username;
  }

  // To be implemented in the backend
  async function fetchStats() {
    const res = await fetch(`${window.CONFIG.API_URL}/api/user/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Stats fetch failed");
    const stats = await res.json();
    currentUserId = stats.userId;
    postsCountEl.textContent = stats.posts;
    followersCountEl.textContent = stats.followers;
    followingCountEl.textContent = stats.following;
  }

  async function fetchPosts() {
    const res = await fetch(`${window.CONFIG.API_URL}/api/getPosts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: currentUserId }),
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
    await fetchUsername();
    // await fetchStats();
    await fetchPosts();
  }

  init().catch(console.error);
});
