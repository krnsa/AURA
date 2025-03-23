window.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("#register-form");
  const errorContainer = document.querySelector("#error-container");

  const handleRegister = async (event) => {
    event.preventDefault();

    const username = registerForm.querySelector("#username").value;
    const password = registerForm.querySelector("#password").value;

    try {
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
        errorContainer.textContent = result.error;
      }
    } catch (err) {
      console.error("Error:", err);
      errorContainer.textContent = "An error occurred. Please try again.";
    }
  };

  registerForm.addEventListener("submit", handleRegister);
});
