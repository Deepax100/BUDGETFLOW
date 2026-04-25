const Transaction = require('../models/Transaction');
const { suggestCategory } = require('../services/categoryService');
const mongoose = require('mongoose');

// @desc    Get transactions (paginated, filterable)
// @route   GET /api/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, category, startDate, endDate, search } = req.query;
    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, description, date, isRecurring, recurringFrequency } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide type and amount' });
    }

    const finalCategory = category || suggestCategory(description, type);

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      category: finalCategory,
      amount: Number(amount),
      description: description || '',
      date: date ? new Date(date) : new Date(),
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || null
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const updates = { ...req.body };
    if (updates.amount) updates.amount = Number(updates.amount);
    if (updates.date) updates.date = new Date(updates.date);

    transaction = await Transaction.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export
exports.exportTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 }).lean();

    const csvHeader = 'Date,Type,Category,Amount,Description\n';
    const csvRows = transactions.map(t =>
      `${new Date(t.date).toISOString().split('T')[0]},${t.type},${t.category},${t.amount},"${(t.description || '').replace(/"/g, '""')}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.status(200).send(csvHeader + csvRows);
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest category
// @route   POST /api/transactions/suggest-category
exports.suggestCategoryEndpoint = async (req, res, next) => {
  try {
    const { description, type } = req.body;
    const category = suggestCategory(description, type || 'expense');
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};
