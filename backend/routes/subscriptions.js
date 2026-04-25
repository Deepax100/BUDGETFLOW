const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  logUsage,
  detectFromTransactions,
  getUsageHistory,
} = require('../controllers/subscriptionController');

router.use(protect);

router.route('/').get(getSubscriptions).post(createSubscription);
router.get('/detect', detectFromTransactions);
router.route('/:id').put(updateSubscription).delete(deleteSubscription);
router.post('/:id/log-usage', logUsage);
router.get('/:id/usage', getUsageHistory);

module.exports = router;
