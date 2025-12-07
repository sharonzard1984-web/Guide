import React, { useContext } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { AppRoute, Lesson } from '../types';
import { AppContext } from '../App';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lessons } = useContext(AppContext);

  return (
    <Layout className="bg-gray-50">
      {/* Header */}
      <div className="bg-white p-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text-dark">Your Lessons</h1>
          <button 
            onClick={() => navigate(AppRoute.SETTINGS)}
            className="p-2 text-text-gray hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-rounded text-3xl">settings</span>
          </button>
        </div>
      </div>

      {/* Lesson List */}
      <div className="p-4 space-y-4 pb-24">
        {lessons.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="material-symbols-rounded text-6xl mb-4 block opacity-50">library_add</span>
            <p>No lessons yet. Tap + to start!</p>
          </div>
        ) : (
          lessons.map((lesson) => (
            <div 
              key={lesson.id}
              onClick={() => navigate(AppRoute.PLAYER.replace(':id', lesson.id))}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded-xl overflow-hidden">
                {lesson.thumbnailUrl ? (
                  <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="material-symbols-rounded">image</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                   <span className="material-symbols-rounded text-white drop-shadow-lg text-3xl">play_circle</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-text-dark leading-tight mb-1 truncate">
                  {lesson.title}
                </h3>
                <p className="text-sm text-text-gray mb-2 line-clamp-2">
                  {lesson.description}
                </p>
                <span className="text-xs font-medium text-gray-400">
                  Created on {lesson.createdAt}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <div className="absolute bottom-8 right-6 z-20">
        <button 
          onClick={() => navigate(AppRoute.UPLOAD)}
          className="w-16 h-16 bg-primary rounded-full shadow-xl shadow-primary/30 flex items-center justify-center text-white hover:bg-primary-dark transition-transform hover:scale-105 active:scale-90"
        >
          <span className="material-symbols-rounded text-4xl">add</span>
        </button>
      </div>
    </Layout>
  );
};
