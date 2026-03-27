const mongoose = require("mongoose");
const wasteLogModel = require("../models/waste.model.js");
const userModel = require("../models/user.model.js");
const dustbinModel = require("../models/dustbin.model.js");
const rewardModel = require("../models/reward.model.js");
const pendingDepositModel = require("../models/pendingDeposit.model.js");
const notificationModel = require("../models/notification.model.js");
const calculateReward = require("../utils/rewardCalculator.js");
const { sendReward } = require("../utils/blockchain.js");
const { estimateWeightRange } = require("../services/gemini.service.js");
const cloudinary = require("../utils/cloudinary.js");


async function createDustbin(req, res) {
  try {
    const role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { name, capacity } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ message: "Name and capacity are required" });
    }

    const dustbin = await dustbinModel.create({
      name,
      capacity
    });

    res.status(201).json({ message: "Dustbin created successfully", dustbin });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }
}

async function reduceCurrentFillLevel(req, res) {
  try {
    const { dustbinId, weight, uid } = req.body;
    if(!uid){
      await notificationModel.create({
        message: `Unauthorized attempt to reduce fill level of dustbin ${dustbinId} with missing UID please check the cctv footage for more details`,
      });
      return res.status(400).json({ message: "UID is required" });
    }
    const user = await userModel.findOne({ uid: uid.toLowerCase() });
    if (!user) {
      await notificationModel.create({
        message: `Unauthorized attempt to reduce fill level of dustbin ${dustbinId} by unknown UID ${uid}`,
      });
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      const fraudUser = await userModel.findOne({ uid: uid.toLowerCase() });
      await notificationModel.create({
        message: `Unauthorized attempt to reduce fill level of dustbin ${dustbinId} by user ${fraudUser.name} (${fraudUser.rollNo}) with UID ${uid}`,
      });
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    if (!dustbinId || !weight) {
      return res.status(400).json({ message: "Dustbin ID and weight are required" });
    }

    const dustbin = await dustbinModel.findById(dustbinId);

    if (!dustbin) {
      return res.status(404).json({ message: "Dustbin not found" });
    }
    const removableWeight = Math.min(weight, dustbin.currentFillLevel);

    const updatedDustbin = await dustbinModel.findByIdAndUpdate(
      dustbinId,
      { $inc: { currentFillLevel: -removableWeight } },
      { returnDocument: "after" }
    );

    res.status(200).json({
      message:
        removableWeight < weight
          ? `Only ${removableWeight} reduced (bin was nearly empty)`
          : "Dustbin fill level reduced successfully",
      reducedWeight: removableWeight,
      dustbin: updatedDustbin
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

// ─── STEP 1: Arduino sends UID + Weight ──────────────────────────────────────
// Creates a PendingDeposit session. Auto-expires in 120 seconds.
async function logWasteDeposit(req, res) {
  try {
    const { uid, weight, dustbinId } = req.body;

    if (!uid || weight === undefined || weight === null || !dustbinId) {
      return res.status(400).json({
        message: "UID, weight, and dustbin ID are required"
      });
    }

    const user = await userModel.findOne({ uid: uid.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const dustbin = await dustbinModel.findById(new mongoose.Types.ObjectId(dustbinId));
    if (!dustbin) return res.status(404).json({ message: "Dustbin not found" });

    // Upsert: if a session already exists for this UID, overwrite it
    await pendingDepositModel.findOneAndUpdate(
      { uid: uid.toLowerCase() },
      { uid: uid.toLowerCase(), weight, dustbinId, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`[Session] Created pending deposit for UID=${uid}, Weight=${weight}g`);

    return res.status(201).json({
      message: "Weight received. Please scan item photo within 2 minutes.",
      uid: uid.toLowerCase(),
      weight
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// ─── STEP 2: Phone sends UID + Image ─────────────────────────────────────────
// Verifies the photo with Gemini, then finalizes or rejects the deposit.
async function completeDepositWithImage(req, res) {
  try {
    const { uid } = req.body;

    if (!uid) return res.status(400).json({ message: "UID is required" });
    if (!req.file)  return res.status(400).json({ message: "Image is required" });

    // 1. Find the pending session
    const pending = await pendingDepositModel.findOne({ uid: uid.toLowerCase() });
    if (!pending) {
      return res.status(404).json({
        message: "No active deposit session found for this UID. Please scan RFID again."
      });
    }

    // 2. Ask Gemini to estimate the natural weight of the item
    let estimate;
    try {
      estimate = await estimateWeightRange(req.file.buffer, req.file.mimetype);
    } catch (geminiError) {
      console.error("[Gemini Error]", geminiError.message);
      return res.status(502).json({ message: "AI verification failed. Try again.", error: geminiError.message });
    }

    console.log(`[Gemini] Object: ${estimate.objectName}, Estimated: ${estimate.minGrams}g–${estimate.maxGrams}g`);
    console.log(`[Sensor]  Actual weight from load cell: ${pending.weight}g`);

    // 3. Cheat detection: allow 50% tolerance above the max estimated weight
    const TOLERANCE = 1.5;
    const isCheat = pending.weight > estimate.maxGrams * TOLERANCE;

    if (isCheat) {
      // Clean up session and reject
      await pendingDepositModel.deleteOne({ uid: uid.toLowerCase() });
      return res.status(400).json({
        message: "⚠️ Cheat detected! The measured weight is too high for this item.",
        objectDetected: estimate.objectName,
        estimatedMax: `${estimate.maxGrams}g`,
        measuredWeight: `${pending.weight}g`
      });
    }

    // 4. Honest submission — finalise the deposit
    const user = await userModel.findOne({ uid: uid.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const dustbin = await dustbinModel.findById(new mongoose.Types.ObjectId(pending.dustbinId));
    if (!dustbin) return res.status(404).json({ message: "Dustbin not found" });

    // Upload image to Cloudinary
    let imageUrl = null;
    try {
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "waste_deposits",
        resource_type: "image"
      });
      imageUrl = uploadResult.secure_url;
    } catch (uploadErr) {
      console.warn("[Cloudinary] Image upload failed:", uploadErr.message);
      // We continue even if upload fails — don't block the deposit
    }

    const remainingCapacity = dustbin.capacity - dustbin.currentFillLevel;
    const acceptedWeight = Math.min(pending.weight, remainingCapacity <= 0 ? 0 : remainingCapacity);

    let wasteLog = null;
    let earnedPoints = 0;
    let isMaxLimitReached = false;

    if (acceptedWeight > 0) {
      wasteLog = await wasteLogModel.create({
        userId: user._id,
        uid: uid.toLowerCase(),
        weight: acceptedWeight,
        dustbinId: pending.dustbinId,
        imageUrl
      });

      const potentialPoints = calculateReward(acceptedWeight);
      const todayIST = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date());

      if (user.lastPointUpdateDate !== todayIST) {
        user.pointsEarnedToday = 0;
        user.lastPointUpdateDate = todayIST;
      }

      if (user.pointsEarnedToday >= 200) {
        isMaxLimitReached = true;
      } else {
        const available = 200 - user.pointsEarnedToday;
        earnedPoints = Math.min(potentialPoints, available);
        if (earnedPoints < potentialPoints) isMaxLimitReached = true;
      }

      user.wasteDroppedToday += acceptedWeight;
      user.pointsEarnedToday += earnedPoints;
      user.points += earnedPoints;
      await user.save();

      await dustbinModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(pending.dustbinId),
        { $inc: { currentFillLevel: acceptedWeight } }
      );

      if (earnedPoints > 0) {
        await rewardModel.create({ userId: user._id, wasteLogId: wasteLog._id, points: earnedPoints, weight: acceptedWeight });
        if (user.walletAddress) {
          sendReward(user.walletAddress, earnedPoints, user.uid);
        }
      }
    }

    // 5. Clear the pending session
    await pendingDepositModel.deleteOne({ uid: uid.toLowerCase() });

    return res.status(201).json({
      message: isMaxLimitReached && earnedPoints === 0
        ? "Max limit exceeded. Try tomorrow."
        : "✅ Waste verified & rewarded!",
      objectDetected: estimate.objectName,
      weight: acceptedWeight,
      points: earnedPoints,
      imageUrl,
      wasteLog
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}


async function getAllDustbins(req, res) {
  try {
    const role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const dustbins = await dustbinModel.find();
    res.status(200).json({
      success: true,
      message: "Dustbins retrieved successfully",
      dustbins
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
  logWasteDeposit,
  completeDepositWithImage,
  createDustbin,
  reduceCurrentFillLevel,
  getAllDustbins
}
