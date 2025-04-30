document.addEventListener("DOMContentLoaded", function () {
  let cartCount = 0;
  const cartItems = [];
  const productsGrid = document.querySelector(".products-grid");
  const productSearch = document.getElementById("product-search");

  const token = localStorage.getItem("token");

  loadProducts();

  productSearch.addEventListener("input", function (e) {
    const query = e.target.value.trim();

    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      loadProducts(query);
    }, 300);
  });

  async function loadProducts(searchQuery = null) {
    try {
      const url = new URL(`${window.CONFIG.API_URL}/api/getProducts`);
      url.searchParams.set("searchQuery", searchQuery);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  function displayProducts(products) {
    productsGrid.innerHTML = "";

    if (!products || products.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products">
          <p>No products found.</p>
        </div>
      `;
      return;
    }

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";

      const formattedPrice = parseFloat(product.price).toFixed(2);

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

    attachAddToCartListeners();
  }

  function attachAddToCartListeners() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();

        const productCard = this.closest(".product-card");
        const productId = this.dataset.productId;
        const productName = productCard.querySelector("h3").textContent;
        const priceText =
          productCard.querySelector(".product-price").textContent;
        const productPrice = Number(priceText.replace("$", ""));

        const productData = {
          id: productId,
          name: productName,
          price: productPrice,
        };

        if (cartItems[productId]) {
          cartItems[productId].quantity += 1;
        } else {
          cartItems[productId] = {
            product: productData,
            quantity: 1,
          };
        }

        cartCount++;

        updateCartCountDisplay();

        animateAddToCart(this);

        showAddedToCartNotification(productName);
      });
    });
  }

  function updateCartCountDisplay() {
    const cartCountElement = document.querySelector(".cart-count");
    if (cartCountElement) {
      cartCountElement.textContent = cartCount;

      if (cartCount === 0) {
        cartCountElement.style.display = "none";
      } else {
        cartCountElement.style.display = "flex";
      }
    }
  }

  function animateAddToCart(button) {
    button.classList.add("button-clicked");

    setTimeout(() => {
      button.classList.remove("button-clicked");
    }, 300);
  }

  function showAddedToCartNotification(productName) {
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
      <span class="material-symbols-outlined">check_circle</span>
      <p>${productName} added to cart</p>
    `;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  const cartButton = document.querySelector(".cart-button");
  if (cartButton) {
    cartButton.addEventListener("click", function () {
      alert(`You have ${cartCount} item(s) in your cart.`);
    });
  }

  const cartPanel = document.getElementById("cart-panel");
  const closeCartButton = document.getElementById("close-cart");
  const cartItemsDiv = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");

  if (cartButton) {
    cartButton.addEventListener("click", () => {
      renderCartItemsPanel();
      cartPanel.classList.remove("hidden");
    });
  }

  if (closeCartButton) {
    closeCartButton.addEventListener("click", () => {
      cartPanel.classList.add("hidden");
    });
  }

  function renderCartItemsPanel() {
    cartItemsDiv.innerHTML = "";

    const entries = Object.values(cartItems);

    if (entries.length === 0) {
      cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
      cartTotalEl.textContent = "0.00";
      return;
    }

    let total = 0;

    entries.forEach(({ product, quantity }) => {
      const itemEl = document.createElement("div");
      itemEl.classList.add("cart-item");
      const subtotal = product.price * quantity;
      total += subtotal;

      itemEl.innerHTML = `
        <p>${product.name} x ${quantity}</p>
        <p>$${subtotal.toFixed(2)}</p>
      `;

      cartItemsDiv.appendChild(itemEl);
    });

    cartTotalEl.textContent = total.toFixed(2);
  }

  const payNowButton = document.createElement("button");
  payNowButton.id = "pay-now-btn";
  payNowButton.classList.add("pay-now-btn"); 
  payNowButton.textContent = "Pay Now";
  cartPanel.appendChild(payNowButton);

  if (payNowButton) {
    payNowButton.addEventListener("click", () => {
      const entries = Object.values(cartItems);
  
      if (entries.length === 0) {
        alert("Your cart is empty.");
        return;
      }
  
      cartPanel.classList.add("hidden");
  
      renderCheckoutPanel(entries);
    });
  }

  function renderCheckoutPanel() {
    const checkoutPanel = document.createElement("div");
    checkoutPanel.classList.add("checkout-panel");

    const entries = Object.values(cartItems);
    let total = 0;

    entries.forEach(({ product, quantity }) => {
      total += product.price * quantity;
    });

    checkoutPanel.innerHTML = `
      <h2>Checkout</h2>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <ul>
          ${entries.map(({ product, quantity }) => `
            <li>${product.name} x ${quantity} - $${(product.price * quantity).toFixed(2)}</li>
          `).join('')}
        </ul>
        <p>Total: $${total.toFixed(2)}</p>
      </div>
      <form id="payment-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" required />
        </div>
        <div class="form-group">
          <label for="address">Shipping Address</label>
          <textarea id="address" required></textarea>
        </div>
        <div class="form-group">
          <label for="credit-card">Credit Card Number</label>
          <input type="text" id="credit-card" required />
        </div>
        <button type="submit" id="confirm-payment">Confirm Payment</button>
      </form>
    `;

    document.body.appendChild(checkoutPanel);

    const paymentForm = document.getElementById("payment-form");
    paymentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      confirmPayment();
    });
  }

  function confirmPayment() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const creditCard = document.getElementById("credit-card").value;

    if (!name || !email || !address || !creditCard) {
      alert("Please fill in all the fields.");
      return;
    }

    alert("Payment confirmed! Your order will be processed shortly.");
    document.querySelector(".checkout-panel").remove(); 
  }


  const style = document.createElement("style");
  style.textContent = `
    .pay-now-btn {
      background-color: #4CAF50; /* Green background */
      color: white; /* White text */
      font-family: 'Arial', sans-serif; /* Custom font */
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }

    .pay-now-btn:hover {
      background-color: #45a049;
    }

    .checkout-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgb(18, 7, 58);
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1000;
    }

    .checkout-panel h2 {
      margin-bottom: 20px;
    }

    .checkout-panel .form-group {
      margin-bottom: 15px;
    }

    .checkout-panel .form-group label {
      display: block;
      margin-bottom: 5px;
    }

    .checkout-panel .form-group input,
    .checkout-panel .form-group textarea {
      width: 100%;
      padding: 8px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .checkout-panel button {
      background-color: #4CAF50;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }

    .checkout-panel button:hover {
      background-color: #45a049;
    }
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
