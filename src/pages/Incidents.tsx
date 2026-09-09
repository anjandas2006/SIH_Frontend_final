import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Edit3,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Car,
  Bus,
  Save,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { Incident } from '../types';
import { EvidenceModal } from '../components/common/EvidenceModal';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // OCR Correction Modal state
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [correctedPlateInput, setCorrectedPlateInput] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');

  const [selectedEvidence, setSelectedEvidence] = useState<{
    isOpen: boolean;
    title: string;
    image: string;
    metadata?: any;
  }>({ isOpen: false, title: '', image: '' });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = () => {
    api.getIncidents().then((data) => {
      setIncidents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleUpdateStatus = async (incidentId: string, status: string) => {
    await api.updateIncidentStatus(incidentId, status);
    loadIncidents();
  };

  const handleSaveOcrCorrection = async () => {
    if (!editingIncident) return;
    await api.correctIncidentOcr(editingIncident.id, correctedPlateInput, correctionNotes);
    setEditingIncident(null);
    setCorrectedPlateInput('');
    setCorrectionNotes('');
    loadIncidents();
  };

  const filtered = incidents.filter((inc) => {
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || inc.incident_type === typeFilter;
    const matchesSearch =
      inc.incident_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.detected_plate && inc.detected_plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inc.location_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Incident Management & Hit-and-Run Investigation Workflow</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic tracking preservation, optical number plate OCR, and verifiable chain of evidence
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
              placeholder="Search code, plate, location..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Incident Types</option>
            <option value="HIT_AND_RUN">Hit & Run</option>
            <option value="RASH_DRIVING">Rash Driving</option>
            <option value="PEDESTRIAN_SAFETY_RISK">Pedestrian Safety</option>
            <option value="ROAD_HAZARD">Road Hazard</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Hit-and-Run Automated Architecture Explainer Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Automated Hit-and-Run Evidence Pipeline</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Collision Acoustic/Visual Trigger &rarr; Vehicle Tracking &rarr; Escaping Vector &rarr; Plate OCR &rarr; Police Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-400">
            OCR Confidence: 91%
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400">
            Chain of Custody: Geotagged
          </span>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Incident ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Vehicle / Plate</th>
                <th className="px-4 py-3">OCR Conf</th>
                <th className="px-4 py-3">Bus Reporter</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-400">{inc.incident_code}</td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {inc.incident_type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                      inc.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {inc.detected_plate ? (
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-400 font-bold">
                          {inc.corrected_plate || inc.detected_plate}
                        </span>
                        {inc.corrected_plate && (
                          <span className="text-[9px] text-cyan-400 bg-cyan-500/10 px-1 rounded">MODIFIED</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">No plate detected</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">
                    {inc.plate_confidence ? `${Math.round(inc.plate_confidence * 100)}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">{inc.bus_id}</td>
                  <td className="px-4 py-3 text-slate-300 truncate max-w-[180px]">{inc.location_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.status === 'VERIFIED' ? 'bg-blue-500/20 text-blue-400' :
                      inc.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                      inc.status === 'UNDER_REVIEW' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
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
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                        title="View Dashcam Evidence"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {inc.detected_plate && (
                        <button
                          onClick={() => {
                            setEditingIncident(inc);
                            setCorrectedPlateInput(inc.corrected_plate || inc.detected_plate || '');
                            setCorrectionNotes('');
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                          title="Manual OCR Plate Correction"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(inc.id, inc.status === 'VERIFIED' ? 'RESOLVED' : 'VERIFIED')}
                        className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold transition-colors"
                      >
                        {inc.status === 'VERIFIED' ? 'Resolve' : 'Verify'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual OCR Plate Correction Modal */}
      {editingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Manual OCR Plate Verification</span>
              </h3>
              <button
                onClick={() => setEditingIncident(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-slate-400">AI Detected Plate (Raw OCR)</p>
                <p className="text-lg font-mono font-bold text-amber-400">{editingIncident.detected_plate}</p>
                <p className="text-[10px] text-slate-500">OCR Confidence: {Math.round(editingIncident.plate_confidence * 100)}%</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Supervisor Corrected Plate
                </label>
                <input
                  type="text"
                  value={correctedPlateInput}
                  onChange={(e) => setCorrectedPlateInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 font-mono font-bold text-white uppercase focus:outline-none"
                  placeholder="e.g. WB12AB1234"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Verification Notes / Evidence Ref
                </label>
                <textarea
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 text-white text-xs focus:outline-none"
                  placeholder="e.g. Verified against rear camera close-up crop..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingIncident(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOcrCorrection}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Plate Override</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
