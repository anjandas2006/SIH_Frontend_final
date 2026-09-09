import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Activity,
  ShieldCheck,
  CheckCircle2,
  HardDriveDownload,
  Percent
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { api } from '../services/api';

export const Analytics: React.FC = () => {
  const [trafficAnalytics, setTrafficAnalytics] = useState<any | null>(null);
  const [roadHealthAnalytics, setRoadHealthAnalytics] = useState<any | null>(null);
  const [fleetAnalytics, setFleetAnalytics] = useState<any | null>(null);
  const [aiPerformance, setAiPerformance] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getTrafficAnalytics(),
      api.getRoadHealthAnalytics(),
      api.getFleetAnalytics(),
      api.getAiPerformance()
    ]).then(([t, r, f, a]) => {
      setTrafficAnalytics(t);
      setRoadHealthAnalytics(r);
      setFleetAnalytics(f);
      setAiPerformance(a);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>City-Wide Urban Intelligence & Edge AI Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Longitudinal insights covering edge vision accuracy, infrastructure wear, and municipal bandwidth efficiency
        </p>
      </div>

      {/* AI Key Efficiency Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Edge AI Model Accuracy</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">94.6%</p>
          <p className="text-xs text-slate-400 mt-1">False positive rate: 2.8%</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Bandwidth Data Reduction</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">99.4%</p>
          <p className="text-xs text-slate-400 mt-1">Events transmitted vs raw video stream</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Daily Inferences Executed</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">284,000</p>
          <p className="text-xs text-slate-400 mt-1">Onboard 20 edge compute nodes</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Inference Latency</span>
          <p className="text-2xl font-black text-amber-400 mt-1">28.4 ms</p>
          <p className="text-xs text-slate-400 mt-1">Real-time frame processing</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Defect Discovery vs Repair Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Defect Discovery vs Municipal Repair Rate
            </h2>
            <span className="text-xs text-cyan-400 font-semibold">Weekly Pipeline</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roadHealthAnalytics?.defect_discovery_rate_per_day || []}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="new_defects" name="New Detections" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repaired" name="Repaired Tickets" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Confidence Bracket Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              AI Detection Confidence Distribution
            </h2>
            <span className="text-xs text-emerald-400 font-semibold">89% High Confidence</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiPerformance?.confidence_brackets || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="bracket" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="events" name="Event Count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
