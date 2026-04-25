const mongoose = require('mongoose');
const { getMonthlySummary, getCategoryBreakdown, getMonthlyTrend, getFinancialHealthScore, getSmartInsights } = require('../services/analyticsService');
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../services/categoryService');

// @desc    Get financial summary
// @route   GET /api/analytics/summary
exports.getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const userId = req.user._id;

    const [summary, healthScore] = await Promise.all([
      getMonthlySummary(userId, month),
      getFinancialHealthScore(userId)
    ]);

    res.status(200).json({ success: true, data: { ...summary, healthScore, month } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chart data
// @route   GET /api/analytics/charts
exports.getCharts = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const userId = req.user._id;

    const [categoryBreakdown, monthlyTrend] = await Promise.all([
      getCategoryBreakdown(userId, month),
      getMonthlyTrend(userId, 6)
    ]);

    // Format monthly trend for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};
    monthlyTrend.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!trendMap[key]) {
        trendMap[key] = { month: monthNames[item._id.month - 1], income: 0, expense: 0 };
      }
      trendMap[key][item._id.type] = item.total;
    });

    const trendData = Object.values(trendMap).sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    // Colors for pie chart
    const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#06b6d4', '#14b8a6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#78716c', '#64748b'];
    const pieData = categoryBreakdown.map((item, idx) => ({
      name: item._id,
      value: item.total,
      count: item.count,
      color: COLORS[idx % COLORS.length]
    }));

    res.status(200).json({
      success: true,
      data: { categoryBreakdown: pieData, monthlyTrend: trendData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get smart insights
// @route   GET /api/analytics/insights
exports.getInsights = async (req, res, next) => {
  try {
    const insights = await getSmartInsights(req.user._id);
    res.status(200).json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories list
// @route   GET /api/analytics/categories
exports.getCategories = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: { expense: EXPENSE_CATEGORIES, income: INCOME_CATEGORIES } });
  } catch (error) {
    next(error);
  }
};
