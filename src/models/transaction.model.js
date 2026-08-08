const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  pointsUsed: {
    type: Number,
    required: true
  },
  txHash: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success"
  },
  type: {
    type: String,
    enum: ["reward", "purchase"],
    default: "reward"
  },
  error: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
