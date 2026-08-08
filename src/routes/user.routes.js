const express = require('express');
const router = express.Router();
const { getWalletBalance } = require('../controller/user.controller.js');
const { authUser } = require('../middleware/auth.middleware.js');

/**
 * @route GET /api/user/balance
 * @desc Get the current user's GC token balance from the blockchain
 * @access Private (Authenticated users only)
 */
router.get("/balance", authUser, getWalletBalance);

module.exports = router;
