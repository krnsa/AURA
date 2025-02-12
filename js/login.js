function login(event) {
  event.preventDefault();
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  console.log("username: " + username);
  console.log("password: " + password);
}
