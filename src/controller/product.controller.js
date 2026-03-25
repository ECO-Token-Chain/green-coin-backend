const productModel = require("../models/product.model.js");

async function getAllProducts(req, res) {
    try {
        const products = await productModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: "Products retrieved successfully",
            products
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

async function getProductById(req, res) {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({
            message: "Product retrieved successfully",
            product
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

module.exports = {
    getAllProducts,
    getProductById
}
