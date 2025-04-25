const usernameElement = document.querySelector("#username");
const postsContainer = document.querySelector(".posts");

// Fetch and display user posts
const fetchPosts = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${window.CONFIG.API_URL}/api/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    if (!result.error) {
      postsContainer.innerHTML = "";
      result.posts.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
            <div class="post-content">
              <p>${post.post_body}</p>
              ${post.post_file ? `<img src="${post.post_file}" alt="Post image">` : ""}
            </div>
          `;
        postsContainer.appendChild(postElement);
      });
    }
  } catch (err) {
    console.error("Error fetching posts:", err);
    postsContainer.innerHTML = "<p style='color: red;'>Error loading posts</p>";
  }
};

// Initialize profile page
const initProfile = () => {
  const token = localStorage.getItem("token");
  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  usernameElement.textContent = `Welcome, ${decodedToken.username}`;
  fetchPosts();
};

const updateStats = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${window.CONFIG.API_URL}/api/user/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const stats = await response.json();

    document.getElementById("posts-count").textContent = stats.posts;
    document.getElementById("followers-count").textContent = stats.followers;
    document.getElementById("following-count").textContent = stats.following;
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
};

const handleNewPost = () => {
  const modal = document.getElementById("post-modal");
  const uploadBtn = document.getElementById("upload-post");
  const fileInput = document.getElementById("post-image");
  const postText = document.getElementById("post-text");

  document.getElementById("new-post-btn").onclick = () => {
    modal.style.display = "block";
  };

  uploadBtn.onclick = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${window.CONFIG.API_URL}/api/posts/new`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      if (response.ok) {
        modal.style.display = "none";
        fetchPosts();
        updateStats();
      }
    } catch (err) {
      console.error("Error uploading post:", err);
    }
  };
};

// initProfile();
// updateStats();
// handleNewPost();
