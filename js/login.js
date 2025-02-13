const loginForm = document.getElementById('login-form');

const handleLogin = (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  console.log(`Username: ${username}, Password: ${password}`);

};

loginForm.addEventListener('submit', handleLogin);