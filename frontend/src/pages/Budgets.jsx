import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { budgetsAPI, analyticsAPI } from '../services/api';
import { useCurrency } from '../lib/utils';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: '', monthlyLimit: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const format = useCurrency();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetRes, catRes] = await Promise.all([
        budgetsAPI.getAll(),
        analyticsAPI.getCategories()
      ]);
      setBudgets(budgetRes.data.data);
      setCategories(catRes.data.data.expense);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await budgetsAPI.create(form);
      setModalOpen(false);
      setForm({ category: '', monthlyLimit: '' });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await budgetsAPI.delete(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err) { console.error(err); }
  };

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'bg-danger-500';
    if (pct >= 80) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getProgressBg = (pct) => {
    if (pct >= 100) return 'bg-red-50';
    if (pct >= 80) return 'bg-amber-50';
    return 'bg-green-50';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Budgets</h1>
          <p className="text-dark-500 text-sm mt-1">Set monthly spending limits by category</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Budget
        </button>
      </div>

      {budgets.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-5">
          {budgets.map((budget, i) => (
            <motion.div
              key={budget._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-dark-800">{budget.category}</h3>
                  <p className="text-sm text-dark-400 mt-0.5">
                    {format(budget.spent)} of {format(budget.monthlyLimit)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    budget.percentage >= 100 ? 'bg-red-100 text-danger-600' : budget.percentage >= 80 ? 'bg-amber-100 text-warning-600' : 'bg-green-100 text-success-600'
                  }`}>
                    {budget.percentage}%
                  </span>
                  {deleteConfirmId === budget._id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-dark-500">Sure?</span>
                      <button onClick={() => handleDelete(budget._id)} className="px-2 py-1 text-xs font-bold bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors">Yes</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 text-xs font-bold bg-dark-100 text-dark-600 rounded-lg hover:bg-dark-200 transition-colors">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(budget._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-dark-400 hover:text-danger-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className={`w-full h-3 rounded-full ${getProgressBg(budget.percentage)} overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                  className={`h-full rounded-full ${getProgressColor(budget.percentage)}`}
                />
              </div>

              <div className="flex items-center gap-2 mt-3">
                {budget.percentage >= 100 ? (
                  <><AlertTriangle className="w-4 h-4 text-danger-500" /><span className="text-xs text-danger-500 font-medium">Over budget!</span></>
                ) : budget.percentage >= 80 ? (
                  <><AlertTriangle className="w-4 h-4 text-warning-500" /><span className="text-xs text-warning-600 font-medium">Approaching limit</span></>
                ) : (
                  <><CheckCircle className="w-4 h-4 text-success-500" /><span className="text-xs text-success-600 font-medium">{format(budget.monthlyLimit - budget.spent)} remaining</span></>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-dark-400 mb-4">No budgets set yet</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">Create your first budget</button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Budget">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="input-field" required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit ($)</label>
            <input type="number" min="1" step="1" value={form.monthlyLimit} onChange={(e) => setForm(f => ({ ...f, monthlyLimit: e.target.value }))} className="input-field" placeholder="500" required />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Create Budget</button>
        </form>
      </Modal>
    </div>
  );
}
