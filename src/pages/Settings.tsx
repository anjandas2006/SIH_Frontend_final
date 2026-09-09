import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  EyeOff,
  Cpu,
  Save,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';

export const Settings: React.FC = () => {
  const { speed, isRunning, setSimulationSpeed, toggleSimulation } = useSimulation();

  const [clusteringRadius, setClusteringRadius] = useState(35);
  const [potholeThreshold, setPotholeThreshold] = useState(0.85);
  const [trafficThreshold, setTrafficThreshold] = useState(75);
  const [plateBlurring, setPlateBlurring] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      setClusteringRadius(s.clustering_radius_meters || 35);
      setPotholeThreshold(s.pothole_confidence_threshold || 0.85);
      setTrafficThreshold(s.traffic_density_threshold || 75);
      setPlateBlurring(s.license_plate_blurring ?? true);
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateSettings({
      clustering_radius_meters: clusteringRadius,
      pothole_confidence_threshold: potholeThreshold,
      traffic_density_threshold: trafficThreshold,
      license_plate_blurring: plateBlurring
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <span>System Parameters & Edge Algorithmic Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Adjust multi-bus clustering radius, detection confidence gating, simulation speed, and privacy filters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Multi-Bus Clustering Radius */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Multi-Bus Defect Clustering Proximity Radius
              </h2>
            </div>
            <span className="font-mono text-cyan-400 font-bold text-sm">{clusteringRadius} meters</span>
          </div>

          <p className="text-xs text-slate-400">
            Detections of the same defect type (e.g. pothole) by different buses within this spatial Haversine distance will automatically merge into a single verified consensus ticket.
          </p>

          <div>
            <input
              type="range"
              min={15}
              max={60}
              step={1}
              value={clusteringRadius}
              onChange={(e) => setClusteringRadius(Number(e.target.value))}
              className="w-full accent-cyan-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>15m (Strict Urban Grid)</span>
              <span>35m (Recommended Standard)</span>
              <span>60m (Wide Arterial)</span>
            </div>
          </div>
        </div>

        {/* AI Confidence Gates */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Edge AI Confidence & Alert Thresholds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-300">Pothole Confirmation Threshold</span>
                <span className="text-emerald-400 font-mono">{Math.round(potholeThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.70}
                max={0.99}
                step={0.01}
                value={potholeThreshold}
                onChange={(e) => setPotholeThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">Only detections above this confidence emit municipal alerts.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-300">Traffic Congestion Flagging Threshold</span>
                <span className="text-orange-400 font-mono">{trafficThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                step={1}
                value={trafficThreshold}
                onChange={(e) => setTrafficThreshold(Number(e.target.value))}
                className="w-full accent-orange-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">Density percentage required to trigger traffic bottleneck alert.</p>
            </div>
          </div>
        </div>

        {/* Privacy & Plate Blurring */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Privacy & Automatic License Plate Masking
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Autonomous Plate Obfuscation</p>
              <p className="text-[11px] text-slate-400">
                Automatically blur non-incident passenger vehicle plates on edge units prior to evidence upload.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={plateBlurring}
                onChange={(e) => setPlateBlurring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Parameters Persisted Successfully
            </span>
          )}
          <button
            type="submit"
            className="py-2.5 px-6 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
