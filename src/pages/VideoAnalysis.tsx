import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu as CpuIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  RotateCcw as RotateCcwIcon,
  CheckCircle2 as CheckCircle2Icon,
  AlertTriangle as AlertTriangleIcon,
  Send as SendIcon,
  Eye as EyeIcon
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
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Perspective road
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height * 0.35);
    ctx.lineTo(width * 0.65, height * 0.35);
    ctx.lineTo(width * 0.95, height);
    ctx.lineTo(width * 0.05, height);
    ctx.closePath();
    ctx.fill();

    // Road dashed center line
    ctx.strokeStyle = '#f8fafc';
    ctx.setLineDash([16, 12]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.35);
    ctx.lineTo(width * 0.5, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw detections
    frame.detections.forEach((det: any) => {
      const x = det.bbox[0] * width;
      const y = det.bbox[1] * height;
      const w = det.bbox[2] * width;
      const h = det.bbox[3] * height;

      let strokeColor = '#0284c7';
      if (det.class_name.includes('pothole') || det.class_name.includes('defect')) strokeColor = '#ea580c';
      if (det.class_name.includes('accident') || det.class_name.includes('incident')) strokeColor = '#dc2626';
      if (det.class_name.includes('pedestrian')) strokeColor = '#a855f7';

      // Bounding box
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
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, x + 5, y - 6);

      // If plate text
      if (det.plate_text) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x, y + h + 2, 120, 18);
        ctx.fillStyle = '#0f172a';
        ctx.fillText(`PLATE: ${det.plate_text}`, x + 4, y + h + 15);
      }
    });

    // Top HUD Telemetry
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, width, 32);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(
      `FRAME: ${frame.frame_number}/15 | TIME: ${frame.timestamp_sec}s | DENSITY: ${frame.density_percent}% | BUS: BUS-024 [FRONT-CAM]`,
      14,
      20
    );

    // Bottom Watermark
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, height - 24, width, 24);
    ctx.fillStyle = '#34d399';
    ctx.font = '10px monospace';
    ctx.fillText(`YOLOv8-URBAN + BYTETRACK OBJECT INFERENCE | 0.024s / FRAME`, 14, height - 8);
  }, [currentFrameIndex, analysisResult]);

  const currentFrameData = analysisResult?.frame_results[currentFrameIndex];

  const handleCommitEvent = async (eventIdx: number) => {
    await triggerDefectDemo();
    setCommittedEvents((prev) => ({ ...prev, [eventIdx]: true }));
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-[#063269] tracking-tight flex items-center gap-2.5">
            <CpuIcon className="w-6 h-6 text-[#0284c7]" />
            <span>Edge AI Video Analysis & Computer Vision Studio</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Simulate onboard bus camera processing: Frame extraction &rarr; Object detection &rarr; Tracking &rarr; Geotagged event creation
          </p>
        </div>

        {/* Demo Video Selector */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs text-slate-600 font-semibold">Demo Scenario:</label>
          <select
            value={selectedScenarioId}
            onChange={(e) => {
              setSelectedScenarioId(e.target.value);
              runAnalysis(e.target.value);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] shadow-2xs font-medium"
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
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                <div className="w-8 h-8 border-3 border-[#0284c7] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono text-[#38bdf8]">Running Edge AI Object Detection...</p>
              </div>
            )}
          </div>

          {/* Timeline & Player Controls */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold transition-colors cursor-pointer shadow-2xs"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setCurrentFrameIndex(0)}
                className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title="Rewind"
              >
                <RotateCcwIcon className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-600 ml-2 font-medium">
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
                className="w-full accent-[#0284c7] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                1080p @ 30 FPS
              </span>
            </div>
          </div>

          {/* Real-time Vehicle Counting Breakdown */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-slate-200 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Cars</p>
              <p className="text-lg font-bold text-[#0284c7] mt-0.5">{currentFrameData?.vehicle_counts.car || 2}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Bikes</p>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{currentFrameData?.vehicle_counts.motorcycle || 1}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Buses</p>
              <p className="text-lg font-bold text-indigo-700 mt-0.5">{currentFrameData?.vehicle_counts.bus || 1}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Autos</p>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{currentFrameData?.vehicle_counts.auto_rickshaw || 1}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Pedestrians</p>
              <p className="text-lg font-bold text-purple-700 mt-0.5">{currentFrameData?.vehicle_counts.pedestrian || 0}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Density</p>
              <p className="text-lg font-bold text-rose-700 mt-0.5">{currentFrameData?.density_percent || 65}%</p>
            </div>
          </div>
        </div>

        {/* Right: Extracted Events & Edge Action Feed */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Extracted High-Value Events</h2>
              <p className="text-[10px] text-slate-500">Events prioritized for central server upload</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] text-xs font-bold border border-sky-200">
              {analysisResult?.summary_events.length || 0} Flagged
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {analysisResult?.summary_events.map((ev: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600" />
                    {ev.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-[#0284c7] font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                    Frame {ev.frame}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <p>Confidence: <strong className="text-emerald-700">{ev.confidence}</strong></p>
                  <p>Severity: <strong className="text-rose-700">{ev.severity}</strong></p>
                  {ev.plate && <p>Plate: <strong className="text-amber-700 font-mono">{ev.plate}</strong></p>}
                  <p className="text-[10px] text-slate-500 font-mono">Geotag: {ev.gps[0]}, {ev.gps[1]}</p>
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
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <EyeIcon className="w-3.5 h-3.5" />
                    <span>View Evidence</span>
                  </button>

                  <button
                    onClick={() => handleCommitEvent(idx)}
                    disabled={committedEvents[idx]}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all shadow-2xs ${
                      committedEvents[idx]
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                        : 'bg-[#0284c7] hover:bg-[#0369a1] text-white cursor-pointer'
                    }`}
                  >
                    {committedEvents[idx] ? (
                      <>
                        <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Committed to City DB</span>
                      </>
                    ) : (
                      <>
                        <SendIcon className="w-3.5 h-3.5" />
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
