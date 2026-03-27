const userModel = require("../models/user.model.js");
const productModel = require("../models/product.model.js");
const notificationModel = require("../models/notification.model.js");
const getDataUri = require("../utils/dataUri.js");
const cloudinary = require("../utils/cloudinary.js");

async function getAllStudents(req, res) {
    try {
        const role = req.user.role;
        if (role !== "admin") {
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
    try {
        const role = req.user.role;
        if (role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        const { id } = req.params;
        const { uid } = req.body;
        const student = await userModel.findByIdAndUpdate(id, { uid: uid.toLowerCase() }, { returnDocument: "after" }).select("-password");
        if (!student) {
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
    try {
        const role = req.user.role;
        if (role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        const { id } = req.params;
        const student = await userModel.findByIdAndDelete(id).select("-password");
        if (!student) {
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
    try {
        const role = req.user.role;
        if (role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        const { id } = req.params;
        const user = await userModel.findByIdAndUpdate(id, { role: "admin" }, { returnDocument: "after" }).select("-password");
        if (!user) {
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
        const { name, price } = req.body;
        const file = req.file;

        if (!name || !price || !file) {
            return res.status(400).json({ message: "Product name, price, and image are required" });
        }
        const parsedPrice = Number(price);
        if (isNaN(parsedPrice)) {
            return res.status(400).json({ message: "Invalid price format. Price must be a number." });
        }

        const fileUri = getDataUri(file);


        const myCloud = await cloudinary.uploader.upload(fileUri.content);

        const product = new productModel({
            name,
            price: parsedPrice,
            image: myCloud.secure_url
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

async function getStudentById(req, res) {
    try {
        const role = req.user.role;
        if (role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        const { id } = req.params;
        const student = await userModel.findById(id).select("-password");
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({
            message: "Student found successfully",
            student
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

async function getNotificitations(req,res){
    try{
        const role = req.user.role;
        if (role !== "admin") {
          return res.status(403).json({ message: "Access denied. Admins only." });
        }
        const notifications = await notificationModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: "Notifications retrieved successfully",
            notifications
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
    deleteProduct,
    getStudentById,
    getNotificitations
}