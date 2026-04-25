import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Percent, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { analyticsAPI, transactionsAPI } from '../services/api';
import { useCurrency, formatDate, getGreeting } from '../lib/utils';
import useAuthStore from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const format = useCurrency();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sumRes, chartRes, txRes, insRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getCharts(),
        transactionsAPI.getAll({ limit: 5 }),
        analyticsAPI.getInsights(),
      ]);
      setSummary(sumRes.data.data);
      setCharts(chartRes.data.data);
      setTransactions(txRes.data.data);
      setInsights(insRes.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-dark-900">{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
        <p className="text-dark-500 mt-1">Here's your financial overview</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard title="Total Balance" value={summary?.balance || 0} icon={DollarSign} color="primary" delay={0} />
        <DashboardCard title="Monthly Income" value={summary?.income || 0} icon={TrendingUp} color="green" delay={0.1} />
        <DashboardCard title="Monthly Expenses" value={summary?.expense || 0} icon={TrendingDown} color="red" delay={0.2} />
        <DashboardCard title="Savings Rate" value={`${summary?.savingsRate || 0}%`} icon={Percent} color="purple" delay={0.3} />
      </div>

      {/* Health Score + Insights */}
      <div className="grid lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <h3 className="text-sm font-semibold text-dark-400 mb-4">Financial Health</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={summary?.healthScore >= 70 ? '#22c55e' : summary?.healthScore >= 40 ? '#f59e0b' : '#ef4444'} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(summary?.healthScore || 0) * 3.27} 327`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-dark-900">{summary?.healthScore || 0}</span>
                  <p className="text-xs text-dark-400">/ 100</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-dark-500 mt-4">
            {summary?.healthScore >= 70 ? 'Great financial health! 🎉' : summary?.healthScore >= 40 ? 'Room for improvement 💪' : 'Needs attention ⚠️'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-dark-400 mb-4">Smart Insights</h3>
          <div className="space-y-3">
            {insights.length > 0 ? insights.map((insight, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${
                insight.type === 'danger' ? 'bg-red-50' : insight.type === 'warning' ? 'bg-amber-50' : insight.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <span className="text-lg flex-shrink-0">{insight.icon}</span>
                <p className="text-sm text-dark-700">{insight.message}</p>
              </div>
            )) : (
              <p className="text-sm text-dark-400">Add transactions to see insights.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card p-6">
          <h3 className="text-sm font-semibold text-dark-400 mb-4">Spending by Category</h3>
          {charts?.categoryBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={charts.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name">
                  {charts.categoryBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => format(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-dark-400 text-sm">No expense data yet</div>
          )}
          {charts?.categoryBreakdown?.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {charts.categoryBreakdown.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-dark-500">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="card p-6">
          <h3 className="text-sm font-semibold text-dark-400 mb-4">Monthly Trend</h3>
          {charts?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.monthlyTrend} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => format(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-dark-400 text-sm">No trend data yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="card p-6">
        <h3 className="text-sm font-semibold text-dark-400 mb-4">Recent Transactions</h3>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx._id} className="flex items-center justify-between py-3 border-b border-dark-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-success-500" /> : <ArrowDownRight className="w-5 h-5 text-danger-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-800">{tx.description || tx.category}</p>
                    <p className="text-xs text-dark-400">{tx.category} • {formatDate(tx.date)}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-dark-400 text-center py-8">No transactions yet. Add your first one!</p>
        )}
      </motion.div>
    </div>
  );
}
