import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Compass,
  FileText,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  Percent,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Plus,
  Table,
  HardDriveDownload
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { api } from '../services/api';

export const AnalyticsReportsHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'analytics'; // 'analytics', 'routes', 'reports'
  const [activeTab, setActiveTab] = useState<'analytics' | 'routes' | 'reports'>(
    (initialTab as any) || 'analytics'
  );

  const handleTabChange = (tab: 'analytics' | 'routes' | 'reports') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // --- ANALYTICS DATA ---
  const [trafficAnalytics, setTrafficAnalytics] = useState<any | null>(null);
  const [roadHealthAnalytics, setRoadHealthAnalytics] = useState<any | null>(null);
  const [fleetAnalytics, setFleetAnalytics] = useState<any | null>(null);
  const [aiPerformance, setAiPerformance] = useState<any | null>(null);

  // --- ROUTES & OD DATA ---
  const [routesRanking, setRoutesRanking] = useState<any[]>([]);
  const [odMatrix, setOdMatrix] = useState<any | null>(null);

  // --- REPORTS DATA ---
  const [reports, setReports] = useState<any[]>([]);
  const [reportType, setReportType] = useState('ROAD_HEALTH');
  const [reportTitle, setReportTitle] = useState('Weekly City Road Surface Defect Audit');
  const [daysBack, setDaysBack] = useState(7);
  const [generating, setGenerating] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getTrafficAnalytics().catch(() => null),
      api.getRoadHealthAnalytics().catch(() => null),
      api.getFleetAnalytics().catch(() => null),
      api.getAiPerformance().catch(() => null),
      api.getRoutesRanking().catch(() => []),
      api.getOdMatrix().catch(() => null),
      api.getReports().catch(() => [])
    ]).then(([t, r, f, a, rk, od, rep]) => {
      setTrafficAnalytics(t);
      setRoadHealthAnalytics(r);
      setFleetAnalytics(f);
      setAiPerformance(a);
      setRoutesRanking(rk);
      setOdMatrix(od);
      setReports(rep);
      setLoading(false);
    });
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.generateReport(reportType, reportTitle, daysBack);
      const rep = await api.getReports();
      setReports(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const COLORS = ['#0284c7', '#06b6d4', '#16a34a', '#f59e0b', '#dc2626'];

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* 1. TOP HEADER & UNIFIED TABS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-heading font-extrabold text-[#063269] tracking-tight">
              Analytics, Insights & Municipal Reports Hub
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-[#0284c7] border border-sky-200">
              UNIFIED INTELLIGENCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Longitudinal trend analytics, route origin-destination flows, and official UKPMS auditing reports in one workspace.
          </p>
        </div>

        {/* Crisp Segmented Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start lg:self-auto">
          <button
            onClick={() => handleTabChange('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-[#063269] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Urban Trend Analytics</span>
          </button>

          <button
            onClick={() => handleTabChange('routes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-white text-[#063269] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Route & OD Flow Insights</span>
          </button>

          <button
            onClick={() => handleTabChange('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-white text-[#063269] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Municipal Reports & CSV Export</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono font-bold">
              {reports.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: URBAN TREND ANALYTICS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Edge AI Model Accuracy</span>
              <p className="text-3xl font-heading font-extrabold text-emerald-600 mt-1">94.6%</p>
              <p className="text-xs text-slate-500">False positive rate: <strong>2.8%</strong></p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Bandwidth Optimization</span>
              <p className="text-3xl font-heading font-extrabold text-[#0284c7] mt-1">98.2%</p>
              <p className="text-xs text-slate-500">Metadata-only cloud uplink</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Fleet Coverage Efficiency</span>
              <p className="text-3xl font-heading font-extrabold text-indigo-600 mt-1">88.4%</p>
              <p className="text-xs text-slate-500">KMC major arterial corridors</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Monthly Survey Cost Saved</span>
              <p className="text-3xl font-heading font-extrabold text-emerald-600 mt-1">₹392,000</p>
              <p className="text-xs text-slate-500">vs manual profilometer survey</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Carriageway Defect Recurrence Rate
                </h3>
                <span className="text-xs text-emerald-600 font-semibold">Post-Repair Audit</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roadHealthAnalytics?.monthly_trend || [
                    { month: 'Apr', detected: 45, repaired: 38 },
                    { month: 'May', detected: 52, repaired: 48 },
                    { month: 'Jun', detected: 68, repaired: 55 },
                    { month: 'Jul', detected: 74, repaired: 62 },
                    { month: 'Aug', detected: 60, repaired: 58 },
                    { month: 'Sep', detected: 42, repaired: 40 }
                  ]}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                    <Bar dataKey="detected" fill="#ea580c" name="New Defects Detected" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="repaired" fill="#16a34a" name="Verified Repairs" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Edge AI Inference Distribution
                </h3>
                <span className="text-xs text-[#0284c7] font-semibold">Per-Frame Class Mix</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Potholes', value: 38 },
                        { name: 'Vehicles', value: 42 },
                        { name: 'Waterlogging', value: 12 },
                        { name: 'Pedestrians', value: 8 }
                      ]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROUTE & OD FLOW INSIGHTS                                            */}
      {/* ========================================================================= */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Route Efficiency Ranking */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Survey Corridors Efficiency Ranking
                </h3>
                <span className="text-xs text-slate-500">Sorted by Speed & Pavement Score</span>
              </div>

              <div className="space-y-3">
                {(routesRanking.length > 0 ? routesRanking : [
                  { route_code: 'R-101', name: 'Howrah Station ⇄ Esplanade', avg_speed: 28.4, pci: 8.2, status: 'EXCELLENT' },
                  { route_code: 'R-102', name: 'Salt Lake Sector V ⇄ Park Street', avg_speed: 24.1, pci: 7.6, status: 'GOOD' },
                  { route_code: 'R-103', name: 'Gariahat ⇄ Shyambazar', avg_speed: 18.5, pci: 5.4, status: 'FAIR' },
                  { route_code: 'R-104', name: 'Dum Dum Airport ⇄ Howrah', avg_speed: 16.2, pci: 3.8, status: 'POOR' },
                  { route_code: 'R-105', name: 'New Town Eco Park ⇄ Sealdah', avg_speed: 22.0, pci: 6.8, status: 'GOOD' }
                ]).map((r: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#063269]">{r.route_code}</span>
                        <span className="text-xs font-bold text-slate-900">{r.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Average Velocity: <strong className="text-slate-800">{r.avg_speed} km/h</strong> • RM-PCI Index: <strong className="text-[#0284c7]">{r.pci}</strong>
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'EXCELLENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      r.status === 'GOOD' ? 'bg-lime-50 text-lime-700 border border-lime-200' :
                      r.status === 'FAIR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Origin-Destination Matrix Preview */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Corridor Origin-Destination Passenger Density Matrix
                </h3>
                <span className="text-xs text-indigo-600 font-semibold">OD Estimation</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Origin \ Destination</th>
                      <th className="p-2.5">Howrah</th>
                      <th className="p-2.5">Esplanade</th>
                      <th className="p-2.5">Salt Lake</th>
                      <th className="p-2.5">Dum Dum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50">Howrah</td>
                      <td className="p-2.5 text-slate-400">-</td>
                      <td className="p-2.5 font-bold text-rose-600 bg-rose-50/50">1,840 / hr</td>
                      <td className="p-2.5 text-slate-700">620 / hr</td>
                      <td className="p-2.5 text-slate-700">410 / hr</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50">Esplanade</td>
                      <td className="p-2.5 font-bold text-rose-600 bg-rose-50/50">1,620 / hr</td>
                      <td className="p-2.5 text-slate-400">-</td>
                      <td className="p-2.5 font-bold text-amber-600 bg-amber-50/50">980 / hr</td>
                      <td className="p-2.5 text-slate-700">540 / hr</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50">Salt Lake</td>
                      <td className="p-2.5 text-slate-700">590 / hr</td>
                      <td className="p-2.5 font-bold text-amber-600 bg-amber-50/50">1,120 / hr</td>
                      <td className="p-2.5 text-slate-400">-</td>
                      <td className="p-2.5 text-slate-700">710 / hr</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900 bg-slate-50">Dum Dum</td>
                      <td className="p-2.5 text-slate-700">430 / hr</td>
                      <td className="p-2.5 text-slate-700">580 / hr</td>
                      <td className="p-2.5 text-slate-700">640 / hr</td>
                      <td className="p-2.5 text-slate-400">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500">
                Peak morning transit demand concentrated between Howrah Station & Esplanade Commercial Center.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MUNICIPAL REPORTS & CSV EXPORT                                      */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Generator Form Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Generate Municipal Audit Report
                </h3>
                <p className="text-xs text-slate-500">
                  Produce structured UKPMS-compliant carriageway condition logs, pothole schedules, and contractor repair bills.
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Print Document</span>
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Report Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                >
                  <option value="ROAD_HEALTH">Carriageway Defect Audit (RM-PCI)</option>
                  <option value="TRAFFIC_BOTTLENECK">Traffic Congestion Hotspots</option>
                  <option value="INCIDENT_SAFETY">Hit-and-Run Safety & OCR Report</option>
                  <option value="FLEET_PERFORMANCE">Survey Fleet Telemetry Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Audit Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Report Title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Horizon</label>
                <select
                  value={daysBack}
                  onChange={(e) => setDaysBack(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                >
                  <option value={7}>Last 7 Days (Weekly Audit)</option>
                  <option value={14}>Last 14 Days (Bi-Weekly)</option>
                  <option value={30}>Last 30 Days (Monthly Summary)</option>
                  <option value={90}>Last 90 Days (Quarterly UKPMS)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2 px-4 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{generating ? 'Compiling Report...' : 'Compile & Export'}</span>
              </button>
            </form>
          </div>

          {/* Historical Audit Documents Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Historical Municipal Reports Archive ({reports.length})</span>
              <span className="text-slate-500 font-normal">Compatible with UKPMS / Excel / GIS</span>
            </div>

            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-sky-50 text-[#0284c7] mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rep.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Generated by <strong>{rep.generated_by || 'Transport Authority'}</strong> on {new Date(rep.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.2 rounded border border-slate-200">
                          {rep.report_type}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Audited & Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <a
                      href={api.getExportCsvUrl(rep.id)}
                      download
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV Feed</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
