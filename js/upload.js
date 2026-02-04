import { fileToBase64, analyzeScreenshot } from './geminiService.js?v=3';
import { generateMuseSteamerVideo } from './baiduService.js?v=3';
import { addLesson } from './store.js?v=3';

console.log("Upload.js v3 loaded - Cache busted");

const bindUpload = () => {
  const navigateTo = (page) => {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? page : `pages/${page}`;
  };
  const fileInput = document.getElementById('fileInput');
  const processingState = document.getElementById('processingState');
  const statusMessage = document.getElementById('statusMessage');
  const uploadBtn = document.getElementById('uploadBtn');

  if (!fileInput || !processingState || !statusMessage || !uploadBtn) {
    setTimeout(bindUpload, 50);
    return;
  }

  const triggerUpload = () => fileInput.click();
  uploadBtn.addEventListener('click', triggerUpload);

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processingState.classList.remove('hidden');
    statusMessage.textContent = 'Saving photo and analyzing...';

    const API_URL = 'http://127.0.0.1:8001';
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Save to backend
      const uploadResponse = await fetch(`${API_URL}/upload-photo`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.detail || 'Failed to upload photo to server');
      }
      
      const base64 = await fileToBase64(file);
      const analysis = await analyzeScreenshot(base64);
      statusMessage.textContent = 'Creating your video guide... This may take a minute.';

      let videoUrl = undefined;
      try {
        // Use Baidu MuseSteamer for video generation (handled by server-side)
        const generatedVideoPath = await generateMuseSteamerVideo(base64, analysis.title);
        if (generatedVideoPath) {
          videoUrl = generatedVideoPath;
        } else {
          statusMessage.textContent = 'Video generation took too long, but your text guide is ready!';
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (baiduErr) {
        console.warn('Baidu MuseSteamer generation skipped or failed', baiduErr);
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
