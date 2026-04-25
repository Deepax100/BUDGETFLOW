import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Globe, Save, LogOut, Lock, Eye, EyeOff,
  Sun, Moon, Trash2, ShieldCheck, AlertTriangle, ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Dark mode helper (stores in localStorage + adds class to <html>)
function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('bf_dark') === 'true');

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bf_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bf_dark', 'false');
    }
  }, [dark]);

  return [dark, setDark];
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium text-white ${
        type === 'success' ? 'bg-success-500' : 'bg-danger-500'
      }`}
    >
      {type === 'success' ? '✅' : '❌'} {msg}
    </motion.div>
  );
}

function Section({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-6 space-y-5"
    >
      <div>
        <h3 className="font-semibold text-dark-800 text-base">{title}</h3>
        {subtitle && <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dark, setDark] = useDarkMode();

  // Form states
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', currency: user?.currency || 'USD' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  const [resetConfirm, setResetConfirm] = useState(null); // 'transactions' | 'subscriptions' | 'all'
  const [resetting, setResetting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await authAPI.updateMe(profileForm);
      updateUser(data.user);
      showToast('Profile saved successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving profile', 'error');
    } finally { setSavingProfile(false); }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return showToast('New passwords do not match', 'error');
    }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error changing password', 'error');
    } finally { setSavingPw(false); }
  };

  // Reset data
  const handleReset = async (type) => {
    setResetting(true);
    try {
      await authAPI.resetData(type);
      setResetConfirm(null);
      showToast(`${type === 'all' ? 'All data' : type === 'transactions' ? 'Transactions' : 'Subscriptions'} reset successfully!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error resetting data', 'error');
    } finally { setResetting(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const CURRENCIES = [
    { code: 'USD', label: 'USD — US Dollar ($)' },
    { code: 'INR', label: 'INR — Indian Rupee (₹)' },
    { code: 'EUR', label: 'EUR — Euro (€)' },
    { code: 'GBP', label: 'GBP — British Pound (£)' },
    { code: 'JPY', label: 'JPY — Japanese Yen (¥)' },
    { code: 'CAD', label: 'CAD — Canadian Dollar (C$)' },
    { code: 'AUD', label: 'AUD — Australian Dollar (A$)' },
    { code: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
    { code: 'AED', label: 'AED — UAE Dirham (د.إ)' },
    { code: 'CHF', label: 'CHF — Swiss Franc (Fr)' },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold text-dark-900">Settings</h1>
        <p className="text-dark-500 text-sm mt-1">Manage your account, appearance & data</p>
      </div>

      {/* Profile Section */}
      <Section title="Profile" subtitle="Update your name and display preferences" delay={0}>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                className="input-field pl-11"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="email"
                value={user?.email || ''}
                className="input-field pl-11 bg-dark-50 cursor-not-allowed opacity-60"
                disabled
              />
            </div>
            <p className="text-xs text-dark-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Currency</label>

            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none z-10" />

              <select
                value={profileForm.currency}
                onChange={(e) =>
                  setProfileForm((f) => ({
                    ...f,
                    currency: e.target.value
                  }))
                }
                className="input-field pl-14 pr-10 appearance-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-dark-400 mt-1">
              This will update all currency displays across the app
            </p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="btn-primary flex items-center gap-2"
          >
            {savingProfile ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Profile
          </button>
        </form>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" subtitle="Choose your preferred theme" delay={0.05}>
        <div className="flex items-center justify-between p-4 bg-dark-50 rounded-2xl">
          <div className="flex items-center gap-3">
            {dark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="text-sm font-semibold text-dark-800">{dark ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-xs text-dark-400">Toggle between light and dark theme</p>
            </div>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${dark ? 'bg-primary-600' : 'bg-dark-300'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Security" subtitle="Change your account password" delay={0.1}>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password', pwKey: 'current' },
            { key: 'newPassword', label: 'New Password', pwKey: 'new' },
            { key: 'confirmPassword', label: 'Confirm New Password', pwKey: 'confirm' },
          ].map(({ key, label, pwKey }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type={showPw[pwKey] ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={(e) => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                  required
                  minLength={key !== 'currentPassword' ? 6 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => ({ ...p, [pwKey]: !p[pwKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-dark-400 hover:text-dark-600 transition-colors"
                >
                  {showPw[pwKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={savingPw} className="btn-primary flex items-center gap-2">
            {savingPw
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <ShieldCheck className="w-4 h-4" />
            }
            Change Password
          </button>
        </form>
      </Section>

      {/* Data Management */}
      <Section title="Data Management" subtitle="Reset specific data permanently. This cannot be undone." delay={0.15}>
        <div className="space-y-3">
          {[
            { type: 'transactions', label: 'Reset Transactions', desc: 'Delete all your transaction history', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            { type: 'subscriptions', label: 'Reset Subscriptions', desc: 'Remove all tracked subscriptions', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
            { type: 'all', label: 'Reset All Data', desc: 'Delete everything — transactions, budgets, goals, subscriptions', color: 'text-danger-600', bg: 'bg-red-50', border: 'border-red-200' },
          ].map(({ type, label, desc, color, bg, border }) => (
            <div key={type}>
              <div className={`flex items-center justify-between p-4 rounded-xl border ${bg} ${border}`}>
                <div>
                  <p className={`text-sm font-semibold ${color}`}>{label}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => setResetConfirm(type)}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border ${border} ${color} hover:brightness-95 transition-all`}
                >
                  <Trash2 className="w-3 h-3" /> Reset
                </button>
              </div>

              <AnimatePresence>
                {resetConfirm === type && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-4 bg-dark-900 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>Are you sure? This <strong>cannot be undone</strong>.</span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          disabled={resetting}
                          onClick={() => handleReset(type)}
                          className="bg-danger-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-danger-600 transition flex items-center gap-1"
                        >
                          {resetting ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : null}
                          Yes, Reset
                        </button>
                        <button
                          onClick={() => setResetConfirm(null)}
                          className="bg-dark-700 text-dark-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-dark-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Section>

      {/* Account */}
      <Section title="Account" delay={0.2}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-800">{user?.name}</p>
            <p className="text-xs text-dark-400">{user?.email} · Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : 'N/A'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-danger flex items-center gap-2 text-sm py-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </Section>
    </div>
  );
}