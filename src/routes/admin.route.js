const express = require('express');
const router = express.Router();
const { getAllStudents , updateStudentUID , deleteStudent , promoteToAdmin } = require('../controller/admin.controller.js');
const { authUser } = require('../middleware/auth.middleware.js');

/**
 * @route GET /api/admin/students
 * @desc Get all students
 * @access Private (Admin only)
 */
router.get("/students", authUser, getAllStudents);

/**
 * @route PATCH /api/admin/students/:id/uid
 * @desc Update student's UID
 * @access Private (Admin only)
 */
router.patch("/students/:id/uid", authUser, updateStudentUID);

/**
 * @route DELETE /api/admin/students/:id
 * @desc Delete a student
 * @access Private (Admin only)
 */
router.delete("/students/:id", authUser, deleteStudent);

/**
 * @route PATCH /api/admin/users/:id/promote
 * @desc Promote a user to admin 
 * @access Private (Admin only)
 */
router.patch("/users/:id/promote", authUser, promoteToAdmin);

module.exports = router;