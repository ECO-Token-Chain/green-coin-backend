const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controller/auth.controller.js');
const { authUser } = require('../middleware/auth.middleware.js');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post("/login", login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user by clearing cookie
 * @access Private
 */
router.post("/logout", authUser, (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});


/**
 * @route POST /api/auth/getMe
 * @desc Get current logged in user details
 * @access Private
 */
router.get("/getMe", authUser, getMe);
module.exports = router;