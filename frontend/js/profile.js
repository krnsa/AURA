window.addEventListener("DOMContentLoaded", () => {
  const usernameElement = document.querySelector("#username");
  const postsContainer = document.querySelector("#posts-container");
  const logoutButton = document.querySelector("#logout-button");

  // Fetch and display user posts
  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in. Redirecting to login...");
      window.location.href = "./login.html";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/getPosts", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ user_id: null }) // null gets all posts
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
              ${post.post_file ? `<img src="${post.post_file}" alt="Post image">` : ''}
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

  // Handle logout
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("You have been logged out.");
    window.location.href = "./login.html";
  });

  // Initialize profile page
  const initProfile = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in. Redirecting to login...");
      window.location.href = "./login.html";
      return;
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    usernameElement.textContent = `Welcome, ${decodedToken.username}`;
    fetchPosts();
  };

  const updateStats = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:5000/api/user/stats", {
            headers: { Authorization: `Bearer ${token}` }
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
        const text = postText.value;

        try {
            const response = await fetch("http://localhost:5000/api/newPost", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}` 
                },
                body: JSON.stringify({
                    user_id: getUserIdFromToken(),
                    post_body: text,
                    post_file: file ? await fileToBase64(file) : null
                })
            });
            
            if (response.ok) {
                modal.style.display = "none";
                fetchPosts();
                fileInput.value = "";
                postText.value = "";
            }
        } catch (err) {
            console.error("Error creating post:", err);
        }
    };
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id;
};

  initProfile();
  updateStats();
  handleNewPost();
});
