import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileTerminal, FileSpreadsheet, Download, BarChart2, ShieldCheck, Cpu } from 'lucide-react';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/summary');
        setSummary(res.data);
      } catch (err) {
        console.error('Failed to load intelligence summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      const res = await api.get('/reports/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'VORTEX_Supply_Intelligence_Matrix.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export Excel report');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await api.get('/reports/export/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'VORTEX_Supply_Intelligence_Matrix.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export PDF report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
            <FileTerminal className="w-5 h-5 text-indigo-400" />
            INTELLIGENCE DISPATCH CONSOLE
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">Compile and stream multi-tab Excel workbooks and executive PDF operational telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider hover:bg-emerald-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            {downloadingExcel ? 'COMPILING XLSX...' : 'EXPORT EXCEL (.XLSX)'}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold uppercase tracking-wider hover:bg-cyan-500/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:opacity-50"
          >
            <FileTerminal className="w-4 h-4 text-cyan-400" />
            {downloadingPdf ? 'COMPILING PDF...' : 'EXPORT PDF (.PDF)'}
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        <div className="bg-[#0D131F]/90 backdrop-blur-md p-6 rounded-xl border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">CURRENT INVENTORY VALUATION</span>
          <span className="text-2xl font-bold text-white tabular-nums mt-2 block">
            ${summary ? summary.total_valuation.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
          <span className="text-[11px] text-cyan-400 mt-1 block">Live warehouse valuation</span>
        </div>

        <div className="bg-[#0D131F]/90 backdrop-blur-md p-6 rounded-xl border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">TOTAL GROSS REVENUE</span>
          <span className="text-2xl font-bold text-white tabular-nums mt-2 block">
            ${summary ? summary.total_sales_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            Across {summary?.total_units_sold.toLocaleString()} units transacted
          </span>
        </div>

        <div className="bg-[#0D131F]/90 backdrop-blur-md p-6 rounded-xl border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">AI FORECAST ACCURACY</span>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <span className="text-[11px] text-slate-500 block uppercase">MEAN MAE</span>
              <span className="text-lg font-bold text-white tabular-nums">
                {summary?.forecast_accuracy?.avg_mae || '0.00'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block uppercase">MEAN MAPE</span>
              <span className="text-lg font-bold text-emerald-400 tabular-nums">
                {summary?.forecast_accuracy?.avg_mape || '0.00'}%
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Aggregated over {summary?.forecast_accuracy?.total_evaluations} ML evaluation runs
          </span>
        </div>
      </div>

      {/* Export Format Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
        <div className="bg-[#0D131F]/90 backdrop-blur-md p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase">SPREADSHEET WORKBOOK (.XLSX)</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Programmatically formatted multi-sheet binary via <code>openpyxl</code>:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-300">
              <li>Executive Summary & operational KPIs</li>
              <li>Complete Inventory Valuation & health status</li>
              <li>Smart alerts and exact calculated reorder quantities</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="mt-6 w-full py-2.5 px-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-xs font-bold uppercase tracking-wider text-emerald-300 hover:bg-emerald-950/40 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Dispatch Excel Workbook
          </button>
        </div>

        <div className="bg-[#0D131F]/90 backdrop-blur-md p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <FileTerminal className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase">OPERATIONAL BRIEFING DOCUMENT (.PDF)</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executive vector printable report rendered via <code>reportlab</code>:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-300">
              <li>Enterprise supply chain performance summary</li>
              <li>Critical stock alert warnings and recommended purchase volumes</li>
              <li>Product catalog inventory valuation breakdown</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="mt-6 w-full py-2.5 px-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-950/40 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Dispatch PDF Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
