import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Zap, RefreshCw, Sparkles, Calendar,
  TrendingUp, AlertTriangle, CheckCircle, X, ChevronDown,
  BarChart2, CreditCard
} from 'lucide-react';
import { subscriptionsAPI } from '../services/api';
import Modal from '../components/Modal';
import { useCurrency } from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// ─── Colours/icons available in manual form ─────────────────────────────────
const COLOR_PALETTE = ['#6366f1','#8b5cf6','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316','#3b82f6'];
const CATEGORY_ICONS = { streaming:'🎬', music:'🎵', productivity:'💼', gaming:'🎮', fitness:'💪', news:'📰', cloud:'☁️', education:'📚', other:'📦' };
const CATEGORIES = ['streaming','music','productivity','gaming','fitness','news','cloud','education','other'];

// ─── Usage health helper ─────────────────────────────────────────────────────
function getUsageHealth(count, billingCycle) {
  const threshold = billingCycle === 'annual' ? count / 3 : count; // for annual, look at monthly avg
  if (threshold === 0) return { label: 'Never used', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-600', dot: '🔴' };
  if (threshold <= 3) return { label: 'Rarely used', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', dot: '🟡' };
  if (threshold <= 10) return { label: 'Occasionally', color: '#22c55e', bg: 'bg-green-50', text: 'text-green-600', dot: '🟢' };
  return { label: 'Actively used', color: '#16a34a', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: '✅' };
}

// ─── A single subscription card ──────────────────────────────────────────────
function SubCard({ sub, onLogUsage, onDelete, loggedToday }) {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const format = useCurrency();
  const health = getUsageHealth(sub.usageThisMonth, sub.billingCycle);

  const loadHistory = async () => {
    if (history) return setExpanded(e => !e);
    const { data } = await subscriptionsAPI.getUsageHistory(sub._id);
    setHistory(data.data);
    setExpanded(true);
  };

  const renewalLabel = () => {
    const d = sub.daysUntilRenewal;
    if (d === null) return null;
    if (d === 0) return { text: 'Renews today!', urgent: true };
    if (d <= 3) return { text: `Renews in ${d}d`, urgent: true };
    return { text: `${d} days left`, urgent: false };
  };

  const renewal = renewalLabel();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className="card overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1.5" style={{ backgroundColor: sub.color }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-dark-100"
              style={{ backgroundColor: `${sub.color}15` }}>
              {sub.icon}
            </div>
            <div>
              <h3 className="font-semibold text-dark-800 leading-tight">{sub.name}</h3>
              <span className="text-xs text-dark-400 capitalize">{sub.category}</span>
            </div>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-dark-500">Sure?</span>
              <button onClick={() => onDelete(sub._id)} className="px-2 py-1 text-xs font-bold bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 text-xs font-bold bg-dark-100 text-dark-600 rounded-lg hover:bg-dark-200 transition-colors">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cost + billing */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-xl font-bold text-dark-900">{format(sub.cost)}</span>
          <span className="text-xs text-dark-400">/{sub.billingCycle === 'annual' ? 'yr' : sub.billingCycle === 'weekly' ? 'wk' : 'mo'}</span>
          {sub.billingCycle !== 'monthly' && (
            <span className="text-xs text-dark-400 ml-1">({format(sub.monthlyCost)}/mo)</span>
          )}
        </div>

        {/* Renewal badge */}
        {renewal && (
          <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full mb-3 font-medium ${
            renewal.urgent ? 'bg-red-50 text-red-600' : 'bg-dark-50 text-dark-500'
          }`}>
            <Calendar className="w-3 h-3" />
            {renewal.text}
          </div>
        )}

        {/* Usage health bar */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-4 ${health.bg}`}>
          <div className="flex items-center gap-2">
            <span className="text-base">{health.dot}</span>
            <div>
              <p className={`text-xs font-semibold ${health.text}`}>{health.label}</p>
              <p className="text-xs text-dark-400">{sub.usageThisMonth} sessions this month</p>
            </div>
          </div>
        </div>

        {/* Usage log progress dots (last 7 days) */}
        <UsageDots usageLogs={sub.usageLogs} />

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onLogUsage(sub._id)}
            disabled={loggedToday}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
              loggedToday
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                : 'btn-primary'
            }`}
          >
            {loggedToday ? <><CheckCircle className="w-4 h-4" /> Used today!</> : <><Zap className="w-4 h-4" /> Log Usage</>}
          </motion.button>
          <button onClick={loadHistory}
            className="p-2 rounded-xl border border-dark-200 text-dark-400 hover:text-dark-700 hover:border-dark-400 transition-colors">
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable usage history chart */}
      <AnimatePresence>
        {expanded && history && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-dark-100 px-5 pb-5 pt-4 overflow-hidden"
          >
            <p className="text-xs font-medium text-dark-500 mb-3">6-Month Usage</p>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={history} barSize={20}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {history.map((_, i) => <Cell key={i} fill={sub.color} opacity={0.6 + i * 0.07} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Last 7 days usage dots
function UsageDots({ usageLogs }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const used = usageLogs?.some((l) => {
      const ld = new Date(l.date);
      ld.setHours(0, 0, 0, 0);
      return ld.getTime() === d.getTime();
    });
    return { used, label: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()] };
  });

  return (
    <div className="flex gap-1.5 items-center">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={`w-5 h-5 rounded-full transition-all ${d.used ? 'bg-emerald-400' : 'bg-dark-100'}`} />
          <span className="text-[9px] text-dark-400">{d.label}</span>
        </div>
      ))}
      <span className="text-xs text-dark-400 ml-1">last 7d</span>
    </div>
  );
}

// ─── Detect panel ────────────────────────────────────────────────────────────
function DetectPanel({ onAdd, onClose }) {
  const [detected, setDetected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionsAPI.detect().then(({ data }) => {
      setDetected(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-dark-800">Auto-Detected Subscriptions</h3>
          <p className="text-xs text-dark-400 mt-0.5">Found from your transaction history</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : detected.length === 0 ? (
        <div className="text-center py-8 text-dark-400 text-sm">
          <p>No subscriptions detected from transactions.</p>
          <p className="text-xs mt-1">Add some expense transactions first.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {detected.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl border border-dark-100 hover:border-primary-200 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{d.icon}</span>
                <div>
                  <p className="font-medium text-sm text-dark-800">{d.name}</p>
                  <p className="text-xs text-dark-400">Seen {d.matchCount}× · Last: {new Date(d.lastSeen).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-dark-700">{format(d.suggestedCost)}</span>
                <button onClick={() => onAdd(d)} className="btn-primary text-xs py-1.5 px-3">Add</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', category: 'streaming', cost: '', billingCycle: 'monthly', startDate: new Date().toISOString().split('T')[0], color: '#6366f1', icon: '📦', notes: '' };

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState({ totalMonthly: 0, totalAnnual: 0, count: 0, underused: 0 });
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [detectOpen, setDetectOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loggedToday, setLoggedToday] = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await subscriptionsAPI.getAll();
      setSubs(data.data);
      setStats(data.stats);
      const today = new Date(); today.setHours(0,0,0,0);
      const todayMap = {};
      data.data.forEach(s => {
        todayMap[s._id] = s.usageLogs?.some(l => {
          const d = new Date(l.date); d.setHours(0,0,0,0);
          return d.getTime() === today.getTime();
        });
      });
      setLoggedToday(todayMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const format = useCurrency();

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.startDate) delete payload.startDate;
      await subscriptionsAPI.create(payload);
      setAddOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) { 
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to add subscription");
    }
  };

  const handleLogUsage = async (id) => {
    await subscriptionsAPI.logUsage(id);
    setLoggedToday(prev => ({ ...prev, [id]: true }));
    load();
  };

  const handleDelete = async (id) => {
    await subscriptionsAPI.delete(id);
    load();
  };

  const handleDetectedAdd = async (detected) => {
    await subscriptionsAPI.create({
      name: detected.name,
      category: detected.category,
      cost: detected.suggestedCost,
      billingCycle: 'monthly',
      color: detected.color,
      icon: detected.icon,
      transactionKeyword: detected.keyword,
      autoDetected: true,
    });
    setDetectOpen(false);
    load();
  };

  const handleCategoryChange = (cat) => {
    const icon = CATEGORY_ICONS[cat] || '📦';
    setForm(f => ({ ...f, category: cat, icon }));
  };

  // Upcoming renewals (next 14 days)
  const upcoming = subs
    .filter(s => s.daysUntilRenewal !== null && s.daysUntilRenewal <= 14)
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Subscriptions</h1>
          <p className="text-dark-500 text-sm mt-1">Track what you pay for and how much you actually use it</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDetectOpen(true)}
            className="btn-secondary flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" /> Auto-Detect
          </button>
          <button onClick={() => setAddOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Subscription
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Cost', value: format(stats.totalMonthly), icon: CreditCard, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Yearly Cost', value: format(stats.totalAnnual), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Subs', value: stats.count, icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Underused', value: stats.underused, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-dark-400">{s.label}</p>
              <p className="text-lg font-bold text-dark-900">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Health Pie Chart */}
      {subs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 border-2 border-dark-100">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-dark-900 mb-2">Cost vs. Usage Health</h3>
              <p className="text-sm text-dark-500 mb-6 leading-relaxed">
                This chart breaks down your monthly subscription spending. The slice <strong className="text-dark-800">size</strong> represents cost, while the <strong className="text-dark-800">color</strong> represents usage. Red slices are expensive subscriptions that you rarely use!
              </p>
              <div className="space-y-3 p-4 bg-dark-50 rounded-xl">
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" /> <span className="text-sm font-medium text-dark-700">Negligible usage (🔴 Consider canceling)</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" /> <span className="text-sm font-medium text-dark-700">Moderate usage (🟡 Monitor)</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" /> <span className="text-sm font-medium text-dark-700">Active usage (🟢 Worth the cost)</span></div>
              </div>
            </div>
            <div className="w-full md:w-1/2 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subs.map(s => {
                      const h = getUsageHealth(s.usageThisMonth, s.billingCycle);
                      return { name: s.name, value: s.monthlyCost, fill: h.color };
                    })}
                    cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value"
                  >
                    {subs.map((s, i) => {
                      const h = getUsageHealth(s.usageThisMonth, s.billingCycle);
                      return <Cell key={i} fill={h.color} />;
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => format(val)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming renewals alert */}
      {upcoming.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card p-4 border border-amber-200 bg-amber-50/60">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">Upcoming Renewals (Next 14 Days)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {upcoming.map(s => (
              <div key={s._id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-amber-100 text-sm shadow-sm">
                <span>{s.icon}</span>
                <span className="font-medium text-dark-700">{s.name}</span>
                <span className="text-dark-400">·</span>
                <span className={`font-semibold ${s.daysUntilRenewal <= 3 ? 'text-red-500' : 'text-amber-600'}`}>
                  {s.daysUntilRenewal === 0 ? 'Today' : `${s.daysUntilRenewal}d`}
                </span>
                <span className="text-dark-400">{format(s.cost)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Subscriptions grid */}
      {subs.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {subs.map(sub => (
              <SubCard
                key={sub._id}
                sub={sub}
                onLogUsage={handleLogUsage}
                onDelete={handleDelete}
                loggedToday={loggedToday[sub._id] || false}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card p-14 text-center">
          <CreditCard className="w-12 h-12 text-dark-200 mx-auto mb-4" />
          <p className="font-medium text-dark-500 mb-1">No subscriptions tracked yet</p>
          <p className="text-sm text-dark-400 mb-5">Add them manually or let us detect them from your transactions</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setDetectOpen(true)} className="btn-secondary text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Auto-Detect
            </button>
            <button onClick={() => setAddOpen(true)} className="btn-primary text-sm">+ Add Manually</button>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Subscription">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-field" placeholder="e.g. Netflix" required />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={e => handleCategoryChange(e.target.value)} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Billing Cycle</label>
              <select value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))} className="input-field">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="label">Cost</label>
              <input type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                className="input-field" placeholder="9.99" required />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Icon (emoji)</label>
              <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                className="input-field text-2xl" maxLength={2} />
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {COLOR_PALETTE.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" placeholder="e.g. Family plan" />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Add Subscription</button>
        </form>
      </Modal>

      {/* Auto-detect Modal */}
      <Modal isOpen={detectOpen} onClose={() => setDetectOpen(false)} title="">
        <DetectPanel onAdd={handleDetectedAdd} onClose={() => setDetectOpen(false)} />
      </Modal>
    </div>
  );
}
