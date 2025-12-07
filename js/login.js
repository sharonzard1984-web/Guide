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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    navigateTo('welcome.html');
  });
};

bindLogin();
