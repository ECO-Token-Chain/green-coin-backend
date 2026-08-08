const express = require('express');
const router = express.Router();
const {
    getAllStudents,
    updateStudentUID,
    deleteStudent,
    promoteToAdmin,
    addProduct,
    deleteProduct,
    getStudentById
} = require('../controller/admin.controller.js');
const { getAllTransactions } = require('../controller/transaction.controller.js'); //  Import the transaction controller
const { authUser, isAdmin } = require('../middleware/auth.middleware.js');
const upload = require('../middleware/multer.js');

/**
 * @route POST /api/admin/products
 * @desc Add a new product
 * @access Private (Admin only)
 */
router.post("/products", authUser, isAdmin, upload.single("image"), addProduct);

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
 * @route GET /api/admin/students/:id
 * @desc Get a student by ID
 * @access Private (Admin only)
 */
router.get("/students/:id", authUser, isAdmin, getStudentById);

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

router.get("/students/:id", authUser, isAdmin, getStudentById);

/**
 * @route PATCH /api/admin/users/:id/promote
 * @desc Promote a user to admin
 * @access Private (Admin only)
 */
router.patch("/users/:id/promote", authUser, isAdmin, promoteToAdmin);

/**
 * @route GET /api/admin/transactions
 * @desc Get all transactions (Rewards & Purchases)
 * @access Private (Admin only)
 */
router.get("/transactions", authUser, isAdmin, getAllTransactions);

module.exports = router;