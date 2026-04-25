const Goal = require('../models/Goal');

// @desc    Get all goals
// @route   GET /api/goals
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    const goalsWithProgress = goals.map(g => ({
      ...g,
      percentage: Math.round((g.currentAmount / g.targetAmount) * 100)
    }));
    res.status(200).json({ success: true, data: goalsWithProgress });
  } catch (error) {
    next(error);
  }
};

// @desc    Create goal
// @route   POST /api/goals
exports.createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, deadline, color } = req.body;
    if (!title || !targetAmount) {
      return res.status(400).json({ success: false, message: 'Please provide title and targetAmount' });
    }
    const goal = await Goal.create({
      userId: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline: deadline ? new Date(deadline) : null,
      color: color || '#6366f1'
    });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    const updates = { ...req.body };
    if (updates.targetAmount) updates.targetAmount = Number(updates.targetAmount);
    if (updates.currentAmount !== undefined) updates.currentAmount = Number(updates.currentAmount);
    if (updates.deadline) updates.deadline = new Date(updates.deadline);

    goal = await Goal.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    await Goal.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};
