(async function () {
  const PORT = 5000;
  const URL = `http://localhost:${PORT}`;
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const res = await fetch(URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  } else {
    const data = await res.json();
    console.log("User authenticated successfully.");
    console.log(data.message);
  }
})();
