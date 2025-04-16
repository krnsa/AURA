// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize cart count from localStorage or set to 0 if not found
  let cartCount = parseInt(localStorage.getItem("cartCount")) || 0;

  // Update the cart count display
  updateCartCountDisplay();

  // Get all "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  // Add click event listeners to all "Add to Cart" buttons
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

      // Save cart count to localStorage
      localStorage.setItem("cartCount", cartCount);

      // Update the cart count display
      updateCartCountDisplay();

      // Animate the button
      animateAddToCart(this);

      // Optionally, show a notification
      showAddedToCartNotification(productName);
    });
  });

  // Function to update the cart count display
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

  // Cart button functionality - you could expand this to show a cart sidebar/dropdown
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
