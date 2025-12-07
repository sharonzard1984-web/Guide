import React from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../constants';
import { AppRoute } from '../types';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout className="bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 p-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(AppRoute.DASHBOARD)} className="p-2 text-text-dark hover:bg-gray-200 rounded-full">
           <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold flex-1 text-center pr-10">Settings & Help</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
        {/* Profile */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
            <img src={CURRENT_USER.avatarUrl} alt={CURRENT_USER.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-text-dark">{CURRENT_USER.name}</h2>
          <p className="text-text-gray">{CURRENT_USER.email}</p>
        </div>

        {/* Section: Profile & Activity */}
        <h3 className="font-bold text-text-gray/80 text-sm uppercase tracking-wide mb-3 pl-1">Profile & Activity</h3>
        <div className="space-y-3 mb-8">
            <SettingsItem icon="person" label="My Account" />
            <SettingsItem icon="bookmark" label="My Saved Videos" />
            <SettingsItem icon="history" label="Viewing History" />
        </div>

        {/* Section: Settings */}
        <h3 className="font-bold text-text-gray/80 text-sm uppercase tracking-wide mb-3 pl-1">Settings</h3>
        <div className="space-y-3 mb-8">
            <SettingsItem 
                icon="notifications" 
                label="Notifications" 
                rightElement={
                    <div className="w-12 h-7 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                    </div>
                } 
            />
            <SettingsItem 
                icon="text_fields" 
                label="Text Size" 
                rightElement={<div className="text-text-gray flex items-center gap-1">Large <span className="material-symbols-rounded text-sm">arrow_forward_ios</span></div>} 
            />
        </div>

        {/* Section: FAQ */}
        <h3 className="font-bold text-text-gray/80 text-sm uppercase tracking-wide mb-3 pl-1">Frequently Asked Questions</h3>
        <div className="space-y-3 mb-8">
            <SettingsItem icon="play_circle" label="How do I create a video?" rightElement={<span className="material-symbols-rounded text-gray-400">expand_more</span>} />
            <SettingsItem icon="image" label="How do I take a screenshot?" rightElement={<span className="material-symbols-rounded text-gray-400">expand_more</span>} />
            <SettingsItem icon="share" label="Can I share my videos?" rightElement={<span className="material-symbols-rounded text-gray-400">expand_more</span>} />
        </div>

        {/* Section: Legal */}
        <h3 className="font-bold text-text-gray/80 text-sm uppercase tracking-wide mb-3 pl-1">Legal</h3>
        <div className="space-y-3 mb-8">
            <SettingsItem icon="policy" label="Privacy Policy" />
        </div>

        {/* Section: Support */}
        <h3 className="font-bold text-text-gray/80 text-sm uppercase tracking-wide mb-3 pl-1">Support</h3>
        <div className="space-y-3 mb-8">
            <SettingsItem icon="chat_bubble" label="Send Feedback" />
        </div>
        
        {/* Actions */}
        <div className="space-y-4 mb-8">
            <button className="w-full h-14 bg-white rounded-2xl flex items-center justify-center font-bold text-text-dark shadow-sm hover:bg-gray-50 transition-colors">
                <span className="material-symbols-rounded mr-2">info</span> About This App
            </button>
            <button 
                onClick={() => navigate(AppRoute.LOGIN)}
                className="w-full h-14 bg-red-50 rounded-2xl flex items-center justify-center font-bold text-red-500 hover:bg-red-100 transition-colors"
            >
                <span className="material-symbols-rounded mr-2">logout</span> Log Out
            </button>
        </div>

        <p className="text-center text-text-gray text-sm">Version 1.0.2</p>
      </div>
    </Layout>
  );
};

const SettingsItem: React.FC<{ icon: string, label: string, rightElement?: React.ReactNode }> = ({ icon, label, rightElement }) => (
    <div className="bg-white p-4 rounded-2xl flex items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center mr-4">
            <span className="material-symbols-rounded">{icon}</span>
        </div>
        <span className="font-bold text-text-dark text-lg flex-1">{label}</span>
        {rightElement || <span className="material-symbols-rounded text-gray-300">arrow_forward_ios</span>}
    </div>
);
