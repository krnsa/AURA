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
let followers = [];
let following = [];
let isShowingAllPosts = false; // Default to showing only the current user's posts
const postSectionTitleEl = document.querySelector(".posts-title");
const togglePostsBtn = document.createElement("button");
togglePostsBtn.className = "toggle-posts-btn";
togglePostsBtn.textContent = "Show All Posts";

// Variables for file upload
const uploadInputContainer = document.querySelector(".upload-input-container");
const uploadFilename = document.querySelector(".upload-filename");
const imagePreview = document.querySelector(".image-preview");
const imagePreviewImg = imagePreview.querySelector("img");
const removeImageBtn = document.querySelector(".remove-image");
const uploadProgress = document.querySelector(".upload-progress");
const uploadProgressBar = document.querySelector(".upload-progress-bar");

// Handle file selection and preview
uploadInput.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    // Display file name
    uploadFilename.textContent = file.name;

    // Display image preview
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreviewImg.src = e.target.result;
      imagePreview.classList.add("active");
    };
    reader.readAsDataURL(file);
  } else {
    uploadFilename.textContent = "";
    imagePreview.classList.remove("active");
  }
});

// Remove selected image
removeImageBtn.addEventListener("click", function () {
  uploadInput.value = "";
  uploadFilename.textContent = "";
  imagePreview.classList.remove("active");
});

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

  // Fetch followers data
  await fetchFollowersData();

  console.log(user);
}

async function fetchFollowersData() {
  try {
    // Fetch followers and following data
    const followersResponse = await fetch(
      `${window.CONFIG.API_URL}/api/getFollowers?username=${currentUsername}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (followersResponse.ok) {
      const result = await followersResponse.json();

      if (result.data) {
        // Fetch followers (people following this user)
        followers = result.data.followers || [];
        followersCountEl.textContent = followers.length;

        // Fetch following (people this user is following)
        following = result.data.following || [];
        followingCountEl.textContent = following.length;
      } else {
        console.error("Invalid followers data format");
        followersCountEl.textContent = 0;
        followingCountEl.textContent = 0;
      }
    } else {
      console.error("Failed to fetch followers data");
      followersCountEl.textContent = 0;
      followingCountEl.textContent = 0;
    }
  } catch (error) {
    console.error("Error fetching followers data:", error);
    followersCountEl.textContent = 0;
    followingCountEl.textContent = 0;
  }
}

async function followUserAction(userToFollow) {
  try {
    const response = await fetch(`${window.CONFIG.API_URL}/api/followUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_to_follow: userToFollow }),
    });

    if (response.ok) {
      // Update the followers/following data
      await fetchFollowersData();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error following user:", error);
    return false;
  }
}

