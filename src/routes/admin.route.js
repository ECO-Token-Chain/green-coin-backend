const express = require('express');
const router = express.Router();
const {
    getAllStudents,
    updateStudentUID,
    deleteStudent,
    promoteToAdmin,
    addProduct,
    deleteProduct
} = require('../controller/admin.controller.js');
const { authUser, isAdmin } = require('../middleware/auth.middleware.js');

/**
 * @route POST /api/admin/products
 * @desc Add a new product
 * @access Private (Admin only)
 */
router.post("/products", authUser, isAdmin, addProduct);

/**
 * @route DELETE /api/admin/products/:id
 * @desc Delete a product
 * @access Private (Admin only)
 */
router.delete("/products/:id", authUser, isAdmin, deleteProduct);

/**
 * @route GET /api/admin/students
 * @desc Get all students
 * @access Private (Admin only)
 */
router.get("/students", authUser, isAdmin, getAllStudents);

/**
 * @route PATCH /api/admin/students/:id/uid
 * @desc Update student's UID
 * @access Private (Admin only)
 */
router.patch("/students/:id/uid", authUser, isAdmin, updateStudentUID);

/**
 * @route DELETE /api/admin/students/:id
 * @desc Delete a student
 * @access Private (Admin only)
 */
router.delete("/students/:id", authUser, isAdmin, deleteStudent);

/**
 * @route PATCH /api/admin/users/:id/promote
 * @desc Promote a user to admin
 * @access Private (Admin only)
 */
router.patch("/users/:id/promote", authUser, isAdmin, promoteToAdmin);

module.exports = router;