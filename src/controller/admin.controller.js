const userModel = require("../models/user.model.js");
const productModel = require("../models/product.model.js");

async function getAllStudents(req, res) {
    try{
        const role = req.user.role;
        if(role !== "admin"){
            return res.status(403).json({ message: "Access denied" });
        }
        const students = await userModel.find({ role: "user" }).select("-password");
        res.status(200).json({
            message: "Students retrieved successfully",
            students
        })
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });

    }
}
async function updateStudentUID(req, res) {
    try{
        const role = req.user.role;
        if(role !== "admin"){
            return res.status(403).json({ message: "Access denied" });
        }
        const { id } = req.params;
        const { uid } = req.body;
        const student = await userModel.findByIdAndUpdate(id, { uid: uid.toLowerCase() }, { returnDocument: "after" }).select("-password");
        if(!student){
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({
            message: "Student UID updated successfully",
            student
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

async function deleteStudent(req, res) {
    try{
        const role = req.user.role;
        if(role !== "admin"){
            return res.status(403).json({ message: "Access denied" });
        }
        const { id } = req.params;
        const student = await userModel.findByIdAndDelete(id).select("-password");
        if(!student){
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({
            message: "Student deleted successfully",
            student
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });

    }
}
async function promoteToAdmin(req, res) {
    try{
        const role = req.user.role;
        if(role !== "admin"){
            return res.status(403).json({ message: "Access denied" });
        }
        const { id } = req.params;
        const user = await userModel.findByIdAndUpdate(id, { role: "admin" }, { returnDocument: "after" }).select("-password");
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User promoted to admin successfully",
            user
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}
async function addProduct(req, res) {
    try {
        const { name, price, image } = req.body;
        
        // Basic validation
        if (!name || !price || !image) {
            return res.status(400).json({ message: "Product name, price, and image are required" });
        }

        const product = new productModel({
            name,
            price,
            image
        });

        await product.save();

        res.status(201).json({
            message: "Product added successfully",
            product
        });

    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const product = await productModel.findByIdAndDelete(id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            message: "Product deleted successfully",
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
    getAllStudents,
    updateStudentUID,
    deleteStudent,
    promoteToAdmin,
    addProduct,
    deleteProduct
}