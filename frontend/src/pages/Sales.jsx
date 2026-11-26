import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { Zap, Plus, Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [saleForm, setSaleForm] = useState({
    product_id: '',
    quantity_sold: 1,
    sale_date: new Date().toISOString().split('T')[0],
    region: 'North',
    total_amount: '',
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSalesAndProducts = async () => {
    try {
      setLoading(true);
      const [salesRes, prodRes] = await Promise.all([
        api.get('/sales', { params: { limit: 100 } }),
        api.get('/products'),
      ]);
      setSales(salesRes.data);
      setProducts(prodRes.data);
      if (prodRes.data.length > 0 && !saleForm.product_id) {
        setSaleForm(prev => ({ ...prev, product_id: prodRes.data[0].product_id }));
      }
    } catch (err) {
      console.error('Failed to load sales ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAndProducts();
  }, []);

  const handleManualSaleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const selectedProd = products.find(p => p.product_id === parseInt(saleForm.product_id));
      const qty = parseInt(saleForm.quantity_sold);
      const calcTotal = saleForm.total_amount ? parseFloat(saleForm.total_amount) : (selectedProd ? qty * selectedProd.unit_price : 0);

      await api.post('/sales', {
        product_id: parseInt(saleForm.product_id),
        quantity_sold: qty,
        sale_date: new Date(saleForm.sale_date).toISOString(),
        region: saleForm.region,
        total_amount: calcTotal,
      });

      setIsManualModalOpen(false);
      fetchSalesAndProducts();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error recording transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Select a valid CSV or Excel file.');
      return;
    }

    setUploadError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/sales/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
      fetchSalesAndProducts();
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Batch ingestion failed.');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleTemplate = async () => {
    try {
      const res = await api.get('/sales/template/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vortex_sales_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download template');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            TRANSACTION INGESTION LEDGER
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">Audit customer consumptions & feed actual ground truth to ML forecaster</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-[#0D131F] text-slate-300 text-xs font-mono hover:text-white hover:border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            CSV SPEC
          </button>
          <button
            onClick={() => {
              setSelectedFile(null);
              setUploadResult(null);
              setUploadError('');
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 text-xs font-mono font-semibold hover:bg-cyan-950/40 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            BATCH CSV IMPORT
          </button>
          <button
            onClick={() => {
              setFormError('');
              setIsManualModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider hover:from-emerald-400 hover:to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            POST SALE
          </button>
        </div>
      </div>

      <div className="bg-[#0D131F]/90 backdrop-blur-md rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            NO TRANSACTION RECORDS PERSISTED IN LEDGER.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">SKU Reference</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Volume Sold</th>
                  <th className="py-3 px-4 text-right">Yield ($)</th>
                  <th className="py-3 px-4 text-center">Jurisdiction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sales.map((sale) => (
                  <tr key={sale.sale_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-bold">
                      #{sale.sale_id}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-400 tracking-wider">
                      {sale.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {sale.product?.product_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white tabular-nums">
                      {sale.quantity_sold}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 tabular-nums">
                      ${sale.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                        {sale.region}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Sale Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="RECORD SINGLE TRANSACTION EVENT"
      >
        {formError && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {formError}
          </div>
        )}
        <form onSubmit={handleManualSaleSubmit} className="space-y-4 font-mono">
          <div>
            <label className="block text-xs text-slate-300 mb-1 uppercase">Target Product SKU *</label>
            <select
              value={saleForm.product_id}
              onChange={(e) => setSaleForm({ ...saleForm, product_id: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-emerald-500"
            >
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.sku_code} — {p.product_name} (${p.unit_price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1 uppercase">Units Sold *</label>
              <input
                type="number"
                min="1"
                required
                value={saleForm.quantity_sold}
                onChange={(e) => setSaleForm({ ...saleForm, quantity_sold: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white tabular-nums focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1 uppercase">Date *</label>
              <input
                type="date"
                required
                value={saleForm.sale_date}
                onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1 uppercase">Territory Region</label>
              <select
                value={saleForm.region}
                onChange={(e) => setSaleForm({ ...saleForm, region: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1 uppercase">Total Settlement ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Auto-computed"
                value={saleForm.total_amount}
                onChange={(e) => setSaleForm({ ...saleForm, total_amount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white tabular-nums"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] text-amber-300">
            <strong>TELEMETRY NOTICE:</strong> Committing this transaction will automatically decrement physical inventory counts in MySQL.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Commit Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="BATCH DATA INGESTION ENGINE"
      >
        {uploadError && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadResult ? (
          <div className="space-y-4 font-mono">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>BATCH INGESTION COMPLETE</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-slate-400 tabular-nums">
                <div>Rows Read: <b className="text-white">{uploadResult.total_rows}</b></div>
                <div className="text-emerald-400">Ingested: <b>{uploadResult.successful_rows}</b></div>
                <div className="text-rose-400">Rejected: <b>{uploadResult.failed_rows}</b></div>
              </div>
            </div>

            {uploadResult.errors?.length > 0 && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-xs font-bold text-rose-300 mb-1">REJECTION REPORT:</p>
                <ul className="list-disc pl-4 text-[11px] text-rose-300 space-y-1">
                  {uploadResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFileUpload} className="space-y-4 font-mono">
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-cyan-500 transition-colors bg-slate-900/60">
              <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Select CSV or Excel (.xlsx) Dataset
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Required attributes: sku_code (or product_id), quantity_sold
              </p>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mt-4 block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-mono file:font-bold file:bg-cyan-500/15 file:text-cyan-300 hover:file:bg-cyan-500/25 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Download spec CSV
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider hover:bg-cyan-400 disabled:opacity-50"
                >
                  {uploading ? 'Ingesting...' : 'Ingest Batch'}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
