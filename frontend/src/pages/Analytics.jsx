import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { analyticsAPI } from '../services/api';
import { useCurrency } from '../lib/utils';

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const format = useCurrency();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sumRes, chartRes, insRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getCharts(),
        analyticsAPI.getInsights(),
      ]);
      setSummary(sumRes.data.data);
      setCharts(chartRes.data.data);
      setInsights(insRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Analytics</h1>
        <p className="text-dark-500 text-sm mt-1">Detailed view of your financial data</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Income', value: summary?.income, color: 'text-success-500' },
          { label: 'Expenses', value: summary?.expense, color: 'text-danger-500' },
          { label: 'Balance', value: summary?.balance, color: 'text-primary-600' },
          { label: 'Health Score', value: `${summary?.healthScore || 0}/100`, color: 'text-accent-600' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
            <p className="text-xs font-medium text-dark-400 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>
              {typeof value === 'number' ? format(value) : value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <h3 className="text-sm font-semibold text-dark-400 mb-4">Spending by Category</h3>
          {charts?.categoryBreakdown?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={charts.categoryBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                    {charts.categoryBreakdown.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip formatter={(v) => format(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {charts.categoryBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-dark-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-dark-800">{format(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-[300px] flex items-center justify-center text-dark-400 text-sm">No expense data</div>}
        </motion.div>

        {/* Income vs Expense Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
          <h3 className="text-sm font-semibold text-dark-400 mb-4">Income vs Expenses (6 Months)</h3>
          {charts?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={charts.monthlyTrend} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => format(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={45} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={45} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[350px] flex items-center justify-center text-dark-400 text-sm">No trend data</div>}
        </motion.div>
      </div>

      {/* Savings Trend Area Chart */}
      {charts?.monthlyTrend?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card p-6">
          <h3 className="text-sm font-semibold text-dark-400 mb-4">Savings Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={charts.monthlyTrend.map(d => ({ ...d, savings: d.income - d.expense }))}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => format(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="savings" stroke="#6366f1" fill="url(#savingsGradient)" strokeWidth={3} name="Net Savings" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="card p-6">
        <h3 className="text-sm font-semibold text-dark-400 mb-4">Financial Insights</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${
              insight.type === 'danger' ? 'bg-red-50' : insight.type === 'warning' ? 'bg-amber-50' : insight.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
            }`}>
              <span className="text-lg">{insight.icon}</span>
              <p className="text-sm text-dark-700">{insight.message}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
