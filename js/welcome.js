const attachWelcomeHandlers = () => {
  const navigateTo = (page) => {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? page : `pages/${page}`;
  };
  const btn = document.getElementById('getStartedBtn');
  if (!btn) {
    setTimeout(attachWelcomeHandlers, 50);
    return;
  }
  btn.addEventListener('click', () => {
    navigateTo('dashboard.html');
  });
};

attachWelcomeHandlers();
