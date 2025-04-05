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
      const response = await fetch("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        postsContainer.innerHTML = ""; // Clear loading message
        result.posts.forEach((post) => {
          const postElement = document.createElement("div");
          postElement.classList.add("post");
          postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
          `;
          postsContainer.appendChild(postElement);
        });
      } else {
        postsContainer.innerHTML = `<p style="color: red;">${result.error}</p>`;
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      postsContainer.innerHTML =
        "<p style='color: red;'>An error occurred. Please try again later.</p>";
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

    document.getElementById("new-post-btn").onclick = () => {
        modal.style.display = "block";
    };

    uploadBtn.onclick = async () => {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("http://localhost:5000/api/posts/new", {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: formData
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

  initProfile();
  updateStats();
  handleNewPost();
});
