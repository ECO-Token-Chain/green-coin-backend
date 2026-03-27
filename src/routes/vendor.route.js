const express = require('express');
const router = express.Router();
const { purchaseItem } = require('../controller/vendor.controller.js');
const { authUser } = require('../middleware/auth.middleware');

// POST /api/vendor/buy
router.post('/buy', authUser, purchaseItem);

module.exports = router;
