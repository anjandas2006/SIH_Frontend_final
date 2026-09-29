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
  Clock,
  ChevronRight,
  FileSpreadsheet,
  Download,
  Layers,
  Wrench,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { api, getEvidenceUrl } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardSummary } from '../types';
import { EvidenceModal } from '../components/common/EvidenceModal';

// Leaflet custom marker icon (crisp high-contrast styling)
const busIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: `<div style="background:#0284c7; width:16px; height:16px; border-radius:50%; border:2.5px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { liveBuses, liveEvents, systemMode, triggerDefectDemo, triggerIncidentDemo } = useSimulation();
  const { theme } = useTheme();
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

  // Compute live event counts in real-time
  const liveFrameCount = liveEvents.length > 0 ? liveEvents.length * 10 : 0;
  const livePotholesCount = liveEvents.filter(e => e.category === 'POTHOLE' || e.type === 'DEFECT' || (e.title && e.title.toLowerCase().includes('pothole'))).length;
  const liveTrafficCount = liveEvents.filter(e => e.type === 'TRAFFIC' || e.type === 'TRAFFIC_UPDATE' || (e.title && e.title.toLowerCase().includes('traffic'))).length;
  const liveIncidentsCount = liveEvents.filter(e => e.category === 'INCIDENT' || e.type === 'INCIDENT' || (e.title && e.title.toLowerCase().includes('incident')) || (e.title && e.title.toLowerCase().includes('hit-and-run'))).length;
  const liveWaterloggingCount = liveEvents.filter(e => e.category === 'WATERLOGGING' || (e.title && e.title.toLowerCase().includes('waterlogging'))).length;

  const kpis = [
    {
      title: 'Survey Fleet Units',
      value: systemMode === 'live' ? liveBuses.length : (summary?.active_buses || 20),
      subtext: systemMode === 'live' ? `${liveBuses.length} Units Active (Standby for Edge Uplink)` : '20 Total Dashcam Units',
      icon: Bus,
      color: systemMode === 'live' && liveBuses.length === 0 ? 'text-slate-400' : 'text-[#0284c7]',
      bgIcon: systemMode === 'live' && liveBuses.length === 0 ? 'bg-slate-100 dark:bg-slate-800' : 'bg-sky-50 dark:bg-sky-950/60'
    },
    {
      title: '10-ft Frame Detections',
      value: systemMode === 'live' ? liveFrameCount.toLocaleString() : (summary?.ai_events_today || 1284).toLocaleString(),
      subtext: systemMode === 'live' ? (liveFrameCount > 0 ? `${liveFrameCount} live edge packets ingested` : '0 real-time detections') : '+18% vs weekly avg',
      icon: Cpu,
      color: systemMode === 'live' && liveFrameCount === 0 ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400',
      bgIcon: systemMode === 'live' && liveFrameCount === 0 ? 'bg-slate-100 dark:bg-slate-800' : 'bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      title: 'Pothole Clusters',
      value: systemMode === 'live' ? livePotholesCount : (summary?.potholes_detected || 42),
      subtext: systemMode === 'live' ? `${livePotholesCount} Live Detected` : `${summary?.road_health_metrics?.unresolved || 18} Unresolved (Immediate)`,
      icon: AlertTriangle,
      color: systemMode === 'live' && livePotholesCount === 0 ? 'text-slate-400' : 'text-amber-600 dark:text-amber-400',
      bgIcon: systemMode === 'live' && livePotholesCount === 0 ? 'bg-slate-100 dark:bg-slate-800' : 'bg-amber-50 dark:bg-amber-950/60'
    },
    {
      title: 'Traffic Bottlenecks',
      value: systemMode === 'live' ? liveTrafficCount : (summary?.traffic_hotspots || 16),
      subtext: systemMode === 'live' ? `${liveTrafficCount} Congestion Zones` : 'Avg Speed: 22.4 km/h',
      icon: TrafficCone,
      color: systemMode === 'live' && liveTrafficCount === 0 ? 'text-slate-400' : 'text-orange-600 dark:text-orange-400',
      bgIcon: systemMode === 'live' && liveTrafficCount === 0 ? 'bg-slate-100 dark:bg-slate-800' : 'bg-orange-50 dark:bg-orange-950/60'
    },
    {
      title: 'Active Safety Incidents',
      value: systemMode === 'live' ? liveIncidentsCount : (summary?.active_incidents || 8),
      subtext: systemMode === 'live' ? `${liveIncidentsCount} Live Alerts` : 'Hit-and-Run & Hazards',
      icon: ShieldAlert,
      color: systemMode === 'live' && liveIncidentsCount === 0 ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400',
      bgIcon: systemMode === 'live' && liveIncidentsCount === 0 ? 'bg-slate-100 dark:bg-slate-800' : 'bg-rose-50 dark:bg-rose-950/60'
    },
    {
      title: 'Drainage Waterlogging',
      value: systemMode === 'live' ? liveWaterloggingCount : (summary?.waterlogging_points || 12),
      subtext: systemMode === 'live' ? `${liveWaterloggingCount} Hazard Points` : 'Monsoon Hazard Points',
      icon: Droplets,
      color: systemMode === 'live' && liveWaterloggingCount === 0 ? 'text-slate-400' : 'text-blue-600 dark:text-blue-400',
      bgIcon: systemMode === 'live' && liveWaterloggingCount === 0 ? 'bg-slate-100 dark:bg-slate-800' : 'bg-blue-50 dark:bg-blue-950/60'
    }
  ];

  const mapBuses = systemMode === 'live' ? [] : liveBuses;

  // High-visibility map tiles: OpenStreetMap used in both bright and dark modes as requested
  const mapTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const mapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* 1. TOP OPERATIONAL TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-heading font-extrabold text-[#063269] dark:text-white tracking-tight">
              BusSense AI Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              UKPMS CERTIFIED
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
            <span>Jurisdiction: <strong className="text-slate-900 dark:text-slate-200">Kolkata Municipal Corporation (KMC)</strong></span>
            <span>•</span>
            <span>Survey Method: <strong className="text-slate-900 dark:text-slate-200">Continuous 10-ft Transit Dashcam Ingestion</strong></span>
            <span>•</span>
            <span className="text-[#0284c7] dark:text-sky-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Edge Sync Active
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/analytics-reports?tab=reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export UKPMS CSV</span>
          </button>
        </div>
      </div>

      {/* 2. STRUCTURED KPI CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111c2e] shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  {kpi.title}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.bgIcon}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">{kpi.value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MIDDLE SECTION: LIVE CARRIAGEWAY MAP (VIBRANT BRIGHT MODE) & 10-FT DEFECT INSPECTION STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Mini Map */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] radar-dot"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Carriageway Geospatial Stream</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">({mapBuses.length} Moving Telemetry Units)</span>
            </div>
            <button
              onClick={() => navigate('/live-map')}
              className="text-xs text-[#0284c7] dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Full Screen GIS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* High-visibility Leaflet Map with crisp bright tiles */}
          <div className="flex-1 min-h-[360px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner">
            {systemMode === 'live' && (
              <div className="absolute top-3 left-14 z-[1000] bg-white/95 dark:bg-[#111c2e]/95 backdrop-blur-sm border border-rose-300 dark:border-rose-900/80 px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  Live Mode: 0 Active Buses Connected (Awaiting edge dashcams). Switch to DEMO in header to view simulation.
                </p>
              </div>
            )}
            <MapContainer
              key={theme} // Force re-render on theme toggle so map tiles switch cleanly
              center={[22.5726, 88.3639]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                key={`dashboard-tile-${theme}`}
                attribution={mapAttribution}
                url={mapTileUrl}
              />
              {mapBuses.map((bus) => (
                <Marker
                  key={bus.bus_number || bus.id}
                  position={[bus.lat || (bus as any).current_lat, bus.lng || (bus as any).current_lng]}
                  icon={busIcon}
                >
                  <Popup>
                    <div className="text-xs space-y-1 py-1 text-slate-800">
                      <p className="font-bold text-[#0284c7] text-sm">{bus.bus_number}</p>
                      <p className="text-slate-600">{bus.route_name || 'Active Corridor'}</p>
                      <p className="text-slate-600">Speed: <strong>{(bus as any).speed || (bus as any).speed_kmh} km/h</strong></p>
                      <button
                        onClick={() => navigate(`/fleet/${bus.bus_number}`)}
                        className="mt-1.5 w-full py-1 bg-[#0284c7] text-white rounded font-bold text-[10px] hover:bg-[#0369a1] transition-colors"
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

        {/* Live AI 10-ft Defect Inspection Ticker */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">10-ft Defect Inspection Queue</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-semibold">
              {systemMode === 'live' ? 'Live Edge Ingestion' : 'Demo Stream Detections'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1 flex flex-col">
            {systemMode === 'live' && liveEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 my-auto">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2.5 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Queue Blank • 0 Incidents Active
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] leading-relaxed">
                  Real-time edge ingestion active. No defects or hazards recorded on live stream. Standby for dashcam telemetry.
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => triggerDefectDemo()}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>⚡ Send Live Defect</span>
                  </button>
                  <button
                    onClick={() => triggerIncidentDemo()}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>🚨 Send Live Incident</span>
                  </button>
                </div>
              </div>
            ) : (
              (systemMode === 'live' ? liveEvents : (summary?.recent_events || [])).map((event: any, idx: number) => (
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
                      severity: event.severity,
                      interval: 'Captured every 10 ft'
                    }
                  })}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50/50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-between group shrink-0"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 p-2 rounded-lg ${
                      event.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400' :
                      event.severity === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' : 'bg-sky-100 dark:bg-sky-950 text-[#0284c7] dark:text-sky-400'
                    }`}>
                      {event.type === 'DEFECT' ? <AlertTriangle className="w-4 h-4" /> :
                       event.type === 'TRAFFIC' ? <TrafficCone className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-400 transition-colors truncate">
                        {event.title}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">{event.location}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{event.bus} • Conf: {event.confidence}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{event.time}</span>
                    <span className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      event.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800' :
                      event.severity === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {event.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. ENGINEERING ANALYTICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hourly Traffic Flow & Velocity */}
        <div className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Hourly Carriageway Velocity & Volume
            </h3>
            <span className="text-xs text-[#0284c7] dark:text-sky-400 font-semibold">Avg: 22.4 km/h</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.traffic_metrics.hourly_trend || []}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: theme === 'dark' ? '#f8fafc' : '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="vehicles" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#trafficGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Road Health & Defect Pipeline */}
        <div className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Municipal Repair Pipeline
            </h3>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              78% Good Quality
            </span>
          </div>

          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Unresolved Defect Clusters</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{summary?.road_health_metrics?.unresolved || 18}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Under Municipal Engineering Review</span>
                <span className="font-bold text-[#0284c7] dark:text-sky-400">{summary?.road_health_metrics?.under_review || 8}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-[#0284c7] h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Work Orders Issued to Contractors</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{summary?.road_health_metrics?.work_order_issued || 5}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Repaired & Verified (Closed)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{summary?.road_health_metrics?.repaired || 14}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Safety & Hit-and-Run Incident Pipeline */}
        <div className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Public Safety & Incident Pipeline
            </h3>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
              8 Active Cases
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{summary?.incident_summary.new || 3}</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 uppercase font-semibold">New Incidents</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary?.incident_summary.under_review || 2}</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 uppercase font-semibold">Under Review</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-2xl font-bold text-[#0284c7] dark:text-sky-400">{summary?.incident_summary.verified || 3}</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 uppercase font-semibold">OCR Verified Plates</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary?.incident_summary.resolved || 12}</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 uppercase font-semibold">Resolved Cases</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. DOWNSIDE OF DASHBOARD: THE CORE ROAD HEALTH & CARRIAGEWAY DISTRIBUTION BANNER (AS REQUESTED) */}
      <div className="bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Overall PCI Rating */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] dark:text-sky-400">
              NETWORK CARRIAGEWAY HEALTH
            </span>
            <span className="text-[10px] font-mono bg-sky-50 dark:bg-sky-950/80 text-[#0284c7] dark:text-sky-400 px-2 py-0.5 rounded font-semibold border border-sky-200 dark:border-sky-800">
              ROAD PCI SCALE 0–10
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-heading font-extrabold text-[#063269] dark:text-white tracking-tight">
              {summary?.road_health_metrics?.rm_pci_index || 7.4}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ 10.0</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-lime-50 dark:bg-lime-950/60 text-[#65a30d] dark:text-lime-400 border border-lime-200 dark:border-lime-800">
              Level 2: Good Condition
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Continuous automated scan across <strong>{summary?.road_health_metrics?.surveyed_network_km || 168.4} km</strong>. Minor surface wear detected; structural load capacity fully intact.
          </p>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 pt-1">
            <span>Interval: <strong>Every 10 Feet</strong></span>
            <span>•</span>
            <span>Turnaround: <strong>&lt; 4 Minutes</strong></span>
          </div>
        </div>

        {/* Center: 5-Level Condition Breakdown Bars */}
        <div className="lg:col-span-5 space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-100">5-Level Carriageway Distribution</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              84% Survey Cost Savings
            </span>
          </div>

          {/* Condition Bar */}
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex shadow-inner">
            <div style={{ width: '42%' }} className="bg-[#16a34a]" title="Level 1 (Excellent): 42%"></div>
            <div style={{ width: '26%' }} className="bg-[#65a30d]" title="Level 2 (Good): 26%"></div>
            <div style={{ width: '15%' }} className="bg-[#eab308]" title="Level 3 (Fair): 15%"></div>
            <div style={{ width: '11%' }} className="bg-[#ea580c]" title="Level 4 (Poor): 11%"></div>
            <div style={{ width: '6%' }} className="bg-[#dc2626]" title="Level 5 (Critical): 6%"></div>
          </div>

          {/* Micro Legend */}
          <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[#16a34a] font-bold block">L1: 42%</span>
              <span className="text-slate-500 dark:text-slate-400 text-[9px]">Excellent</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[#65a30d] font-bold block">L2: 26%</span>
              <span className="text-slate-500 dark:text-slate-400 text-[9px]">Good</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-amber-600 dark:text-amber-400 font-bold block">L3: 15%</span>
              <span className="text-slate-500 dark:text-slate-400 text-[9px]">Fair</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-orange-600 dark:text-orange-400 font-bold block">L4: 11%</span>
              <span className="text-slate-500 dark:text-slate-400 text-[9px]">Poor</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-rose-600 dark:text-rose-400 font-bold block">L5: 6%</span>
              <span className="text-slate-500 dark:text-slate-400 text-[9px]">Critical</span>
            </div>
          </div>
        </div>

        {/* Right: Municipal Action & Work Order Summary */}
        <div className="lg:col-span-3 space-y-2.5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PROJECTED REPAIR ALLOCATION
            </div>
            <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
              ₹3,090,000 <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">($37K)</span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300">
              Covers 18 unresolved pothole clusters + preventative micro-surfacing.
            </p>
          </div>

          <button
            onClick={() => navigate('/road-intelligence')}
            className="w-full py-2.5 px-3 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span>Dispatch Work Orders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
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
