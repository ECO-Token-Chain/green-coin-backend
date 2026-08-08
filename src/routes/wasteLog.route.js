const express = require('express');
const router = express.Router();
const { authUser } = require('../middleware/auth.middleware.js');
const { logWasteDeposit,createDustbin,reduceCurrentFillLevel,getAllDustbins } = require('../controller/wasteLog.controller.js');


/**
 * @route POST /api/iot/dustbin/create
 * @desc Create a new dustbin
 * @access Private (admin only)
 */
router.post("/dustbin/create",authUser,createDustbin);

/**
 * @route GET /api/iot/dustbins
 * @desc Get all dustbins
 * @access Private (Authenticated users only)
 */
router.get("/dustbins", authUser, getAllDustbins);

/**
 * @route POST /api/iot/dustbin/reduce
 * @desc Reduce current fill level of a dustbin (for maintenance)
 * @access Private (admin only)
 */
router.patch("/dustbin/reduce", reduceCurrentFillLevel);

/**
 * @route POST /api/iot/deposit
 * @desc Log waste deposit from IoT device
 * @access Private (dustbin only)
 */
router.post("/deposit", logWasteDeposit);

module.exports = router;