import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Map,
  Cpu,
  Activity,
  TrafficCone,
  AlertTriangle,
  Bell,
  BarChart3,
  FileText,
  Settings,
  Radio,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSimulation } from '../../context/SimulationContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { activeAlertsCount } = useSimulation();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/fleet', label: 'Fleet Management', icon: Bus },
    { to: '/live-map', label: 'Urban Map (GIS)', icon: Map },
    { to: '/video-analysis', label: 'AI Video Analysis', icon: Cpu },
    { to: '/road-health', label: 'Road Health & Defect Clusters', icon: Activity },
    { to: '/traffic', label: 'Traffic Intelligence', icon: TrafficCone },
    { to: '/incidents', label: 'Incidents & Hit-and-Run', icon: ShieldAlert },
    { to: '/alerts', label: 'Alerts Center', icon: Bell, badge: activeAlertsCount },
    { to: '/routes', label: 'Routes & OD Flow', icon: Compass },
    { to: '/analytics', label: 'Analytics & Insights', icon: BarChart3 },
    { to: '/reports', label: 'Reports & Export', icon: FileText },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <Bus className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-base tracking-tight">BusSense AI</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-semibold px-1.5 py-0.5 rounded border border-cyan-500/30">v1.0</span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wider">Mobile Urban Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Command Center
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile & Role Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
            {user?.full_name.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-[10px] text-cyan-400 font-medium truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
