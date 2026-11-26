import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';

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
        console.error('Failed to load summary:', err);
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
      link.setAttribute('download', 'Supply_Chain_Intelligence_Report.xlsx');
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
      link.setAttribute('download', 'Supply_Chain_Executive_Report.pdf');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cobalt-400" />
            Reports & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">Export formatted Excel workbooks and executive PDF intelligence briefs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cobalt-600/20 text-cobalt-300 border border-cobalt-500/40 text-xs font-semibold hover:bg-cobalt-600/30 transition-all shadow-[0_0_15px_rgba(8,100,232,0.2)] disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-neon" />
            {downloadingExcel ? 'Exporting XLSX...' : 'Export Excel (.xlsx)'}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cobalt-600 text-white text-xs font-semibold hover:bg-cobalt-500 transition-all shadow-[0_0_15px_rgba(8,100,232,0.3)] disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {downloadingPdf ? 'Exporting PDF...' : 'Export PDF (.pdf)'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0E1522] p-6 rounded-xl border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Inventory Valuation</span>
          <span className="text-2xl font-mono font-bold text-neon tabular-nums mt-2 block">
            ${summary ? summary.total_valuation.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Live warehouse stock value</span>
        </div>

        <div className="bg-[#0E1522] p-6 rounded-xl border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Gross Sales Revenue</span>
          <span className="text-2xl font-mono font-bold text-white tabular-nums mt-2 block">
            ${summary ? summary.total_sales_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
          <span className="text-[11px] text-cobalt-400 mt-1 block">
            Across {summary?.total_units_sold.toLocaleString()} units transacted
          </span>
        </div>

        <div className="bg-[#0E1522] p-6 rounded-xl border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">AI Forecast Quality</span>
          <div className="flex items-center gap-4 mt-2 font-mono">
            <div>
              <span className="text-[11px] text-slate-500 block uppercase">MEAN MAE</span>
              <span className="text-lg font-bold text-white tabular-nums">
                {summary?.forecast_accuracy?.avg_mae || '0.00'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block uppercase">MEAN MAPE</span>
              <span className="text-lg font-bold text-neon tabular-nums">
                {summary?.forecast_accuracy?.avg_mape || '0.00'}%
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {summary?.forecast_accuracy?.total_evaluations} ML evaluation runs
          </span>
        </div>
      </div>

      {/* Export Format Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0E1522] p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 rounded-lg bg-cobalt-600/20 text-cobalt-400 border border-cobalt-500/30">
                <FileSpreadsheet className="w-5 h-5 text-neon" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Excel Workbook (.xlsx)</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated multi-sheet spreadsheet report generated via <code>openpyxl</code>:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-300">
              <li>Executive Summary with operational metrics and KPI benchmarks</li>
              <li>Inventory Valuation breakdown with health status indicators</li>
              <li>Active stock alerts and exact algorithmic reorder volumes</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="mt-6 w-full py-2.5 px-3 rounded-lg border border-cobalt-500/40 bg-cobalt-950/20 text-xs font-semibold uppercase tracking-wider text-cobalt-300 hover:bg-cobalt-900/40 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-neon" />
            Download Excel Spreadsheet
          </button>
        </div>

        <div className="bg-[#0E1522] p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 rounded-lg bg-cobalt-600/20 text-cobalt-400 border border-cobalt-500/30">
                <FileText className="w-5 h-5 text-cobalt-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Executive PDF Report (.pdf)</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Printable PDF document compiled via <code>reportlab</code>:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-300">
              <li>Comprehensive operational summary and executive KPIs</li>
              <li>Stock reorder recommendations with supplier details</li>
              <li>Category valuation breakdown and inventory health overview</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="mt-6 w-full py-2.5 px-3 rounded-lg bg-cobalt-600 hover:bg-cobalt-500 text-xs font-semibold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(8,100,232,0.3)]"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
