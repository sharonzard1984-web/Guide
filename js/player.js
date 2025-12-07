import { getLessonById } from './store.js';

const bindPlayer = () => {
  const navigateTo = (page) => {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? page : `pages/${page}`;
  };
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const lesson = getLessonById(id);

  if (!lesson) {
    navigateTo('dashboard.html');
    return;
  }

  const videoContainer = document.getElementById('videoContainer');
  const content = document.getElementById('content');
  const replayBtn = document.getElementById('replayBtn');

  if (!videoContainer || !content || !replayBtn) {
    setTimeout(bindPlayer, 50);
    return;
  }

  if (lesson.videoUrl) {
    videoContainer.innerHTML = `
      <video id="mainVideo" src="${lesson.videoUrl}" controls autoPlay class="w-full h-full object-contain" poster="${lesson.thumbnailUrl || ''}"></video>
    `;
  } else {
    videoContainer.innerHTML = `
      <div class="text-center p-8">
        <span class="material-symbols-rounded text-white/50 text-6xl mb-4">videocam_off</span>
        <p class="text-white/70">Video simulation not available without Veo key.</p>
        <p class="text-white/50 text-xs mt-2">Displaying steps below instead.</p>
      </div>
    `;
  }

  content.innerHTML = `
    <h2 class="text-3xl font-bold text-text-dark mb-4">${lesson.title}</h2>
    <p class="text-text-gray text-lg leading-relaxed mb-8">${lesson.description}</p>
    ${lesson.steps && lesson.steps.length > 0 ? `
      <div class="bg-secondary/50 p-6 rounded-2xl mb-8">
        <h3 class="font-bold text-primary mb-4 uppercase text-sm tracking-wider">Instructions</h3>
        <ul class="space-y-4">
          ${lesson.steps.map((step, idx) => `
            <li class="flex gap-3 text-text-dark">
              <span class="font-bold text-primary min-w-[20px]">${idx + 1}.</span>
              <span>${step}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}
  `;

  replayBtn.addEventListener('click', () => {
    const video = document.getElementById('mainVideo');
    if (video) {
      video.currentTime = 0;
      video.play();
    } else {
      window.location.reload();
    }
  });
};

bindPlayer();
