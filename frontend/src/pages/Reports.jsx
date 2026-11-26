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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand/15">
        <div>
          <h2 className="text-xl font-bold text-sand-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple" />
            Reports & Analytics
          </h2>
          <p className="text-xs text-sand/65 mt-1">Export formatted Excel workbooks and executive PDF intelligence briefs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple/15 text-purple-light border border-purple/40 text-xs font-semibold hover:bg-purple/25 transition-all shadow-md shadow-purple/10 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple" />
            <span>{downloadingExcel ? 'Exporting XLSX...' : 'Export Excel (.xlsx)'}</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple text-white text-xs font-semibold hover:bg-purple-hover transition-all shadow-lg shadow-purple/30 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{downloadingPdf ? 'Exporting PDF...' : 'Export PDF (.pdf)'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl shadow-xl">
          <span className="text-xs font-semibold text-sand/70 uppercase tracking-wider block">Inventory Valuation</span>
          <span className="text-2xl font-mono font-bold text-sand-50 tabular-nums mt-2 block">
            ${summary ? summary.total_valuation.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
          <span className="text-[11px] text-sand/60 mt-1 block">Live warehouse stock value</span>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-xl">
          <span className="text-xs font-semibold text-sand/70 uppercase tracking-wider block">Gross Sales Revenue</span>
          <span className="text-2xl font-mono font-bold text-sand-50 tabular-nums mt-2 block">
            ${summary ? summary.total_sales_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
          <span className="text-[11px] text-purple-light mt-1 block">
            Across {summary?.total_units_sold.toLocaleString()} units transacted
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-xl">
          <span className="text-xs font-semibold text-sand/70 uppercase tracking-wider block">AI Forecast Quality</span>
          <div className="flex items-center gap-4 mt-2 font-mono">
            <div>
              <span className="text-[11px] text-sand/60 block uppercase">MEAN MAE</span>
              <span className="text-lg font-bold text-sand-50 tabular-nums">
                {summary?.forecast_accuracy?.avg_mae || '0.00'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-sand/60 block uppercase">MEAN MAPE</span>
              <span className="text-lg font-bold text-purple-light tabular-nums">
                {summary?.forecast_accuracy?.avg_mape || '0.00'}%
              </span>
            </div>
          </div>
          <span className="text-[11px] text-sand/60 mt-1 block">
            Across {summary?.forecast_accuracy?.total_evaluations} ML evaluation runs
          </span>
        </div>
      </div>

      {/* Export Format Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-purple/20 text-purple border border-purple/30">
                <FileSpreadsheet className="w-5 h-5 text-purple" />
              </div>
              <h3 className="text-sm font-bold text-sand-50 uppercase tracking-wider">Excel Workbook (.xlsx)</h3>
            </div>
            <p className="text-xs text-sand/70 leading-relaxed">
              Automated multi-sheet spreadsheet report generated via <code>openpyxl</code>:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-sand/80">
              <li>Executive Summary with operational metrics and KPI benchmarks</li>
              <li>Inventory Valuation breakdown with health status indicators</li>
              <li>Active stock alerts and exact algorithmic reorder volumes</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="mt-6 w-full py-2.5 px-3 rounded-xl border border-purple/40 bg-purple/15 text-xs font-semibold uppercase tracking-wider text-purple-light hover:bg-purple/25 flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-purple" />
            <span>Download Excel Spreadsheet</span>
          </button>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-purple/20 text-purple border border-purple/30">
                <FileText className="w-5 h-5 text-purple" />
              </div>
              <h3 className="text-sm font-bold text-sand-50 uppercase tracking-wider">Executive PDF Report (.pdf)</h3>
            </div>
            <p className="text-xs text-sand/70 leading-relaxed">
              Printable PDF document compiled via <code>reportlab</code>:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-sand/80">
              <li>Comprehensive operational summary and executive KPIs</li>
              <li>Stock reorder recommendations with supplier details</li>
              <li>Category valuation breakdown and inventory health overview</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="mt-6 w-full py-2.5 px-3 rounded-xl bg-purple hover:bg-purple-hover text-xs font-semibold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple/30"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
