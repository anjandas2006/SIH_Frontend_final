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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1320] text-slate-900 dark:text-slate-100 flex font-sans antialiased transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Floating Real-Time Alert Notification Toast */}
        {latestAlert && (
          <div className="fixed top-20 right-6 z-50 max-w-md bg-white dark:bg-[#111c2e] border border-rose-200 dark:border-rose-900 rounded-xl shadow-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-4 duration-200">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                  {latestAlert.severity || 'CRITICAL'} ALERT
                </span>
                <button
                  onClick={dismissLatestAlert}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{latestAlert.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{latestAlert.message}</p>
              <div className="mt-2.5 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    dismissLatestAlert();
                    navigate('/road-intelligence');
                  }}
                  className="text-xs text-[#0284c7] dark:text-sky-400 hover:underline font-semibold flex items-center gap-1"
                >
                  View in Intelligence Hub <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 ml-64 p-6 overflow-y-auto bg-[#f8fafc] dark:bg-[#0b1320] transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
