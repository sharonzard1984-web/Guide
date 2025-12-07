import React, { useContext, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { AppRoute, Lesson } from '../types';
import { AppContext } from '../App';

export const VideoPlayerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { lessons } = useContext(AppContext);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const found = lessons.find(l => l.id === id);
    if (found) setLesson(found);
    else navigate(AppRoute.DASHBOARD);
  }, [id, lessons, navigate]);

  if (!lesson) return null;

  return (
    <Layout className="flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={() => navigate(AppRoute.DASHBOARD)} className="p-2 text-text-dark hover:bg-gray-100 rounded-full">
           <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold flex-1 text-center pr-10">Your Tutorial</h1>
      </div>

      {/* Video Container */}
      <div className="w-full bg-[#101c22] aspect-[4/3] sm:aspect-video relative flex items-center justify-center group rounded-b-2xl shadow-lg overflow-hidden">
        {lesson.videoUrl ? (
          <video 
            src={lesson.videoUrl} 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
            poster={lesson.thumbnailUrl}
          />
        ) : (
          <div className="text-center p-8">
             <span className="material-symbols-rounded text-white/50 text-6xl mb-4">videocam_off</span>
             <p className="text-white/70">Video simulation not available without Veo key.</p>
             <p className="text-white/50 text-xs mt-2">Displaying steps below instead.</p>
          </div>
        )}
        
        {/* Simple progress bar simulation if using mock video player UI */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>0:37</span>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-primary rounded-full"></div>
            </div>
            <span>2:23</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Play button overlay if paused - omitted for native controls */}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
        <h2 className="text-3xl font-bold text-text-dark mb-4">{lesson.title}</h2>
        
        <p className="text-text-gray text-lg leading-relaxed mb-8">
          {lesson.description}
        </p>

        {lesson.steps && lesson.steps.length > 0 && (
          <div className="bg-secondary/50 p-6 rounded-2xl mb-8">
            <h3 className="font-bold text-primary mb-4 uppercase text-sm tracking-wider">Instructions</h3>
            <ul className="space-y-4">
              {lesson.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-text-dark">
                  <span className="font-bold text-primary min-w-[20px]">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 space-y-4 bg-white border-t border-gray-100">
        <Button onClick={() => window.location.reload()} icon="replay">
            Replay Tutorial
        </Button>
        <Button 
            variant="outline" 
            onClick={() => navigate(AppRoute.DASHBOARD)}
            className="border-gray-200 text-text-dark hover:bg-gray-50"
        >
            Back to All Tutorials
        </Button>
      </div>
    </Layout>
  );
};
