import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Shield, Zap, PiggyBank, TrendingUp, Wallet } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Visualize your spending patterns with beautiful interactive charts and insights.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Bank-level encryption keeps your financial data safe and private.' },
  { icon: Zap, title: 'Auto Categorize', desc: 'AI-powered categorization automatically sorts your transactions.' },
  { icon: PiggyBank, title: 'Budget Tracking', desc: 'Set budgets by category and track spending with real-time alerts.' },
  { icon: TrendingUp, title: 'Financial Health', desc: 'Get a personalized financial health score and improvement tips.' },
  { icon: Wallet, title: 'Savings Goals', desc: 'Set and track savings goals to reach your financial milestones.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">BudgetFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 opacity-80" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              ✨ Smart Personal Finance
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-dark-900 leading-tight mb-6">
              Master Your{' '}
              <span className="gradient-text">Money</span>
              <br />
              With Confidence
            </h1>
            <p className="text-lg md:text-xl text-dark-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Track expenses, set budgets, and gain powerful insights into your financial health. 
              Built for people who want to take control of their finances.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                Start Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3">
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { num: '10K+', label: 'Active Users' },
              { num: '$2M+', label: 'Tracked' },
              { num: '99.9%', label: 'Uptime' },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold gradient-text">{num}</p>
                <p className="text-sm text-dark-400 mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-dark-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">
              Everything you need to{' '}
              <span className="gradient-text">manage money</span>
            </h2>
            <p className="text-dark-500 text-lg max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your finances.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="card p-8 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-dark-900 mb-2">{title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to take control?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of users already managing their money smarter with BudgetFlow.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-base">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-dark-700">BudgetFlow</span>
          </div>
          <p className="text-sm text-dark-400">© 2026 BudgetFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
