const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    trim: true
  },
  monthlyLimit: {
    type: Number,
    required: [true, 'Please specify a monthly limit'],
    min: [1, 'Monthly limit must be at least 1']
  },
  month: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
  }
}, { timestamps: true });

budgetSchema.index({ userId: 1, month: 1 });
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
