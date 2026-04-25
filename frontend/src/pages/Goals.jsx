import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Target, TrendingUp, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import { goalsAPI } from '../services/api';
import { useCurrency, formatDate } from '../lib/utils';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addAmountId, setAddAmountId] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [form, setForm] = useState({ title: '', targetAmount: '', currentAmount: '', deadline: '', color: '#6366f1' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const format = useCurrency();

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const { data } = await goalsAPI.getAll();
      setGoals(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await goalsAPI.create(form);
      setModalOpen(false);
      setForm({ title: '', targetAmount: '', currentAmount: '', deadline: '', color: '#6366f1' });
      loadGoals();
    } catch (err) { console.error(err); }
  };

  const handleAddAmount = async (goalId) => {
    if (!addAmount) return;
    const goal = goals.find(g => g._id === goalId);
    try {
      await goalsAPI.update(goalId, { currentAmount: (goal.currentAmount || 0) + Number(addAmount) });
      setAddAmountId(null);
      setAddAmount('');
      loadGoals();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await goalsAPI.delete(id);
      setDeleteConfirmId(null);
      loadGoals();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Savings Goals</h1>
          <p className="text-dark-500 text-sm mt-1">Track progress toward your financial milestones</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {goals.map((goal, i) => (
            <motion.div
              key={goal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="card p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: goal.color || '#6366f1' }} />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${goal.color}15` }}>
                    <Target className="w-5 h-5" style={{ color: goal.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-800">{goal.title}</h3>
                    {goal.deadline && (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-dark-400" />
                        <span className="text-xs text-dark-400">{formatDate(goal.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {deleteConfirmId === goal._id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-dark-500">Sure?</span>
                    <button onClick={() => handleDelete(goal._id)} className="px-2 py-1 text-xs font-bold bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors">Yes</button>
                    <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 text-xs font-bold bg-dark-100 text-dark-600 rounded-lg hover:bg-dark-200 transition-colors">No</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirmId(goal._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-dark-300 hover:text-danger-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-dark-500">{format(goal.currentAmount)}</span>
                  <span className="font-semibold text-dark-800">{format(goal.targetAmount)}</span>
                </div>
                <div className="w-full h-3 bg-dark-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    transition={{ duration: 1.2, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                </div>
                <p className="text-xs text-dark-400 mt-2 text-right">{goal.percentage}% complete</p>
              </div>

              {/* Add funds */}
              {addAmountId === goal._id ? (
                <div className="flex gap-2">
                  <input type="number" min="1" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="input-field text-sm py-2" placeholder="Amount" autoFocus />
                  <button onClick={() => handleAddAmount(goal._id)} className="btn-primary text-sm py-2 px-4">Add</button>
                  <button onClick={() => { setAddAmountId(null); setAddAmount(''); }} className="btn-secondary text-sm py-2 px-3">✕</button>
                </div>
              ) : (
                <button onClick={() => setAddAmountId(goal._id)} className="w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Add Funds
                </button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Target className="w-12 h-12 text-dark-300 mx-auto mb-4" />
          <p className="text-dark-400 mb-4">No savings goals yet</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">Create your first goal</button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Savings Goal">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="label">Goal Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="e.g. Emergency Fund" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Target Amount</label>
              <input type="number" min="1" value={form.targetAmount} onChange={(e) => setForm(f => ({ ...f, targetAmount: e.target.value }))} className="input-field" placeholder="10000" required />
            </div>
            <div>
              <label className="label">Starting Amount</label>
              <input type="number" min="0" value={form.currentAmount} onChange={(e) => setForm(f => ({ ...f, currentAmount: e.target.value }))} className="input-field" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="label">Deadline (optional)</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                  style={{ backgroundColor: c, ringColor: c }} />
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3">Create Goal</button>
        </form>
      </Modal>
    </div>
  );
}
