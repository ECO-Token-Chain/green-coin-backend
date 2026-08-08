const { ethers } = require("ethers");
const { greenCoinContract } = require("../utils/blockchain.js");
const User = require("../models/user.model.js");

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

module.exports = {
    getWalletBalance
};
