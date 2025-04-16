// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  let cartCount = 0;
  const productsGrid = document.querySelector(".products-grid");
  const productSearch = document.getElementById("product-search");

  // Get token from localStorage (global.js already checks this)
  const token = localStorage.getItem("token");

  // Load products when page loads
  loadProducts();

  // Add search functionality
  productSearch.addEventListener("input", function (e) {
    const query = e.target.value.trim();

    // Debounce search for better performance
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      loadProducts(query);
    }, 300);
  });

  // Function to load products from API
  async function loadProducts(searchQuery = null) {
    try {
      const response = await fetch(`${window.CONFIG.API_URL}/api/getProducts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          searchQuery: searchQuery,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      displayProducts(data.products);
    } catch (error) {
      console.error("Error loading products:", error);
      productsGrid.innerHTML = `
        <div class="error-message">
          <p>Unable to load products. Please try again later.</p>
        </div>
      `;
    }
  }

  // Function to display products on the page
  function displayProducts(products) {
    // Clear existing products
    productsGrid.innerHTML = "";

    if (!products || products.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products">
          <p>No products found.</p>
        </div>
      `;
      return;
    }

    // Create product cards
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";

      // Format price to 2 decimal places
      const formattedPrice = parseFloat(product.price).toFixed(2);

      // Use product image if available, otherwise use placeholder
      const imageUrl = product.image || "/api/placeholder/400/320";

      productCard.innerHTML = `
        <div class="product-image">
          <img src="${imageUrl}" alt="${product.title}">
        </div>
        <div class="product-info">
          <h3>${product.title}</h3>
          <p class="product-description">${product.body}</p>
          <div class="product-footer">
            <span class="product-price">$${formattedPrice}</span>
            <button class="add-to-cart-btn" data-product-id="${product.id}">
              <span class="material-symbols-outlined">shopping_cart</span>
              Add to Cart
            </button>
          </div>
        </div>
      `;

      productsGrid.appendChild(productCard);
    });

    // Reattach event listeners to new buttons
    attachAddToCartListeners();
  }

  // Function to attach event listeners to "Add to Cart" buttons
  function attachAddToCartListeners() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        // Prevent default button behavior
        event.preventDefault();

        // Get the product info
        const productCard = this.closest(".product-card");
        const productName = productCard.querySelector("h3").textContent;
        const productPrice =
          productCard.querySelector(".product-price").textContent;

        // Increment cart count
        cartCount++;

        // Update the cart count display
        updateCartCountDisplay();

        // Animate the button
        animateAddToCart(this);

        // Optionally, show a notification
        showAddedToCartNotification(productName);
      });
    });
  }

  // Update the cart count display
  function updateCartCountDisplay() {
    const cartCountElement = document.querySelector(".cart-count");
    if (cartCountElement) {
      cartCountElement.textContent = cartCount;

      // Toggle visibility based on count
      if (cartCount === 0) {
        cartCountElement.style.display = "none";
      } else {
        cartCountElement.style.display = "flex";
      }
    }
  }

  // Function to animate the "Add to Cart" button
  function animateAddToCart(button) {
    // Add a class for animation
    button.classList.add("button-clicked");

    // Remove the class after animation completes
    setTimeout(() => {
      button.classList.remove("button-clicked");
    }, 300);
  }

  // Function to show a notification when a product is added to cart
  function showAddedToCartNotification(productName) {
    // Check if notification container exists, create if not
    let notificationContainer = document.querySelector(
      ".notification-container"
    );
    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.className = "notification-container";
      document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerHTML = `
      <span class="material-symbols-outlined">check_circle</span>
      <p>${productName} added to cart</p>
    `;

    // Add notification to container
    notificationContainer.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Cart button functionality
  const cartButton = document.querySelector(".cart-button");
  if (cartButton) {
    cartButton.addEventListener("click", function () {
      // Alert for demonstration (you would replace this with proper cart view)
      alert(`You have ${cartCount} item(s) in your cart.`);
    });
  }

  // Add CSS for animations and notifications
  const style = document.createElement("style");
  style.textContent = `
    .button-clicked {
      transform: scale(0.95);
      opacity: 0.8;
      transition: transform 0.3s, opacity 0.3s;
    }
    
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .notification {
      background-color: rgba(102, 126, 234, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: slide-in 0.3s forwards;
    }
    
    .notification .material-symbols-outlined {
      margin-right: 8px;
    }
    
    .notification.fade-out {
      animation: fade-out 0.3s forwards;
    }
    
    .error-message, .no-products {
      width: 100%;
      padding: 20px;
      text-align: center;
      color: #666;
    }
    
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fade-out {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});

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
            <label for="product-image">Image URL</label>
            <input type="text" id="product-image" placeholder="Enter image URL">
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
  const imageUrlInput = document.getElementById("product-image");
  const imagePreview = document.getElementById("image-preview-element");
  const publishBtn = document.querySelector(".publish-btn");

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

  // Update image preview when URL changes
  imageUrlInput.addEventListener("input", function () {
    const url = this.value.trim();
    if (url) {
      imagePreview.src = url;
      // Handle loading errors
      imagePreview.onerror = function () {
        imagePreview.src = "/api/placeholder/400/320";
      };
    } else {
      imagePreview.src = "/api/placeholder/400/320";
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
