import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu as CpuIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  RotateCcw as RotateCcwIcon,
  CheckCircle2 as CheckCircle2Icon,
  AlertTriangle as AlertTriangleIcon,
  Send as SendIcon,
  Eye as EyeIcon,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceModal } from '../components/common/EvidenceModal';

const BUILTIN_SCENARIOS = [
  {
    id: 'pothole-downtown',
    title: 'Downtown Pothole & Road Defect Detection',
    bus_id: 'BUS-024',
    route_code: 'R-101',
    location: 'MG Road / Central Avenue Corridor',
    duration_sec: 12.0,
    description: 'High-confidence detection of deep crater pothole with auto-clustering and telemetry geotagging.'
  },
  {
    id: 'traffic-bottleneck',
    title: 'Peak Evening Traffic Density & Congestion',
    bus_id: 'BUS-017',
    route_code: 'R-102',
    location: 'Park Circus 7-Point Crossing',
    duration_sec: 15.0,
    description: 'Real-time vehicle counting, density estimation (88%), and bottleneck delay profiling.'
  },
  {
    id: 'pedestrian-risk',
    title: 'School Zone Pedestrian Safety & Crossing Risk',
    bus_id: 'BUS-003',
    route_code: 'R-105',
    location: 'Sealdah School Zone Crossing',
    duration_sec: 10.0,
    description: 'Pedestrian proximity monitoring, child risk detection, and safe braking distance verification.'
  },
  {
    id: 'hit-and-run',
    title: 'Hit-and-Run Collision & License Plate OCR',
    bus_id: 'BUS-024',
    route_code: 'R-101',
    location: 'Bowbazar Crossing',
    duration_sec: 14.0,
    description: 'Side collision tracking, escaping vehicle trajectory, and 91% confidence license plate recognition.'
  }
];

