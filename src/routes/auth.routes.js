const express = require('express');
const router = express.Router();
const { register } = require('../controller/auth.controller.js');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", register);

module.exports = router;