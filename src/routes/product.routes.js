const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById } = require('../controller/product.controller.js');
const { authUser } = require('../middleware/auth.middleware.js');

router.get("/", authUser, getAllProducts);
router.get("/:id", authUser, getProductById);

module.exports = router;
