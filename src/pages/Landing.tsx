import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  TrendingDown,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Calculator,
  Compass,
  Layers,
  Database,
  Smartphone,
  Cpu,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Landmark,
  X,
  ExternalLink,
  Car,
  Activity,
  Play
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api, getEvidenceUrl } from '../services/api';
import { RoadDefectCluster, Bus } from '../types';

const defaultBusIcon = L.divIcon({
  className: 'bus-marker',
  html: `<div style="background:#2ea3f2; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 6px rgba(46,163,242,0.8);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const defectIcon = L.divIcon({
  className: 'defect-marker',
  html: `<div style="background:#ea580c; width:10px; height:10px; border-radius:50%; border:2px solid white; box-shadow:0 0 6px rgba(234,88,12,0.8);"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Overview data from backend
  const [overview, setOverview] = useState<any>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [defects, setDefects] = useState<RoadDefectCluster[]>([]);
  const [loading, setLoading] = useState(true);

  // 5-Level Rating Selected Tab
  const [selectedLevel, setSelectedLevel] = useState<number>(4);

  // Budget Calculator State
  const [networkKm, setNetworkKm] = useState<number>(150);
  const [surveyFreq, setSurveyFreq] = useState<number>(4);
  const [budgetResult, setBudgetResult] = useState<any>(null);
  const [calculating, setCalculating] = useState<boolean>(false);

  // Request Demo Modal State
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [demoForm, setDemoForm] = useState({
    name: '',
    organization: '',
    email: '',
    networkSize: '100 - 500 km',
    notes: ''
  });
  const [demoSubmitted, setDemoSubmitted] = useState<boolean>(false);

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      api.getRoadMetricsOverview().catch(() => null),
      api.getBuses('ACTIVE').catch(() => []),
      api.getRoadDefects().catch(() => [])
    ]).then(([overviewData, busData, defectData]) => {
      if (overviewData) setOverview(overviewData);
      if (busData) setBuses(busData.slice(0, 12));
      if (defectData) setDefects(defectData.slice(0, 20));
      setLoading(false);
    });

    // Run initial budget calculation
    runBudgetCalc(150, 4);
  }, []);

  const runBudgetCalc = async (km: number, freq: number) => {
    setCalculating(true);
    try {
      const res = await api.calculateBudget(km, freq);
      setBudgetResult(res);
    } catch {
      // Fallback calculation if backend unreachable
      const traditional = km * freq * 7000;
      const rmCost = Math.round(traditional * 0.16);
      setBudgetResult({
        network_km: km,
        traditional_manual_survey_cost_inr: traditional,
        traditional_manual_survey_cost_usd: Math.round(traditional / 83.5),
        roadmetrics_ai_survey_cost_inr: rmCost,
        roadmetrics_ai_survey_cost_usd: Math.round(rmCost / 83.5),
        savings_amount_inr: traditional - rmCost,
        savings_percentage: 84.0,
        time_saved_days: Math.round(km * 0.35),
        priority_potholes_count: Math.round(km * 2.8),
        recommended_maintenance_budget_inr: Math.round(km * 2.8 * 3500 + km * 18000)
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleKmChange = (val: number) => {
    setNetworkKm(val);
    runBudgetCalc(val, surveyFreq);
  };

  const handleFreqChange = (val: number) => {
    setSurveyFreq(val);
    runBudgetCalc(networkKm, val);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoModalOpen(false);
      setDemoSubmitted(false);
    }, 2500);
  };

  const levelDetails: Record<number, {
    title: string;
    pci: string;
    badgeClass: string;
    accentColor: string;
    desc: string;
    sampleDefect: string;
    action: string;
    impact: string;
  }> = {
    1: {
      title: 'Level 1 - Excellent Pavement',
      pci: '8.1 - 10.0',
      badgeClass: 'badge-rm-level-1',
      accentColor: '#18a300',
      desc: 'Optimal pavement condition with smooth surface texture, intact friction, and no structural distress. Found on newly paved or recently sealed roads.',
      sampleDefect: 'No active defects detected',
      action: 'Routine monitoring (Annual survey)',
      impact: 'Zero immediate capital expenditure required.'
    },
    2: {
      title: 'Level 2 - Good / Minor Surface Wear',
      pci: '6.1 - 8.0',
      badgeClass: 'badge-rm-level-2',
      accentColor: '#65a30d',
      desc: 'Early surface aging, minor aggregate loss, and hairline transverse micro-fissures. Structural load capacity remains fully intact.',
      sampleDefect: 'Superficial hairline cracking (< 2mm)',
      action: 'Preventative slurry seal or fog seal',
      impact: 'Extends road lifecycle by 5-7 years at minimal cost.'
    },
    3: {
      title: 'Level 3 - Fair / Moderate Wear',
      pci: '4.1 - 6.0',
      badgeClass: 'badge-rm-level-3',
      accentColor: '#eab308',
      desc: 'Moderate wear with longitudinal cracking, shallow depressions, and initial manhole elevation discrepancies. Moisture infiltration risk beginning.',
      sampleDefect: 'Longitudinal cracks & shallow edge raveling',
      action: 'Crack sealing and selective thin overlay',
      impact: 'Prevents rapid transition into severe pothole clusters.'
    },
    4: {
      title: 'Level 4 - Poor / High Deterioration',
      pci: '2.1 - 4.0',
      badgeClass: 'badge-rm-level-4',
      accentColor: '#ea580c',
      desc: 'Substantial structural distress, open pothole formations, heavy alligator cracking, and rutting in wheel paths. Driving speed and safety significantly reduced.',
      sampleDefect: 'Active potholes (depth > 40mm) & alligator cracking',
      action: 'Priority Work Order: Mill & Patch Asphalt',
      impact: 'High risk of vehicle damage and municipal liability claims.'
    },
    5: {
      title: 'Level 5 - Critical / Failed Pavement',
      pci: '0.0 - 2.0',
      badgeClass: 'badge-rm-level-5',
      accentColor: '#dc2626',
      desc: 'Severe pavement failure, extensive deep potholes, base layer exposure, and structural collapse. Requires urgent safety cordon and total reconstruction.',
      sampleDefect: 'Deep pothole clusters & severe base depression',
      action: 'Emergency Dispatch & Full Depth Reclamation',
      impact: 'Immediate safety hazard to public transit and traffic.'
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#2ea3f2]/20 selection:text-[#063269]">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#063269] text-white shadow-md border-b border-[#0b4282]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#2ea3f2] to-[#18a300] p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#063269] rounded-[7px] flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-[#2ea3f2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl text-white tracking-tight">BusSense</span>
                <span className="text-[11px] font-semibold bg-[#2ea3f2]/20 text-[#2ea3f2] px-2 py-0.5 rounded-full border border-[#2ea3f2]/30">AI</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium tracking-wide">Transit Fleet Edge Sensing & Urban Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-200">
            <a href="#solution" className="hover:text-[#2ea3f2] transition-colors">Solution</a>
            <a href="#rating" className="hover:text-[#2ea3f2] transition-colors">RM-PCI Standard</a>
            <a href="#calculator" className="hover:text-[#2ea3f2] transition-colors">Budget Calculator</a>
            <a href="#imagery" className="hover:text-[#2ea3f2] transition-colors">10-ft Imagery</a>
            <a href="#gis-preview" className="hover:text-[#2ea3f2] transition-colors">Live Web-GIS</a>
            <a href="#industries" className="hover:text-[#2ea3f2] transition-colors">Industries</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="hidden sm:inline-flex text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-300/40 text-slate-100 hover:bg-white/10 transition-colors"
            >
              Request Demo
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-[#2ea3f2] hover:bg-[#1b8cdb] text-[#063269] shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <span>Platform Console</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#063269] via-[#083d7e] to-[#0a4894] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2ea3f2_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-cyan-200">
                <span className="w-2 h-2 rounded-full bg-[#18a300] radar-dot"></span>
                <span>Automated Road Condition Assessment & Asset Management</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
                Better Roads <br />
                <span className="text-[#2ea3f2]">Using AI</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-200 font-normal leading-relaxed max-w-2xl">
                Data-driven road condition assessments for road maintenance and municipal asset management. Objective, automated, and UKPMS-aligned.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3.5 rounded-lg bg-[#2ea3f2] hover:bg-[#1b8cdb] text-[#063269] font-bold text-sm sm:text-base shadow-xl flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Launch Web-GIS Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#calculator"
                  className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm sm:text-base transition-colors flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-[#2ea3f2]" />
                  <span>Calculate Budget Savings</span>
                </a>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-8 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18a300]" />
                  <span>5-Level Rating (RM-PCI 0–10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18a300]" />
                  <span>High-Res 10-ft Intervals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18a300]" />
                  <span>84% Survey Cost Reduction</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Assessment Telemetry Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#041c3b] border border-[#1a4478] rounded-2xl shadow-2xl p-6 text-white space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#18a300] radar-dot"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Live Network Telemetry</span>
                  </div>
                  <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                    Kolkata Urban Fleet
                  </span>
                </div>

                {/* Score Pill */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#07264e] p-4 rounded-xl border border-[#17457b]">
                    <div className="text-xs text-slate-300 font-medium">Network RM-PCI</div>
                    <div className="text-3xl font-heading font-extrabold text-white mt-1">
                      {overview?.rm_pci_network_index || 7.4} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                    </div>
                    <span className="inline-block mt-2 text-[11px] font-semibold text-[#65a30d] bg-[#65a30d]/15 px-2 py-0.5 rounded border border-[#65a30d]/30">
                      Level 2 (Good Condition)
                    </span>
                  </div>

                  <div className="bg-[#07264e] p-4 rounded-xl border border-[#17457b]">
                    <div className="text-xs text-slate-300 font-medium">Surveyed Distance</div>
                    <div className="text-3xl font-heading font-extrabold text-white mt-1">
                      {overview?.total_network_km_surveyed || 168.4} <span className="text-xs text-slate-400 font-normal">km</span>
                    </div>
                    <span className="inline-block mt-2 text-[11px] font-semibold text-cyan-400 bg-cyan-400/15 px-2 py-0.5 rounded border border-cyan-400/30">
                      Active Fleet Survey
                    </span>
                  </div>
                </div>

                {/* Quick Defect Distribution */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>5-Level Road Assessment Distribution</span>
                    <span className="font-mono text-cyan-300">73 Tracked Clusters</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                    <div style={{ width: '42%' }} className="bg-[#18a300]" title="Level 1: 42%"></div>
                    <div style={{ width: '26%' }} className="bg-[#65a30d]" title="Level 2: 26%"></div>
                    <div style={{ width: '15%' }} className="bg-[#eab308]" title="Level 3: 15%"></div>
                    <div style={{ width: '11%' }} className="bg-[#ea580c]" title="Level 4: 11%"></div>
                    <div style={{ width: '6%' }} className="bg-[#dc2626]" title="Level 5: 6%"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#18a300]"></span> L1: 42%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#65a30d]"></span> L2: 26%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span> L3: 15%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ea580c]"></span> L4: 11%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#dc2626]"></span> L5: 6%</span>
                  </div>
                </div>

                {/* Action button inside card */}
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/live-map')}
                    className="w-full py-2.5 rounded-lg bg-[#0e3669] hover:bg-[#134685] border border-[#2ea3f2]/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>View Live GIS Heatmap</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM & SOLUTION STATEMENT */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-xs font-bold text-[#063269] uppercase tracking-widest">
              The Infrastructure Challenge
            </h2>
            <p className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 leading-snug">
              Manual road assessments are time consuming and inefficient
            </p>
            <p className="text-slate-600 text-base leading-relaxed">
              Manual inspections are tedious, subjective, and expensive. With the RoadMetrics platform, road condition assessments and municipal asset tracking are automated, continuous, and objective—giving public authorities true oversight over their road networks.
            </p>
          </div>

          {/* 3 Metric Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#063269]/10 text-[#063269] flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-[#063269]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Savings on Maintenance Budget</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Prioritize maintenance before minor cracks develop into severe structural potholes. Save up to 84% on survey execution costs and allocate repair budgets with surgical precision.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#2ea3f2]/15 text-[#2ea3f2] flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#063269]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900">10x Faster Survey Turnaround</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transform 60-day manual walk-through surveys into continuous edge scans. Defect detections are geo-tagged and uploaded to your cloud Web-GIS platform in real time.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#18a300]/15 text-[#18a300] flex items-center justify-center">
                <Layers className="w-6 h-6 text-[#18a300]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Digital Road Infrastructure</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Build a digital twin of your carriageway. Track asset degradation trends, post-repair warranty status, and export GIS data directly into municipal asset management systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTRODUCING ROADMETRICS: 4-STEP PIPELINE */}
      <section id="solution" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-[#2ea3f2] uppercase tracking-widest">End-to-End Workflow</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
              Introducing RoadMetrics. An automated road maintenance solution.
            </h2>
            <p className="text-slate-600 text-base">
              Getting started is easy. Simply mount a smartphone or tap into transit fleet dashcam video data to run automated road condition surveys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-[#2ea3f2] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#063269] text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#2ea3f2]" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">01</span>
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900">Fleet Data Collection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Survey carriageway video using the RoadMetrics Data Collection app mounted on transit buses, patrol cars, or municipal utility vehicles.
              </p>
              <div className="text-[11px] text-[#063269] font-medium bg-slate-100 px-2.5 py-1.5 rounded">
                Smartphone or Fleet Dashcam
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-[#2ea3f2] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#063269] text-white flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-[#2ea3f2]" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">02</span>
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900">AI Defect Classification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Proprietary AI analyzes video frames taken every 10 feet. Classifies potholes, longitudinal cracks, alligator cracking, and road asset health.
              </p>
              <div className="text-[11px] text-[#063269] font-medium bg-slate-100 px-2.5 py-1.5 rounded">
                Every 10-ft with GPS & Timestamp
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-[#2ea3f2] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#063269] text-white flex items-center justify-center">
                  <Compass className="w-5 h-5 text-[#2ea3f2]" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">03</span>
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900">Web-Based GIS Platform</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access geo-spatial maps, cross-bus clustering, and defect severity indices from your browser without installing legacy desktop GIS software.
              </p>
              <div className="text-[11px] text-[#063269] font-medium bg-slate-100 px-2.5 py-1.5 rounded">
                Cloud GIS & Spatial Clustering
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-[#2ea3f2] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#063269] text-white flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-[#2ea3f2]" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">04</span>
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900">Allocate Budgets & Dispatch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Export CSV or shapefiles for high-priority roads. Dispatch municipal work orders directly to contractors and monitor post-work repair quality.
              </p>
              <div className="text-[11px] text-[#063269] font-medium bg-slate-100 px-2.5 py-1.5 rounded">
                CSV / GeoJSON / UKPMS Compatible
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 5-LEVEL ROAD ASSESSMENT RATING (RM-PCI) EXPLORER */}
      <section id="rating" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#063269] uppercase tracking-widest">Industry Benchmark</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
              5-Level Road Assessment Rating
            </h2>
            <p className="text-slate-600 text-base">
              Roads are classified from Level 1 (best condition) to Level 5 (worst condition). The RM-PCI (Pavement Condition Index) operates on an objective 0–10 scale.
            </p>
          </div>

          {/* Level Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => {
              const active = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2.5 ${
                    active
                      ? 'bg-[#063269] text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: levelDetails[lvl].accentColor }}
                  ></span>
                  <span>Level {lvl}</span>
                  <span className="text-xs opacity-75 font-normal">
                    (PCI {levelDetails[lvl].pci})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Level Detail Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-4xl mx-auto shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${levelDetails[selectedLevel].badgeClass}`}>
                  {levelDetails[selectedLevel].title}
                </span>
                <span className="text-sm font-mono font-bold text-slate-500">
                  RM-PCI: {levelDetails[selectedLevel].pci}
                </span>
              </div>

              <p className="text-slate-700 text-base leading-relaxed">
                {levelDetails[selectedLevel].desc}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 w-36">Typical Defects:</strong>
                  <span>{levelDetails[selectedLevel].sampleDefect}</span>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 w-36">Recommended Action:</strong>
                  <span className="font-semibold text-[#063269]">{levelDetails[selectedLevel].action}</span>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 w-36">Municipal Impact:</strong>
                  <span>{levelDetails[selectedLevel].impact}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sample Inspection Point
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 flex items-center justify-center">
                <img
                  src={getEvidenceUrl(
                    selectedLevel >= 4
                      ? '/evidence/sample_pothole.jpg'
                      : selectedLevel === 3
                      ? '/evidence/sample_damaged_road.jpg'
                      : '/evidence/sample_waterlogging.jpg'
                  )}
                  alt="Road Defect Evidence"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if not loaded
                    (e.target as any).src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute top-2 left-2 bg-[#063269]/90 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                  LAT: 22.5726° N • LNG: 88.3639° E
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  PCI {selectedLevel >= 4 ? '1.4' : selectedLevel === 3 ? '5.2' : '8.6'}
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Capture Interval: 10 ft</span>
                <span className="font-medium text-[#063269]">Confirmed by Fleet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MUNICIPAL BUDGET & SAVINGS CALCULATOR */}
      <section id="calculator" className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-[#2ea3f2] uppercase tracking-widest">ROI Calculator</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white">
              Calculate Your Maintenance Budget Savings
            </h2>
            <p className="text-slate-300 text-base">
              See how much time and public funds your council or infrastructure firm can save by switching from manual survey crews to automated RoadMetrics fleet intelligence.
            </p>
          </div>

          <div className="bg-[#06234b] border border-[#123e74] rounded-2xl p-6 sm:p-10 shadow-2xl max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Form Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <label htmlFor="km-slider" className="text-slate-200">Road Network Length (km)</label>
                  <span className="font-mono text-xl text-[#2ea3f2] font-bold">{networkKm} km</span>
                </div>
                <input
                  id="km-slider"
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={networkKm}
                  onChange={(e) => handleKmChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2ea3f2]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>20 km</span>
                  <span>500 km</span>
                  <span>1,000 km</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Survey Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Semi-Annual (2x)', val: 2 },
                    { label: 'Quarterly (4x)', val: 4 },
                    { label: 'Monthly (12x)', val: 12 }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleFreqChange(opt.val)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        surveyFreq === opt.val
                          ? 'bg-[#2ea3f2] text-[#063269] border-[#2ea3f2]'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Objective UKPMS Compatible Data</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Includes continuous roughness ratings, automated pothole counts, and exportable priority repair work orders.
                </p>
              </div>
            </div>

            {/* Right Results Display */}
            <div className="lg:col-span-6 bg-[#04162e] border border-[#1a4478] rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Projected Annual Savings</span>
                <span className="text-xs font-bold bg-[#18a300]/20 text-[#18a300] px-2.5 py-1 rounded-full border border-[#18a300]/30">
                  {budgetResult?.savings_percentage || 84}% Less Expensive
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400">Total Survey Savings</div>
                <div className="text-4xl font-heading font-extrabold text-[#2ea3f2]">
                  ₹{(budgetResult?.savings_amount_inr || 4704000).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  ≈ ${(budgetResult?.savings_amount_usd || 56335).toLocaleString()} USD saved annually
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <div className="text-slate-400">Manual Survey Cost</div>
                  <div className="font-mono font-bold text-slate-300 text-sm mt-0.5 line-through decoration-rose-500">
                    ₹{(budgetResult?.traditional_manual_survey_cost_inr || 5600000).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">RoadMetrics AI Cost</div>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                    ₹{(budgetResult?.roadmetrics_ai_survey_cost_inr || 896000).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Engineering Time Saved</span>
                  <span className="font-bold text-white text-base font-mono">
                    {budgetResult?.time_saved_days || 70} Days
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Priority Potholes Flagged</span>
                  <span className="font-bold text-amber-400 text-base font-mono">
                    {budgetResult?.priority_potholes_count || 420} Units
                  </span>
                </div>
              </div>

              <button
                onClick={() => setDemoModalOpen(true)}
                className="w-full py-3 rounded-lg bg-[#2ea3f2] hover:bg-[#1b8cdb] text-[#063269] font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                Request Municipal Pilot Survey
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HIGH RESOLUTION IMAGERY SECTION (EVERY 10 FEET) */}
      <section id="imagery" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-[#063269] uppercase tracking-widest">High-Definition Edge Sensing</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
              High Resolution Imagery Every 10 Feet
            </h2>
            <p className="text-slate-600 text-base">
              Access high quality image points taken every 10 feet with associated GPS location data and timestamp. Review before and after repair work with millimeter precision.
            </p>
          </div>

          {/* Sample Survey Points Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(overview?.high_resolution_survey_points?.slice(0, 4) || [
              {
                id: '1',
                cluster_code: 'RD-1022',
                defect_type: 'POTHOLE',
                pci_score: 1.4,
                level: 5,
                latitude: 22.6019,
                longitude: 88.3720,
                address: 'Dum Dum Metro Corridor',
                evidence_image: '/evidence/sample_pothole.jpg',
                action: 'Immediate Work Order'
              },
              {
                id: '2',
                cluster_code: 'RD-1016',
                defect_type: 'WATERLOGGING',
                pci_score: 3.4,
                level: 4,
                latitude: 22.5149,
                longitude: 88.3649,
                address: 'Shyambazar Flyover Underpass',
                evidence_image: '/evidence/sample_waterlogging.jpg',
                action: 'Drainage Clearance'
              },
              {
                id: '3',
                cluster_code: 'RD-1017',
                defect_type: 'ALLIGATOR CRACK',
                pci_score: 4.8,
                level: 3,
                latitude: 22.5679,
                longitude: 88.4049,
                address: 'Airport Connector Road',
                evidence_image: '/evidence/sample_damaged_road.jpg',
                action: 'Schedule Crack Seal'
              },
              {
                id: '4',
                cluster_code: 'RD-1012',
                defect_type: 'POTHOLE',
                pci_score: 1.8,
                level: 5,
                latitude: 22.5749,
                longitude: 88.4199,
                address: 'New Town Eco Park Sector V',
                evidence_image: '/evidence/sample_pothole.jpg',
                action: 'Immediate Work Order'
              }
            ]).map((pt: any) => (
              <div key={pt.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-video bg-slate-900">
                  <img
                    src={getEvidenceUrl(pt.evidence_image)}
                    alt={pt.defect_type}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-[#063269]/90 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {pt.cluster_code}
                  </div>
                  <div className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                    pt.level >= 4 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    Level {pt.level} • PCI {pt.pci_score}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{pt.defect_type}</span>
                    <span className="text-[10px] font-mono text-slate-500">Every 10 ft</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{pt.address}</p>
                  <div className="text-[11px] font-mono text-slate-400">
                    {pt.latitude.toFixed(4)}° N, {pt.longitude.toFixed(4)}° E
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#063269]">{pt.action}</span>
                    <button
                      onClick={() => navigate('/road-health')}
                      className="text-xs text-[#2ea3f2] hover:text-[#063269] font-medium flex items-center gap-0.5"
                    >
                      Inspect <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. LIVE WEB-GIS INTERACTIVE PREVIEW */}
      <section id="gis-preview" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2ea3f2] uppercase tracking-widest">Web-Based GIS Platform</span>
              <h2 className="font-heading font-bold text-3xl text-white">
                Live Carriageway Assessment Map
              </h2>
              <p className="text-sm text-slate-300">
                Live view of public transit survey units and confirmed road defects across the metropolitan grid.
              </p>
            </div>

            <button
              onClick={() => navigate('/live-map')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2ea3f2] hover:bg-[#1b8cdb] text-[#063269] font-bold text-xs transition-colors self-start md:self-auto"
            >
              <span>Open Full Screen GIS Command</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Embedded Leaflet Map */}
          <div className="h-[440px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <MapContainer
              center={[22.5726, 88.3639]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Render Active Buses */}
              {buses.map((bus) => (
                <Marker
                  key={bus.id}
                  position={[bus.current_lat, bus.current_lng]}
                  icon={defaultBusIcon}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <strong>{bus.bus_number}</strong>
                      <div className="text-slate-300">Speed: {bus.speed_kmh} km/h</div>
                      <div className="text-cyan-400">Status: {bus.status}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Render Defects */}
              {defects.map((d) => (
                <Marker
                  key={d.id}
                  position={[d.latitude, d.longitude]}
                  icon={defectIcon}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <strong className="text-amber-400">{d.defect_type}</strong>
                      <div className="text-slate-300">{d.address_description || 'Urban Street'}</div>
                      <div className="text-rose-400 font-bold">Severity: {d.severity}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-[400] bg-[#061e3d]/90 backdrop-blur border border-slate-700/80 p-3 rounded-lg text-xs space-y-1.5 shadow-lg pointer-events-auto">
              <div className="font-semibold text-white text-[11px] mb-1">GIS Map Legend</div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2ea3f2]"></span>
                <span>Active Survey Bus ({buses.length})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
                <span>Detected Defect Cluster ({defects.length})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. INDUSTRIES SERVED */}
      <section id="industries" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-[#063269] uppercase tracking-widest">Client Verticals</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
              Designed for Infrastructure Leaders
            </h2>
            <p className="text-slate-600 text-base">
              Whether you are a national highway authority, municipal city council, or private maintenance contractor, RoadMetrics adapts to your operational standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vertical 1: Infrastructure Firms */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="w-12 h-12 rounded-xl bg-[#063269] text-white flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#2ea3f2]" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-slate-900">Infrastructure Firms & Contractors</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Provide irrefutable objective proof of before-and-after road repair quality. Monitor defect recurrence during warranty periods, speed up punch-list resolution, and optimize heavy equipment mobilization.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18a300]" />
                  <span>Before-and-after work verification with 10-ft interval photos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18a300]" />
                  <span>Subcontractor performance auditing & SLA compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18a300]" />
                  <span>Instant CSV and GIS export for work order execution</span>
                </li>
              </ul>
            </div>

            {/* Vertical 2: City Councils & Municipalities */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="w-12 h-12 rounded-xl bg-[#063269] text-white flex items-center justify-center">
                <Landmark className="w-6 h-6 text-[#2ea3f2]" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-slate-900">City Councils & Municipalities</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ensure citizen safety and fair capital allocation. Eliminate citizen complaints with automated defect detection, satisfy UKPMS and regional regulatory reporting, and protect municipal budgets.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18a300]" />
                  <span>Objective 0–10 RM-PCI pavement condition benchmarks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18a300]" />
                  <span>Evidence-backed budget requests for city legislative approval</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18a300]" />
                  <span>Utilize existing transit fleet with zero specialized vehicle CAPEX</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA BANNER */}
      <section className="py-20 bg-gradient-to-r from-[#063269] to-[#0a4894] text-white text-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white">
            Ready to Automate Your Road Network Inspections?
          </h2>
          <p className="text-slate-200 text-base max-w-2xl mx-auto">
            Join forward-looking city councils and infrastructure maintenance contractors utilizing RoadMetrics AI. Launch a pilot survey on your local roads today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-8 py-3.5 rounded-lg bg-[#2ea3f2] hover:bg-[#1b8cdb] text-[#063269] font-bold text-sm shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Request Field Pilot
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm transition-colors"
            >
              Access GIS Console
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-[#03152c] text-slate-400 text-xs py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-heading font-bold text-lg">
                <Compass className="w-5 h-5 text-[#2ea3f2]" />
                <span>BusSense AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated road condition assessment and municipal asset management platform powered by edge transit fleet AI.
              </p>
              <div className="text-[11px] text-slate-500">
                Intelligent Urban Transit & Edge Sensing Platform
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white text-xs uppercase tracking-wider block mb-2">Platform</span>
              <div><a href="#rating" className="hover:text-white transition-colors">RM-PCI 0–10 Rating</a></div>
              <div><a href="#imagery" className="hover:text-white transition-colors">10-ft Interval Capture</a></div>
              <div><a href="#calculator" className="hover:text-white transition-colors">Budget Calculator</a></div>
              <div><button onClick={() => navigate('/dashboard')} className="hover:text-[#2ea3f2] transition-colors">GIS Command Center</button></div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white text-xs uppercase tracking-wider block mb-2">GIS Modules</span>
              <div><button onClick={() => navigate('/live-map')} className="hover:text-white transition-colors">Carriageway Map</button></div>
              <div><button onClick={() => navigate('/road-health')} className="hover:text-white transition-colors">Defect Clusters</button></div>
              <div><button onClick={() => navigate('/fleet')} className="hover:text-white transition-colors">Fleet Management</button></div>
              <div><button onClick={() => navigate('/traffic')} className="hover:text-white transition-colors">Traffic Intelligence</button></div>
              <div><button onClick={() => navigate('/reports')} className="hover:text-white transition-colors">Work Order Export</button></div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white text-xs uppercase tracking-wider block mb-2">Security & Standards</span>
              <p className="text-xs text-slate-400">
                Compatible with UKPMS (UK Pavement Management System) guidelines and ISO 9001 geospatial data governance.
              </p>
              <div className="pt-2">
                <span className="inline-block text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                  Version 2.4 Enterprise
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              Copyright &copy; 2026 BusSense AI. All Rights Reserved.
            </div>
            <div className="flex gap-6">
              <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Platform Login</button>
              <button onClick={() => setDemoModalOpen(true)} className="hover:text-white transition-colors">Schedule Pilot</button>
            </div>
          </div>
        </div>
      </footer>

      {/* 12. REQUEST DEMO MODAL */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {demoSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#18a300]/15 text-[#18a300] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900">Pilot Request Received</h3>
                <p className="text-sm text-slate-600 max-w-xs mx-auto">
                  Thank you, {demoForm.name || 'Engineer'}. Our technical team will reach out within 24 hours to set up your road survey trial.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-xl text-[#063269]">Request a RoadMetrics Pilot</h3>
                  <p className="text-xs text-slate-500">
                    See automated road condition assessment live on your jurisdiction's road network.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rachel Adams"
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2ea3f2]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Organization / City Council</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Manchester City Council or Balfour Beatty"
                      value={demoForm.organization}
                      onChange={(e) => setDemoForm({ ...demoForm, organization: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2ea3f2]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Work Email</label>
                    <input
                      required
                      type="email"
                      placeholder="rachel.adams@council.gov"
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2ea3f2]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Approximate Road Network Size</label>
                    <select
                      value={demoForm.networkSize}
                      onChange={(e) => setDemoForm({ ...demoForm, networkSize: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2ea3f2]"
                    >
                      <option value="Under 50 km">Under 50 km (Pilot area)</option>
                      <option value="50 - 250 km">50 - 250 km (Suburban municipal)</option>
                      <option value="250 - 1000 km">250 - 1,000 km (Metropolitan city)</option>
                      <option value="Over 1000 km">Over 1,000 km (State / Highway network)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-[#063269] hover:bg-[#094185] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                  >
                    Confirm & Schedule Survey
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
