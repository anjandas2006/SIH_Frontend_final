import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bus,
  ArrowLeft,
  Video,
  Cpu,
  Wifi,
  MapPin,
  Clock,
  Gauge,
  Compass,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';
import { Bus as BusType } from '../types';

const busMarkerIcon = L.divIcon({
  className: 'bus-detail-marker',
  html: `<div style="background:#0284c7; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export const BusDetail: React.FC = () => {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const { liveBuses } = useSimulation();
  const { theme } = useTheme();

  // High-visibility map tiles: OpenStreetMap used in both bright and dark modes as requested
  const mapTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const mapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const [bus, setBus] = useState<BusType | null>(null);
  const [activeCamTab, setActiveCamTab] = useState<'FRONT' | 'REAR' | 'LEFT' | 'RIGHT' | 'CABIN'>('FRONT');
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (busId) {
      api.getBus(busId).then((data) => {
        setBus(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [busId]);

  // Live telemetry overlay
  const liveInfo = liveBuses.find((b) => b.bus_number === busId || b.id === busId);
  const currentLat = liveInfo?.lat || bus?.current_lat || 22.5726;
  const currentLng = liveInfo?.lng || bus?.current_lng || 88.3639;
  const currentSpeed = liveInfo?.speed || bus?.speed_kmh || 32.0;
  const currentHeading = liveInfo?.heading || bus?.heading || 90.0;

  // Render animated canvas simulation for camera feed
  useEffect(() => {
    let animationFrameId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark asphalt background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Road perspective
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(width * 0.35, height * 0.35);
      ctx.lineTo(width * 0.65, height * 0.35);
      ctx.lineTo(width * 0.95, height);
      ctx.lineTo(width * 0.05, height);
      ctx.closePath();
      ctx.fill();

      // Lane markings
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.35);
      ctx.lineTo(width * 0.5, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dynamic animated vehicle or defect depending on camera tab
      if (activeCamTab === 'FRONT') {
        // Vehicle ahead
        const vehX = width * 0.42 + Math.sin(frame * 0.03) * 15;
        const vehY = height * 0.48;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(vehX, vehY, 90, 60);

        // Bounding Box
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.strokeRect(vehX - 4, vehY - 4, 98, 68);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(vehX - 4, vehY - 22, 110, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('CAR #101 (96%)', vehX, vehY - 9);

        // Road pothole detection
        const potX = width * 0.32;
        const potY = height * 0.72;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(potX + 40, potY + 15, 45, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.strokeRect(potX, potY, 80, 32);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(potX, potY - 18, 110, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('POTHOLE (94%)', potX + 4, potY - 5);
      } else if (activeCamTab === 'REAR') {
        // Following motorcycle
        const mX = width * 0.48 + Math.cos(frame * 0.04) * 20;
        const mY = height * 0.52;
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(mX, mY, 40, 50);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(mX - 2, mY - 2, 44, 54);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(mX - 2, mY - 18, 120, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('MOTORCYCLE #102', mX + 2, mY - 6);
      } else if (activeCamTab === 'LEFT') {
        // Pedestrian near sidewalk
        const pedX = width * 0.22;
        const pedY = height * 0.45;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pedX, pedY, 25, 70);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(pedX - 2, pedY - 2, 29, 74);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pedX - 2, pedY - 18, 100, 16);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('PEDESTRIAN (92%)', pedX + 2, pedY - 6);
      } else if (activeCamTab === 'CABIN') {
        // Passenger cabin outline
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#334155';
        ctx.fillRect(width * 0.1, height * 0.2, width * 0.8, height * 0.6);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('OCCUPANCY: 28 PASSENGERS (NORMAL)', width * 0.25, height * 0.5);
      }

      // HUD Telemetry Overlays
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, 0, width, 32);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      ctx.fillText(`CAM: ${activeCamTab} | BUS: ${busId || 'BUS-024'} | SPEED: ${currentSpeed} km/h | LAT: ${currentLat.toFixed(4)} LNG: ${currentLng.toFixed(4)} | ${nowStr}`, 12, 20);

      // AI Edge Processing watermark
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, height - 26, width, 26);
      ctx.fillStyle = '#34d399';
      ctx.font = '10px monospace';
      ctx.fillText(`EDGE AI ENGINE ACTIVE | FPS: 30.0 | LATENCY: 24ms | COMPRESSION: 99.4%`, 12, height - 9);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeCamTab, currentLat, currentLng, currentSpeed, busId]);

  const cameraTabs = ['FRONT', 'REAR', 'LEFT', 'RIGHT', 'CABIN'] as const;

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/fleet')}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Back to Fleet"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-heading font-extrabold text-[#063269] tracking-tight">{bus?.bus_number || busId}</h1>
              <span className="text-xs font-mono text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-semibold">
                {bus?.registration_number || 'WB-04-E-1024'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE IN SERVICE
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Assigned: <strong>{bus?.route_name || 'Howrah ⇄ Esplanade Central'}</strong> ({bus?.route_code || 'R-101'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs font-medium">
            <Radio className="w-3.5 h-3.5 text-[#0284c7] animate-pulse" />
            <span>Telemetry Ping: <strong>1.2s</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: 5-Camera Video Suite + Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5-Camera Feeds Studio */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          {/* Camera Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {cameraTabs.map((cam) => (
                <button
                  key={cam}
                  onClick={() => setActiveCamTab(cam)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    activeCamTab === cam
                      ? 'bg-[#0284c7] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{cam} CAMERA</span>
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>1080p @ 30 FPS</span>
            </div>
          </div>

          {/* Interactive Canvas Video Feed */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Camera Telemetry Sub-panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Current Speed</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{currentSpeed} km/h</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Vehicle Heading</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{currentHeading}° East</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">AI Edge Latency</span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">24 ms</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Today's AI Events</span>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{bus?.events_today_count || 17}</p>
            </div>
          </div>
        </div>

        {/* Right: GPS Location & Route Map */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0284c7]" />
              <h3 className="text-sm font-bold text-slate-900">Live Route Telemetry</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
            </span>
          </div>

          <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
            <MapContainer
              key={`busdetail-${theme}`}
              center={[currentLat, currentLng]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                key={`busdetail-tile-${theme}`}
                attribution={mapAttribution}
                url={mapTileUrl}
              />
              <Marker position={[currentLat, currentLng]} icon={busMarkerIcon}>
                <Popup>
                  <div className="text-xs py-1 text-slate-800">
                    <p className="font-bold text-[#0284c7]">{bus?.bus_number}</p>
                    <p className="text-slate-600">{bus?.route_name}</p>
                    <p className="text-slate-500">Speed: {currentSpeed} km/h</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Bus Hardware Health */}
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium">Edge AI Compute Core</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ONLINE
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium">5x Optical Array Sensor</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 5/5 ONLINE
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium">GPS / RTK Module</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> LOCKED (14 SATS)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