// Generates 15 high-fidelity demo frames for any scenario
function generateDemoFrames(scenarioId: string) {
  const frames = [];
  const isPothole = scenarioId === 'pothole-downtown';
  const isTraffic = scenarioId === 'traffic-bottleneck';
  const isPedestrian = scenarioId === 'pedestrian-risk';
  const isHitAndRun = scenarioId === 'hit-and-run';

  for (let i = 1; i <= 15; i++) {
    const timestamp_sec = Math.round((i - 1) * 0.8 * 10) / 10;
    const detections: any[] = [];
    let carCount = 2;
    let bikeCount = 1;
    let busCount = 1;
    let autoCount = 1;
    let pedCount = 0;
    let density = isTraffic ? 85 + (i % 8) : 55 + (i % 15);

    // Standard traffic vehicles with forward motion
    const depthOffset = (i * 12) % 180;

    // Moving Car on Left Lane
    detections.push({
      class_name: 'car',
      confidence: 0.94,
      bbox: [180 + (i * 4) % 30, 220 + depthOffset * 0.4, 95, 65],
      speed_estimate_kmh: 38.5,
      plate_text: 'WB-02-AK-4491'
    });

    // Moving Bus/Truck ahead
    detections.push({
      class_name: 'bus',
      confidence: 0.91,
      bbox: [320, 160 + (i * 3) % 20, 140, 110],
      speed_estimate_kmh: 28.0,
      plate_text: 'WB-04-E-1008'
    });

    // Auto Rickshaw
    detections.push({
      class_name: 'auto_rickshaw',
      confidence: 0.89,
      bbox: [480 - (i * 3) % 25, 230 + depthOffset * 0.35, 75, 60],
      speed_estimate_kmh: 32.0,
      plate_text: 'WB-24-TR-9102'
    });

    // Motorcycle on lane border
    detections.push({
      class_name: 'motorcycle',
      confidence: 0.93,
      bbox: [290 + (i * 2) % 20, 250 + depthOffset * 0.3, 40, 50],
      speed_estimate_kmh: 42.1
    });

    // Scenario-specific detections:
    if (isPothole && i >= 3 && i <= 8) {
      // Pothole defect in roadway
      const potY = 270 + (i - 3) * 22;
      const potW = 100 + (i - 3) * 12;
      const potH = 50 + (i - 3) * 6;
      detections.push({
        class_name: 'pothole',
        confidence: 0.96,
        bbox: [340 - (i - 3) * 5, potY, potW, potH],
        severity: 'CRITICAL',
        defect_type: 'POTHOLE',
        depth_cm: 8.5
      });
    }

    if (isPedestrian && i >= 4 && i <= 10) {
      pedCount = 2;
      detections.push({
        class_name: 'pedestrian',
        confidence: 0.96,
        bbox: [220 + (i - 4) * 15, 210 + (i - 4) * 8, 45, 95],
        speed_estimate_kmh: 4.5,
        is_school_child: true,
        risk: 'HIGH_COLLISION_PROXIMITY'
      });
      detections.push({
        class_name: 'pedestrian',
        confidence: 0.93,
        bbox: [270 + (i - 4) * 14, 215 + (i - 4) * 8, 40, 85],
        speed_estimate_kmh: 4.2
      });
    }

    if (isHitAndRun && i >= 2 && i <= 9) {
      detections.push({
        class_name: 'incident',
        confidence: 0.92,
        bbox: [160 + (i * 12), 240 + (i * 5), 110, 75],
        speed_estimate_kmh: 56.4,
        plate_text: 'WB-12-AB-1234',
        incident_type: 'HIT_AND_RUN',
        severity: 'CRITICAL'
      });
    }

    frames.push({
      frame_number: i,
      timestamp_sec,
      detections,
      vehicle_counts: {
        car: carCount,
        motorcycle: bikeCount,
        bus: busCount,
        auto_rickshaw: autoCount,
        pedestrian: pedCount
      },
      density_percent: density,
      safety_alerts: []
    });
  }

  // Summary events
  const summary_events: any[] = [];
  if (isPothole) {
    summary_events.push({
      frame: 4,
      type: 'POTHOLE_CLUSTER_DETECTED',
      confidence: '96%',
      severity: 'CRITICAL',
      gps: [22.5850, 88.3640],
      evidence_image: '/evidence/sample_pothole.jpg',
      plate: null
    });
  }
  if (isTraffic) {
    summary_events.push({
      frame: 6,
      type: 'SEVERE_CONGESTION_SPIKE',
      confidence: '94%',
      severity: 'HIGH',
      gps: [22.5450, 88.3750],
      evidence_image: '/evidence/sample_damaged_road.jpg',
      plate: null
    });
  }
  if (isPedestrian) {
    summary_events.push({
      frame: 5,
      type: 'SCHOOL_ZONE_PEDESTRIAN_RISK',
      confidence: '95%',
      severity: 'HIGH',
      gps: [22.5670, 88.3710],
      evidence_image: '/evidence/sample_pedestrian.jpg',
      plate: null
    });
  }
  if (isHitAndRun) {
    summary_events.push({
      frame: 3,
      type: 'HIT_AND_RUN_COLLISION_FLAG',
      confidence: '92%',
      severity: 'CRITICAL',
      gps: [22.5700, 88.3520],
      evidence_image: '/evidence/sample_hit_and_run.jpg',
      plate: 'WB-12-AB-1234'
    });
  }

  return {
    scenario_id: scenarioId,
    total_frames: 15,
    detections_count: frames.reduce((acc, f) => acc + f.detections.length, 0),
    frame_results: frames,
    summary_events
  };
}

