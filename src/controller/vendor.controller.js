const User = require("../models/user.model.js");
const { transferTokens } = require("../utils/blockchain.js");

exports.purchaseItem = async (req, res) => {
    try {
        const { amount, productId } = req.body;
        const vendorWallet = process.env.VENDOR_WALLET;
        
        // Input validation
        if (!amount) {
            return res.status(400).json({ success: false, message: "Missing amount" });
        }
        if (!vendorWallet) {
            return res.status(500).json({ success: false, message: "Vendor Wallet is not configured in environment variables." });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.walletAddress || user.walletAddress === "") {
            return res.status(400).json({ success: false, message: "User does not have a connected blockchain wallet." });
        }

        if (user.points < amount) {
            return res.status(400).json({ success: false, message: "Insufficient GS Points to complete this purchase." });
        }

        // STEP 5: Call blockchain transferFrom
        try {
            // STEP 6: This executes the transaction via the admin wallet allowance
            await transferTokens(user.walletAddress, vendorWallet, amount, user.uid);
            
            // Deduct from DB ONLY after successful blockchain TX
            user.points -= amount;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Purchase fully successful via ERC20 blockchain transfer!"
            });

        } catch (chainErr) {
            // STEP 7: Error handling. The points were NOT deducted because it failed.
            console.error("Blockchain transaction failed:", chainErr);
            return res.status(500).json({
                success: false,
                message: "Blockchain transaction failed. Please ensure you approved enough GC on MetaMask.",
                error: chainErr.message
            });
        }

    } catch (error) {
        console.error("Purchase Controller Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
