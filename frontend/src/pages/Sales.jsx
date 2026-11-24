import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { ShoppingCart, Plus, Upload, Download, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Sale Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [saleForm, setSaleForm] = useState({
    product_id: '',
    quantity_sold: 1,
    sale_date: new Date().toISOString().split('T')[0],
    region: 'North',
    total_amount: '',
  });

  // Bulk CSV Upload Modal
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
      setUploadError('Please select a CSV or Excel file.');
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
      setUploadError(err.response?.data?.detail || 'File upload failed.');
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
      link.setAttribute('download', 'sales_upload_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales & Demand History</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer transaction history and feed actuals into the ML engine</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            CSV Template
          </button>
          <button
            onClick={() => {
              setSelectedFile(null);
              setUploadResult(null);
              setUploadError('');
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Bulk Import CSV
          </button>
          <button
            onClick={() => {
              setFormError('');
              setIsManualModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Record Single Sale
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No historical sales transactions recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Qty Sold</th>
                  <th className="py-3 px-4 text-right">Revenue ($)</th>
                  <th className="py-3 px-4 text-center">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.sale_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      #{sale.sale_id}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-600">
                      {sale.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {sale.product?.product_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                      {sale.quantity_sold}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">
                      ${sale.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
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

      {/* Record Manual Sale Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Record Single Sale Transaction"
      >
        {formError && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleManualSaleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Select Product *</label>
            <select
              value={saleForm.product_id}
              onChange={(e) => setSaleForm({ ...saleForm, product_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Quantity Sold *</label>
              <input
                type="number"
                min="1"
                required
                value={saleForm.quantity_sold}
                onChange={(e) => setSaleForm({ ...saleForm, quantity_sold: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sale Date *</label>
              <input
                type="date"
                required
                value={saleForm.sale_date}
                onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Region</label>
              <select
                value={saleForm.region}
                onChange={(e) => setSaleForm({ ...saleForm, region: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Total Amount ($) [Optional]</label>
              <input
                type="number"
                step="0.01"
                placeholder="Auto-calculated if empty"
                value={saleForm.total_amount}
                onChange={(e) => setSaleForm({ ...saleForm, total_amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
            <strong>Inventory Note:</strong> Recording this sale will automatically decrement the sold units from real-time product inventory.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Record Sale'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Bulk Import Sales via CSV / Excel"
      >
        {uploadError && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadResult ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Import Finished</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-slate-600 tabular-nums">
                <div>Total rows: <b>{uploadResult.total_rows}</b></div>
                <div className="text-emerald-600">Imported: <b>{uploadResult.successful_rows}</b></div>
                <div className="text-rose-600">Failed: <b>{uploadResult.failed_rows}</b></div>
              </div>
            </div>

            {uploadResult.errors?.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-rose-800 mb-1">Errors Encountered:</p>
                <ul className="list-disc pl-4 text-[11px] text-rose-700 space-y-1">
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
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">
                Choose CSV or Excel (.xlsx) file to upload
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Required columns: sku_code (or product_id), quantity_sold
              </p>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mt-4 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                Download sample CSV
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Processing File...' : 'Upload & Process'}
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
