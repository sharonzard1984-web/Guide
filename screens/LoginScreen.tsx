import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate(AppRoute.WELCOME);
  };

  return (
    <Layout className="p-6 flex flex-col justify-center">
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
          <span className="material-symbols-rounded text-white text-5xl">phone_iphone</span>
        </div>
        <h1 className="text-3xl font-bold text-text-dark mb-2 text-center">Smartphone Savvy</h1>
        <p className="text-text-gray text-center max-w-[250px]">
          Welcome back! Please log in to continue.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 w-full">
        <div>
          <label className="block text-text-dark font-medium mb-2 text-lg">Email or Username</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@example.com"
            className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-text-dark font-medium mb-2 text-lg">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-14 pl-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              <span className="material-symbols-rounded">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" className="text-primary font-medium text-sm">Forgot Password?</button>
          </div>
        </div>

        <Button type="submit" className="mt-4">
          Log In
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-text-gray">
          Don't have an account? <button className="text-primary font-bold ml-1">Sign up</button>
        </p>
      </div>
    </Layout>
  );
};
