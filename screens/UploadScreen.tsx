import React, { useRef, useState, useContext } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { AppContext } from '../App';
import { analyzeScreenshot, generateVeoVideo, fileToBase64 } from '../services/geminiService';

export const UploadScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addLesson } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage('Analyzing your screenshot...');

    try {
      const base64 = await fileToBase64(file);

      // 1. Analyze with Gemini Flash
      const analysis = await analyzeScreenshot(base64);
      
      setStatusMessage('Creating your video guide...');
      
      // 2. Try to generate a Veo Video (may fail if no key/quota, handled gracefully)
      let videoUrl = undefined;
      // We wrap Veo in a separate try catch because it is more likely to fail on demo keys
      try {
        const generatedVideo = await generateVeoVideo(base64);
        if (generatedVideo) videoUrl = generatedVideo;
      } catch (veoErr) {
        console.warn("Veo generation skipped or failed", veoErr);
      }

      // 3. Create Lesson Object
      const newLesson = {
        id: Date.now().toString(),
        title: analysis.title,
        description: analysis.description,
        steps: analysis.steps,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        thumbnailUrl: URL.createObjectURL(file), // Use the uploaded image as thumb
        videoUrl: videoUrl // Undefined will show placeholder in player
      };

      addLesson(newLesson);
      
      // Artificial delay for UX if it happened too fast
      if (!videoUrl) await new Promise(r => setTimeout(r, 1500)); 

      navigate(AppRoute.PLAYER.replace(':id', newLesson.id));

    } catch (error) {
      console.error(error);
      alert('Something went wrong processing your screenshot. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  if (isProcessing) {
    return (
      <Layout className="flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-bold text-text-dark mb-2 text-center">Processing</h2>
        <p className="text-text-gray text-center">{statusMessage}</p>
      </Layout>
    );
  }

  return (
    <Layout className="p-6 flex flex-col relative bg-gray-50">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-dark hover:bg-gray-100 rounded-full">
           <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold flex-1 text-center pr-10">Upload a Screenshot</h1>
        <span className="material-symbols-rounded text-gray-400">help</span>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <h2 className="text-2xl font-bold text-text-dark mb-6">How to Upload</h2>
        
        {/* Step 1 */}
        <div className="flex gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-rounded">screenshot_monitor</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-text-dark">1. Take a Screenshot</h3>
            <p className="text-text-gray text-sm leading-relaxed">
              Press the power and volume down buttons at the same time.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-rounded">upload_file</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-text-dark">2. Tap Upload Below</h3>
            <p className="text-text-gray text-sm leading-relaxed">
              Find and select the screenshot you just took from your photos.
            </p>
          </div>
        </div>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="relative w-48 h-64 bg-[#fcdba8] rounded-xl flex items-center justify-center shadow-inner overflow-hidden border-4 border-white shadow-xl">
           <div className="absolute inset-x-0 bottom-0 h-40 bg-[#f8cf95] rounded-t-full translate-y-20"></div>
           <div className="w-32 h-56 bg-white rounded-lg border-2 border-gray-800 relative z-10 flex flex-col items-center pt-2">
              <div className="w-12 h-1 bg-gray-200 rounded-full mb-2"></div>
              {/* Hand overlay simulation with divs */}
              <div className="absolute -right-12 bottom-12 w-24 h-40 bg-[#eeb67e] rounded-full transform -rotate-45 border-2 border-[#dca168]"></div>
              <div className="absolute -left-12 bottom-12 w-24 h-40 bg-[#eeb67e] rounded-full transform rotate-45 border-2 border-[#dca168]"></div>
           </div>
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="space-y-4">
        <Button onClick={triggerUpload} icon="image">
          Upload from Gallery
        </Button>
        <Button onClick={triggerUpload} variant="secondary" icon="photo_camera">
          Use Camera
        </Button>
      </div>
    </Layout>
  );
};
