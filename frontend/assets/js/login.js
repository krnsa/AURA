window.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
  
    const validateForm = (username, password) => {
      const errors = {};
  
      if (username.length < 3 || username.length > 30) {
        errors.username = 'Username must be at least 3 characters and at most 30 characters';
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
      const data = { username, password };
  
      // fetch('https://example.com/api', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(data)
      // })
      // .then(response => response.json())
      // .then(data => {
      //   console.log('Success:', data);
      // })
      // .catch(error => {
      //   console.error('Error:', error);
      // });
  
      console.log(`Username: ${username}, Password: ${password}`);
  
      // If validation fails, display errors in the console for now. Later, we can display them in the UI.
      const errors = validateForm(username, password);
      console.log(errors);
    };
  
    loginForm.addEventListener('submit', handleLogin);
  });