import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSimulation } from '../../context/SimulationContext';
import { AlertCircle, X, ChevronRight } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { latestAlert, dismissLatestAlert } = useSimulation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Floating Real-Time Alert Notification Toast */}
        {latestAlert && (
          <div className="fixed top-20 right-6 z-50 max-w-md bg-slate-900 border border-rose-500/50 rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-4 duration-200">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5 animate-pulse">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                  {latestAlert.severity || 'CRITICAL'} ALERT
                </span>
                <button
                  onClick={dismissLatestAlert}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">{latestAlert.title}</p>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">{latestAlert.message}</p>
              <div className="mt-2.5 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    dismissLatestAlert();
                    navigate('/alerts');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  View Alert Center <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 ml-64 p-6 overflow-y-auto bg-slate-950/60">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
