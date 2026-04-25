const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' },
});

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Subscription name is required'], trim: true },
    category: {
      type: String,
      enum: ['streaming', 'music', 'productivity', 'gaming', 'fitness', 'news', 'cloud', 'education', 'other'],
      default: 'other',
    },
    cost: { type: Number, required: [true, 'Cost is required'], min: 0 },
    billingCycle: { type: String, enum: ['monthly', 'annual', 'weekly'], default: 'monthly' },
    startDate: { type: Date, default: Date.now },
    nextBillingDate: { type: Date },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '📦' },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: '' },
    usageLogs: [usageLogSchema],
    // Auto-detected from transactions flag
    autoDetected: { type: Boolean, default: false },
    transactionKeyword: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-calculate nextBillingDate before save
subscriptionSchema.pre('save', function (next) {
  if (!this.nextBillingDate || this.isModified('startDate') || this.isModified('billingCycle')) {
    const start = new Date(this.startDate);
    const now = new Date();
    let next = new Date(start);

    if (this.billingCycle === 'monthly') {
      while (next <= now) next.setMonth(next.getMonth() + 1);
    } else if (this.billingCycle === 'annual') {
      while (next <= now) next.setFullYear(next.getFullYear() + 1);
    } else if (this.billingCycle === 'weekly') {
      while (next <= now) next.setDate(next.getDate() + 7);
    }
    this.nextBillingDate = next;
  }
  next();
});

// Virtual: monthly cost regardless of billing cycle
subscriptionSchema.virtual('monthlyCost').get(function () {
  if (this.billingCycle === 'annual') return +(this.cost / 12).toFixed(2);
  if (this.billingCycle === 'weekly') return +(this.cost * 4.33).toFixed(2);
  return this.cost;
});

// Virtual: usage this month
subscriptionSchema.virtual('usageThisMonth').get(function () {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return this.usageLogs.filter((l) => new Date(l.date) >= startOfMonth).length;
});

// Virtual: days until next billing
subscriptionSchema.virtual('daysUntilRenewal').get(function () {
  if (!this.nextBillingDate) return null;
  const diff = new Date(this.nextBillingDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

subscriptionSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
