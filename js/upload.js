import { fileToBase64, analyzeScreenshot, generateVeoVideo } from './geminiService.js';
import { addLesson } from './store.js';

const bindUpload = () => {
  const navigateTo = (page) => {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? page : `pages/${page}`;
  };
  const fileInput = document.getElementById('fileInput');
  const processingState = document.getElementById('processingState');
  const statusMessage = document.getElementById('statusMessage');
  const uploadBtn = document.getElementById('uploadBtn');
  const cameraBtn = document.getElementById('cameraBtn');

  if (!fileInput || !processingState || !statusMessage || !uploadBtn || !cameraBtn) {
    setTimeout(bindUpload, 50);
    return;
  }

  const triggerUpload = () => fileInput.click();
  uploadBtn.addEventListener('click', triggerUpload);
  cameraBtn.addEventListener('click', triggerUpload);

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processingState.classList.remove('hidden');
    statusMessage.textContent = 'Analyzing your screenshot...';

    try {
      const base64 = await fileToBase64(file);
      const analysis = await analyzeScreenshot(base64);
      statusMessage.textContent = 'Creating your video guide...';

      let videoUrl = undefined;
      try {
        const generatedVideo = await generateVeoVideo(base64);
        if (generatedVideo) videoUrl = generatedVideo;
      } catch (veoErr) {
        console.warn('Veo generation skipped or failed', veoErr);
      }

      const thumbBase64 = `data:${file.type};base64,${base64}`;
      const newLesson = {
        id: Date.now().toString(),
        title: analysis.title,
        description: analysis.description,
        steps: analysis.steps,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        thumbnailUrl: thumbBase64,
        videoUrl: videoUrl,
      };

      addLesson(newLesson);
      if (!videoUrl) await new Promise((r) => setTimeout(r, 1500));
      navigateTo(`player.html?id=${newLesson.id}`);
    } catch (error) {
      console.error(error);
      alert('Something went wrong processing your screenshot. Please try again.');
      processingState.classList.add('hidden');
    }
  });
};

bindUpload();
