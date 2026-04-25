const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency, createdAt: user.createdAt }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, currency } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, currency }, { new: true, runValidators: true });
    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user data
// @route   DELETE /api/auth/reset-data
// Body: { type: 'all' | 'transactions' | 'subscriptions' | 'budgets' | 'goals' }
exports.resetData = async (req, res, next) => {
  try {
    const { type } = req.body;
    const uid = req.user._id;

    if (type === 'transactions' || type === 'all') {
      await Transaction.deleteMany({ userId: uid });
    }
    if (type === 'subscriptions' || type === 'all') {
      await Subscription.deleteMany({ user: uid });
    }
    if (type === 'budgets' || type === 'all') {
      await Budget.deleteMany({ userId: uid });
    }
    if (type === 'goals' || type === 'all') {
      await Goal.deleteMany({ userId: uid });
    }

    res.status(200).json({ success: true, message: `Reset ${type} data successfully` });
  } catch (error) {
    next(error);
  }
};

