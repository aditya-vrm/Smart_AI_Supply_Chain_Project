import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileSpreadsheet, FileText, Download, BarChart2, ShieldCheck } from 'lucide-react';

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
        console.error('Failed to load reports summary:', err);
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
      link.setAttribute('download', 'Supply_Chain_Executive_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download Excel report');
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
      alert('Failed to download PDF report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Analytics Export</h2>
          <p className="text-xs text-slate-500 mt-0.5">Generate and stream executive spreadsheets (Excel) and PDF operational reports</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {downloadingExcel ? 'Generating .xlsx...' : 'Download Excel (.xlsx)'}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            {downloadingPdf ? 'Generating .pdf...' : 'Download PDF (.pdf)'}
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Total Inventory Valuation</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums mt-2 block">
            ${summary ? summary.total_valuation.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Live warehouse valuation</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Historical Sales Volume</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums mt-2 block">
            ${summary ? summary.total_sales_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {summary?.total_units_sold.toLocaleString()} units sold
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">AI Forecast Accuracy</span>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Avg MAE</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {summary?.forecast_accuracy?.avg_mae || '0.00'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Avg MAPE</span>
              <span className="text-lg font-bold text-emerald-600 tabular-nums">
                {summary?.forecast_accuracy?.avg_mape || '0.00'}%
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Based on {summary?.forecast_accuracy?.total_evaluations} ML evaluation runs
          </span>
        </div>
      </div>

      {/* Export Description Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Microsoft Excel Export (.xlsx)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full multi-tab workbook generated via <code>openpyxl</code> containing:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-500">
              <li>Executive Summary & operational KPIs</li>
              <li>Complete Inventory Valuation & health status</li>
              <li>Smart alerts and exact calculated reorder quantities</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="mt-6 w-full py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Download Excel Spreadsheet
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Executive PDF Document (.pdf)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-resolution printable executive report rendered via <code>reportlab</code> containing:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-500">
              <li>Corporate supply chain performance summary</li>
              <li>Critical stock alert warnings and recommended purchase volumes</li>
              <li>Product catalog inventory valuation breakdown</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="mt-6 w-full py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Download Operations PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
