(() => {
  const loginForm = document.querySelector('#login-form');

  const validateForm = (username, password) => {
    const errors = {};

    if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleLogin = (event) => {
    event.preventDefault();

    const username = loginForm.querySelector('#username').value;
    const password = loginForm.querySelector('#password').value;

    console.log(`Username: ${username}, Password: ${password}`);
    const errors = validateForm(username, password);
    console.alert(errors);
  };

  loginForm.addEventListener('submit', handleLogin);
})();