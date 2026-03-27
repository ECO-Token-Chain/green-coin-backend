const { ethers } = require("ethers");
const { greenCoinContract } = require("../utils/blockchain.js");
const User = require("../models/user.model.js");
const Transaction = require("../models/transaction.model.js");

async function getWalletBalance(req, res) {
    try {
        const user = await User.findById(req.user.id);

        if (!user || !user.walletAddress) {
            return res.status(404).json({
                success: false,
                message: "Wallet address not found for this user."
            });
        }

        const walletAddress = user.walletAddress;
        const balance = await greenCoinContract.balanceOf(walletAddress);

        const formattedBalance = ethers.formatUnits(balance, 18);

        res.status(200).json({
            success: true,
            wallet: walletAddress,
            balance: formattedBalance,
            symbol: "GC"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Blockchain error: " + error.message
        });
    }
}

// GET /api/user/orders — Purchases made by the user (type: 'purchase', status: 'success')
async function getMyOrders(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const orders = await Transaction.find({
            uid: user.uid,
            type: "purchase",
            status: "success"
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/user/transactions — All spending transactions (type: 'purchase')
async function getMyTransactions(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const transactions = await Transaction.find({
            uid: user.uid,
            type: "purchase"
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    getWalletBalance,
    getMyOrders,
    getMyTransactions
};

