const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authUser } = require('../middleware/auth.middleware.js');
const {
  logWasteDeposit,
  completeDepositWithImage,
  createDustbin,
  reduceCurrentFillLevel,
  getAllDustbins
} = require('../controller/wasteLog.controller.js');

// Multer: store image in memory (buffer) so Gemini can read directly
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route POST /api/iot/dustbin/create
 * @desc Create a new dustbin
 * @access Private (admin only)
 */
router.post("/dustbin/create", authUser, createDustbin);

/**
 * @route GET /api/iot/dustbins
 * @desc Get all dustbins
 * @access Private (Authenticated users only)
 */
router.get("/dustbins", authUser, getAllDustbins);

/**
 * @route PATCH /api/iot/dustbin/reduce
 * @desc Reduce current fill level of a dustbin (for maintenance)
 * @access Private (admin only)
 */
router.patch("/dustbin/reduce", reduceCurrentFillLevel);

/**
 * STEP 1 — Arduino/serial.js
 * @route POST /api/iot/deposit
 * @desc Receive UID + Weight from Arduino; creates a pending session (expires in 2 min)
 * @access Public (IoT device)
 */
router.post("/deposit", logWasteDeposit);

/**
 * STEP 2 — Phone App
 * @route POST /api/iot/deposit/complete
 * @desc Receive UID + Image from phone;

 */
router.post("/deposit/complete", upload.single('image'), completeDepositWithImage);

module.exports = router;