async function unfollowUserAction(userToUnfollow) {
  try {
    const response = await fetch(`${window.CONFIG.API_URL}/api/unfollowUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_to_unfollow: userToUnfollow }),
    });

    if (response.ok) {
      // Update the followers/following data
      await fetchFollowersData();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return false;
  }
}

// Check if the current user is following a specific user
function isFollowing(username) {
  return following.some((relation) => relation.followed_user === username);
}

async function fetchPosts() {
  // Pass user_id only if showing current user's posts
  const url = isShowingAllPosts
    ? `${window.CONFIG.API_URL}/api/getPosts`
    : `${window.CONFIG.API_URL}/api/getPosts?user_id=${currentUserId}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Fetching posts from:", response);
  postsListEl.innerHTML = "";
  loadingSpinner.classList.add("show");

  if (!response.ok) {
    loadingSpinner.classList.remove("show");
    postsCountEl.textContent = 0;
    postsListEl.innerHTML = "<p>Error loading posts</p>";
    return;
  }

  const result = await response.json();
  const posts = result.data;

  // Update the posts count only if showing current user's posts
  if (!isShowingAllPosts) {
    postsCountEl.textContent = posts.length;
  }

  console.table(posts);
  loadingSpinner.classList.remove("show");

  // Handle case when there are no posts
  if (posts.length === 0) {
    postsListEl.innerHTML = `<p class="no-posts">No posts ${
      isShowingAllPosts ? "available" : "yet"
    }</p>`;
    return;
  }

  renderPosts(posts);
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

        // Update count only when showing own posts
        if (!isShowingAllPosts) {
          const currentCount = parseInt(postsCountEl.textContent);
          postsCountEl.textContent = Math.max(0, currentCount - 1);
        }

        // Check if no more posts are available
        if (postsListEl.children.length === 0) {
          postsListEl.innerHTML = `<p class="no-posts">No posts ${
            isShowingAllPosts ? "available" : "yet"
          }</p>`;
        }
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

    // Show upload progress bar
    uploadProgress.classList.add("active");
    uploadProgressBar.style.width = "0%";

    // Show upload progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      uploadProgressBar.style.width = `${Math.min(progress, 90)}%`;

      if (progress >= 90) {
        clearInterval(progressInterval);
      }
    }, 100);

    const response = await fetch(`${window.CONFIG.API_URL}/api/newPost`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    // Complete upload
    clearInterval(progressInterval);
    uploadProgressBar.style.width = "100%";

    const result = await response.json();

    setTimeout(() => {
      uploadProgress.classList.remove("active");

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        postTextInput.value = "";
        uploadInput.value = "";
        uploadFilename.textContent = "";
        imagePreview.classList.remove("active");

        fetchPosts();
      }
    }, 500);
  } catch (error) {
    console.error("Error creating post:", error);
    alert("Failed to create post. Please try again.");
    uploadProgress.classList.remove("active");
  } finally {
    uploadSubmitBtn.disabled = false;
    uploadSubmitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      Post
    `;
  }
}

// Add event delegation for follower-related UI elements
function setupFollowerEvents() {
  document.addEventListener("click", async (e) => {
    // Skip if the button is inside a post card
    if (e.target.closest(".post-card")) {
      return; // Skip if the button is inside a post card
    }

    // Handle buttons outside of posts (e.g., in follower list)
    if (e.target.classList.contains("follow-btn")) {
      const userToFollow = e.target.dataset.username;
      const success = await followUserAction(userToFollow);
      if (success) {
        e.target.classList.remove("follow-btn");
        e.target.classList.add("unfollow-btn");
        e.target.textContent = "Unfollow";
      }
    } else if (e.target.classList.contains("unfollow-btn")) {
      const userToUnfollow = e.target.dataset.username;
      const success = await unfollowUserAction(userToUnfollow);
      if (success) {
        e.target.classList.remove("unfollow-btn");
        e.target.classList.add("follow-btn");
        e.target.textContent = "Follow";
      }
    }
  });
}

// Add this to enhance the profile page with follower lists
function addFollowerInteractivity() {
  // Make follower and following counts clickable to show a modal with the lists
  followersCountEl.parentElement.style.cursor = "pointer";
  followingCountEl.parentElement.style.cursor = "pointer";

  followersCountEl.parentElement.addEventListener("click", () => {
    showFollowersList("followers");
  });

  followingCountEl.parentElement.addEventListener("click", () => {
    showFollowersList("following");
  });
}

// Function to display followers or following in a modal
async function showFollowersList(type) {
  // Create modal structure
  const modal = document.createElement("div");
  modal.className = "followers-modal";

  // Set modal header based on type
  const title = type === "followers" ? "Followers" : "Following";

  modal.innerHTML = `
    <div class="followers-modal-content">
      <div class="followers-modal-header">
        <h3>${title}</h3>
        <span class="followers-modal-close">&times;</span>
      </div>
      <div class="followers-modal-body">
        <div class="followers-list">
          <!-- List will be populated with followers -->
          <div class="followers-loading">Loading...</div>
        </div>
      </div>
    </div>
  `;

  // Add modal to body
  document.body.appendChild(modal);

  // Add close functionality
  const closeBtn = modal.querySelector(".followers-modal-close");
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Close when clicking outside the modal content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  // Populate the list based on type
  const listEl = modal.querySelector(".followers-list");

  try {
    // Fetch the latest followers data
    await fetchFollowersData();

    let usersToDisplay = [];
    if (type === "followers") {
      // Display the list of users following this user
      usersToDisplay = followers.map((f) => f.following_user);
    } else {
      // Display the list of users followed by this user
      usersToDisplay = following.map((f) => f.followed_user);
    }

    if (usersToDisplay.length === 0) {
      listEl.innerHTML = `<p class="no-followers">No ${type} yet</p>`;
      return;
    }

    // Clear loading indicator
    listEl.innerHTML = "";

    // For each username, fetch their details and add to the list
    for (const username of usersToDisplay) {
      // Create a placeholder while we fetch the user details
      const userItem = document.createElement("div");
      userItem.className = "follower-item loading";
      userItem.innerHTML = `
        <div class="follower-avatar placeholder"></div>
        <div class="follower-info">
          <div class="follower-username placeholder">${username}</div>
        </div>
      `;
      listEl.appendChild(userItem);

      // Fetch user details
      try {
        const response = await fetch(`${window.CONFIG.API_URL}/api/findUser?username=${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const user = await response.json();

          // Update the user item with real data
          userItem.className = "follower-item";

          // Determine if the current user is following this user
          const isCurrentlyFollowing = isFollowing(username);

          userItem.innerHTML = `
            <div class="follower-avatar">
              <img src="${user.avatar_url || "/img/default-avatar.png"}" alt="${username}'s avatar">
            </div>
            <div class="follower-info">
              <div class="follower-username">${username}</div>
            </div>
            ${
              username !== currentUsername
                ? `
              <button class="${
                isCurrentlyFollowing ? "unfollow-btn" : "follow-btn"
              }" data-username="${username}">
                ${isCurrentlyFollowing ? "Unfollow" : "Follow"}
              </button>
            `
                : ""
            }
          `;
        }
      } catch (error) {
        console.error(`Error fetching user ${username}:`, error);
        userItem.innerHTML = `
          <div class="follower-info">
            <div class="follower-username">${username}</div>
            <div class="follower-error">Error loading user details</div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error(`Error displaying ${type}:`, error);
    listEl.innerHTML = `<p class="followers-error">Error loading ${type}</p>`;
  }
}

async function renderPosts(posts) {
  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.dataset.postId = post.id;

    const isCurrentUser = post.user === currentUserId;
    const isFollowingUser = !isCurrentUser && isFollowing(post.username);

    // Check if the user has liked this post
    const isLiked = post.likes && post.likes.includes(currentUsername);
    const likeIconToUse = isLiked ? likes_filled_icon : likes_icon;

    // Create post content HTML
    let postHTML = `
      <div class="post-header">
        <div class="post-user-info">
          <div class="post-avatar">
            <img src="${post.avatar_url}" alt="${post.username}'s avatar">
          </div>
          <div class="post-username">${post.username}</div>
        </div>
    `;

    // Add follow/unfollow button if not current user
    if (!isCurrentUser) {
      postHTML += `
        <button class="${isFollowingUser ? "unfollow-btn" : "follow-btn"} post-follow-btn" 
                data-username="${post.username}">
          ${isFollowingUser ? "Unfollow" : "Follow"}
        </button>
      `;
    }

    postHTML += `
      </div>
      ${post.url ? `<img src="${post.url}" alt="Post image">` : ""}
      ${post.body ? `<div class="post-text">${post.body}</div>` : ""}
      <div class="post-stats">
        <div class="likes-count" data-post-id="${post.id}" data-liked="${isLiked}">
          ${likeIconToUse}
          <span>${post.likes ? post.likes.length : 0}</span>
        </div>
        ${
          isCurrentUser
            ? `
          <div class="delete-post" data-post-id="${post.id}">
            ${delete_icon}
          </div>
        `
            : ""
        }
      </div>
    `;

    card.innerHTML = postHTML;

    // Add event listeners
    card.querySelector(".likes-count").addEventListener("click", handleLikeClick);

    if (isCurrentUser) {
      card.querySelector(".delete-post").addEventListener("click", handleDeleteClick);
    }

    if (!isCurrentUser) {
      const followBtn = card.querySelector(".post-follow-btn");
      followBtn.addEventListener("click", function (e) {
        const isUnfollowBtn = this.classList.contains("unfollow-btn");
        const username = this.dataset.username;

        if (isUnfollowBtn) {
          unfollowUserAction(username).then((success) => {
            if (success) {
              this.classList.remove("unfollow-btn");
              this.classList.add("follow-btn");
              this.textContent = "Follow";
            }
          });
        } else {
          followUserAction(username).then((success) => {
            if (success) {
              this.classList.remove("follow-btn");
              this.classList.add("unfollow-btn");
              this.textContent = "Unfollow";
            }
          });
        }
      });
    }

    postsListEl.appendChild(card);
  });
}

async function togglePostsView() {
  isShowingAllPosts = !isShowingAllPosts;

  // Update button text based on the current view
  togglePostsBtn.textContent = isShowingAllPosts ? "Show My Posts" : "Show All Posts";

  // Update the title based on the current view
  postSectionTitleEl.textContent = isShowingAllPosts ? "All Posts" : "Your Posts";

  // Fetch all posts if showing all posts, otherwise fetch only the current user's posts
  await fetchPosts();
}

async function init() {
  await findUser();

  // Initialize the title
  postSectionTitleEl.textContent = "Your Posts";

  // Add toggle button to the page
  const postSectionHeader = document.createElement("div");
  postSectionHeader.className = "posts-header";
  postSectionHeader.appendChild(postSectionTitleEl); // Move existing title to new container
  postSectionHeader.appendChild(togglePostsBtn);

  const postSection = document.querySelector(".post-section");
  if (postSection.firstChild) {
    postSection.insertBefore(postSectionHeader, postSection.firstChild);
  } else {
    postSection.appendChild(postSectionHeader);
  }

  // Add toggle button event listener
  togglePostsBtn.addEventListener("click", togglePostsView);

  await fetchPosts();
  setupFollowerEvents();
  addFollowerInteractivity();

  uploadSubmitBtn.addEventListener("click", createNewPost);
}

init().catch(console.error);
