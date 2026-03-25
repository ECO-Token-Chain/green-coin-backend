const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String, // Cloudinary URL or filename
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
