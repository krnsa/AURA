// Add this code to shop.js, right after the existing code
// Product upload overlay functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get the floating action button
  const floatingActionBtn = document.querySelector(".floating-action-btn");

  // Create product upload overlay HTML
  const overlayHTML = `
      <div class="overlay-backdrop">
        <div class="product-upload-form">
          <div class="form-header">
            <h3>Add New Product</h3>
            <span class="close-overlay material-symbols-outlined">close</span>
          </div>
          <div class="form-content">
            <div class="form-group">
              <label for="product-title">Product Title</label>
              <input type="text" id="product-title" placeholder="Enter product title">
            </div>
            <div class="form-group">
              <label for="product-description">Description</label>
              <textarea id="product-description" rows="4" placeholder="Enter product description"></textarea>
            </div>
            <div class="form-group">
              <label for="product-price">Price ($)</label>
              <input type="number" id="product-price" placeholder="0.00" step="0.01" min="0">
            </div>
            <div class="form-group">
              <label for="product-image">Product Image</label>
              <div class="file-upload-container">
                <input type="file" id="product-image" accept="image/*" class="file-input">
                <div class="file-upload-button">
                  <span class="material-symbols-outlined">upload_file</span>
                  Choose Image
                </div>
                <div class="file-name">No file selected</div>
              </div>
            </div>
            <div class="image-preview-container">
              <p>Image Preview</p>
              <div class="image-preview">
                <img src="/api/placeholder/400/320" alt="Product preview" id="image-preview-element">
              </div>
            </div>
            <button class="publish-btn">
              <span class="material-symbols-outlined">publish</span>
              Publish Product
            </button>
          </div>
        </div>
      </div>
    `;

  // Add overlay to the body
  document.body.insertAdjacentHTML("beforeend", overlayHTML);

  // Get references to the overlay elements
  const overlayBackdrop = document.querySelector(".overlay-backdrop");
  const closeOverlay = document.querySelector(".close-overlay");

  const fileInput = document.getElementById("product-image");
  const fileName = document.querySelector(".file-name");
  const fileUploadButton = document.querySelector(".file-upload-button");

  const imagePreview = document.getElementById("image-preview-element");
  const publishBtn = document.querySelector(".publish-btn");

  // Handle file selection button click
  fileUploadButton.addEventListener("click", function () {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      // Update filename display
      fileName.textContent = this.files[0].name;

      // Create a URL for the selected file
      const fileReader = new FileReader();
      fileReader.onload = function (e) {
        // Update image preview with selected image
        imagePreview.src = e.target.result;
      };
      fileReader.readAsDataURL(this.files[0]);
    } else {
      // Reset if no file selected
      fileName.textContent = "No file selected";
      imagePreview.src = "/api/placeholder/400/320";
    }
  });

  // Add drag and drop support
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

      // Trigger change event manually to update preview
      const event = new Event("change", { bubbles: true });
      fileInput.dispatchEvent(event);
    }
  });

  // Show overlay when floating action button is clicked
  floatingActionBtn.addEventListener("click", function () {
    overlayBackdrop.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling while overlay is open
  });

  // Close overlay when close button is clicked
  closeOverlay.addEventListener("click", function () {
    overlayBackdrop.classList.remove("active");
    document.body.style.overflow = ""; // Re-enable scrolling
  });

  // Close overlay when clicking outside the form
  overlayBackdrop.addEventListener("click", function (e) {
    if (e.target === overlayBackdrop) {
      overlayBackdrop.classList.remove("active");
      document.body.style.overflow = ""; // Re-enable scrolling
    }
  });

  // Add publish button functionality (non-functional as per requirements)
  publishBtn.addEventListener("click", function () {
    // Show a message that publishing is not implemented
    const title = document.getElementById("product-title").value;

    // Create notification
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

    // Different message based on whether title was provided
    if (title) {
      notification.innerHTML = `
          <span class="material-symbols-outlined">info</span>
          <p>Product "${title}" would be published (functionality not implemented)</p>
        `;
    } else {
      notification.innerHTML = `
          <span class="material-symbols-outlined">info</span>
          <p>Publishing functionality is not implemented</p>
        `;
    }

    // Add notification and remove after delay
    notificationContainer.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  });
});
