const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a goal title'],
    trim: true,
    maxlength: 100
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please specify a target amount'],
    min: [1, 'Target amount must be at least 1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    default: null
  },
  color: {
    type: String,
    default: '#6366f1'
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
