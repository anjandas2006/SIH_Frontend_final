import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  Cpu,
  AlertTriangle,
  TrafficCone,
  ShieldAlert,
  Droplets,
  Activity,
  ArrowUpRight,
  Eye,
  CheckCircle,
  Radio,
  Clock
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import { DashboardSummary } from '../types';
import { EvidenceModal } from '../components/common/EvidenceModal';

// Leaflet custom marker icon
const busIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: `<div style="background:#06b6d4; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 8px #06b6d4;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { liveBuses, liveEvents } = useSimulation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<{
    isOpen: boolean;
    title: string;
    image: string;
    metadata?: any;
  }>({ isOpen: false, title: '', image: '' });

  useEffect(() => {
    api.getDashboardSummary()
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard summary', err);
        setLoading(false);
      });
  }, []);

  const kpis = [
    {
      title: 'Active Buses',
      value: summary?.active_buses || 20,
      subtext: 'of 20 Total Fleet Units',
      icon: Bus,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30'
    },
    {
      title: 'AI Events Today',
      value: (summary?.ai_events_today || 1284).toLocaleString(),
      subtext: '+18% vs daily average',
      icon: Cpu,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
      title: 'Potholes Detected',
      value: summary?.potholes_detected || 42,
      subtext: `${summary?.road_health_metrics.unresolved || 18} Unresolved Clusters`,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
      title: 'Traffic Hotspots',
      value: summary?.traffic_hotspots || 16,
      subtext: 'Severe Bottlenecks Flagged',
      icon: TrafficCone,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/30'
    },
    {
      title: 'Active Incidents',
      value: summary?.active_incidents || 8,
      subtext: 'Hit-and-Run & Rash Driving',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30'
    },
    {
      title: 'Waterlogging Points',
      value: summary?.waterlogging_points || 12,
      subtext: 'Standing Drainage Hazards',
      icon: Droplets,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30'
    }
  ];

  const mapBuses = liveBuses.length > 0 ? liveBuses : [
    { id: '1', bus_number: 'BUS-024', lat: 22.5726, lng: 88.3639, speed: 32, route_name: 'Howrah ⇄ Esplanade' },
    { id: '2', bus_number: 'BUS-017', lat: 22.5510, lng: 88.3520, speed: 28, route_name: 'Salt Lake ⇄ Park Street' },
    { id: '3', bus_number: 'BUS-011', lat: 22.5850, lng: 88.4100, speed: 24, route_name: 'Garia ⇄ Esplanade' },
    { id: '4', bus_number: 'BUS-003', lat: 22.5640, lng: 88.3515, speed: 35, route_name: 'Dum Dum ⇄ Howrah' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Urban Intelligence Command Dashboard</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              KOLKATA METROPOLITAN AREA
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Edge AI surveillance, road defect clustering, and multi-bus urban telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/video-analysis')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>Open AI Vision Studio</span>
          </button>
          <button
            onClick={() => navigate('/live-map')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Full GIS Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className={`p-4 rounded-xl border bg-slate-900/60 backdrop-blur flex flex-col justify-between ${kpi.bg} shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tight">{kpi.value}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium truncate">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Section: Live Fleet Map & Real-time AI Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Mini Map */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <h2 className="text-sm font-semibold text-white tracking-tight">Active Fleet Geospatial Stream</h2>
              <span className="text-xs text-slate-400">({mapBuses.length} Moving Units)</span>
            </div>
            <button
              onClick={() => navigate('/live-map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>Interactive GIS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-h-[320px] rounded-lg overflow-hidden border border-slate-800 relative">
            <MapContainer
              center={[22.5726, 88.3639]}
              zoom={12}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {mapBuses.map((bus) => (
                <Marker
                  key={bus.bus_number || bus.id}
                  position={[bus.lat || bus.current_lat, bus.lng || bus.current_lng]}
                  icon={busIcon}
                >
                  <Popup>
                    <div className="text-xs space-y-1 py-1">
                      <p className="font-bold text-cyan-400 text-sm">{bus.bus_number}</p>
                      <p className="text-slate-300">{bus.route_name || 'Active Corridor'}</p>
                      <p className="text-slate-400">Speed: <strong>{bus.speed || bus.speed_kmh} km/h</strong></p>
                      <button
                        onClick={() => navigate(`/fleet/${bus.bus_number}`)}
                        className="mt-1.5 w-full py-1 bg-cyan-500 text-slate-950 rounded font-bold text-[10px]"
                      >
                        Inspect 5-Cam Feed
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Live AI Event Ticker */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Recent AI Edge Detections</h2>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[320px] pr-1">
            {summary?.recent_events.map((event, idx) => (
              <div
                key={event.id || idx}
                onClick={() => setSelectedEvidence({
                  isOpen: true,
                  title: event.title,
                  image: event.evidence || '/evidence/sample_pothole.jpg',
                  metadata: {
                    busNumber: event.bus,
                    location: event.location,
                    timestamp: event.time,
                    confidence: event.confidence,
                    severity: event.severity
                  }
                })}
                className="p-3 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 p-2 rounded-lg ${
                    event.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                    event.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {event.type === 'DEFECT' ? <AlertTriangle className="w-4 h-4" /> :
                     event.type === 'TRAFFIC' ? <TrafficCone className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                      {event.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{event.location}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{event.bus} • Conf: {event.confidence}</p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">{event.time}</span>
                  <span className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    event.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                    event.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {event.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Traffic Trend & Road Condition Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hourly Traffic Flow Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hourly Vehicle Volume & Speed
            </h3>
            <span className="text-xs text-cyan-400 font-semibold">Avg: 22.4 km/h</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.traffic_metrics.hourly_trend || []}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="vehicles" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#trafficGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Road Health & Defect Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Road Health Pipeline Status
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">78% Good</span>
          </div>

          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Unresolved Defect Clusters</span>
                <span className="font-bold text-amber-400">{summary?.road_health_metrics.unresolved || 18}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Under Municipal Review</span>
                <span className="font-bold text-blue-400">{summary?.road_health_metrics.under_review || 8}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Work Orders Dispatched</span>
                <span className="font-bold text-indigo-400">{summary?.road_health_metrics.work_order_issued || 5}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-indigo-400 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Repaired & Verified</span>
                <span className="font-bold text-emerald-400">{summary?.road_health_metrics.repaired || 14}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Summary Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Incident Investigation Pipeline
            </h3>
            <span className="text-xs text-rose-400 font-semibold">8 Active</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <p className="text-xl font-bold text-rose-400">{summary?.incident_summary.new || 3}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">New Incidents</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <p className="text-xl font-bold text-amber-400">{summary?.incident_summary.under_review || 2}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Under Review</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <p className="text-xl font-bold text-blue-400">{summary?.incident_summary.verified || 3}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Verified Plates</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <p className="text-xl font-bold text-emerald-400">{summary?.incident_summary.resolved || 12}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Resolved Cases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Viewer Modal */}
      <EvidenceModal
        isOpen={selectedEvidence.isOpen}
        onClose={() => setSelectedEvidence({ isOpen: false, title: '', image: '' })}
        title={selectedEvidence.title}
        imageSrc={selectedEvidence.image}
        metadata={selectedEvidence.metadata}
      />
    </div>
  );
};