export const VideoAnalysis: React.FC = () => {
  const { triggerDefectDemo, triggerIncidentDemo } = useSimulation();

  const [scenarios, setScenarios] = useState<any[]>(BUILTIN_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioId] = useState('pothole-downtown');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(() => generateDemoFrames('pothole-downtown'));
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [committedEvents, setCommittedEvents] = useState<Record<number, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedEvidence, setSelectedEvidence] = useState<{
    isOpen: boolean;
    title: string;
    image: string;
    metadata?: any;
  }>({ isOpen: false, title: '', image: '' });

  // Load scenarios on mount and run default scenario
  useEffect(() => {
    api.getVideoSamples()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setScenarios(data);
        }
      })
      .catch(() => {});

    runAnalysis('pothole-downtown');
  }, []);

  const runAnalysis = async (scenarioId: string) => {
    setIsProcessing(true);
    // Instant demo feedback with built-in generator
    const localFallback = generateDemoFrames(scenarioId);
    setAnalysisResult(localFallback);
    setCurrentFrameIndex(0);
    setIsPlaying(true);

    try {
      const formData = new FormData();
      formData.append('scenario_id', scenarioId);
      formData.append('bus_id', 'BUS-024');

      const result = await api.analyzeVideo(formData);
      if (result && Array.isArray(result.frame_results) && result.frame_results.length > 0) {
        setAnalysisResult(result);
      }
    } catch {
      // Already using localFallback
    } finally {
      setIsProcessing(false);
    }
  };

  // Continuous Playback loop through frames
  useEffect(() => {
    let interval: number;
    if (isPlaying && analysisResult && analysisResult.frame_results?.length > 0) {
      const delay = Math.round(750 / playbackSpeed);
      interval = window.setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % analysisResult.frame_results.length);
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isPlaying, analysisResult, playbackSpeed]);

  // High-fidelity Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analysisResult || !analysisResult.frame_results?.[currentFrameIndex]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = analysisResult.frame_results[currentFrameIndex];
    const width = canvas.width;
    const height = canvas.height;

    // 1. Sky & Horizon Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.38);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.38);

    // Cityscape Skyline in distant background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, height * 0.28, 45, height * 0.1);
    ctx.fillRect(110, height * 0.22, 60, height * 0.16);
    ctx.fillRect(200, height * 0.25, 75, height * 0.13);
    ctx.fillRect(width - 240, height * 0.24, 70, height * 0.14);
    ctx.fillRect(width - 140, height * 0.27, 50, height * 0.11);

    // 2. Road Shoulders / Curbs
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, height * 0.38, width, height * 0.62);

    // 3. Perspective Carriageway Road Surface
    const roadGrad = ctx.createLinearGradient(0, height * 0.38, 0, height);
    roadGrad.addColorStop(0, '#1e293b');
    roadGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = roadGrad;

    ctx.beginPath();
    ctx.moveTo(width * 0.36, height * 0.38);
    ctx.lineTo(width * 0.64, height * 0.38);
    ctx.lineTo(width * 0.96, height);
    ctx.lineTo(width * 0.04, height);
    ctx.closePath();
    ctx.fill();

    // Road Outer White Edges
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.36, height * 0.38);
    ctx.lineTo(width * 0.04, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width * 0.64, height * 0.38);
    ctx.lineTo(width * 0.96, height);
    ctx.stroke();

    // 4. Moving Center Dashed Line (Animation Effect)
    const dashOffset = (currentFrameIndex * 18) % 40;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.setLineDash([22, 18]);
    ctx.lineDashOffset = -dashOffset;
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.38);
    ctx.lineTo(width * 0.5, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Draw Detections with Reticles and Physical Graphics
    frame.detections.forEach((det: any) => {
      // Normalize bounding box coordinates
      let x = det.bbox[0];
      let y = det.bbox[1];
      let w = det.bbox[2];
      let h = det.bbox[3];

      if (x <= 1 && y <= 1 && w <= 1 && h <= 1) {
        x = x * width;
        y = y * height;
        w = w * width;
        h = h * height;
      } else if (w > x && h > y) {
        // [x1, y1, x2, y2] format
        w = w - x;
        h = h - y;
      }

      // Constrain within visible bounds
      x = Math.max(10, Math.min(width - 50, x));
      y = Math.max(height * 0.35, Math.min(height - 40, y));
      w = Math.max(30, Math.min(width * 0.5, w));
      h = Math.max(25, Math.min(height * 0.5, h));

      const isPothole = det.class_name.includes('pothole') || det.defect_type === 'POTHOLE';
      const isPedestrian = det.class_name.includes('pedestrian');
      const isIncident = det.class_name.includes('incident') || det.class_name.includes('accident');

      let strokeColor = '#0284c7';
      let tagBg = '#0284c7';

      if (isPothole) {
        strokeColor = '#f97316'; // Vibrant orange
        tagBg = '#ea580c';

        // Draw simulated pothole crater on road surface
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w * 0.45, h * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner shadow
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.beginPath();
        ctx.ellipse(x + w / 2 - 4, y + h / 2 - 3, w * 0.35, h * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (isIncident) {
        strokeColor = '#ef4444'; // Red
        tagBg = '#dc2626';

        // Draw car shape
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(x + 4, y + 8, w - 8, h - 12);
        // Taillights
        ctx.fillStyle = '#f87171';
        ctx.fillRect(x + 8, y + h - 10, 10, 6);
        ctx.fillRect(x + w - 18, y + h - 10, 10, 6);
      } else if (isPedestrian) {
        strokeColor = '#a855f7'; // Purple
        tagBg = '#9333ea';

        // Draw pedestrian shape
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 10, 7, 0, Math.PI * 2); // Head
        ctx.fill();
        ctx.fillRect(x + w / 2 - 4, y + 18, 8, h - 22); // Body
      } else {
        // Vehicle Silhouette
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.fillRect(x + 2, y + 4, w - 4, h - 8);
        // Headlights / taillights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 6, y + h - 8, 8, 4);
        ctx.fillRect(x + w - 14, y + h - 8, 8, 4);
      }

      // High-contrast Edge Bounding Box
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Corner Reticle Accents
      const rLen = 8;
      ctx.lineWidth = 3.5;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x, y + rLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + rLen, y);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + w - rLen, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + rLen);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x, y + h - rLen);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + rLen, y + h);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + w - rLen, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - rLen);
      ctx.stroke();

      // Top Tag Badge
      const confStr = typeof det.confidence === 'number' ? `${Math.round(det.confidence * 100)}%` : '95%';
      const speedStr = det.speed_estimate_kmh ? ` [${Math.round(det.speed_estimate_kmh)} km/h]` : '';
      const label = `${det.class_name.toUpperCase()} ${confStr}${speedStr}`;

      ctx.font = 'bold 11px monospace';
      const labelWidth = ctx.measureText(label).width + 12;

      ctx.fillStyle = tagBg;
      ctx.fillRect(x, Math.max(34, y - 20), labelWidth, 20);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, x + 6, Math.max(48, y - 6));

      // License Plate Badge if present
      if (det.plate_text) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x, y + h + 2, 136, 18);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`PLATE: ${det.plate_text}`, x + 5, y + h + 15);
      }
    });

    // 6. Top Telemetry HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, 0, width, 32);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(
      `FRAME: ${frame.frame_number}/15 | TIME: ${frame.timestamp_sec}s | DENSITY: ${frame.density_percent}% | BUS: BUS-024 [FRONT-CAM 1080p]`,
      14,
      20
    );

    // Live AI Pulsing Dot in HUD
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(width - 80, 16, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('LIVE INFER', width - 70, 20);

    // 7. Bottom Watermark & Edge Stats
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, height - 26, width, 26);
    ctx.fillStyle = '#34d399';
    ctx.font = '10px monospace';
    ctx.fillText('YOLOv8-URBAN + BYTETRACK OBJECT INFERENCE | 0.024s / FRAME • UKPMS STANDARD', 14, height - 9);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`GEO: 22.5726° N, 88.3639° E • CORRIDOR R-101`, width - 270, height - 9);
  }, [currentFrameIndex, analysisResult]);

  const currentFrameData = analysisResult?.frame_results?.[currentFrameIndex];

  const handleCommitEvent = async (eventIdx: number) => {
    const ev = analysisResult?.summary_events?.[eventIdx];
    if (ev?.type.includes('INCIDENT') || ev?.type.includes('HIT_AND_RUN')) {
      await triggerIncidentDemo();
    } else {
      await triggerDefectDemo();
    }
    setCommittedEvents((prev) => ({ ...prev, [eventIdx]: true }));
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-heading font-extrabold text-[#063269] dark:text-white tracking-tight flex items-center gap-2.5">
              <CpuIcon className="w-6 h-6 text-[#0284c7] dark:text-sky-400" />
              <span>Edge AI Video Analysis & Computer Vision Studio</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-950 text-[#0284c7] dark:text-sky-400 border border-sky-200 dark:border-sky-800">
              DEMO SIMULATION ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Simulate onboard bus camera processing: Frame extraction &rarr; Object detection &rarr; Tracking &rarr; Geotagged event creation
          </p>
        </div>

        {/* Demo Video Selector */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Demo Scenario:</label>
          <select
            value={selectedScenarioId}
            onChange={(e) => {
              setSelectedScenarioId(e.target.value);
              runAnalysis(e.target.value);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7] shadow-2xs font-medium cursor-pointer"
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
        <div className="lg:col-span-8 bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 aspect-video flex items-center justify-center shadow-inner">
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
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold transition-colors cursor-pointer shadow-2xs"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setCurrentFrameIndex(0);
                  setIsPlaying(true);
                }}
                className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Rewind to Frame 1"
              >
                <RotateCcwIcon className="w-4 h-4" />
              </button>

              {/* Speed Multiplier Pill */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                {[0.5, 1.0, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      playbackSpeed === s
                        ? 'bg-[#0284c7] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 ml-1 font-medium">
                Frame {currentFrameIndex + 1} / 15 ({currentFrameData?.timestamp_sec || 0}s)
              </span>
            </div>

            {/* Frame Slider */}
            <div className="flex-1 min-w-[140px] max-w-xs">
              <input
                type="range"
                min={0}
                max={14}
                value={currentFrameIndex}
                onChange={(e) => {
                  setCurrentFrameIndex(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-[#0284c7] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                1080p @ 30 FPS
              </span>
            </div>
          </div>

          {/* Real-time Vehicle Counting Breakdown */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Cars</p>
              <p className="text-lg font-bold text-[#0284c7] dark:text-sky-400 mt-0.5">
                {currentFrameData?.vehicle_counts?.car ?? 2}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Bikes</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {currentFrameData?.vehicle_counts?.motorcycle ?? 1}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Buses</p>
              <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">
                {currentFrameData?.vehicle_counts?.bus ?? 1}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Autos</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                {currentFrameData?.vehicle_counts?.auto_rickshaw ?? 1}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Pedestrians</p>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-400 mt-0.5">
                {currentFrameData?.vehicle_counts?.pedestrian ?? 0}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Density</p>
              <p className="text-lg font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                {currentFrameData?.density_percent ?? 65}%
              </p>
            </div>
          </div>
        </div>

        {/* Right: Extracted Events & Edge Action Feed */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Extracted High-Value Events</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Events prioritized for central server upload</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-[#0284c7] dark:text-sky-400 text-xs font-bold border border-sky-200 dark:border-sky-800">
              {analysisResult?.summary_events?.length || 0} Flagged
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {analysisResult?.summary_events?.map((ev: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {ev.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-[#0284c7] dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                    Frame {ev.frame}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <p>Confidence: <strong className="text-emerald-700 dark:text-emerald-400">{ev.confidence}</strong></p>
                  <p>Severity: <strong className="text-rose-700 dark:text-rose-400">{ev.severity}</strong></p>
                  {ev.plate && <p>Plate: <strong className="text-amber-700 dark:text-amber-400 font-mono">{ev.plate}</strong></p>}
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Geotag: {ev.gps?.[0]}, {ev.gps?.[1]}</p>
                </div>

                {/* Evidence Thumbnail */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedEvidence({
                      isOpen: true,
                      title: ev.type.replace(/_/g, ' '),
                      image: ev.evidence_image || '/evidence/sample_pothole.jpg',
                      metadata: {
                        busNumber: 'BUS-024',
                        location: 'MG Road Corridor',
                        confidence: ev.confidence,
                        severity: ev.severity
                      }
                    })}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <EyeIcon className="w-3.5 h-3.5" />
                    <span>View Evidence</span>
                  </button>

                  <button
                    onClick={() => handleCommitEvent(idx)}
                    disabled={committedEvents[idx]}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all shadow-2xs ${
                      committedEvents[idx]
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 cursor-default'
                        : 'bg-[#0284c7] hover:bg-[#0369a1] text-white cursor-pointer'
                    }`}
                  >
                    {committedEvents[idx] ? (
                      <>
                        <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Committed to DB</span>
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
