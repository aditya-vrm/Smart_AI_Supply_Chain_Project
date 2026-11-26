import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { ShoppingCart, Plus, Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

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
      console.error('Failed to load sales:', err);
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
      setFormError(err.response?.data?.detail || 'Error recording sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a valid CSV file.');
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
      setUploadError(err.response?.data?.detail || 'Failed to import CSV.');
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
      link.setAttribute('download', 'sales_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand/15">
        <div>
          <h2 className="text-xl font-bold text-sand-50 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple" />
            Sales Transactions
          </h2>
          <p className="text-xs text-sand/65 mt-1">Record sales orders, monitor revenue, and upload bulk transaction batches</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sand/20 glass-card text-sand text-xs hover:text-sand-50 hover:border-sand/40 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-purple" />
            <span>CSV Template</span>
          </button>
          <button
            onClick={() => {
              setSelectedFile(null);
              setUploadResult(null);
              setUploadError('');
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple/40 bg-purple/15 text-purple-light text-xs font-semibold hover:bg-purple/25 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => {
              setFormError('');
              setIsManualModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple text-white text-xs font-semibold hover:bg-purple-hover transition-all shadow-lg shadow-purple/30"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 text-sand/60 text-xs">
            No sales records found. Record your first sale or upload a CSV file.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-900/80 text-sand/70 border-b border-sand/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Units Sold</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-center">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10 font-sans">
                {sales.map((sale) => (
                  <tr key={sale.sale_id} className="hover:bg-forest-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sand/60">
                      #{sale.sale_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-sand/80">
                      {sale.sale_date.split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sand-50 tracking-wider">
                      {sale.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-sand-50">
                      {sale.product?.product_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sand-50 tabular-nums">
                      {sale.quantity_sold}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sand-50 tabular-nums">
                      ${sale.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] bg-forest-900/80 text-sand/80 border border-sand/15">
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
        title="Record New Sale"
      >
        {formError && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleManualSaleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sand/80 mb-1">Product *</label>
            <select
              required
              value={saleForm.product_id}
              onChange={(e) => setSaleForm({ ...saleForm, product_id: e.target.value })}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id} className="bg-forest-900 text-sand">
                  {p.sku_code} - {p.product_name} (${p.unit_price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Quantity Sold *</label>
              <input
                type="number"
                min="1"
                required
                value={saleForm.quantity_sold}
                onChange={(e) => setSaleForm({ ...saleForm, quantity_sold: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono tabular-nums focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Date *</label>
              <input
                type="date"
                required
                value={saleForm.sale_date}
                onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Region *</label>
              <select
                value={saleForm.region}
                onChange={(e) => setSaleForm({ ...saleForm, region: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs focus:outline-none"
              >
                <option value="North" className="bg-forest-900 text-sand">North</option>
                <option value="South" className="bg-forest-900 text-sand">South</option>
                <option value="East" className="bg-forest-900 text-sand">East</option>
                <option value="West" className="bg-forest-900 text-sand">West</option>
                <option value="Central" className="bg-forest-900 text-sand">Central</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Total Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Auto-calculated if blank"
                value={saleForm.total_amount}
                onChange={(e) => setSaleForm({ ...saleForm, total_amount: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono tabular-nums focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-sand/15">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-sand/20 text-xs text-sand/70 hover:text-sand-50 hover:bg-forest-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-purple hover:bg-purple-hover text-white text-xs font-semibold shadow-lg shadow-purple/30 disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Record Sale'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Import Sales (CSV)"
      >
        {uploadError && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadResult && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs space-y-1">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Import Completed Successfully!</span>
            </div>
            <p className="text-sand/80 font-mono">
              Inserted: <span className="font-bold text-sand-50">{uploadResult.inserted_rows}</span> / Total: {uploadResult.total_rows}
            </p>
            {uploadResult.errors?.length > 0 && (
              <div className="mt-2 text-amber-300 text-[11px]">
                <p className="font-semibold">Warnings / Errors ({uploadResult.errors.length}):</p>
                <ul className="list-disc pl-4 space-y-0.5 mt-1">
                  {uploadResult.errors.slice(0, 3).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {uploadResult.errors.length > 3 && <li>...and {uploadResult.errors.length - 3} more</li>}
                </ul>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-sand/20 hover:border-purple/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-forest-900/40">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="hidden"
              id="csvFileInput"
            />
            <label htmlFor="csvFileInput" className="cursor-pointer block">
              <FileSpreadsheet className="w-8 h-8 text-purple mx-auto mb-2" />
              <span className="text-xs font-semibold text-sand-50 block">
                {selectedFile ? selectedFile.name : 'Click to select CSV file'}
              </span>
              <span className="text-[11px] text-sand/50 block mt-1">
                Supported columns: sku_code, quantity, sale_date, region, total_amount
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-sand/15">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-sand/20 text-xs text-sand/70 hover:text-sand-50 hover:bg-forest-850"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-4 py-2 rounded-xl bg-purple hover:bg-purple-hover text-white text-xs font-semibold shadow-lg shadow-purple/30 disabled:opacity-50"
            >
              {uploading ? 'Processing File...' : 'Start Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
