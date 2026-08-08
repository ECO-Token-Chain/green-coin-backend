const mongoose = require("mongoose");
const wasteLogModel = require("../models/waste.model.js");
const userModel = require("../models/user.model.js");
const dustbinModel = require("../models/dustbin.model.js");
const rewardModel = require("../models/reward.model.js");
const calculateReward = require("../utils/rewardCalculator.js");
const { sendReward } = require("../utils/blockchain.js");


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

    const user = await userModel.findOne({ uid: uid.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
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

async function logWasteDeposit(req, res) {
  try {
    const { uid, weight, dustbinId } = req.body;

    if (!uid || weight === undefined || weight === null || !dustbinId) {
      return res.status(400).json({
        message: "UID, weight, and dustbin ID are required"
      });
    }


    const user = await userModel.findOne({ uid: uid.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const dustbin = await dustbinModel.findById(new mongoose.Types.ObjectId(dustbinId));
    if (!dustbin) {
      return res.status(404).json({ message: "Dustbin not found" });
    }

    const remainingCapacity = dustbin.capacity - dustbin.currentFillLevel;

    let acceptedWeight = weight;

    if (remainingCapacity <= 0) {
      acceptedWeight = 0;
    } else if (weight > remainingCapacity) {
      acceptedWeight = remainingCapacity;
    }

    let wasteLog = null;

    if (acceptedWeight > 0) {
      wasteLog = await wasteLogModel.create({
        userId: user._id,
        uid,
        weight: acceptedWeight,
        dustbinId
      });
    }

    if (acceptedWeight > 0) {
      const weightInGram = acceptedWeight;
      const potentialPoints = calculateReward(weightInGram);
      const todayIST = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());


      if (user.lastPointUpdateDate !== todayIST) {
        user.pointsEarnedToday = 0;
        user.lastPointUpdateDate = todayIST;
      }

      let earnedPoints = 0;
      let isMaxLimitReached = false;

      if (user.pointsEarnedToday >= 200) {
        earnedPoints = 0;
        isMaxLimitReached = true;
      } else {
        const availablePoints = 200 - user.pointsEarnedToday;
        earnedPoints = Math.min(potentialPoints, availablePoints);

        if (earnedPoints < potentialPoints) {
          isMaxLimitReached = true;
        }
      }

      user.wasteDroppedToday += weightInGram;
      user.pointsEarnedToday += earnedPoints;
      user.points += earnedPoints;

      await user.save();

      await dustbinModel.findByIdAndUpdate(new mongoose.Types.ObjectId(dustbinId), {
        $inc: { currentFillLevel: acceptedWeight }
      });

      if (earnedPoints > 0) {
        await rewardModel.create({
          userId: user._id,
          wasteLogId: wasteLog?._id,
          points: earnedPoints,
          weight: acceptedWeight
        });

        if (user.walletAddress) {

          sendReward(user.walletAddress, earnedPoints, user.uid);
        } else {
          console.log(`[Blockchain] User ${user.name} earned points but has no walletAddress configured.`);
        }
      }

      const responseMessage = isMaxLimitReached && earnedPoints === 0
        ? "Max limit exceed. Try in next date."
        : "Waste added & rewarded";

      return res.status(201).json({
        message: responseMessage,
        weight: acceptedWeight,
        points: earnedPoints,
        wasteLog
      });
    }


    res.status(201).json({
      message: "Waste added & rewarded",
      weight: 0,
      points: 0,
      wasteLog
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

module.exports = {
  logWasteDeposit,
  createDustbin,
  reduceCurrentFillLevel
}