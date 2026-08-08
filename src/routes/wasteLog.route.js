const express = require('express');
const router = express.Router();
const { authUser } = require('../middleware/auth.middleware.js');
const { logWasteDeposit,createDustbin } = require('../controller/wasteLog.controller.js');


/**
 * @route POST /api/iot/dustbin/create
 * @desc Create a new dustbin
 * @access Private (admin only)
 */
router.post("/dustbin/create",authUser,createDustbin);

/**
 * @route POST /api/iot/deposit
 * @desc Log waste deposit from IoT device
 * @access Private (dustbin only)
 */
router.post("/deposit", logWasteDeposit);

module.exports = router;