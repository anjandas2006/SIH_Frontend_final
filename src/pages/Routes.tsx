import React, { useState, useEffect } from 'react';
import {
  Compass,
  TrendingUp,
  Clock,
  Gauge,
  AlertTriangle,
  TrafficCone,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Route } from '../types';

export const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [odData, setOdData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRoutes(),
      api.getRoutesRanking(),
      api.getOdMatrix()
    ]).then(([r, rank, od]) => {
      setRoutes(r);
      setRanking(rank);
      setOdData(od);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-cyan-400" />
          <span>Transit Route Corridors & Origin-Destination Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Efficiency rankings, bottleneck delays, and simulated metropolitan passenger mobility matrices
        </p>
      </div>

      {/* Congestion Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Corridor Delay & Congestion Ranking
          </h2>
          <span className="text-xs text-cyan-400 font-semibold">Priority Intervention Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Route Code</th>
                <th className="px-4 py-3">Corridor Description</th>
                <th className="px-4 py-3">Congestion Level</th>
                <th className="px-4 py-3">Avg Speed</th>
                <th className="px-4 py-3">Peak Delay</th>
                <th className="px-4 py-3">Defects</th>
                <th className="px-4 py-3">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ranking.map((item, idx) => (
                <tr key={item.route_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="px-4 py-3 font-mono font-bold text-cyan-400">{item.route_code}</td>
                  <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.congestion_level === 'HIGH' ? 'bg-rose-500/20 text-rose-400' :
                      item.congestion_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {item.congestion_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{item.avg_speed_kmh} km/h</td>
                  <td className="px-4 py-3 font-mono text-rose-400 font-bold">+{item.avg_delay_mins} mins</td>
                  <td className="px-4 py-3 font-mono text-amber-400">{item.defects_count} active</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">{item.efficiency_score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Origin - Destination Matrix (Simulated Demo Data) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Metropolitan Origin &rarr; Destination Flow Matrix</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                DEMO PASSENGER DATA
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated inter-hub passenger volume matrix to inform dynamic bus fleet allocation
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Peak Period: <strong>08:30 AM - 10:30 AM</strong></span>
          </div>
        </div>

        {/* OD Flows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {odData?.flows.map((flow: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  {flow.origin} <ArrowRight className="w-3.5 h-3.5 text-cyan-400" /> {flow.destination}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  flow.status === 'HEAVY' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {flow.status}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-900">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Simulated Flow</span>
                <span className="text-sm font-bold font-mono text-cyan-400">{flow.flow.toLocaleString()} pax</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
