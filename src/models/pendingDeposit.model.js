const mongoose = require("mongoose");

/**
 * PendingDeposit stores a temporary session created when Arduino sends UID+Weight.
 * It waits for the phone to send the image to complete the deposit.
 * The TTL index automatically deletes the record after 120 seconds if no image arrives.
 */
const pendingDepositSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true, // Only one active session per RFID card at a time
    lowercase: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  dustbinId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // TTL: MongoDB will auto-delete this document 120 seconds after createdAt
    expires: 120,
  },
});

const pendingDepositModel = mongoose.model("PendingDeposit", pendingDepositSchema);

module.exports = pendingDepositModel;
