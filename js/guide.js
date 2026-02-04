import { getLessonById } from './store.js';

const initGuide = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const lesson = getLessonById(id);

  if (!lesson) {
    window.location.href = 'dashboard.html';
    return;
  }

  const backBtn = document.getElementById('backBtn');
  const finishBtn = document.getElementById('finishBtn');
  const guideTitle = document.getElementById('guideTitle');
  const guideFullDesc = document.getElementById('guideFullDesc');
  const stepsContainer = document.getElementById('stepsContainer');

  // Set Content
  guideTitle.textContent = lesson.title || "Mastering the Interface";
  guideFullDesc.textContent = lesson.description || "Welcome to the full guide! In this lesson, we cover everything from the basic layout to advanced shortcuts. Follow the steps below to become a pro in minutes.";

  // Render Steps
  const steps = lesson.steps || [
    "Open the app and navigate to the dashboard to see your current progress.",
    "Tap on any lesson card to open the video player and watch the tutorial.",
    "Click the description area at the bottom to see detailed written instructions.",
    "Follow along with the video and mark steps as complete as you go."
  ];

  stepsContainer.innerHTML = `
    <div class="bg-secondary/50 p-6 rounded-3xl border border-primary/10">
      <h3 class="font-bold text-primary mb-6 uppercase text-sm tracking-wider flex items-center gap-2">
        <span class="material-symbols-rounded text-lg">format_list_numbered</span>
        Step-by-Step Guide
      </h3>
      <ul class="space-y-6">
        ${steps.map((step, idx) => `
          <li class="flex gap-4">
            <div class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20">
                ${idx + 1}
            </div>
            <div class="pt-1">
                <p class="text-text-dark font-medium leading-relaxed">${step}</p>
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  // Event Listeners
  backBtn.addEventListener('click', () => {
    window.history.back();
  });

  finishBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
};

document.addEventListener('DOMContentLoaded', initGuide);
