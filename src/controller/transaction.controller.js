const Transaction = require("../models/transaction.model.js");

async function getAllTransactions(req, res) {
    try {
        const { uid, status, type, date } = req.query;
        let query = {};

        // Filter by UID
        if (uid) {
            query.uid = uid;
        }

        // Filter by Status (success/failed)
        if (status) {
            query.status = status;
        }

        // Filter by Type (reward/purchase)
        if (type) {
            query.type = type;
        }

        // Filter by Date (today)
        if (date === "today") {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: startOfDay };
        }

        const transactions = await Transaction.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
}

module.exports = {
    getAllTransactions
};
