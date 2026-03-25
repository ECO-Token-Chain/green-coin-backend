const userModel = require('../models/user.model.js');

async function getLeaderboard(req, res) {
    try {
        const students = await userModel.find({ role: 'user' }).sort({ points: -1 }).select('name points _id');
        const leaderboard = students.map((student, index) => ({
            rank: index + 1,
            ...student.toObject()
        }));

        res.status(200).json({
            message: "Leaderboard retrieved successfully",
            leaderboard
        })
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

module.exports = {
    getLeaderboard,
}