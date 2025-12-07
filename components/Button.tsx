import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true, 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "h-14 rounded-xl font-bold text-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-blue-200",
    secondary: "bg-secondary text-primary hover:bg-blue-100",
    outline: "border-2 border-primary text-primary hover:bg-blue-50",
    danger: "bg-red-50 text-red-500 hover:bg-red-100"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-rounded mr-2">{icon}</span>}
      {children}
    </button>
  );
};
