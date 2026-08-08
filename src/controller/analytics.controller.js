const wasteLogModel = require('../models/waste.model.js');

async function getCollegeWasteLast7Days(req, res) {
  try {
    const role = req.user.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const data = await wasteLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalWaste: { $sum: "$weight" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
        message: "College waste data for the last 7 days retrieved successfully",
        data
    });
  } catch (err) {
    res.status(500).json({
        message: "Server error",
        error: err.message
    });
  }
}

async function getUserWasteLast7Days(req, res) {
  try {
    const userId = req.user.id;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const data = await wasteLogModel.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalWaste: { $sum: "$weight" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
        message: "User waste data for the last 7 days retrieved successfully",
        data
    });
  } catch (err) {
    res.status(500).json({
        message: "Server error",
        error: err.message
    });
  }
}

async function getUserWasteById(req, res) {
  try {
    const role = req.user.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { userId } = req.params;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const data = await wasteLogModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalWaste: { $sum: "$weight" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
        message: "User waste data for the last 7 days retrieved successfully",
        data
    });
  } catch (err) {
    res.status(500).json({
        message: "Server error",
        error: err.message
    });
  }
}

module.exports = {
  getCollegeWasteLast7Days,
  getUserWasteLast7Days,
  getUserWasteById
};