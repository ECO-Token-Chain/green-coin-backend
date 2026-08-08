const mongoose = require('mongoose');

const dustbinSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    currentFillLevel: {
        type: Number,
        required: true,
        default: 0
    },
    capacity: {
        type: Number,
        required: true,
    },
    wasteType: {
        type: String,
        required: true,
        enum: ["wet", "dry"],
        default: "dry"
    },
    panchayat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Panchayat',
        default: null
    },
    location: {
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true });

const dustbinModel = mongoose.model('Dustbin', dustbinSchema);
module.exports = dustbinModel;