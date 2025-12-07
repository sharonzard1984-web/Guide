import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { UploadScreen } from './screens/UploadScreen';
import { VideoPlayerScreen } from './screens/VideoPlayerScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AppRoute, Lesson } from './types';
import { INITIAL_LESSONS } from './constants';

interface AppContextType {
  lessons: Lesson[];
  addLesson: (lesson: Lesson) => void;
}

export const AppContext = React.createContext<AppContextType>({
  lessons: [],
  addLesson: () => {}
});

const App: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);

  const addLesson = (lesson: Lesson) => {
    setLessons(prev => [lesson, ...prev]);
  };

  return (
    <AppContext.Provider value={{ lessons, addLesson }}>
      <HashRouter>
        <Routes>
          <Route path={AppRoute.LOGIN} element={<LoginScreen />} />
          <Route path={AppRoute.WELCOME} element={<WelcomeScreen />} />
          <Route path={AppRoute.DASHBOARD} element={<DashboardScreen />} />
          <Route path={AppRoute.UPLOAD} element={<UploadScreen />} />
          <Route path={AppRoute.PLAYER} element={<VideoPlayerScreen />} />
          <Route path={AppRoute.SETTINGS} element={<SettingsScreen />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
