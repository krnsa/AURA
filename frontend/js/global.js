const token = localStorage.getItem("token");
if (!token) {
  alert("You are not logged in. Redirecting to login...");
  window.location.href = "./login.html";
} else {
  console.log("User is logged in.");
}
