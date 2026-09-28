import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Bus,
  Search,
  Filter,
  Eye,
  Wrench,
  ShieldCheck,
  ChevronRight,
  Calculator,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { api, getEvidenceUrl } from '../services/api';
import { RoadDefectCluster } from '../types';
import { EvidenceModal } from '../components/common/EvidenceModal';

export const RoadHealth: React.FC = () => {
  const [clusters, setClusters] = useState<RoadDefectCluster[]>([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState<number | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterDetail, setSelectedClusterDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedEvidence, setSelectedEvidence] = useState<{
    isOpen: boolean;
    title: string;
    image: string;
    metadata?: any;
  }>({ isOpen: false, title: '', image: '' });

  useEffect(() => {
    loadClusters();
  }, []);

  const loadClusters = () => {
    api.getRoadDefects().then((data) => {
      setClusters(data);
      if (data.length > 0 && !selectedClusterDetail) {
        inspectCluster(data[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const inspectCluster = async (clusterId: string) => {
    try {
      const detail = await api.getRoadDefectDetail(clusterId);
      setSelectedClusterDetail(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (clusterId: string, newStatus: string) => {
    await api.updateDefectStatus(clusterId, newStatus);
    loadClusters();
    if (selectedClusterDetail) {
      inspectCluster(clusterId);
    }
  };

  const getPciFromSeverity = (sev: string, status?: string) => {
    if (status === 'REPAIRED') return { level: 1, pci: 9.2, label: 'Level 1 (Excellent)', color: '#18a300', cost: '₹0' };
    switch (sev) {
      case 'CRITICAL': return { level: 5, pci: 1.4, label: 'Level 5 (Critical)', color: '#dc2626', cost: '₹18,500' };
      case 'HIGH': return { level: 4, pci: 3.4, label: 'Level 4 (Poor)', color: '#ea580c', cost: '₹8,200' };
      case 'MEDIUM': return { level: 3, pci: 5.6, label: 'Level 3 (Fair)', color: '#eab308', cost: '₹3,500' };
      case 'LOW': default: return { level: 2, pci: 7.6, label: 'Level 2 (Good)', color: '#65a30d', cost: '₹1,200' };
    }
  };

  const filtered = clusters.filter((c) => {
    const matchesType = filterType === 'ALL' || c.defect_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const pciInfo = getPciFromSeverity(c.severity, c.status);
    const matchesLevel = filterLevel === 'ALL' || pciInfo.level === filterLevel;
    const matchesSearch =
      c.cluster_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.defect_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.address_description && c.address_description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesStatus && matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-[#2ea3f2]" />
            <span>Road Health & RM-PCI Assessment Center</span>
          </h1>
          <p className="text-xs text-slate-300">
            5-Level pavement deterioration grading (RM-PCI 0–10 scale) powered by multi-bus Haversine spatial consensus
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code, type, street..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-[#051c38] border border-[#0f376a] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#2ea3f2] w-48"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#051c38] border border-[#0f376a] text-xs text-slate-200 focus:outline-none focus:border-[#2ea3f2]"
          >
            <option value="ALL">All Defect Types</option>
            <option value="POTHOLE">Potholes</option>
            <option value="WATERLOGGING">Waterlogging</option>
            <option value="DAMAGED_ROAD">Alligator / Fatigue Cracks</option>
            <option value="MISSING_DIVIDER">Missing Divider</option>
            <option value="DAMAGED_SIGN">Signage Obstruction</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#051c38] border border-[#0f376a] text-xs text-slate-200 focus:outline-none focus:border-[#2ea3f2]"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="WORK_ORDER_ISSUED">Work Order Issued</option>
            <option value="REPAIRED">Repaired</option>
          </select>
        </div>
      </div>

      {/* 5-Level Rating Filter Quick Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#051c38] p-2 rounded-xl border border-[#0f376a]">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
          RM-PCI Rating:
        </span>
        <button
          onClick={() => setFilterLevel('ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            filterLevel === 'ALL'
              ? 'bg-[#2ea3f2] text-[#063269]'
              : 'text-slate-300 hover:bg-[#082852]'
          }`}
        >
          All Levels ({clusters.length})
        </button>
        {[
          { lvl: 1, name: 'Level 1 (PCI 8-10)', color: '#18a300' },
          { lvl: 2, name: 'Level 2 (PCI 6-8)', color: '#65a30d' },
          { lvl: 3, name: 'Level 3 (PCI 4-6)', color: '#eab308' },
          { lvl: 4, name: 'Level 4 (PCI 2-4)', color: '#ea580c' },
          { lvl: 5, name: 'Level 5 (PCI 0-2)', color: '#dc2626' }
        ].map((item) => (
          <button
            key={item.lvl}
            onClick={() => setFilterLevel(item.lvl)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              filterLevel === item.lvl
                ? 'bg-white text-[#063269] shadow-sm'
                : 'text-slate-300 hover:bg-[#082852]'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* Main Content Grid: Left List + Right Cluster Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Clustered Tickets List */}
        <div className="lg:col-span-7 bg-[#051c38] border border-[#0f376a] rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#0f376a] mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Carriageway Defect Clusters ({filtered.length})
            </span>
            <span className="text-xs text-[#2ea3f2] font-semibold">10-ft Edge Capture Frequency</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
            {filtered.map((cluster) => {
              const pci = getPciFromSeverity(cluster.severity, cluster.status);
              return (
                <div
                  key={cluster.id}
                  onClick={() => inspectCluster(cluster.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedClusterDetail?.cluster.id === cluster.id
                      ? 'bg-[#0a2c5a] border-[#2ea3f2] shadow-md shadow-[#2ea3f2]/10'
                      : 'bg-[#031429] border-[#0c2e58] hover:border-[#174682]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="p-2.5 rounded-lg mt-0.5 flex items-center justify-center font-bold text-xs"
                      style={{
                        backgroundColor: `${pci.color}20`,
                        color: pci.color,
                        border: `1px solid ${pci.color}40`
                      }}
                    >
                      L{pci.level}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2ea3f2] font-mono">{cluster.cluster_code}</span>
                        <span className="text-xs font-bold text-white uppercase">{cluster.defect_type.replace('_', ' ')}</span>
                        <span
                          className="px-1.5 py-0.2 rounded text-[9px] font-bold"
                          style={{ backgroundColor: `${pci.color}25`, color: pci.color }}
                        >
                          PCI {pci.pci}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 truncate">{cluster.address_description || 'Urban Transit Corridor'}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Bus className="w-3.5 h-3.5" />
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
                      cluster.status === 'REPAIRED' ? 'bg-emerald-500/20 text-emerald-400' :
                      cluster.status === 'WORK_ORDER_ISSUED' ? 'bg-indigo-500/20 text-indigo-400' :
                      cluster.status === 'UNDER_REVIEW' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
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

        {/* Right: Multi-Bus Consensus & RoadMetrics Assessment Inspector */}
        <div className="lg:col-span-5 bg-[#051c38] border border-[#0f376a] rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#0f376a] mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>RoadMetrics Inspection & Work Ticket</span>
            </h2>
            <span className="text-[10px] font-mono text-[#2ea3f2] bg-[#2ea3f2]/10 px-2 py-0.5 rounded border border-[#2ea3f2]/30">
              UKPMS CERTIFIED
            </span>
          </div>

          {selectedClusterDetail ? (
            <div className="space-y-4">
              {/* Evidence Snapshot */}
              <div className="relative rounded-lg overflow-hidden border border-[#0f376a] aspect-video bg-black flex items-center justify-center">
                <img
                  src={getEvidenceUrl(selectedClusterDetail.cluster.evidence_image || '/evidence/sample_pothole.jpg')}
                  alt="Defect Evidence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#063269]/90 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                  {selectedClusterDetail.cluster.cluster_code} • CAPTURE INTERVAL: 10 FT
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
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 hover:bg-black text-[#2ea3f2] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Enlarge Evidence</span>
                </button>
              </div>

              {/* Assessment Breakdown Box */}
              {(() => {
                const pci = getPciFromSeverity(selectedClusterDetail.cluster.severity, selectedClusterDetail.cluster.status);
                return (
                  <div className="p-3.5 rounded-xl bg-[#031429] border border-[#0d315c] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">RM-PCI Rating Scale</span>
                      <span className="font-bold text-sm" style={{ color: pci.color }}>
                        {pci.label} (PCI: {pci.pci}/10)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Multi-Bus Consensus</span>
                      <span className="font-bold text-emerald-400">
                        {Math.round(selectedClusterDetail.cluster.confidence * 100)}% ({selectedClusterDetail.cluster.confirmed_buses_count} Buses Verified)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Estimated Repair Cost</span>
                      <span className="font-mono font-bold text-amber-400">{pci.cost}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">GPS Coordinates</span>
                      <span className="font-mono text-slate-300">
                        {selectedClusterDetail.cluster.latitude.toFixed(6)}° N, {selectedClusterDetail.cluster.longitude.toFixed(6)}° E
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Individual Bus Detections Breakdown */}
              <div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Confirming Telemetry Streams ({selectedClusterDetail.confirming_buses?.length || 1})
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedClusterDetail.detection_history?.map((det: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#031429] border border-[#0d315c] text-xs">
                      <div className="flex items-center gap-2">
                        <Bus className="w-3.5 h-3.5 text-[#2ea3f2]" />
                        <span className="font-bold text-white">{det.bus_id}</span>
                      </div>
                      <span className="text-slate-400 font-mono">Conf: {Math.round(det.confidence * 100)}%</span>
                      <span className="text-emerald-400 font-semibold">Telemetry Hit #{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Municipal Action Buttons */}
              <div className="pt-2 border-t border-[#0f376a]">
                <p className="text-xs font-semibold text-slate-400 mb-2">Dispatch Work Order:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedClusterDetail.cluster.id, 'WORK_ORDER_ISSUED')}
                    className="py-1.5 px-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Issue Order
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedClusterDetail.cluster.id, 'UNDER_REVIEW')}
                    className="py-1.5 px-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedClusterDetail.cluster.id, 'REPAIRED')}
                    className="py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
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
