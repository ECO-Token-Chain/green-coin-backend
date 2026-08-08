const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { authUser } = require('../middleware/auth.middleware.js');
const { getCollegeWasteLast7Days, getUserWasteLast7Days, getUserWasteById, getTotalWasteWeight } = require('../controller/analytics.controller.js');

/**
 * @route GET /api/analytics/weekly/college
 * @desc Get weekly analytics data for waste collection (overall college)
 * @access Private (Admin only)
 */
router.get("/weekly/college", authUser, getCollegeWasteLast7Days);

/**
 * @route GET /api/analytics/weekly/my
 * @desc Get weekly analytics data for waste collection (individual student(current user))
 * @access Private (Authenticated users only)
 */
router.get("/weekly/my", authUser, getUserWasteLast7Days);

/**
 * @route GET /api/analytics/weekly/user/:id
 * @desc Get weekly analytics data for waste collection (individual student by id)
 * @access Private (Admin only)
 */
router.get("/weekly/user/:id", authUser, getUserWasteById);

/**
 * @route GET /api/analytics/total
 * @desc Get total waste weight collected from all logs
 * @access Private (Authenticated users only)
 */
router.get("/total", authUser, getTotalWasteWeight);

module.exports = router;