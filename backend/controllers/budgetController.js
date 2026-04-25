const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get budgets for a month
// @route   GET /api/budgets
exports.getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgets = await Budget.find({ userId: req.user._id, month }).lean();

    // Calculate spent for each budget
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

    const spending = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const budgetsWithSpent = budgets.map(b => {
      const spent = spending.find(s => s._id === b.category)?.total || 0;
      return { ...b, spent, percentage: Math.round((spent / b.monthlyLimit) * 100) };
    });

    res.status(200).json({ success: true, data: budgetsWithSpent });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update budget
// @route   POST /api/budgets
exports.createBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month } = req.body;
    const now = new Date();
    const budgetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (!category || !monthlyLimit) {
      return res.status(400).json({ success: false, message: 'Please provide category and monthlyLimit' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month: budgetMonth },
      { userId: req.user._id, category, monthlyLimit: Number(monthlyLimit), month: budgetMonth },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    await Budget.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};
