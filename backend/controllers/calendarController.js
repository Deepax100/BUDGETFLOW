const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');

// @desc  Get all calendar data for a given month
// @route GET /api/calendar?month=2026-04
exports.getCalendarMonth = async (req, res) => {
  try {
    const now = new Date();
    const monthStr = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, month] = monthStr.split('-').map(Number);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const uid = req.user._id;

    // Transactions in the month
    const transactions = await Transaction.find({
      userId: uid,
      date: { $gte: start, $lte: end },
    }).select('description amount type category date').sort({ date: 1 });

    // Active subscriptions billed this month (by nextBillingDate or startDate)
    const subscriptions = await Subscription.find({ user: uid, isActive: true })
      .select('name icon color cost billingCycle nextBillingDate usageLogs startDate');

    // Build billing events: if nextBillingDate is in this month, mark it
    const billingEvents = subscriptions
      .filter(s => {
        const bd = s.nextBillingDate;
        return bd && bd >= start && bd <= end;
      })
      .map(s => ({
        _id: s._id,
        name: s.name,
        icon: s.icon,
        color: s.color,
        cost: s.cost,
        date: s.nextBillingDate,
        type: 'billing',
      }));

    // Build usage events from usageLogs
    const usageEvents = [];
    subscriptions.forEach(s => {
      (s.usageLogs || []).forEach(log => {
        const d = new Date(log.date);
        if (d >= start && d <= end) {
          usageEvents.push({
            subscriptionId: s._id,
            name: s.name,
            icon: s.icon,
            color: s.color,
            date: log.date,
            note: log.note || '',
            type: 'usage',
          });
        }
      });
    });

    // Group everything by day
    const dayMap = {};

    transactions.forEach(tx => {
      const key = new Date(tx.date).toISOString().split('T')[0];
      if (!dayMap[key]) dayMap[key] = { transactions: [], billingEvents: [], usageEvents: [] };
      dayMap[key].transactions.push(tx);
    });

    billingEvents.forEach(ev => {
      const key = new Date(ev.date).toISOString().split('T')[0];
      if (!dayMap[key]) dayMap[key] = { transactions: [], billingEvents: [], usageEvents: [] };
      dayMap[key].billingEvents.push(ev);
    });

    usageEvents.forEach(ev => {
      const key = new Date(ev.date).toISOString().split('T')[0];
      if (!dayMap[key]) dayMap[key] = { transactions: [], billingEvents: [], usageEvents: [] };
      dayMap[key].usageEvents.push(ev);
    });

    res.json({ success: true, data: dayMap, month: monthStr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
