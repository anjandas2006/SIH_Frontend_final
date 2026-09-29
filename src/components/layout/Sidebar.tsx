import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Map,
  Cpu,
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  // The 6 consolidated primary modules requested by user
  const primaryNavItems = [
    {
      to: '/dashboard',
      label: 'Command Dashboard',
      description: 'Executive overview & RM-PCI',
      icon: LayoutDashboard
    },
    {
      to: '/fleet',
      label: 'Fleet Management',
      description: 'Dashcam units & live telemetry',
      icon: Bus
    },
    {
      to: '/live-map',
      label: 'Urban Map (GIS)',
      description: 'Carriageway geospatial stream',
      icon: Map
    },
    {
      to: '/video-analysis',
      label: 'AI Video Analysis',
      description: 'Computer vision & edge studio',
      icon: Cpu
    },
    {
      to: '/road-intelligence',
      label: 'Road, Traffic & Incidents',
      description: 'Defects, traffic & hit-and-run',
      icon: ShieldAlert
    },
    {
      to: '/analytics-reports',
      label: 'Analytics & Reports',
      description: 'Trends, OD flow & UKPMS export',
      icon: BarChart3
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#111c2e] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40 text-slate-700 dark:text-slate-200 shadow-sm font-sans transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800 gap-3 bg-white dark:bg-[#111c2e]">
        <div className="w-9 h-9 rounded-lg bg-[#063269] flex items-center justify-center text-white shadow-sm">
          <Bus className="w-5 h-5 text-[#2ea3f2]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-extrabold text-[#063269] dark:text-white text-base tracking-tight truncate">
              BusSense AI
            </span>
            <span className="text-[10px] bg-sky-50 dark:bg-sky-950/80 text-[#0284c7] dark:text-sky-400 font-bold px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              URBAN
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Transit Fleet Edge Sensing</p>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Enterprise Modules</span>
          <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            6 Unified Hubs
          </span>
        </div>

        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50/90 dark:bg-sky-950/70 text-[#0284c7] dark:text-sky-400 font-semibold border-l-3 border-[#0284c7] shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                  {item.description}
                </p>
              </div>
            </NavLink>
          );
        })}

      </div>

      {/* User Profile Card */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111c2e]">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-[#063269] flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {user?.full_name.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
            <p className="text-[10px] text-[#0284c7] dark:text-sky-400 font-semibold truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
