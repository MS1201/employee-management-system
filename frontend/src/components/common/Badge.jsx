import React from 'react';

export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variantMap = {
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    red: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
    yellow: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    blue: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200 dark:border-sky-800',
    purple: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
    gray: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize transition-colors ${variantMap[variant] || variantMap.gray} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

