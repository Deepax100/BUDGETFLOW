const express = require('express');
const router = express.Router();
const { getCalendarMonth } = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCalendarMonth);

module.exports = router;
