window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login-form");
  const errorContainer = document.querySelector("#error-container");

  const validateForm = (username, password) => {
    const errors = {};

    if (username.length < 3 || username.length > 30) {
      errors.username =
        "Username must be at least 3 characters and at most 30 characters";
    }

    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  };

  const displayErrors = (errors) => {
    errorContainer.innerHTML = ""; // Clear previous errors

    Object.keys(errors).forEach((key) => {
      const errorMessage = document.createElement("p");
      errorMessage.textContent = errors[key];
      errorMessage.style.color = "red";
      errorContainer.appendChild(errorMessage);
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const username = loginForm.querySelector("#username").value;
    const password = loginForm.querySelector("#password").value;

    const errors = validateForm(username, password);
    if (Object.keys(errors).length > 0) {
      displayErrors(errors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem("token", result.token);
        console.log("Login success");
        window.location.href = "./index.html";
      } else {
        displayErrors({ general: result.error });
      }
    } catch (err) {
      console.error("Error:", err);
      errorContainer.innerHTML =
        "<p style='color: red;'>An error occurred. Please try again later.</p>";
    } finally {
      loginForm.querySelector("#password").value = ""; // Clear password field
    }
  };

  loginForm.addEventListener("submit", handleLogin);
});
