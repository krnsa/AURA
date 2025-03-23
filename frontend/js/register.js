window.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("#register-form");
  const errorContainer = document.querySelector("#error-container");

  // Validate form inputs
  const validateForm = (username, password) => {
    const errors = {};

    // Username validation
    if (username.length < 3 || username.length > 30) {
      errors.username =
        "Username must be at least 3 characters and at most 30 characters.";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores.";
    }

    // Password validation
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
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
      errorMessage.style.color = "red";
      errorContainer.appendChild(errorMessage);
    });
  };

  // Handle register form submission
  const handleRegister = async (event) => {
    event.preventDefault();

    const username = registerForm.querySelector("#username").value.trim();
    const password = registerForm.querySelector("#password").value.trim();

    // Validate form inputs
    const errors = validateForm(username, password);
    if (Object.keys(errors).length > 0) {
      displayErrors(errors);
      return;
    }

    try {
      // Send register request to the backend
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Registration successful! Redirecting to login...");
        window.location.href = "./login.html";
      } else {
        displayErrors({ general: result.error });
      }
    } catch (err) {
      console.error("Error:", err);
      errorContainer.innerHTML =
        "<p style='color: red;'>An error occurred. Please try again later.</p>";
    }
  };

  registerForm.addEventListener("submit", handleRegister);
});
