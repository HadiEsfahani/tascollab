import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ 
  className = '', 
  variant = 'default',
  children,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    destructive: 'bg-red-100 text-red-700 hover:bg-red-200',
    outline: 'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};