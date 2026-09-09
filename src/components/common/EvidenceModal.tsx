import React from 'react';
import { X, ExternalLink, ShieldCheck, MapPin, Calendar, Bus } from 'lucide-react';
import { getEvidenceUrl } from '../../services/api';


interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageSrc: string;
  metadata?: {
    busNumber?: string;
    location?: string;
    timestamp?: string;
    confidence?: string | number;
    severity?: string;
    defectType?: string;
  };
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  title,
  imageSrc,
  metadata
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image & Overlay */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[350px]">
          <img
            src={getEvidenceUrl(imageSrc)}
            alt={title}
            className="max-h-[55vh] w-auto object-contain rounded-lg border border-slate-800 shadow-lg"
          />
        </div>

        {/* Metadata Footer */}
        {metadata && (
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {metadata.busNumber && (
              <div className="flex items-center gap-2 text-slate-300">
                <Bus className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-[10px] text-slate-400">Capturing Bus</p>
                  <p className="font-semibold">{metadata.busNumber}</p>
                </div>
              </div>
            )}
            {metadata.location && (
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-slate-400">Geotag Location</p>
                  <p className="font-semibold truncate max-w-[160px]">{metadata.location}</p>
                </div>
              </div>
            )}
            {metadata.timestamp && (
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[10px] text-slate-400">Detection Time</p>
                  <p className="font-semibold">{metadata.timestamp}</p>
                </div>
              </div>
            )}
            {metadata.confidence && (
              <div>
                <p className="text-[10px] text-slate-400">AI Confidence</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">
                    {metadata.confidence}
                  </span>
                  {metadata.severity && (
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      metadata.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                      metadata.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {metadata.severity}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
