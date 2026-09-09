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
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { RoadDefectCluster } from '../types';
import { EvidenceModal } from '../components/common/EvidenceModal';

export const RoadHealth: React.FC = () => {
  const [clusters, setClusters] = useState<RoadDefectCluster[]>([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
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

  const filtered = clusters.filter((c) => {
    const matchesType = filterType === 'ALL' || c.defect_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.cluster_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.defect_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.address_description && c.address_description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Road Health & Multi-Bus Defect Clustering Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400">
            Spatial Haversine clustering (35m radius) combines independent detections across the bus fleet into verified infrastructure work tickets
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code, type, address..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Defect Types</option>
            <option value="POTHOLE">Pothole</option>
            <option value="WATERLOGGING">Waterlogging</option>
            <option value="DAMAGED_ROAD">Damaged Road</option>
            <option value="MISSING_DIVIDER">Missing Divider</option>
            <option value="DAMAGED_SIGN">Damaged Sign</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="WORK_ORDER_ISSUED">Work Order Issued</option>
            <option value="REPAIRED">Repaired</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid: Left List + Right Cluster Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Clustered Tickets List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Active Clustered Defect Tickets ({filtered.length})
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Haversine Radius: 35m</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
            {filtered.map((cluster) => (
              <div
                key={cluster.id}
                onClick={() => inspectCluster(cluster.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedClusterDetail?.cluster.id === cluster.id
                    ? 'bg-slate-800/80 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2.5 rounded-lg mt-0.5 ${
                    cluster.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                    cluster.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400 font-mono">{cluster.cluster_code}</span>
                      <span className="text-xs font-bold text-white uppercase">{cluster.defect_type.replace('_', ' ')}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        cluster.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {cluster.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 truncate">{cluster.address_description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5" />
                        Confirmed by {cluster.confirmed_buses_count} buses
                      </span>
                      <span>•</span>
                      <span>{cluster.total_detections} Total Hits</span>
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
                  <span className="text-[10px] text-slate-500 font-mono mt-2">
                    {new Date(cluster.last_detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Multi-Bus Intelligent Clustering Inspector */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Bus Consensus Verification</span>
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              CLUSTER ENGINE
            </span>
          </div>

          {selectedClusterDetail ? (
            <div className="space-y-4">
              {/* Evidence Snapshot */}
              <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                <img
                  src={selectedClusterDetail.cluster.evidence_image || '/evidence/sample_pothole.jpg'}
                  alt="Defect Evidence"
                  className="w-full h-full object-cover"
                />
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
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 hover:bg-black text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Enlarge Evidence</span>
                </button>
              </div>

              {/* Multi-Bus Consensus Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Cluster Ticket ID</span>
                  <span className="font-bold text-cyan-400 font-mono text-sm">{selectedClusterDetail.cluster.cluster_code}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Consensus Confidence</span>
                  <span className="font-bold text-emerald-400">{Math.round(selectedClusterDetail.cluster.confidence * 100)}% (Multi-pass Verified)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Severity Grade</span>
                  <span className="font-bold text-rose-400">{selectedClusterDetail.cluster.severity}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Geotag Coordinates</span>
                  <span className="font-mono text-slate-300">
                    {selectedClusterDetail.cluster.latitude.toFixed(4)}, {selectedClusterDetail.cluster.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Individual Bus Detections Breakdown */}
              <div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Confirming Buses ({selectedClusterDetail.confirming_buses?.length || 1})
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedClusterDetail.detection_history?.map((det: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <Bus className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-white">{det.bus_id}</span>
                      </div>
                      <span className="text-slate-400 font-mono">Conf: {Math.round(det.confidence * 100)}%</span>
                      <span className="text-emerald-400 font-semibold">Hit #{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-400 mb-2">Municipal Action Workflow:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedClusterDetail.cluster.id, 'WORK_ORDER_ISSUED')}
                    className="py-1.5 px-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Issue Work Order
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedClusterDetail.cluster.id, 'UNDER_REVIEW')}
                    className="py-1.5 px-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Mark Under Review
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
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
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
