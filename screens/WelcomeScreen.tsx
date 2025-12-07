import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout className="flex flex-col items-center justify-center p-8 bg-gray-50 relative">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {/* Hero Icon */}
        <div className="relative mb-12">
          <div className="w-48 h-48 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
               {/* Decorative layers */}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="bg-primary text-white p-6 rounded-2xl shadow-xl transform -rotate-6">
                <span className="material-symbols-rounded text-6xl">screenshot_monitor</span>
             </div>
             <div className="absolute bottom-4 right-8 bg-white p-3 rounded-full shadow-lg text-primary transform rotate-12">
                <span className="material-symbols-rounded text-4xl">play_circle</span>
             </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-text-dark text-center mb-6">
          Welcome!
        </h1>

        <p className="text-xl text-text-gray text-center leading-relaxed max-w-xs">
          Turn your confusing screenshots into simple, step-by-step video guides.
        </p>
      </div>

      <div className="w-full mt-auto mb-8 space-y-6">
        <Button onClick={() => navigate(AppRoute.DASHBOARD)}>
          Get Started
        </Button>
        
        <div className="text-center">
          <button className="text-primary font-medium underline underline-offset-4 decoration-primary/30">
            How does this work?
          </button>
        </div>
      </div>
    </Layout>
  );
};
