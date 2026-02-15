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
  const videoTitle = document.getElementById('videoTitle');
  const videoDescPreview = document.getElementById('videoDescPreview');
  const descriptionArea = document.getElementById('descriptionArea');

  if (!videoContainer || !descriptionArea) {
    setTimeout(bindPlayer, 50);
    return;
  }

  // Use the lesson's video URL if available, otherwise fallback to demo video
  const videoUrl = lesson.videoUrl || "http://appguide.tech:8001/backend/videos/demo.mp4";
  
  videoContainer.innerHTML = `
    <div class="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black">
      <video 
        id="mainVideo"
        src="${videoUrl}" 
        class="w-full h-full object-cover"
        autoplay 
        muted 
        loop 
        playsinline>
      </video>
      <!-- Click-to-unmute overlay -->
      <div id="videoOverlay" class="absolute inset-0 z-10 cursor-pointer"></div>
    </div>
  `;

  // Set Content
  videoTitle.textContent = lesson.title || "How to use this App";
  videoDescPreview.textContent = lesson.description || "Click to see the full step-by-step breakdown.";

  // Navigation to Guide Page
  descriptionArea.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `guide.html?id=${id}`;
  });

  // Unmute on first click of the overlay
  const videoOverlay = document.getElementById('videoOverlay');
  const mainVideo = document.getElementById('mainVideo');
  if (videoOverlay && mainVideo) {
    videoOverlay.addEventListener('click', () => {
      mainVideo.muted = !mainVideo.muted;
    });
  }
};

bindPlayer();
