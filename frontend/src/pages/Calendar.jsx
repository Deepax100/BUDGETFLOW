import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { calendarAPI } from '../services/api';
import { useCurrency, formatDate } from '../lib/utils';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [dayData, setDayData] = useState({});
  const [selected, setSelected] = useState(null); // selected day key 'YYYY-MM-DD'
  const [loading, setLoading] = useState(true);
  const format = useCurrency();

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await calendarAPI.getMonth(monthStr);
      setDayData(data.data || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [monthStr]);

  useEffect(() => { loadData(); }, [loadData]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getDayKey = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const getDayInfo = (d) => {
    if (!d) return null;
    const key = getDayKey(d);
    const data = dayData[key];
    if (!data) return { key, empty: true };

    const totalExpense = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    return {
      key,
      empty: false,
      totalExpense,
      totalIncome,
      txCount: data.transactions.length,
      billingCount: data.billingEvents.length,
      usageCount: data.usageEvents.length,
      ...data,
    };
  };

  const isToday = (d) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d;
  };

  const selectedInfo = selected ? dayData[selected] : null;
  const selectedDate = selected ? new Date(selected + 'T00:00:00') : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Calendar</h1>
          <p className="text-dark-500 text-sm mt-1">See your daily transactions & subscription activity</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth}
            className="p-2 rounded-xl border border-dark-200 hover:bg-dark-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-dark-600" />
          </motion.button>
          <span className="text-lg font-bold text-dark-900 min-w-[160px] text-center">
            {MONTHS[month]} {year}
          </span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth}
            className="p-2 rounded-xl border border-dark-200 hover:bg-dark-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-dark-600" />
          </motion.button>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex-1 overflow-hidden"
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-dark-100">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-dark-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {cells.map((d, idx) => {
                const info = getDayInfo(d);
                const today = d ? isToday(d) : false;
                const isSelected = d ? getDayKey(d) === selected : false;

                return (
                  <div
                    key={idx}
                    onClick={() => d && info && !info.empty && setSelected(getDayKey(d))}
                    className={`min-h-[90px] p-2 border-b border-r border-dark-50 transition-all ${
                      d ? 'cursor-pointer hover:bg-primary-50/40' : 'bg-dark-50/30'
                    } ${isSelected ? 'bg-primary-50 ring-2 ring-inset ring-primary-400' : ''}`}
                  >
                    {d && (
                      <>
                        <div className={`w-7 h-7 flex items-center justify-center mb-1.5 rounded-full text-sm font-semibold transition-colors ${
                          today
                            ? 'bg-primary-600 text-white shadow-sm'
                            : isSelected
                            ? 'text-primary-700'
                            : 'text-dark-700'
                        }`}>
                          {d}
                        </div>

                        {/* Dots / badges */}
                        <div className="space-y-1">
                          {info && !info.empty && info.totalExpense > 0 && (
                            <div className="flex items-center gap-1 bg-red-50 rounded px-1.5 py-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              <span className="text-[10px] text-red-600 font-medium truncate">{format(info.totalExpense)}</span>
                            </div>
                          )}
                          {info && !info.empty && info.totalIncome > 0 && (
                            <div className="flex items-center gap-1 bg-green-50 rounded px-1.5 py-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                              <span className="text-[10px] text-green-600 font-medium truncate">{format(info.totalIncome)}</span>
                            </div>
                          )}
                          {info && !info.empty && info.billingCount > 0 && (
                            <div className="flex items-center gap-1 bg-amber-50 rounded px-1.5 py-0.5">
                              <CreditCard className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
                              <span className="text-[10px] text-amber-600 font-medium">{info.billingCount} billed</span>
                            </div>
                          )}
                          {info && !info.empty && info.usageCount > 0 && (
                            <div className="flex items-center gap-0.5 flex-wrap">
                              {info.usageEvents.slice(0, 3).map((ev, i) => (
                                <span key={i} title={ev.name} className="text-sm">{ev.icon}</span>
                              ))}
                              {info.usageCount > 3 && (
                                <span className="text-[10px] text-dark-400">+{info.usageCount - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Side Panel */}
        <AnimatePresence>
          {selected && selectedInfo && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="card w-80 flex-shrink-0 overflow-hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-100">
                <div>
                  <p className="font-semibold text-dark-800">
                    {selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-xs text-dark-400 mt-0.5">{selectedInfo.transactions?.length || 0} transactions</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[560px] overflow-y-auto">
                {/* Transactions */}
                {selectedInfo.transactions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Transactions</p>
                    <div className="space-y-2">
                      {selectedInfo.transactions.map((tx, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-50">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {tx.type === 'income'
                              ? <ArrowUpRight className="w-4 h-4 text-success-600" />
                              : <ArrowDownRight className="w-4 h-4 text-danger-500" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-800 truncate">{tx.description || tx.category}</p>
                            <p className="text-xs text-dark-400 capitalize">{tx.category}</p>
                          </div>
                          <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>
                            {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscriptions Billed */}
                {selectedInfo.billingEvents?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">💳 Subscription Billing</p>
                    <div className="space-y-2">
                      {selectedInfo.billingEvents.map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-amber-100 bg-amber-50">
                          <span className="text-xl flex-shrink-0">{ev.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-800">{ev.name}</p>
                            <p className="text-xs text-amber-600">Billing today</p>
                          </div>
                          <span className="text-sm font-bold text-amber-700 flex-shrink-0">{format(ev.cost)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscription Usage */}
                {selectedInfo.usageEvents?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">✅ Used Today</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedInfo.usageEvents.map((ev, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm"
                          style={{ borderColor: ev.color, backgroundColor: `${ev.color}15` }}>
                          <span>{ev.icon}</span>
                          <span className="font-medium" style={{ color: ev.color }}>{ev.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!selectedInfo.transactions?.length && !selectedInfo.billingEvents?.length && !selectedInfo.usageEvents?.length && (
                  <p className="text-center text-sm text-dark-400 py-8">No activity on this day</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="card p-4 flex flex-wrap gap-4 text-xs text-dark-500">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><span>Expenses</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-400" /><span>Income</span></div>
        <div className="flex items-center gap-2"><CreditCard className="w-3 h-3 text-amber-500" /><span>Subscription billed</span></div>
        <div className="flex items-center gap-2"><span>🎬</span><span>Subscription used (emoji = service)</span></div>
        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">1</div><span>Today</span></div>
      </div>
    </div>
  );
}
