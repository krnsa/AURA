const likes_icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" /></svg>`;

const likes_filled_icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="liked" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/></svg>`;

const delete_icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>`;

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
const loadingSpinner = document.querySelector(".loading-spinner");
let currentUserId;
let currentUsername;

async function findUser() {
  const result1 = await fetch(`${window.CONFIG.API_URL}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data1 = await result1.json();
  userNameEl.textContent = data1.user.username;
  currentUsername = data1.user.username;

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
    loadingSpinner.classList.remove("show");
    postsCountEl.textContent = 0;
    postsListEl.innerHTML = "<p>Error loading posts</p>";
    return;
  }
  const result = await response.json();
  const posts = result.data;
  postsCountEl.textContent = posts.length;
  console.table(posts);
  loadingSpinner.classList.remove("show");
  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.dataset.postId = post.id;

    // Check if user has liked this post
    const isLiked = post.likes && post.likes.includes(currentUsername);
    const likeIconToUse = isLiked ? likes_filled_icon : likes_icon;

    card.innerHTML = `
        ${post.url ? `<img src="${post.url}" alt="Post image">` : ""}
        ${post.body ? `<div class="post-text">${post.body}</div>` : ""}
        <div class="post-stats">
          <div class="likes-count" data-post-id="${post.id}" data-liked="${isLiked}">
            ${likeIconToUse}
            <span>${post.likes ? post.likes.length : 0}</span>
          </div>
          <div class="delete-post" data-post-id="${post.id}">
            ${delete_icon}
          </div>
        </div>
      `;

    // Add event listeners for like and delete actions
    card.querySelector(".likes-count").addEventListener("click", handleLikeClick);
    card.querySelector(".delete-post").addEventListener("click", handleDeleteClick);

    postsListEl.appendChild(card);
  });
}

async function handleLikeClick(e) {
  e.preventDefault();
  const likeElement = e.currentTarget;
  const postId = likeElement.dataset.postId;
  const isLiked = likeElement.dataset.liked === "true";
  const countElement = likeElement.querySelector("span");
  const iconElement = likeElement.querySelector("svg");

  try {
    if (isLiked) {
      // Unlike post
      const response = await fetch(`${window.CONFIG.API_URL}/api/removeLike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: postId }),
      });

      if (response.ok) {
        // Update UI
        likeElement.dataset.liked = "false";
        iconElement.outerHTML = likes_icon;
        const currentLikes = parseInt(countElement.textContent);
        countElement.textContent = Math.max(0, currentLikes - 1);
      }
    } else {
      // Like post
      const response = await fetch(`${window.CONFIG.API_URL}/api/likePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: postId }),
      });

      if (response.ok) {
        // Update UI
        likeElement.dataset.liked = "true";
        iconElement.outerHTML = likes_filled_icon;
        const currentLikes = parseInt(countElement.textContent);
        countElement.textContent = currentLikes + 1;
      }
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

async function handleDeleteClick(e) {
  e.preventDefault();
  const postId = e.currentTarget.dataset.postId;

  // Confirm deletion
  if (!confirm("Are you sure you want to delete this post?")) {
    return;
  }

  try {
    const response = await fetch(`${window.CONFIG.API_URL}/api/removePost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: currentUserId,
        post_id: postId,
      }),
    });

    if (response.ok) {
      // Remove post from UI
      const postElement = document.querySelector(`.post-card[data-post-id="${postId}"]`);
      if (postElement) {
        postElement.remove();

        // Update post count
        const currentCount = parseInt(postsCountEl.textContent);
        postsCountEl.textContent = Math.max(0, currentCount - 1);
      }
    } else {
      const error = await response.json();
      alert(`Failed to delete post: ${error.error || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("An error occurred while deleting the post");
  }
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
