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
    console.log('Login form submitted');

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    try {
      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      const username = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      console.log('Attempting login for:', username);

      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://127.0.0.1:8001/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful');
        localStorage.setItem('access_token', data.access_token);
        
        // Ensure new user flag is NOT set for regular login
        localStorage.removeItem('is_new_user');
        
        navigateTo('dashboard.html');
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        alert(`Login failed: ${errorData.detail || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Error during login fetch:', error);
      alert('Could not connect to the server. Please ensure the backend is running.');
    } finally {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
};

bindLogin();
