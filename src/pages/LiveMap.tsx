import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Polyline
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Bus,
  AlertTriangle,
  Droplets,
  TrafficCone,
  ShieldAlert,
  Sliders,
  Eye,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceModal } from '../components/common/EvidenceModal';
import { RoadDefectCluster, TrafficEvent, Incident } from '../types';

// Custom Map Marker Icons
const createDivIcon = (color: string, iconHtml: string) =>
  L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background:${color}; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 0 10px ${color}; font-size:12px;">${iconHtml}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

const busIcon = createDivIcon('#06b6d4', '🚌');
const potholeIcon = createDivIcon('#ef4444', '⚠️');
const waterloggingIcon = createDivIcon('#3b82f6', '🌊');
const damagedRoadIcon = createDivIcon('#f59e0b', '🛣️');
const trafficIcon = createDivIcon('#ea580c', '🚦');
const incidentIcon = createDivIcon('#e11d48', '🚨');
const pedIcon = createDivIcon('#8b5cf6', '🚶');

export const LiveMap: React.FC = () => {
  const { liveBuses } = useSimulation();

  const [defects, setDefects] = useState<RoadDefectCluster[]>([]);
  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Layer Toggles
  const [layers, setLayers] = useState({
    buses: true,
    potholes: true,
    damagedRoads: true,
    waterlogging: true,
    missingDividers: true,
    trafficSigns: true,
    congestion: true,
    incidents: true,
    pedestrians: true,
    routes: false
  });

  const [selectedEvidence, setSelectedEvidence] = useState<{
    isOpen: boolean;
    title: string;
    image: string;
    metadata?: any;
  }>({ isOpen: false, title: '', image: '' });

  useEffect(() => {
    Promise.all([
      api.getRoadDefects(),
      api.getTrafficEvents(),
      api.getIncidents(),
      api.getRoutes()
    ]).then(([d, t, i, r]) => {
      setDefects(d);
      setTrafficEvents(t);
      setIncidents(i);
      setRoutes(r);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const displayBuses = liveBuses.length > 0 ? liveBuses : [
    { id: '1', bus_number: 'BUS-024', lat: 22.5726, lng: 88.3639, speed: 32, route_name: 'Howrah ⇄ Esplanade' },
    { id: '2', bus_number: 'BUS-017', lat: 22.5510, lng: 88.3520, speed: 28, route_name: 'Salt Lake ⇄ Park Street' },
    { id: '3', bus_number: 'BUS-011', lat: 22.5850, lng: 88.4100, speed: 24, route_name: 'Garia ⇄ Esplanade' },
    { id: '4', bus_number: 'BUS-003', lat: 22.5640, lng: 88.3515, speed: 35, route_name: 'Dum Dum ⇄ Howrah' }
  ];

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Smart City GIS Urban Map & Spatial AI Overlay</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive multi-layered GIS intelligence aggregated from active bus-mounted sensors
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            CRS: EPSG:4326 (WGS84)
          </span>
        </div>
      </div>

      {/* Main Map + Layer Drawer Container */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 relative flex shadow-2xl">
        {/* Leaflet Map Canvas */}
        <div className="flex-1 h-full w-full">
          <MapContainer
            center={[22.5726, 88.3639]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Routes Polylines */}
            {layers.routes && routes.map((r) => (
              <Polyline
                key={r.id}
                positions={r.waypoints_json.map((wp: any) => [wp[0], wp[1]])}
                pathOptions={{ color: r.color || '#3b82f6', weight: 4, opacity: 0.6 }}
              />
            ))}

            {/* Live Buses Layer */}
            {layers.buses && displayBuses.map((bus) => (
              <Marker
                key={bus.bus_number || bus.id}
                position={[bus.lat || bus.current_lat, bus.lng || bus.current_lng]}
                icon={busIcon}
              >
                <Popup>
                  <div className="text-xs space-y-1 py-1">
                    <p className="font-bold text-cyan-400 text-sm">{bus.bus_number}</p>
                    <p className="text-slate-300">{bus.route_name}</p>
                    <p className="text-slate-400">Current Speed: <strong>{bus.speed || bus.speed_kmh} km/h</strong></p>
                    <div className="pt-2">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                        CAMERAS & AI ONLINE
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Road Defect Clusters Layer */}
            {defects.map((defect) => {
              if (defect.defect_type === 'POTHOLE' && !layers.potholes) return null;
              if (defect.defect_type === 'WATERLOGGING' && !layers.waterlogging) return null;
              if (defect.defect_type === 'DAMAGED_ROAD' && !layers.damagedRoads) return null;
              if (defect.defect_type === 'MISSING_DIVIDER' && !layers.missingDividers) return null;
              if (defect.defect_type === 'DAMAGED_SIGN' && !layers.trafficSigns) return null;

              const icon = defect.defect_type === 'POTHOLE' ? potholeIcon :
                           defect.defect_type === 'WATERLOGGING' ? waterloggingIcon : damagedRoadIcon;

              return (
                <Marker
                  key={defect.id}
                  position={[defect.latitude, defect.longitude]}
                  icon={icon}
                >
                  <Popup>
                    <div className="text-xs space-y-1.5 py-1 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white uppercase">{defect.defect_type.replace('_', ' ')}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          defect.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {defect.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-cyan-400 font-mono font-bold">{defect.cluster_code}</p>
                      <p className="text-slate-300 text-[11px]">{defect.address_description}</p>
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] space-y-0.5">
                        <p className="text-emerald-400 font-bold">Confirmed by: {defect.confirmed_buses_count} buses</p>
                        <p className="text-slate-400">Total Detections: {defect.total_detections}</p>
                        <p className="text-slate-400">Consensus Conf: {Math.round(defect.confidence * 100)}%</p>
                      </div>
                      <button
                        onClick={() => setSelectedEvidence({
                          isOpen: true,
                          title: `${defect.defect_type} (${defect.cluster_code})`,
                          image: defect.evidence_image || '/evidence/sample_pothole.jpg',
                          metadata: {
                            busNumber: `Confirmed by ${defect.confirmed_buses_count} buses`,
                            location: defect.address_description,
                            confidence: `${Math.round(defect.confidence * 100)}%`,
                            severity: defect.severity
                          }
                        })}
                        className="w-full mt-1.5 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Dashcam Evidence</span>
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Traffic Congestion Layer */}
            {layers.congestion && trafficEvents.map((te) => (
              <Marker
                key={te.id}
                position={[te.latitude, te.longitude]}
                icon={trafficIcon}
              >
                <Popup>
                  <div className="text-xs space-y-1 py-1">
                    <p className="font-bold text-orange-400">TRAFFIC BOTTLENECK</p>
                    <p className="text-white font-semibold">{te.location_name}</p>
                    <p className="text-slate-300">Density: <strong>{te.density_percent}% ({te.density_level})</strong></p>
                    <p className="text-slate-400">Speed: {te.avg_speed_kmh} km/h • Vehicles: {te.vehicle_count}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Incidents Layer */}
            {layers.incidents && incidents.map((inc) => (
              <Marker
                key={inc.id}
                position={[inc.latitude, inc.longitude]}
                icon={incidentIcon}
              >
                <Popup>
                  <div className="text-xs space-y-1.5 py-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-rose-400">{inc.incident_type.replace('_', ' ')}</p>
                      <span className="text-[10px] font-mono text-cyan-400">{inc.incident_code}</span>
                    </div>
                    <p className="text-slate-200">{inc.location_name}</p>
                    {inc.detected_plate && (
                      <p className="text-xs font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-amber-400">
                        Plate: <strong>{inc.corrected_plate || inc.detected_plate}</strong>
                      </p>
                    )}
                    <button
                      onClick={() => setSelectedEvidence({
                        isOpen: true,
                        title: `${inc.incident_type} (${inc.incident_code})`,
                        image: inc.evidence_image || '/evidence/sample_hit_and_run.jpg',
                        metadata: {
                          busNumber: inc.bus_id,
                          location: inc.location_name,
                          confidence: `${Math.round(inc.plate_confidence * 100)}%`,
                          severity: inc.severity
                        }
                      })}
                      className="w-full mt-1 py-1 rounded bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect Incident Frame</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Floating GIS Layer Controls Panel */}
        <div className="absolute top-4 right-4 z-[500] w-64 bg-slate-950/95 backdrop-blur border border-slate-800 rounded-xl p-3.5 shadow-2xl space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-white">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>GIS Layer Filters</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Active</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Live Buses
              </span>
              <input
                type="checkbox"
                checked={layers.buses}
                onChange={() => toggleLayer('buses')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Potholes
              </span>
              <input
                type="checkbox"
                checked={layers.potholes}
                onChange={() => toggleLayer('potholes')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Waterlogging
              </span>
              <input
                type="checkbox"
                checked={layers.waterlogging}
                onChange={() => toggleLayer('waterlogging')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Damaged Roads
              </span>
              <input
                type="checkbox"
                checked={layers.damagedRoads}
                onChange={() => toggleLayer('damagedRoads')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Traffic Congestion
              </span>
              <input
                type="checkbox"
                checked={layers.congestion}
                onChange={() => toggleLayer('congestion')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Critical Incidents
              </span>
              <input
                type="checkbox"
                checked={layers.incidents}
                onChange={() => toggleLayer('incidents')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Bus Route Corridors
              </span>
              <input
                type="checkbox"
                checked={layers.routes}
                onChange={() => toggleLayer('routes')}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>
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
