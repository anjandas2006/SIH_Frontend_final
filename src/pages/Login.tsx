import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Shield, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const rolesDemo = [
    { role: 'Administrator', user: 'admin', label: 'Full Command Center Access', color: 'from-blue-600 to-indigo-600' },
    { role: 'Transport Authority', user: 'transport', label: 'Fleet & Route Operations', color: 'from-cyan-600 to-blue-600' },
    { role: 'Traffic Officer', user: 'traffic', label: 'Incidents & Congestion Intel', color: 'from-amber-600 to-orange-600' },
    { role: 'Maintenance Officer', user: 'maintenance', label: 'Road Defects & Infrastructure', color: 'from-emerald-600 to-teal-600' },
    { role: 'Analyst', user: 'analyst', label: 'GIS Maps & Trend Analytics', color: 'from-purple-600 to-pink-600' },
  ];

  const handleQuickLogin = async (userKey: string) => {
    setLoading(true);
    await login({ username: userKey, password: 'password123' });
    setLoading(false);
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login({ username, password });
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 mb-4">
            <Bus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BusSense AI</h1>
          <p className="text-xs text-slate-400 mt-1">Mobile Urban Intelligence Platform Using Public Transport Fleet</p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-3 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            PROTOTYPE DEMONSTRATION SUITE
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Command Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick 1-Click Role Login
            </p>
            <div className="grid grid-cols-1 gap-2">
              {rolesDemo.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleQuickLogin(r.user)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${r.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {r.role.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {r.role}
                      </p>
                      <p className="text-[10px] text-slate-500">{r.label}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
