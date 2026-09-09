import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu,
  UploadCloud,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  TrafficCone,
  ShieldAlert,
  Send,
  Sliders,
  ChevronRight,
  Eye,
  FileVideo
} from 'lucide-react';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceModal } from '../components/common/EvidenceModal';

export const VideoAnalysis: React.FC = () => {
  const { triggerDefectDemo } = useSimulation();

  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('pothole-downtown');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [committedEvents, setCommittedEvents] = useState<Record<number, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedEvidence, setSelectedEvidence] = useState<{
    isOpen: boolean;
    title: string;
    image: string;
    metadata?: any;
  }>({ isOpen: false, title: '', image: '' });

  useEffect(() => {
    api.getVideoSamples().then((data) => {
      setScenarios(data);
      // Run initial default analysis
      runAnalysis(data[0]?.id || 'pothole-downtown');
    }).catch(() => {});
  }, []);

  const runAnalysis = async (scenarioId: string) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('scenario_id', scenarioId);
      formData.append('bus_id', 'BUS-024');

      const result = await api.analyzeVideo(formData);
      setAnalysisResult(result);
      setCurrentFrameIndex(0);
      setIsPlaying(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Playback loop through frames
  useEffect(() => {
    let interval: number;
    if (isPlaying && analysisResult && analysisResult.frame_results.length > 0) {
      interval = window.setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % analysisResult.frame_results.length);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isPlaying, analysisResult]);

  // Draw current frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analysisResult || !analysisResult.frame_results[currentFrameIndex]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = analysisResult.frame_results[currentFrameIndex];
    const width = canvas.width;
    const height = canvas.height;

    // Background road environment
    ctx.fillStyle = '#1e242d';
    ctx.fillRect(0, 0, width, height);

    // Perspective road
    ctx.fillStyle = '#2d333f';
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height * 0.35);
    ctx.lineTo(width * 0.65, height * 0.35);
    ctx.lineTo(width * 0.95, height);
    ctx.lineTo(width * 0.05, height);
    ctx.closePath();
    ctx.fill();

    // Road lane markings
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.35);
    ctx.lineTo(width * 0.5, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw detected bounding boxes
    frame.detections.forEach((det: any) => {
      const [bx, by, bw, bh] = det.bbox;
      const x = bx * width;
      const y = by * height;
      const w = bw * width;
      const h = bh * height;

      let strokeColor = '#10b981'; // Green for normal vehicles
      if (det.class_name === 'pothole') strokeColor = '#ef4444';
      if (det.class_name === 'pedestrian') strokeColor = '#f59e0b';
      if (det.plate_text) strokeColor = '#eab308';

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Label background
      ctx.fillStyle = strokeColor;
      const label = `${det.class_name.toUpperCase()} ${Math.round(det.confidence * 100)}%`;
      ctx.font = 'bold 11px monospace';
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 20, textWidth + 10, 20);

      // Label text
      ctx.fillStyle = strokeColor === '#ef4444' ? '#fff' : '#000';
      ctx.fillText(label, x + 5, y - 6);

      // If plate text
      if (det.plate_text) {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(x, y + h + 2, 120, 18);
        ctx.fillStyle = '#000';
        ctx.fillText(`PLATE: ${det.plate_text}`, x + 4, y + h + 15);
      }
    });

    // Top HUD Telemetry
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, width, 32);
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(
      `FRAME: ${frame.frame_number}/15 | TIME: ${frame.timestamp_sec}s | DENSITY: ${frame.density_percent}% | BUS: BUS-024 [FRONT-CAM]`,
      14,
      20
    );

    // Bottom Watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, height - 24, width, 24);
    ctx.fillStyle = '#10b981';
    ctx.font = '10px monospace';
    ctx.fillText(`YOLOv8-URBAN + BYTETRACK OBJECT INFERENCE | 0.024s / FRAME`, 14, height - 8);
  }, [currentFrameIndex, analysisResult]);

  const currentFrameData = analysisResult?.frame_results[currentFrameIndex];

  const handleCommitEvent = async (eventIdx: number) => {
    await triggerDefectDemo();
    setCommittedEvents((prev) => ({ ...prev, [eventIdx]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Edge AI Video Analysis & Computer Vision Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Simulate onboard bus camera processing: Frame extraction &rarr; Object detection &rarr; Tracking &rarr; Geotagged event creation
          </p>
        </div>

        {/* Demo Video Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Demo Scenario:</label>
          <select
            value={selectedScenarioId}
            onChange={(e) => {
              setSelectedScenarioId(e.target.value);
              runAnalysis(e.target.value);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Player & Controls */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-xl">
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-2">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono text-cyan-400">Running Edge AI Object Detection...</p>
              </div>
            )}
          </div>

          {/* Timeline & Player Controls */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setCurrentFrameIndex(0)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Rewind"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-400 ml-2">
                Frame {currentFrameIndex + 1} / 15 ({currentFrameData?.timestamp_sec || 0}s)
              </span>
            </div>

            {/* Frame Slider */}
            <div className="flex-1 max-w-xs">
              <input
                type="range"
                min={0}
                max={14}
                value={currentFrameIndex}
                onChange={(e) => {
                  setCurrentFrameIndex(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                1080p @ 30 FPS
              </span>
            </div>
          </div>

          {/* Real-time Vehicle Counting Breakdown */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-800 text-center text-xs">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Cars</p>
              <p className="text-base font-bold text-cyan-400 mt-0.5">{currentFrameData?.vehicle_counts.car || 2}</p>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Bikes</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{currentFrameData?.vehicle_counts.motorcycle || 1}</p>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Buses</p>
              <p className="text-base font-bold text-indigo-400 mt-0.5">{currentFrameData?.vehicle_counts.bus || 1}</p>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Autos</p>
              <p className="text-base font-bold text-amber-400 mt-0.5">{currentFrameData?.vehicle_counts.auto_rickshaw || 1}</p>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Pedestrians</p>
              <p className="text-base font-bold text-purple-400 mt-0.5">{currentFrameData?.vehicle_counts.pedestrian || 0}</p>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Density</p>
              <p className="text-base font-bold text-rose-400 mt-0.5">{currentFrameData?.density_percent || 65}%</p>
            </div>
          </div>
        </div>

        {/* Right: Extracted Events & Edge Action Feed */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Extracted High-Value Events</h2>
              <p className="text-[10px] text-slate-400">Events prioritized for central server upload</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold">
              {analysisResult?.summary_events.length || 0} Flagged
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {analysisResult?.summary_events.map((ev: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    {ev.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    Frame {ev.frame}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1">
                  <p>Confidence: <strong className="text-emerald-400">{ev.confidence}</strong></p>
                  <p>Severity: <strong className="text-rose-400">{ev.severity}</strong></p>
                  {ev.plate && <p>Plate: <strong className="text-amber-400 font-mono">{ev.plate}</strong></p>}
                  <p className="text-[10px] text-slate-400 font-mono">Geotag: {ev.gps[0]}, {ev.gps[1]}</p>
                </div>

                {/* Evidence Thumbnail */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedEvidence({
                      isOpen: true,
                      title: ev.type,
                      image: ev.evidence_image || '/evidence/sample_pothole.jpg',
                      metadata: {
                        busNumber: 'BUS-024',
                        location: 'MG Road Corridor',
                        confidence: ev.confidence,
                        severity: ev.severity
                      }
                    })}
                    className="flex-1 py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Evidence</span>
                  </button>

                  <button
                    onClick={() => handleCommitEvent(idx)}
                    disabled={committedEvents[idx]}
                    className={`flex-1 py-1 px-2 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      committedEvents[idx]
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
                    }`}
                  >
                    {committedEvents[idx] ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Committed to City DB</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Commit to DB</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
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
