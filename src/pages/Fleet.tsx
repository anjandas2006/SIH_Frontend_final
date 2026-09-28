import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus as BusIcon,
  Video,
  Cpu,
  Search,
  Filter,
  ArrowRight,
  Wifi,
  Radio,
  Clock,
  Gauge,
  LayoutGrid,
  List
} from 'lucide-react';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import { Bus } from '../types';

export const Fleet: React.FC = () => {
  const navigate = useNavigate();
  const { liveBuses, systemMode } = useSimulation();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBuses().then((data) => {
      setBuses(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Merge with live telemetry if available or mark offline if in live mode without hardware connection
  const displayBuses = buses.map((b) => {
    if (systemMode === 'live') {
      return {
        ...b,
        status: 'OFFLINE' as any,
        camera_status: 'DISCONNECTED',
        ai_status: 'OFFLINE',
        speed_kmh: 0
      };
    }
    const live = liveBuses.find((lb) => lb.bus_number === b.bus_number);
    if (live) {
      return {
        ...b,
        current_lat: live.lat,
        current_lng: live.lng,
        speed_kmh: live.speed,
        heading: live.heading,
        status: live.status,
        camera_status: live.camera_status,
        ai_status: live.ai_status,
        events_today_count: live.events_today || b.events_today_count
      };
    }
    return b;
  });

  const filtered = displayBuses.filter((b) => {
    const matchesSearch =
      b.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.route_name && b.route_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-[#063269] dark:text-white tracking-tight flex items-center gap-2.5">
            <BusIcon className="w-6 h-6 text-[#0284c7] dark:text-sky-400" />
            <span>Fleet Management & Edge AI Telemetry</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time monitoring of {systemMode === 'live' ? '0 active units (Standby)' : '20 mobile urban sensor units'} with 5-camera optical arrays
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bus, plate or route..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] w-56 shadow-2xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-[#0284c7] shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Online)</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#0284c7] shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#0284c7] shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((bus) => (
            <div
              key={bus.id}
              onClick={() => navigate(`/fleet/${bus.bus_number}`)}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-all shadow-sm hover:shadow cursor-pointer flex flex-col justify-between group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7] font-bold text-xs shadow-2xs">
                      {bus.bus_number.split('-')[1]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                        {bus.bus_number}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">{bus.registration_number}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      bus.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : bus.status === 'MAINTENANCE'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${bus.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {bus.status}
                  </span>
                </div>

                {/* Route Info */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 my-3">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Assigned Route</p>
                  <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                    {bus.route_name || 'Downtown Urban Corridor'}
                  </p>
                  <p className="text-[10px] text-[#0284c7] font-mono font-semibold mt-0.5">{bus.route_code || 'R-101'}</p>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Gauge className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Speed: <strong className="text-slate-900">{bus.speed_kmh} km/h</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Events: <strong className="text-slate-900">{bus.events_today_count}</strong></span>
                  </div>
                </div>

                {/* Camera & AI Status Indicators */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Cameras:</span>
                    <span className={`font-semibold ${bus.camera_status === 'ONLINE' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {bus.camera_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Edge AI:</span>
                    <span className={`font-semibold ${bus.ai_status === 'ONLINE' ? 'text-[#0284c7]' : 'text-slate-500'}`}>
                      {bus.ai_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-[#0284c7] font-semibold group-hover:text-[#0369a1]">
                <span>View 5-Camera Feed</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Bus ID</th>
                <th className="px-4 py-3">Plate</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">Cameras</th>
                <th className="px-4 py-3">Edge AI</th>
                <th className="px-4 py-3">Events Today</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((bus) => (
                <tr
                  key={bus.id}
                  onClick={() => navigate(`/fleet/${bus.bus_number}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-slate-900">{bus.bus_number}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{bus.registration_number}</td>
                  <td className="px-4 py-3 text-slate-700">{bus.route_name || 'Corridor R-101'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      bus.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-800">{bus.speed_kmh} km/h</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{bus.camera_status}</td>
                  <td className="px-4 py-3 font-semibold text-[#0284c7]">{bus.ai_status}</td>
                  <td className="px-4 py-3 font-bold text-amber-700">{bus.events_today_count}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[#0284c7] hover:text-[#0369a1] font-semibold">
                      Inspect &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
