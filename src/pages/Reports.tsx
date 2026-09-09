import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [reportType, setReportType] = useState('ROAD_HEALTH');
  const [reportTitle, setReportTitle] = useState('Weekly City Road Surface Defect Audit');
  const [daysBack, setDaysBack] = useState(7);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    api.getReports().then((data) => setReports(data)).catch(() => {});
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.generateReport(reportType, reportTitle, daysBack);
      loadReports();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Smart City Municipal Reports & Data Exports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate formal auditing documents, civil engineering summaries, and raw CSV feeds
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Report Generator Form */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Generate New Audit Report</span>
        </h2>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Report Category</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setReportTitle(`Executive ${e.target.value.replace('_', ' ')} Audit`);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ROAD_HEALTH">Road Surface & Defect Audit</option>
              <option value="TRAFFIC">Traffic Congestion & Delay Survey</option>
              <option value="FLEET">Fleet Sensor & Camera Operational Health</option>
              <option value="INCIDENTS">Law Enforcement Incident Register</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Time Range</label>
            <select
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>Last 24 Hours</option>
              <option value={7}>Last 7 Days (Weekly Audit)</option>
              <option value={30}>Last 30 Days (Monthly Review)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{generating ? 'Compiling...' : 'Generate Document'}</span>
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Generated Reports Archive ({reports.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">Format: CSV & Printable Layout</span>
        </div>

        <div className="divide-y divide-slate-800">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{report.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    <span className="font-semibold text-cyan-400">{report.report_type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Period: {new Date(report.period_start).toLocaleDateString()} to {new Date(report.period_end).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>By: {report.generated_by}</span>
                  </div>

                  {report.summary_json && (
                    <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                      {Object.entries(report.summary_json).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          {k.replace('_', ' ')}: <strong className="text-emerald-400">{String(v)}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <a
                  href={api.getExportCsvUrl(report.id)}
                  download
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
