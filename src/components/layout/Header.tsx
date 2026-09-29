import React, { useState, useEffect } from 'react';
import {
  Bell,
  Settings,
  Clock,
  ChevronDown,
  UserCheck,
  Radio,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Shield,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSimulation } from '../../context/SimulationContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const { activeAlertsCount, systemMode, setSystemMode } = useSimulation();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const [timeStr, setTimeStr] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const roles = [
    'Administrator',
    'Transport Authority',
    'Traffic Officer',
    'Maintenance Officer',
    'Analyst'
  ] as const;

  return (
    <header className="h-16 bg-white dark:bg-[#111c2e] border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 ml-64 text-slate-800 dark:text-slate-100 shadow-2xs font-sans transition-colors duration-200">
      {/* Left: Brand Title & Live / Demo Mode Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-heading font-extrabold text-[#063269] dark:text-sky-400 text-lg tracking-tight">
            BusSense AI
          </span>

          {/* Interactive LIVE vs DEMO Mode Toggle Pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              onClick={() => setSystemMode('live')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                systemMode === 'live'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Live Edge Mode (Hardware not connected - 0 Active Buses)"
              aria-label="Switch to Live Mode"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${systemMode === 'live' ? 'bg-white animate-pulse' : 'bg-slate-400'}`}></span>
              <span>LIVE</span>
            </button>

            <button
              onClick={() => setSystemMode('demo')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                systemMode === 'demo'
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Demo Simulation Mode (Full Active Fleet - 20 Buses)"
              aria-label="Switch to Demo Mode"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${systemMode === 'demo' ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>DEMO</span>
            </button>
          </div>
        </div>

        {/* Dynamic Status Badges depending on Live vs Demo Mode */}
        {systemMode === 'live' ? (
          <div className="hidden xl:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Live Edge Standby (0 Incidents • Corridors Clear)
            </span>
          </div>
        ) : (
          <div className="hidden xl:flex items-center gap-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#0284c7] radar-dot"></span>
            <span className="text-[11px] font-bold text-[#0284c7] dark:text-sky-300 uppercase tracking-wider">
              Demo Simulation Active (20 Units Moving)
            </span>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
          <Radio className={`w-3.5 h-3.5 ${systemMode === 'live' ? 'text-rose-500' : 'text-[#0284c7] dark:text-sky-400'} animate-pulse`} />
          <span>
            Survey Fleet:{' '}
            <strong className={`${systemMode === 'live' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'} font-semibold`}>
              {systemMode === 'live' ? '0 Units Active (Disconnected)' : '20 Units Active'}
            </strong>
          </span>
        </div>
      </div>

      {/* Right: Theme Toggle, Notification Bell, System Configuration, Login Option & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>

        {/* Light / Dark Mode Toggle Symbol */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs flex items-center justify-center"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Notification Bell Symbol (Alerts Center) */}
        <button
          onClick={() => navigate('/alerts')}
          className={`relative p-2 rounded-lg border transition-all cursor-pointer shadow-2xs flex items-center justify-center ${
            location.pathname === '/alerts'
              ? 'bg-blue-50 dark:bg-sky-950/80 text-[#0284c7] dark:text-sky-400 border-[#0284c7]/40 dark:border-sky-700 ring-2 ring-[#0284c7]/20'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
          title="Alerts Center (Notifications)"
          aria-label="View Alerts Center"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* System Configuration Symbol (Settings) */}
        <button
          onClick={() => navigate('/settings')}
          className={`p-2 rounded-lg border transition-all cursor-pointer shadow-2xs flex items-center justify-center ${
            location.pathname === '/settings'
              ? 'bg-blue-50 dark:bg-sky-950/80 text-[#0284c7] dark:text-sky-400 border-[#0284c7]/40 dark:border-sky-700 ring-2 ring-[#0284c7]/20'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
          title="System Configuration & Edge Parameters"
          aria-label="System Configuration"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Login Option */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          title="Login / Switch Account"
        >
          <LogIn className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
          <span className="hidden sm:inline">Login</span>
        </Link>

        {/* Operational Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
            <span className="hidden sm:inline font-semibold">{user?.role || 'Administrator'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Switch Operational Role
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    user?.role === r ? 'text-[#0284c7] dark:text-sky-400 font-bold bg-sky-50/70 dark:bg-sky-950/50' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{r}</span>
                  {user?.role === r && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Active</span>}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                <Link
                  to="/login"
                  onClick={() => setShowRoleMenu(false)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Go to Login Portal</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
