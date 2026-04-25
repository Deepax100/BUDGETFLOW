import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCurrency } from '../lib/utils';

export default function DashboardCard({ title, value, icon: Icon, trend, trendValue, color = 'primary', delay = 0 }) {
  const format = useCurrency();
  const colorMap = {
    primary: 'from-primary-500 to-primary-600',
    green: 'from-success-500 to-success-600',
    red: 'from-danger-400 to-danger-500',
    purple: 'from-accent-500 to-accent-600',
    cyan: 'from-cyan-500 to-cyan-600',
  };

  const bgMap = {
    primary: 'bg-primary-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
    cyan: 'bg-cyan-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card p-6 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <p className="text-2xl font-bold text-dark-900">
            {typeof value === 'number' ? format(value) : value}
          </p>
          {trendValue !== undefined && (
            <div className="flex items-center gap-1.5">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-success-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-danger-500" />
              ) : (
                <Minus className="w-4 h-4 text-dark-400" />
              )}
              <span className={`text-xs font-semibold ${
                trend === 'up' ? 'text-success-500' : trend === 'down' ? 'text-danger-500' : 'text-dark-400'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${bgMap[color]} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 bg-gradient-to-br ${colorMap[color]} bg-clip-text`} style={{ color: color === 'primary' ? '#6366f1' : color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : color === 'purple' ? '#8b5cf6' : '#06b6d4' }} />
        </div>
      </div>
    </motion.div>
  );
}
