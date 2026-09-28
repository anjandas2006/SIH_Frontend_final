import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
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
import { useTheme } from '../context/ThemeContext';
import { EvidenceModal } from '../components/common/EvidenceModal';
import { RoadDefectCluster, TrafficEvent, Incident } from '../types';

// Custom Map Marker Icons (clean enterprise circular markers with white outline)
const createDivIcon = (color: string, iconHtml: string) =>
  L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background:${color}; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 2px 6px rgba(0,0,0,0.25); font-size:12px;">${iconHtml}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

const busIcon = createDivIcon('#0284c7', '🚌');
const potholeIcon = createDivIcon('#ea580c', '⚠️');
const waterloggingIcon = createDivIcon('#0284c7', '🌊');
const damagedRoadIcon = createDivIcon('#d97706', '🛣️');
const trafficIcon = createDivIcon('#ea580c', '🚦');
const incidentIcon = createDivIcon('#dc2626', '🚨');

export const LiveMap: React.FC = () => {
  const { liveBuses, systemMode } = useSimulation();
  const { theme } = useTheme();

  // High-visibility map tiles: OpenStreetMap used in both bright and dark modes as requested
  const mapTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const mapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

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

  const fallbackBuses = [
    { id: '1', bus_number: 'BUS-024', lat: 22.5726, lng: 88.3639, speed: 32, route_name: 'Howrah ⇄ Esplanade' },
    { id: '2', bus_number: 'BUS-017', lat: 22.5510, lng: 88.3520, speed: 28, route_name: 'Salt Lake ⇄ Park Street' },
    { id: '3', bus_number: 'BUS-011', lat: 22.5850, lng: 88.4100, speed: 24, route_name: 'Garia ⇄ Esplanade' },
    { id: '4', bus_number: 'BUS-003', lat: 22.5640, lng: 88.3515, speed: 35, route_name: 'Dum Dum ⇄ Howrah' }
  ];

  // In live mode, 0 active buses; in demo mode, show live simulation
  const displayBuses = systemMode === 'live' ? [] : (liveBuses.length > 0 ? liveBuses : fallbackBuses);

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col font-sans text-slate-800 dark:text-slate-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-[#063269] dark:text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#0284c7] dark:text-sky-400" />
            <span>BusSense AI Urban GIS & Road Surface Map</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Multi-layered carriageway intelligence aggregated from continuous 10-ft interval fleet sensors
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs shadow-2xs font-semibold">
            CRS: EPSG:4326 (WGS84) • UKPMS COMPLIANT
          </span>
        </div>
      </div>

      {/* Main Map + Layer Drawer Container */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative flex shadow-sm bg-white dark:bg-[#111c2e]">
        {systemMode === 'live' && (
          <div className="absolute top-3 left-14 z-[1000] bg-white/95 dark:bg-[#111c2e]/95 backdrop-blur-sm border border-rose-300 dark:border-rose-900/80 px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              Live GIS Stream: 0 Active Buses Connected (Physical dashcam uplink standby). Switch to DEMO mode in header to view simulated fleet.
            </p>
          </div>
        )}
        {/* Leaflet Map Canvas */}
        <div className="flex-1 h-full w-full">
          <MapContainer
            key={`livemap-${theme}`}
            center={[22.5726, 88.3639]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              key={`livemap-tile-${theme}`}
              attribution={mapAttribution}
              url={mapTileUrl}
            />

            {/* Routes Polylines */}
            {layers.routes && routes.map((r) => (
              <Polyline
                key={r.id}
                positions={r.waypoints_json.map((wp: any) => [wp[0], wp[1]])}
                pathOptions={{ color: r.color || '#0284c7', weight: 4, opacity: 0.7 }}
              />
            ))}

            {/* Live Buses Layer */}
            {layers.buses && displayBuses.map((bus) => (
              <Marker
                key={bus.bus_number || bus.id}
                position={[bus.lat || (bus as any).current_lat, bus.lng || (bus as any).current_lng]}
                icon={busIcon}
              >
                <Popup>
                  <div className="text-xs space-y-1.5 py-1 text-slate-800">
                    <p className="font-bold text-[#0284c7] text-sm">{bus.bus_number}</p>
                    <p className="text-slate-600 font-medium">{bus.route_name}</p>
                    <p className="text-slate-600">Current Speed: <strong>{(bus as any).speed || (bus as any).speed_kmh} km/h</strong></p>
                    <div className="pt-1.5">
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
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
                    <div className="text-xs space-y-2 py-1 min-w-[210px] text-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase">{defect.defect_type.replace('_', ' ')}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          defect.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {defect.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#0284c7] font-mono font-bold">{defect.cluster_code}</p>
                      <p className="text-slate-600 text-[11px] leading-snug">{defect.address_description}</p>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] space-y-0.5">
                        <p className="text-emerald-700 font-semibold">Confirmed by: {defect.confirmed_buses_count} buses</p>
                        <p className="text-slate-500">Total Detections: {defect.total_detections}</p>
                        <p className="text-slate-500">Consensus Conf: {Math.round(defect.confidence * 100)}%</p>
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
                        className="w-full mt-1.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
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
                  <div className="text-xs space-y-1 py-1 text-slate-800">
                    <p className="font-bold text-orange-600">TRAFFIC BOTTLENECK</p>
                    <p className="text-slate-900 font-semibold">{te.location_name}</p>
                    <p className="text-slate-600">Density: <strong>{te.density_percent}% ({te.density_level})</strong></p>
                    <p className="text-slate-500">Speed: {te.avg_speed_kmh} km/h • Vehicles: {te.vehicle_count}</p>
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
                  <div className="text-xs space-y-2 py-1 text-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-rose-600">{inc.incident_type.replace('_', ' ')}</p>
                      <span className="text-[10px] font-mono text-[#0284c7] font-semibold">{inc.incident_code}</span>
                    </div>
                    <p className="text-slate-700">{inc.location_name}</p>
                    {inc.detected_plate && (
                      <p className="text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-900">
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
                      className="w-full mt-1.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Incident Frame</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Floating GIS Layer Controls Panel (Clean white enterprise card) */}
        <div className="absolute top-4 right-4 z-[500] w-64 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-lg space-y-2.5 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-bold text-slate-900">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Carriageway Layer Filters</span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span> Live Buses
              </span>
              <input
                type="checkbox"
                checked={layers.buses}
                onChange={() => toggleLayer('buses')}
                className="rounded border-slate-300 text-[#0284c7] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Potholes
              </span>
              <input
                type="checkbox"
                checked={layers.potholes}
                onChange={() => toggleLayer('potholes')}
                className="rounded border-slate-300 text-[#0284c7] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Waterlogging
              </span>
              <input
                type="checkbox"
                checked={layers.waterlogging}
                onChange={() => toggleLayer('waterlogging')}
                className="rounded border-slate-300 text-[#0284c7] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Damaged Roads
              </span>
              <input
                type="checkbox"
                checked={layers.damagedRoads}
                onChange={() => toggleLayer('damagedRoads')}
                className="rounded border-slate-300 text-[#0284c7] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span> Traffic Congestion
              </span>
              <input
                type="checkbox"
                checked={layers.congestion}
                onChange={() => toggleLayer('congestion')}
                className="rounded border-slate-300 text-[#0284c7] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Critical Incidents
              </span>
              <input
                type="checkbox"
                checked={layers.incidents}
                onChange={() => toggleLayer('incidents')}
                className="rounded border-slate-300 text-[#0284c7] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Bus Route Corridors
              </span>
              <input
                type="checkbox"
                checked={layers.routes}
                onChange={() => toggleLayer('routes')}
                className="rounded border-slate-300 text-[#0284c7] focus:ring-0"
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
