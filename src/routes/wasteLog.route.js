const express = require('express');
const router = express.Router();
const { authUser } = require('../middleware/auth.middleware.js');
const { logWasteDeposit } = require('../controller/wasteLog.controller.js');

/**
 * @route POST /api/iot/deposit
 * @desc Log waste deposit from IoT device
 * @access Public (for now - can be changed to Private if needed)
 */
router.post("/deposit", logWasteDeposit);

module.exports = router;