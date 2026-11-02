import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size] || 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className={`${sizeClass} animate-spin text-primary-600`} />
      {text && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

