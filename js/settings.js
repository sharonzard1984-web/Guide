import { getCurrentUser } from './store.js';

const bindSettings = () => {
  const navigateTo = (page) => {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? page : `pages/${page}`;
  };
  const profile = document.getElementById('profileSection');
  const items = document.querySelectorAll('.settings-item');

  if (!profile || items.length === 0) {
    setTimeout(bindSettings, 50);
    return;
  }

  const user = getCurrentUser();
  profile.innerHTML = `
    <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
      <img src="${user.avatarUrl}" alt="${user.name}" class="w-full h-full object-cover" />
    </div>
    <h2 class="text-2xl font-bold text-text-dark">${user.name}</h2>
    <p class="text-text-gray">${user.email}</p>
  `;

  items.forEach((item) => {
    const icon = item.getAttribute('data-icon');
    const label = item.getAttribute('data-label');
    const rightIcon = item.getAttribute('data-right-icon');
    item.className = 'bg-white p-4 rounded-2xl flex items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow';
    item.innerHTML = `
      <div class="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center mr-4">
        <span class="material-symbols-rounded">${icon}</span>
      </div>
      <span class="font-bold text-text-dark text-lg flex-1">${label}</span>
      ${rightIcon ? `<span class="material-symbols-rounded text-gray-400">${rightIcon}</span>` : ''}
    `;
  });
};

bindSettings();
