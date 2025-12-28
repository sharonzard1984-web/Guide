const attachWelcomeHandlers = () => {
  const navigateTo = (page) => {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? page : `pages/${page}`;
  };

  // Check if welcome page has already been shown
  const isNewUser = localStorage.getItem('is_new_user');
  if (!isNewUser) {
    navigateTo('dashboard.html');
    return;
  }

  const btn = document.getElementById('getStartedBtn');
  if (!btn) {
    setTimeout(attachWelcomeHandlers, 50);
    return;
  }
  btn.addEventListener('click', () => {
    // Clear the flag so welcome page doesn't show again
    localStorage.removeItem('is_new_user');
    navigateTo('dashboard.html');
  });
};

attachWelcomeHandlers();
