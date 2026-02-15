import { getLessons } from './store.js';

const bindDashboard = () => {
  const profileBtn = document.getElementById('profileBtn');
  const userAvatar = document.getElementById('userAvatar');
  const uploadBtn = document.getElementById('uploadBtn');
  const container = document.getElementById('lessonList');

  if (!profileBtn || !uploadBtn || !container) {
    setTimeout(bindDashboard, 50);
    return;
  }

  const navigateTo = (page) => {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? page : `pages/${page}`;
  };

  // Fetch user data for avatar
  const fetchUserAvatar = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const API_URL = 'http://appguide.tech:8001';
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        if (userAvatar) {
          userAvatar.src = user.avatar_url 
            ? `${API_URL}${user.avatar_url}` 
            : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username) + '&background=random&size=40';
          userAvatar.alt = user.username;
        }
      }
    } catch (error) {
      console.error('Error fetching user avatar:', error);
    }
  };

  profileBtn.addEventListener('click', () => {
    navigateTo('settings.html');
  });

  uploadBtn.addEventListener('click', () => {
    navigateTo('upload.html');
  });

  let lessons = [];
  try {
    lessons = getLessons();
  } catch (e) {
    console.error('Failed to get lessons:', e);
  }

  if (!lessons || lessons.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20 text-gray-400">
        <span class="material-symbols-rounded text-6xl mb-4 block opacity-50">library_add</span>
        <p>No lessons yet. Tap + to start!</p>
      </div>
    `;
  } else {
    window.openPlayer = (lessonId) => {
      navigateTo(`player.html?id=${lessonId}`);
    };

    container.innerHTML = lessons.map(lesson => `
      <div 
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
        onclick="openPlayer('${lesson.id}')"
      >
        <div class="relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded-xl overflow-hidden">
          ${lesson.thumbnailUrl ? `
            <img src="${lesson.thumbnailUrl}" alt="${lesson.title}" class="w-full h-full object-cover" />
          ` : `
            <div class="w-full h-full flex items-center justify-center text-gray-400">
              <span class="material-symbols-rounded">image</span>
            </div>
          `}
          <div class="absolute inset-0 flex items-center justify-center bg-black/10">
             <span class="material-symbols-rounded text-white drop-shadow-lg text-3xl">play_circle</span>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-lg text-text-dark leading-tight mb-1 truncate">
            ${lesson.title}
          </h3>
          <p class="text-sm text-text-gray mb-2 line-clamp-2">
            ${lesson.description}
          </p>
          <span class="text-xs font-medium text-gray-400">
            Created on ${lesson.createdAt}
          </span>
        </div>
      </div>
    `).join('');
  }

  // Fetch avatar in background
  fetchUserAvatar();
};

bindDashboard();
