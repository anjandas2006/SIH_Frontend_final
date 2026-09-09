import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Zap,
  ShieldAlert,
  Bell,
  Clock,
  ChevronDown,
  UserCheck,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSimulation } from '../../context/SimulationContext';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, switchRole } = useAuth();
  const {
    isRunning,
    speed,
    activeAlertsCount,
    toggleSimulation,
    setSimulationSpeed,
    triggerDefectDemo,
    triggerIncidentDemo
  } = useSimulation();

  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [triggering, setTriggering] = useState(false);

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

  const handleTriggerPothole = async () => {
    setTriggering(true);
    await triggerDefectDemo();
    setTimeout(() => setTriggering(false), 800);
  };

  const handleTriggerIncident = async () => {
    setTriggering(true);
    await triggerIncidentDemo();
    setTimeout(() => setTriggering(false), 800);
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 ml-64">
      {/* Left: Demo Mode & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 radar-dot"></span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">LIVE DEMO MODE</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-md border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Edge AI Fleet: <strong className="text-slate-200 font-semibold">20 Units Active</strong></span>
        </div>
      </div>

      {/* Right: Simulation Controls, Demo Triggers & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Simulation Controls */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              isRunning ? 'bg-amber-500/20 text-amber-400 font-medium' : 'bg-emerald-500/20 text-emerald-400 font-medium'
            }`}
            title={isRunning ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause' : 'Play'}</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          <div className="flex items-center gap-1 px-1">
            {[1.0, 2.0, 5.0, 10.0].map((s) => (
              <button
                key={s}
                onClick={() => setSimulationSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  speed === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Demo Scenario Triggers */}
        <button
          onClick={handleTriggerPothole}
          disabled={triggering}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all cursor-pointer"
          title="Emit simulated pothole detection from BUS-024 to demonstrate live multi-bus clustering"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Trigger Pothole</span>
        </button>

        <button
          onClick={handleTriggerIncident}
          disabled={triggering}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all cursor-pointer"
          title="Emit Hit-and-Run incident with OCR Plate extraction"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>+ Trigger Incident</span>
        </button>

        {/* Alerts Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          title="View Alerts Center"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-medium">{user?.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Switch Operational Role
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    user?.role === r ? 'text-cyan-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                  }`}
                >
                  <span>{r}</span>
                  {user?.role === r && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
};
