const mongoose = require("mongoose");

const wasteLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  dustbinId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dustbin",
    required: true
  },
  uid: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  createdAt: {

    type: Date,
    default: Date.now
  }
});

const wasteLogModel = mongoose.model("WasteLog", wasteLogSchema);

module.exports = wasteLogModel;