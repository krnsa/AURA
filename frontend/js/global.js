(async function () {
  // ---------------- Define API URL ----------------
  const development = "http://localhost:5000";
  const production = "https://aura-backend.up.railway.app";

  window.CONFIG = window.CONFIG || {};
  window.CONFIG.API_URL = location.hostname === "localhost" ? development : production;

  // ---------------- Global authentication check ----------------

  // Skip authentication check for login and register pages
  const allowedPaths = ["/login.html", "/register.html"];
  if (allowedPaths.includes(location.pathname)) {
    return;
  }

  // Check if token exists in localStorage
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    // Verify token with server
    const res = await fetch(window.CONFIG.API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Invalid token: remove and redirect
    if (!res.ok) {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
    } else {
      // Proceed if token valid
      const data = await res.json();
      console.log("User authenticated:", data.message);
    }
  } catch (error) {
    console.error("Network or server error:", error);
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  }
})();
