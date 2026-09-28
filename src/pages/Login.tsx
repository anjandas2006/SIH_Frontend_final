import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Shield, KeyRound, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const rolesDemo = [
    { role: 'Administrator', user: 'admin', label: 'Full GIS Console Access' },
    { role: 'Transport Authority', user: 'transport', label: 'Survey Fleet Operations' },
    { role: 'Traffic Officer', user: 'traffic', label: 'Incidents & Hotspot Intel' },
    { role: 'Maintenance Officer', user: 'maintenance', label: 'RM-PCI Road Defects & Orders' },
    { role: 'Analyst', user: 'analyst', label: 'Web-GIS Maps & City Planning' },
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Return to Public Portal Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
          <span>Return to BusSense Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#063269] text-white shadow-md mb-4">
            <Compass className="w-7 h-7 text-[#2ea3f2]" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-[#063269] tracking-tight">BusSense AI</h1>
          <p className="text-xs text-slate-600 mt-1">Intelligent Urban Transit & Edge Sensing Platform</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            UKPMS COMPLIANT PLATFORM CONSOLE
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-[#0284c7] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0284c7] shadow-2xs"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-[#0284c7] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0284c7] shadow-2xs"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Role Login (Pre-configured Access)
            </p>
            <div className="space-y-2">
              {rolesDemo.map((item) => (
                <button
                  key={item.user}
                  type="button"
                  onClick={() => handleQuickLogin(item.user)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-sky-50/60 border border-slate-200 text-left flex items-center justify-between text-xs transition-colors group cursor-pointer shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block group-hover:text-[#0284c7] transition-colors">{item.role}</span>
                    <span className="text-[10px] text-slate-500">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono group-hover:text-[#0284c7]">
                    user: {item.user}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
