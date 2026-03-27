const express = require('express');
const router = express.Router();
const { getWalletBalance, getMyOrders, getMyTransactions } = require('../controller/user.controller.js');
const { authUser } = require('../middleware/auth.middleware.js');

router.get("/balance", authUser, getWalletBalance);
router.get("/orders", authUser, getMyOrders);
router.get("/transactions", authUser, getMyTransactions);

module.exports = router;
