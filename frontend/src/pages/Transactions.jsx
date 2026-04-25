import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, Pencil, Trash2, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../components/Modal';
import { transactionsAPI, analyticsAPI } from '../services/api';
import { useCurrency, formatDate } from '../lib/utils';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 15 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState({ income: [], expense: [] });

  const [form, setForm] = useState({ type: 'expense', category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const format = useCurrency();

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, [pagination.page, typeFilter]);

  const loadCategories = async () => {
    try {
      const { data } = await analyticsAPI.getCategories();
      setCategories(data.data);
    } catch (err) { console.error(err); }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      const { data } = await transactionsAPI.getAll(params);
      setTransactions(data.data);
      setPagination(p => ({ ...p, ...data.pagination }));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    loadTransactions();
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ type: 'expense', category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    setModalOpen(true);
  };

  const openEdit = (tx) => {
    setEditing(tx);
    setForm({ type: tx.type, category: tx.category, amount: tx.amount, description: tx.description || '', date: new Date(tx.date).toISOString().split('T')[0] });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await transactionsAPI.update(editing._id, form);
      } else {
        await transactionsAPI.create(form);
      }
      setModalOpen(false);
      loadTransactions();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await transactionsAPI.delete(id);
      setDeleteConfirmId(null);
      loadTransactions();
    } catch (err) { console.error(err); }
  };

  const handleExport = async () => {
    try {
      const { data } = await transactionsAPI.export();
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  const currentCategories = form.type === 'income' ? categories.income : categories.expense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Transactions</h1>
          <p className="text-dark-500 text-sm mt-1">{pagination.total} total transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search transactions..." />
        </form>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="input-field w-auto min-w-[140px]">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-100">
                    <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-6 py-4">Transaction</th>
                    <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-6 py-4">Category</th>
                    <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-6 py-4">Date</th>
                    <th className="text-right text-xs font-semibold text-dark-400 uppercase tracking-wider px-6 py-4">Amount</th>
                    <th className="text-right text-xs font-semibold text-dark-400 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <motion.tr key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                            {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-success-500" /> : <ArrowDownRight className="w-4 h-4 text-danger-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark-800">{tx.description || tx.category}</p>
                            <p className="text-xs text-dark-400 capitalize">{tx.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs bg-dark-100 text-dark-600 px-2.5 py-1 rounded-lg font-medium">{tx.category}</span></td>
                      <td className="px-6 py-4 text-sm text-dark-500">{formatDate(tx.date)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>
                          {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {deleteConfirmId === tx._id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-xs text-dark-500 mr-1">Sure?</span>
                            <button
                              onClick={() => handleDelete(tx._id)}
                              className="px-2.5 py-1 text-xs font-bold bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 text-xs font-bold bg-dark-100 text-dark-600 rounded-lg hover:bg-dark-200 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(tx)} className="p-2 rounded-lg hover:bg-primary-50 text-dark-400 hover:text-primary-600 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirmId(tx._id)} className="p-2 rounded-lg hover:bg-red-50 text-dark-400 hover:text-danger-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-dark-100">
                <p className="text-sm text-dark-500">Page {pagination.page} of {pagination.pages}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-dark-400 mb-4">No transactions found</p>
            <button onClick={openCreate} className="btn-primary text-sm">Add your first transaction</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'expense', category: '' }))}
              className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.type === 'expense' ? 'border-danger-500 bg-red-50 text-danger-600' : 'border-dark-200 text-dark-400'}`}>
              Expense
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'income', category: '' }))}
              className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.type === 'income' ? 'border-success-500 bg-green-50 text-success-600' : 'border-dark-200 text-dark-400'}`}>
              Income
            </button>
          </div>
          <div>
            <label className="label">Amount</label>
            <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" placeholder="0.00" required />
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="input-field" required>
              <option value="">Select category</option>
              {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" placeholder="Optional description" />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" required />
          </div>
          <button type="submit" className="btn-primary w-full py-3">{editing ? 'Update' : 'Add'} Transaction</button>
        </form>
      </Modal>
    </div>
  );
}
