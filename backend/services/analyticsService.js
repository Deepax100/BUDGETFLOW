const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const getMonthlySummary = async (userId, month) => {
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

  const result = await Transaction.aggregate([
    { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);

  const income = result.find(r => r._id === 'income')?.total || 0;
  const expense = result.find(r => r._id === 'expense')?.total || 0;
  const incomeCount = result.find(r => r._id === 'income')?.count || 0;
  const expenseCount = result.find(r => r._id === 'expense')?.count || 0;
  const balance = income - expense;
  const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;

  return { income, expense, balance, savingsRate: Number(savingsRate), incomeCount, expenseCount };
};

const getCategoryBreakdown = async (userId, month) => {
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

  return Transaction.aggregate([
    { $match: { userId, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
};

const getMonthlyTrend = async (userId, months = 6) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  return Transaction.aggregate([
    { $match: { userId, date: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
};

const getFinancialHealthScore = async (userId) => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const summary = await getMonthlySummary(userId, month);
  const budgets = await Budget.find({ userId, month });

  let score = 50;

  // Savings rate impact
  if (summary.savingsRate >= 20) score += 20;
  else if (summary.savingsRate >= 10) score += 10;
  else if (summary.savingsRate < 0) score -= 20;

  // Budget adherence
  if (budgets.length > 0) {
    score += 10;
    const categories = await getCategoryBreakdown(userId, month);
    let withinBudget = 0;
    budgets.forEach(budget => {
      const spent = categories.find(c => c._id === budget.category)?.total || 0;
      if (spent <= budget.monthlyLimit) withinBudget++;
    });
    const adherenceRate = withinBudget / budgets.length;
    score += Math.round(adherenceRate * 20);
  }

  return Math.min(100, Math.max(0, score));
};

const getSmartInsights = async (userId) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

  const [currentSummary, prevSummary, categories, budgets] = await Promise.all([
    getMonthlySummary(userId, currentMonth),
    getMonthlySummary(userId, prevMonth),
    getCategoryBreakdown(userId, currentMonth),
    Budget.find({ userId, month: currentMonth })
  ]);

  const insights = [];

  // Spending trend
  if (prevSummary.expense > 0) {
    const change = ((currentSummary.expense - prevSummary.expense) / prevSummary.expense * 100).toFixed(1);
    if (change > 10) {
      insights.push({ type: 'warning', icon: '📈', message: `Your spending is up ${change}% compared to last month.` });
    } else if (change < -10) {
      insights.push({ type: 'success', icon: '📉', message: `Great! Your spending decreased by ${Math.abs(change)}% this month.` });
    }
  }

  // Savings rate
  if (currentSummary.savingsRate >= 20) {
    insights.push({ type: 'success', icon: '🎯', message: `Excellent savings rate of ${currentSummary.savingsRate}%! You're on track.` });
  } else if (currentSummary.savingsRate < 10 && currentSummary.savingsRate >= 0) {
    insights.push({ type: 'warning', icon: '💡', message: `Your savings rate is ${currentSummary.savingsRate}%. Try to save at least 20% of income.` });
  } else if (currentSummary.savingsRate < 0) {
    insights.push({ type: 'danger', icon: '🚨', message: 'You are spending more than you earn this month!' });
  }

  // Top spending category
  if (categories.length > 0) {
    const topCat = categories[0];
    const pct = currentSummary.expense > 0 ? (topCat.total / currentSummary.expense * 100).toFixed(0) : 0;
    insights.push({ type: 'info', icon: '📊', message: `Top spending: ${topCat._id} at $${topCat.total.toFixed(2)} (${pct}% of expenses).` });
  }

  // Budget alerts
  budgets.forEach(budget => {
    const spent = categories.find(c => c._id === budget.category)?.total || 0;
    const pct = (spent / budget.monthlyLimit * 100).toFixed(0);
    if (spent > budget.monthlyLimit) {
      insights.push({ type: 'danger', icon: '🔴', message: `Over budget on ${budget.category}: $${spent.toFixed(2)} / $${budget.monthlyLimit} (${pct}%).` });
    } else if (pct >= 80) {
      insights.push({ type: 'warning', icon: '🟡', message: `Approaching budget limit on ${budget.category}: ${pct}% used.` });
    }
  });

  if (insights.length === 0) {
    insights.push({ type: 'info', icon: '✅', message: 'Add more transactions to get personalized insights!' });
  }

  return insights;
};

module.exports = { getMonthlySummary, getCategoryBreakdown, getMonthlyTrend, getFinancialHealthScore, getSmartInsights };
