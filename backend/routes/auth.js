const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, changePassword, resetData } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);
router.delete('/reset-data', protect, resetData);

module.exports = router;
