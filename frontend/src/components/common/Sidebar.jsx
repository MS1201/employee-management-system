import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarOff,
  DollarSign,
  Award,
  FolderLock,
  BarChart3,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isHR, isSuperAdmin } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ...(isHR ? [{ name: 'Employees', path: '/employees', icon: Users }] : []),
    ...(isHR ? [{ name: 'Departments', path: '/departments', icon: Building2 }] : []),
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'Leave Management', path: '/leaves', icon: CalendarOff },
    { name: 'Payroll', path: '/payroll', icon: DollarSign },
    { name: 'Performance', path: '/performance', icon: Award },
    { name: 'Documents', path: '/documents', icon: FolderLock },
    ...(isHR ? [{ name: 'Reports', path: '/reports', icon: BarChart3 }] : []),
    { name: 'My Profile', path: '/profile', icon: UserCheck },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                NexusEMS
              </span>
              <span className="block text-[10px] text-primary-400 font-semibold uppercase tracking-wider">
                Enterprise Suite
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{link.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </div>

        {/* Role badge in sidebar footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-primary-400 border border-slate-700">
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 capitalize truncate">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

