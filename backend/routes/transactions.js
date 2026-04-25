const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction, exportTransactions, suggestCategoryEndpoint } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/export', exportTransactions);
router.post('/suggest-category', suggestCategoryEndpoint);
router.route('/').get(getTransactions).post(createTransaction);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

module.exports = router;
