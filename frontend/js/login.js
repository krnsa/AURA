window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login-form");
  const errorContainer = document.querySelector("#error-container");

  // Validate form inputs
  const validateForm = (username, password) => {
    const errors = {};

    // Username validation
    if (username.length < 3 || username.length > 30) {
      errors.username = "Username must be at least 3 characters and at most 30 characters.";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = "Username can only contain letters, numbers, and underscores.";
    }

    // Password validation
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least one number.";
    }

    return errors;
  };

  // Display errors on the page
  const displayErrors = (errors) => {
    errorContainer.innerHTML = ""; // Clear previous errors

    Object.keys(errors).forEach((key) => {
      const errorMessage = document.createElement("p");
      errorMessage.textContent = errors[key];
      errorContainer.appendChild(errorMessage);
    });
  };

  // Handle login form submission
  const handleLogin = async (event) => {
    event.preventDefault();

    const spinner = document.querySelector("button[type='submit'] .loading-spinner");
    spinner.classList.add("loading");

    const username = loginForm.querySelector("#username").value.trim();
    const password = loginForm.querySelector("#password").value.trim();

    // Validate form inputs
    const errors = validateForm(username, password);
    if (Object.keys(errors).length > 0) {
      spinner.classList.remove("loading");
      displayErrors(errors);
      return;
    }

    try {
      // Send login request to the backend
      const response = await fetch(`${window.CONFIG.API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (result.success) {
        // Store the token in localStorage
        localStorage.setItem("token", result.token);

        // Show success message and redirect to profile page
        alert("Login successful!");
        window.location.href = "/";
      } else {
        // Display error message from the server
        spinner.classList.remove("loading");
        displayErrors({ general: result.error });
      }
    } catch (err) {
      console.error("Error:", err);
      errorContainer.innerHTML =
        "<p style='color: red;'>An error occurred. Please try again later.</p>";
    } finally {
      // Clear the password field
      loginForm.querySelector("#password").value = "";
    }
  };

  loginForm.addEventListener("submit", handleLogin);
});
