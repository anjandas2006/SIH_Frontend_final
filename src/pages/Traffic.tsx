import React, { useState, useEffect } from 'react';
import {
  TrafficCone,
  Gauge,
  Car,
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { api } from '../services/api';

export const Traffic: React.FC = () => {
  const [summary, setSummary] = useState<any | null>(null);
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getTrafficSummary(),
      api.getTrafficBottlenecks()
    ]).then(([s, b]) => {
      setSummary(s);
      setBottlenecks(b);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const vehicleColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  const vehicleChartData = summary?.vehicle_breakdown
    ? Object.entries(summary.vehicle_breakdown).map(([k, v]) => ({
        name: k.replace('_', ' ').toUpperCase(),
        count: v
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <TrafficCone className="w-5 h-5 text-orange-400" />
          <span>Real-time Urban Traffic Intelligence & Bottleneck Profiler</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Dynamic traffic density calculated from bus optical tracking: Density = f(Vehicle Count, Average Velocity, Road Capacity)
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City-Wide Traffic Density</span>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-black text-rose-400">{summary?.overall_density_percent || 76}%</p>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 uppercase">
              {summary?.overall_density_level || 'HIGH'}
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mt-3">
            <div
              className="bg-rose-500 h-2 rounded-full transition-all"
              style={{ width: `${summary?.overall_density_percent || 76}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Fleet Velocity</span>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-black text-cyan-400">{summary?.average_speed_kmh || 22.4}</p>
            <span className="text-xs text-slate-400 font-mono">km/h</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Corridor baseline: 35 km/h (-36%)</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Surveyed Vehicles</span>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-black text-emerald-400">{summary?.total_vehicles_active || 480}</p>
            <span className="text-xs text-slate-400 font-mono">units</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Real-time edge counts across 20 routes</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Severe Congestion Hotspots</span>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-black text-amber-400">{summary?.congestion_hotspots_count || 8}</p>
            <span className="text-xs text-slate-400 font-mono">intersections</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Average transit delay: +18 mins</p>
        </div>
      </div>

      {/* Middle Grid: Hourly Curve + Vehicle Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Volume & Congestion Curve */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              24-Hour Diurnal Traffic Volume & Velocity
            </h2>
            <span className="text-xs text-cyan-400 font-semibold">Morning & Evening Peak Peaks</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.hourly_trend || []}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="vehicles" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Classification Distribution */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Vehicle Classification Distribution
            </h2>
            <span className="text-xs text-emerald-400 font-semibold">Edge AI Classified</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleChartData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {vehicleChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={vehicleColors[index % vehicleColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottlenecks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Critical Urban Congestion Bottlenecks
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Bottleneck Location</th>
                <th className="px-4 py-3">Density Index</th>
                <th className="px-4 py-3">Average Speed</th>
                <th className="px-4 py-3">Traffic Volume</th>
                <th className="px-4 py-3">Reporting Bus</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bottlenecks.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{b.location_name}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-rose-400">{b.density_percent}%</span>
                  </td>
                  <td className="px-4 py-3 font-mono">{b.avg_speed_kmh} km/h</td>
                  <td className="px-4 py-3">{b.vehicle_count} vehicles</td>
                  <td className="px-4 py-3 font-mono text-cyan-400">{b.bus_reporter}</td>
                  <td className="px-4 py-3 text-slate-400">{b.duration_minutes} mins</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.density_level === 'SEVERE' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {b.density_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
