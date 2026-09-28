import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  TrafficCone,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Bus,
  CheckCircle2,
  Clock,
  Car,
  AlertTriangle,
  Wrench,
  Download,
  Edit3,
  Save,
  X,
  Gauge,
  Sliders,
  TrendingUp,
  MapPin,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { api, getEvidenceUrl } from '../services/api';
import { RoadDefectCluster, TrafficEvent, Incident } from '../types';
import { EvidenceModal } from '../components/common/EvidenceModal';

export const RoadIntelligenceHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'defects'; // 'defects', 'traffic', 'incidents'
  const [activeTab, setActiveTab] = useState<'defects' | 'traffic' | 'incidents'>(
    (initialTab as any) || 'defects'
  );

  // Sync tab with URL
  const handleTabChange = (tab: 'defects' | 'traffic' | 'incidents') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // --- STATE FOR DEFECTS ---
  const [clusters, setClusters] = useState<RoadDefectCluster[]>([]);
  const [defectFilterType, setDefectFilterType] = useState('ALL');
  const [defectFilterStatus, setDefectFilterStatus] = useState('ALL');
  const [defectFilterLevel, setDefectFilterLevel] = useState<number | 'ALL'>('ALL');
  const [defectSearchTerm, setDefectSearchTerm] = useState('');
  const [selectedClusterDetail, setSelectedClusterDetail] = useState<any | null>(null);

  // --- STATE FOR TRAFFIC ---
  const [trafficSummary, setTrafficSummary] = useState<any | null>(null);
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);

  // --- STATE FOR INCIDENTS ---
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentStatusFilter, setIncidentStatusFilter] = useState('ALL');
  const [incidentTypeFilter, setIncidentTypeFilter] = useState('ALL');
  const [incidentSearchTerm, setIncidentSearchTerm] = useState('');
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [correctedPlateInput, setCorrectedPlateInput] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');

  // Common Evidence Modal
  const [selectedEvidence, setSelectedEvidence] = useState<{
    isOpen: boolean;
    title: string;
    image: string;
    metadata?: any;
  }>({ isOpen: false, title: '', image: '' });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRoadDefects().catch(() => []),
      api.getTrafficSummary().catch(() => null),
      api.getTrafficBottlenecks().catch(() => []),
      api.getIncidents().catch(() => [])
    ]).then(([d, ts, tb, inc]) => {
      setClusters(d);
      if (d.length > 0) inspectCluster(d[0].id);
      setTrafficSummary(ts);
      setBottlenecks(tb);
      setIncidents(inc);
      setLoading(false);
    });
  }, []);

  const inspectCluster = async (clusterId: string) => {
    try {
      const detail = await api.getRoadDefectDetail(clusterId);
      setSelectedClusterDetail(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateDefectStatus = async (clusterId: string, newStatus: string) => {
    await api.updateDefectStatus(clusterId, newStatus);
    const updated = await api.getRoadDefects();
    setClusters(updated);
    if (selectedClusterDetail) {
      inspectCluster(clusterId);
    }
  };

  const handleUpdateIncidentStatus = async (incidentId: string, status: string) => {
    await api.updateIncidentStatus(incidentId, status);
    const updated = await api.getIncidents();
    setIncidents(updated);
  };

  const handleSaveOcrCorrection = async () => {
    if (!editingIncident) return;
    await api.correctIncidentOcr(editingIncident.id, correctedPlateInput, correctionNotes);
    setEditingIncident(null);
    setCorrectedPlateInput('');
    setCorrectionNotes('');
    const updated = await api.getIncidents();
    setIncidents(updated);
  };

  const getPciFromSeverity = (sev: string, status?: string) => {
    if (status === 'REPAIRED') return { level: 1, pci: 9.4, label: 'Level 1 (Excellent)', color: '#16a34a', cost: '₹0' };
    switch (sev) {
      case 'CRITICAL': return { level: 5, pci: 1.4, label: 'Level 5 (Critical)', color: '#dc2626', cost: '₹18,500' };
      case 'HIGH': return { level: 4, pci: 3.4, label: 'Level 4 (Poor)', color: '#ea580c', cost: '₹8,200' };
      case 'MEDIUM': return { level: 3, pci: 5.6, label: 'Level 3 (Fair)', color: '#d97706', cost: '₹3,500' };
      case 'LOW': default: return { level: 2, pci: 7.6, label: 'Level 2 (Good)', color: '#65a30d', cost: '₹1,200' };
    }
  };

  // Filtered defects
  const filteredDefects = clusters.filter((c) => {
    const matchesType = defectFilterType === 'ALL' || c.defect_type === defectFilterType;
    const matchesStatus = defectFilterStatus === 'ALL' || c.status === defectFilterStatus;
    const pciInfo = getPciFromSeverity(c.severity, c.status);
    const matchesLevel = defectFilterLevel === 'ALL' || pciInfo.level === defectFilterLevel;
    const matchesSearch =
      c.cluster_code.toLowerCase().includes(defectSearchTerm.toLowerCase()) ||
      c.defect_type.toLowerCase().includes(defectSearchTerm.toLowerCase()) ||
      (c.address_description && c.address_description.toLowerCase().includes(defectSearchTerm.toLowerCase()));
    return matchesType && matchesStatus && matchesLevel && matchesSearch;
  });

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    const matchesStatus = incidentStatusFilter === 'ALL' || inc.status === incidentStatusFilter;
    const matchesType = incidentTypeFilter === 'ALL' || inc.incident_type === incidentTypeFilter;
    const matchesSearch =
      inc.incident_code.toLowerCase().includes(incidentSearchTerm.toLowerCase()) ||
      inc.location_name.toLowerCase().includes(incidentSearchTerm.toLowerCase()) ||
      (inc.detected_plate && inc.detected_plate.toLowerCase().includes(incidentSearchTerm.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* 1. TOP HEADER & OPERATIONAL TABS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-heading font-extrabold text-[#063269] tracking-tight">
              Road, Traffic & Incidents Intelligence Hub
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              UNIFIED COMMAND
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single operational pane consolidating RM-PCI defect clusters, dynamic traffic density, and safety OCR tracking.
          </p>
        </div>

        {/* Crisp Segmented Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start lg:self-auto">
          <button
            onClick={() => handleTabChange('defects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'defects'
                ? 'bg-white text-[#063269] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Road Health (RM-PCI)</span>
            <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded font-mono font-bold">
              {clusters.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('traffic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'traffic'
                ? 'bg-white text-[#063269] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrafficCone className="w-3.5 h-3.5 text-orange-500" />
            <span>Traffic Intelligence</span>
            <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.2 rounded font-mono font-bold">
              {bottlenecks.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('incidents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-white text-[#063269] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Incidents & Hit & Run (OCR)</span>
            <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-mono font-bold">
              {incidents.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ROAD HEALTH & DEFECT CLUSTERS (RM-PCI)                             */}
      {/* ========================================================================= */}
      {activeTab === 'defects' && (
        <div className="space-y-6">
          {/* Defect Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                RM-PCI Filter:
              </span>
              <button
                onClick={() => setDefectFilterLevel('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  defectFilterLevel === 'ALL'
                    ? 'bg-[#063269] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Levels ({clusters.length})
              </button>
              {[
                { lvl: 1, name: 'L1: Excellent (8-10)', color: '#16a34a' },
                { lvl: 2, name: 'L2: Good (6-8)', color: '#65a30d' },
                { lvl: 3, name: 'L3: Fair (4-6)', color: '#d97706' },
                { lvl: 4, name: 'L4: Poor (2-4)', color: '#ea580c' },
                { lvl: 5, name: 'L5: Critical (0-2)', color: '#dc2626' }
              ].map((item) => (
                <button
                  key={item.lvl}
                  onClick={() => setDefectFilterLevel(item.lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    defectFilterLevel === item.lvl
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={defectSearchTerm}
                  onChange={(e) => setDefectSearchTerm(e.target.value)}
                  placeholder="Search code, street..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284c7] w-48"
                />
              </div>

              <select
                value={defectFilterType}
                onChange={(e) => setDefectFilterType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              >
                <option value="ALL">All Types</option>
                <option value="POTHOLE">Potholes</option>
                <option value="WATERLOGGING">Waterlogging</option>
                <option value="DAMAGED_ROAD">Alligator / Fatigue Cracks</option>
                <option value="MISSING_DIVIDER">Missing Divider</option>
                <option value="DAMAGED_SIGN">Signage</option>
              </select>

              <select
                value={defectFilterStatus}
                onChange={(e) => setDefectFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNRESOLVED">Unresolved</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="WORK_ORDER_ISSUED">Work Order Issued</option>
                <option value="REPAIRED">Repaired</option>
              </select>
            </div>
          </div>

          {/* Defect Cards Split: Left List + Right Consensus Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  Carriageway Defect Clusters ({filteredDefects.length})
                </span>
                <span className="text-[#0284c7] font-semibold">Haversine Clustering: 35m</span>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
                {filteredDefects.map((cluster) => {
                  const pci = getPciFromSeverity(cluster.severity, cluster.status);
                  const isSelected = selectedClusterDetail?.cluster.id === cluster.id;
                  return (
                    <div
                      key={cluster.id}
                      onClick={() => inspectCluster(cluster.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-50/70 border-[#0284c7] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                          style={{
                            backgroundColor: `${pci.color}15`,
                            color: pci.color,
                            border: `1px solid ${pci.color}35`
                          }}
                        >
                          L{pci.level}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#063269]">{cluster.cluster_code}</span>
                            <span className="text-xs font-bold text-slate-900 uppercase">
                              {cluster.defect_type.replace('_', ' ')}
                            </span>
                            <span
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold"
                              style={{ backgroundColor: `${pci.color}15`, color: pci.color }}
                            >
                              PCI {pci.pci}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 truncate">
                            {cluster.address_description || 'Urban Transit Corridor'}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Bus className="w-3.5 h-3.5 text-emerald-600" />
                              Confirmed by {cluster.confirmed_buses_count} buses
                            </span>
                            <span>•</span>
                            <span>{cluster.total_detections} Hits</span>
                            <span>•</span>
                            <span>Conf: {Math.round(cluster.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cluster.status === 'REPAIRED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          cluster.status === 'WORK_ORDER_ISSUED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          cluster.status === 'UNDER_REVIEW' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {cluster.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-2">
                          {new Date(cluster.last_detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Cluster Detail & Action Panel */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>BusSense AI Work Order Inspector</span>
                </h2>
                <span className="text-[10px] font-mono text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">
                  UKPMS COMPLIANT
                </span>
              </div>

              {selectedClusterDetail ? (
                <div className="space-y-4">
                  {/* Evidence Snapshot */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 flex items-center justify-center shadow-xs">
                    <img
                      src={getEvidenceUrl(selectedClusterDetail.cluster.evidence_image || '/evidence/sample_pothole.jpg')}
                      alt="Defect Evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#063269]/90 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {selectedClusterDetail.cluster.cluster_code} • 10-FT CAPTURE
                    </div>
                    <button
                      onClick={() => setSelectedEvidence({
                        isOpen: true,
                        title: `${selectedClusterDetail.cluster.defect_type} (${selectedClusterDetail.cluster.cluster_code})`,
                        image: selectedClusterDetail.cluster.evidence_image || '/evidence/sample_pothole.jpg',
                        metadata: {
                          busNumber: `Confirmed by ${selectedClusterDetail.cluster.confirmed_buses_count} buses`,
                          location: selectedClusterDetail.cluster.address_description,
                          confidence: `${Math.round(selectedClusterDetail.cluster.confidence * 100)}%`,
                          severity: selectedClusterDetail.cluster.severity
                        }
                      })}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/75 hover:bg-black text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Enlarge Photo</span>
                    </button>
                  </div>

                  {/* Rating Breakdown */}
                  {(() => {
                    const pci = getPciFromSeverity(selectedClusterDetail.cluster.severity, selectedClusterDetail.cluster.status);
                    return (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Pavement Condition Rating</span>
                          <span className="font-bold text-sm" style={{ color: pci.color }}>
                            {pci.label} (PCI: {pci.pci}/10)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Multi-Bus Verification</span>
                          <span className="font-bold text-emerald-700">
                            {Math.round(selectedClusterDetail.cluster.confidence * 100)}% ({selectedClusterDetail.cluster.confirmed_buses_count} Buses Verified)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Estimated Municipal Repair Cost</span>
                          <span className="font-mono font-bold text-slate-900">{pci.cost}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">GPS Geotag</span>
                          <span className="font-mono text-slate-700">
                            {selectedClusterDetail.cluster.latitude.toFixed(6)}° N, {selectedClusterDetail.cluster.longitude.toFixed(6)}° E
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Confirming buses breakdown */}
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Confirming Fleet Telemetry ({selectedClusterDetail.confirming_buses?.length || 1})
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {selectedClusterDetail.detection_history?.map((det: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center gap-2">
                            <Bus className="w-3.5 h-3.5 text-[#0284c7]" />
                            <span className="font-bold text-slate-800">{det.bus_id}</span>
                          </div>
                          <span className="text-slate-500 font-mono">Conf: {Math.round(det.confidence * 100)}%</span>
                          <span className="text-emerald-700 font-semibold">Hit #{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Work Order Dispatch Actions */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Dispatch Municipal Action:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleUpdateDefectStatus(selectedClusterDetail.cluster.id, 'WORK_ORDER_ISSUED')}
                        className="py-2 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Issue Order
                      </button>
                      <button
                        onClick={() => handleUpdateDefectStatus(selectedClusterDetail.cluster.id, 'UNDER_REVIEW')}
                        className="py-2 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Under Review
                      </button>
                      <button
                        onClick={() => handleUpdateDefectStatus(selectedClusterDetail.cluster.id, 'REPAIRED')}
                        className="py-2 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Mark Repaired
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                  Select a clustered defect ticket to view multi-bus consensus history
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRAFFIC INTELLIGENCE & BOTTLENECKS                                  */}
      {/* ========================================================================= */}
      {activeTab === 'traffic' && (
        <div className="space-y-6">
          {/* Top 4 Traffic KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">City-Wide Traffic Density</span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-heading font-extrabold text-rose-600">{trafficSummary?.overall_density_percent || 76}%</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                  {trafficSummary?.overall_density_level || 'HIGH'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Calculated via optical density matrix</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Fleet Velocity</span>
              <p className="text-3xl font-heading font-extrabold text-[#0284c7] mt-1">
                {trafficSummary?.average_speed_kmh || 22.4} <span className="text-sm font-normal text-slate-500">km/h</span>
              </p>
              <p className="text-[11px] text-slate-500">-12% speed drop during peak rush</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Congestion Bottlenecks</span>
              <p className="text-3xl font-heading font-extrabold text-amber-600 mt-1">
                {bottlenecks.length || 16} <span className="text-sm font-normal text-slate-500">Hotspots</span>
              </p>
              <p className="text-[11px] text-slate-500">Delay impact exceeding 15 mins</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tracked Vehicles</span>
              <p className="text-3xl font-heading font-extrabold text-emerald-600 mt-1">
                {(trafficSummary?.total_vehicles_active || 3420).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500">Tracked in urban corridor grid</p>
            </div>
          </div>

          {/* Traffic Charts & Bottlenecks List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Hourly Velocity Curve */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Hourly Vehicle Volume & Carriageway Velocity
                </h3>
                <span className="text-xs text-[#0284c7] font-semibold">24-Hour Rolling Average</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficSummary?.hourly_trend || []}>
                    <defs>
                      <linearGradient id="trafficLightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="vehicles" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#trafficLightGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Active Congestion Bottlenecks Table */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Severe Bottleneck Locations
                </h3>
                <span className="text-xs text-rose-600 font-bold">High Density</span>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-64">
                {bottlenecks.map((b: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{b.location_name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Avg Speed: <strong className="text-rose-600">{b.avg_speed_kmh} km/h</strong> • Vehicles: {b.vehicle_count}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {b.density_percent}% Density
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INCIDENTS & HIT & RUN (OCR)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          {/* Incident Filter Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={incidentSearchTerm}
                  onChange={(e) => setIncidentSearchTerm(e.target.value)}
                  placeholder="Search plate, code, street..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284c7] w-56"
                />
              </div>

              <select
                value={incidentTypeFilter}
                onChange={(e) => setIncidentTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              >
                <option value="ALL">All Incident Types</option>
                <option value="HIT_AND_RUN">Hit & Run</option>
                <option value="RASH_DRIVING">Rash Driving</option>
                <option value="PEDESTRIAN_SAFETY_RISK">Pedestrian Safety</option>
                <option value="ROAD_HAZARD">Road Hazard</option>
              </select>

              <select
                value={incidentStatusFilter}
                onChange={(e) => setIncidentStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="NEW">New Incidents</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="VERIFIED">Verified Plate</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Total Logged: <strong>{filteredIncidents.length}</strong>
            </div>
          </div>

          {/* Incidents Table / Cards */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredIncidents.map((inc) => (
                <div key={inc.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-lg mt-0.5 ${
                      inc.incident_type === 'HIT_AND_RUN' ? 'bg-rose-50 text-rose-600' :
                      inc.incident_type === 'RASH_DRIVING' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
                    }`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#063269]">{inc.incident_code}</span>
                        <span className="font-bold text-xs text-slate-900 uppercase">{inc.incident_type.replace(/_/g, ' ')}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          inc.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          inc.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {inc.severity}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{inc.location_name}</p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        {inc.detected_plate && (
                          <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900 font-mono font-bold text-[11px]">
                            <span>Plate:</span>
                            <span className="text-slate-900">{inc.corrected_plate || inc.detected_plate}</span>
                            <button
                              onClick={() => {
                                setEditingIncident(inc);
                                setCorrectedPlateInput(inc.corrected_plate || inc.detected_plate || '');
                              }}
                              className="text-[#0284c7] hover:underline text-[10px] ml-1"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                        <span>OCR Conf: {Math.round(inc.plate_confidence * 100)}%</span>
                        <span>•</span>
                        <span>Logged by {inc.bus_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      onClick={() => setSelectedEvidence({
                        isOpen: true,
                        title: `${inc.incident_type} (${inc.incident_code})`,
                        image: inc.evidence_image || '/evidence/sample_hit_and_run.jpg',
                        metadata: {
                          busNumber: inc.bus_id,
                          location: inc.location_name,
                          plate: inc.corrected_plate || inc.detected_plate,
                          confidence: `${Math.round(inc.plate_confidence * 100)}%`,
                          severity: inc.severity
                        }
                      })}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Inspect Frame</span>
                    </button>

                    <select
                      value={inc.status}
                      onChange={(e) => handleUpdateIncidentStatus(inc.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
                    >
                      <option value="NEW">NEW</option>
                      <option value="UNDER_REVIEW">UNDER REVIEW</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OCR Correction Modal */}
          {editingIncident && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Correct License Plate OCR
                  </h3>
                  <button onClick={() => setEditingIncident(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Incident Code</label>
                    <input disabled value={editingIncident.incident_code} className="w-full px-3 py-2 rounded bg-slate-100 border border-slate-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Original Optical Reading</label>
                    <input disabled value={editingIncident.detected_plate || 'Unreadable'} className="w-full px-3 py-2 rounded bg-slate-100 border border-slate-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Human-Corrected Number Plate</label>
                    <input
                      type="text"
                      value={correctedPlateInput}
                      onChange={(e) => setCorrectedPlateInput(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Verification Audit Notes</label>
                    <textarea
                      value={correctionNotes}
                      onChange={(e) => setCorrectionNotes(e.target.value)}
                      placeholder="e.g. Verified against rear camera angle frame #142"
                      className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7] h-20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button onClick={() => setEditingIncident(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                    Cancel
                  </button>
                  <button onClick={handleSaveOcrCorrection} className="px-4 py-2 text-xs font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-lg">
                    Save Verified Plate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Common Evidence Modal */}
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
