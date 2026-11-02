import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

