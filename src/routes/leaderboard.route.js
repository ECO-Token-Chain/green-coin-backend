const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controller/leaderboard.controller.js');
const { authUser } = require('../middleware/auth.middleware.js');
/**
 * @route GET /api/leaderboard
 * @desc Get the leaderboard of students based on their points
 * @access Private (Authenticated users only)
 */
router.get("/", authUser, getLeaderboard);

module.exports = router;