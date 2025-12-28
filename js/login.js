const bindLogin = () => {
  const navigateTo = (page) => {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? page : `pages/${page}`;
  };
  const toggle = document.getElementById('togglePassword');
  const form = document.getElementById('loginForm');
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');

  if (!toggle || !form || !passwordInput || !eyeIcon) {
    setTimeout(bindLogin, 50);
    return;
  }

  toggle.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeIcon.textContent = 'visibility';
    } else {
      passwordInput.type = 'password';
      eyeIcon.textContent = 'visibility_off';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('email').value; // Assuming email input is used for username
    const password = document.getElementById('password').value;

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8001/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        navigateTo('welcome.html');
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login. Please try again.');
    }
  });
};

bindLogin();
