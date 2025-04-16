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
