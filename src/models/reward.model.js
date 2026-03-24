const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  wasteLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WasteLog",
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  weight: {
    type: Number, // In KG, same as in WasteLog
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const rewardModel = mongoose.model("Reward", rewardSchema);

module.exports = rewardModel;
