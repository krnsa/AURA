const likes_icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" /></svg>`;

const userNameEl = document.querySelector(".user-name");
const postsCountEl = document.getElementById("posts-count");
const followersCountEl = document.getElementById("followers-count");
const followingCountEl = document.getElementById("following-count");
const postsListEl = document.querySelector(".posts-list");
const token = localStorage.getItem("token");
const avatar = document.querySelector(".user-avatar");
const postTextInput = document.querySelector(".post-text-input");
const uploadInput = document.querySelector(".upload-input");
const uploadSubmitBtn = document.querySelector(".upload-submit");
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
  const user = await result2.json();
  currentUserId = user.id;
  avatar.innerHTML = `<img src="${user.avatar_url}"/>`;
  console.log(user);
}

async function fetchPosts() {
  const response = await fetch(`${window.CONFIG.API_URL}/api/getPosts?user_id=${currentUserId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  postsListEl.innerHTML = "";
  if (!response.ok) {
    postsListEl.innerHTML = "<p>Error loading posts</p>";
    return;
  }
  const result = await response.json();
  const posts = result.data;
  postsCountEl.textContent = posts.length;
  console.table(posts);
  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML = `
        ${post.url ? `<img src="${post.url}" alt="Post image">` : ""}
        ${post.body ? `<div class="post-text">${post.body}</div>` : ""}
        <div class="post-stats">
          <div class="likes-count">
            ${likes_icon}
            <span>${post.likes ? post.likes.length : 0}</span>
          </div>
        </div>
      `;
    postsListEl.appendChild(card);
  });
}

async function createNewPost() {
  uploadSubmitBtn.disabled = true;
  uploadSubmitBtn.textContent = "Posting...";

  try {
    const postText = postTextInput.value.trim();
    const file = uploadInput.files[0];

    if (!postText && !file) {
      alert("Please add some text or an image to your post");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", currentUserId);
    formData.append("post_body", postText);

    if (file) {
      formData.append("post_file", file);
    }

    const response = await fetch(`${window.CONFIG.API_URL}/api/newPost`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      postTextInput.value = "";
      uploadInput.value = "";

      await fetchPosts();
    }
  } catch (error) {
    console.error("Error creating post:", error);
    alert("Failed to create post. Please try again.");
  } finally {
    uploadSubmitBtn.disabled = false;
    uploadSubmitBtn.textContent = "Post";
  }
}

async function init() {
  await findUser();
  await fetchPosts();

  uploadSubmitBtn.addEventListener("click", createNewPost);
}

init().catch(console.error);
