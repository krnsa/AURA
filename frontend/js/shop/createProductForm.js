document.addEventListener("DOMContentLoaded", function () {
  const floatingActionBtn = document.querySelector(".floating-action-btn");
  const overlayBackdrop = document.querySelector(".overlay-backdrop");
  const closeOverlay = document.querySelector(".close-overlay");

  const fileInput = document.getElementById("product-image");
  const fileName = document.querySelector(".file-name");
  const fileUploadButton = document.querySelector(".file-upload-button");

  const imagePreview = document.getElementById("image-preview-element");
  const publishBtn = document.querySelector(".publish-btn");

  let imageBase64 = null;

  fileUploadButton.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      fileName.textContent = this.files[0].name;

      const fileReader = new FileReader();
      fileReader.onload = function (e) {
        imagePreview.src = e.target.result;
        imageBase64 = e.target.result; // Store the base64 image data
      };
      fileReader.readAsDataURL(this.files[0]);
    } else {
      fileName.textContent = "No file selected";
      imagePreview.src = "/api/placeholder/400/320";
      imageBase64 = null;
    }
  });

  const uploadContainer = document.querySelector(".file-upload-container");

  uploadContainer.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.classList.add("drag-over");
  });

  uploadContainer.addEventListener("dragleave", function (e) {
    e.preventDefault();
    this.classList.remove("drag-over");
  });

  uploadContainer.addEventListener("drop", function (e) {
    e.preventDefault();
    this.classList.remove("drag-over");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInput.files = e.dataTransfer.files;

      const event = new Event("change", { bubbles: true });
      fileInput.dispatchEvent(event);
    }
  });

  floatingActionBtn.addEventListener("click", function () {
    overlayBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  closeOverlay.addEventListener("click", function () {
    overlayBackdrop.classList.remove("active");
    document.body.style.overflow = "";
  });

  overlayBackdrop.addEventListener("click", function (e) {
    if (e.target === overlayBackdrop) {
      overlayBackdrop.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  publishBtn.addEventListener("click", async function () {
    const title = document.getElementById("product-title").value;
    const description = document.getElementById("product-description").value;
    const price = document.getElementById("product-price").value;

    // Show loading state
    publishBtn.disabled = true;
    publishBtn.innerHTML = `
      <span class="material-symbols-outlined">hourglass_empty</span>
      Uploading...
    `;

    let notificationMessage = "";
    let imageUrl = null;

    if (imageBase64) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Upload the image to Cloudinary through our API
        const response = await fetch(
          `${window.CONFIG.API_URL}/api/createProduct`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              image: imageBase64.split(",")[1],
              title: title,
              description: description,
              price: price,
              userId: localStorage.getItem("userId"),
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error response:", errorText);
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        imageUrl = result.url;
        notificationMessage = `Product "${title}" published!`;
      } catch (error) {
        console.error("Error uploading image:", error);
        notificationMessage = `Error uploading image: ${error.message}`;
      }
    } else {
      notificationMessage = `Product "${title}" would be published without an image`;
    }

    // Reset button state
    publishBtn.disabled = false;
    publishBtn.innerHTML = `
      <span class="material-symbols-outlined">publish</span>
      Publish Product
    `;

    // Show notification
    let notificationContainer = document.querySelector(
      ".notification-container"
    );
    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.className = "notification-container";
      document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerHTML = `
      <span class="material-symbols-outlined">info</span>
      <p>${notificationMessage}</p>
    `;

    if (imageUrl) {
      notification.innerHTML += `<p>Image URL: ${imageUrl}</p>`;
    }

    notificationContainer.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);

    if (imageUrl) {
      setTimeout(() => {
        overlayBackdrop.classList.remove("active");
        document.body.style.overflow = "";
      }, 1000);
    }
  });
});
