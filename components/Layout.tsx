import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-100 font-sans">
      <div className={`w-full max-w-md bg-white min-h-screen shadow-2xl overflow-hidden relative ${className}`}>
        {children}
      </div>
    </div>
  );
};
