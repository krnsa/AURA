(async function () {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const res = await fetch("http://localhost:3000/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  }
})();
