const mongoose = require('mongoose');

const panchayatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Panchayat name is required'],
        trim: true,
        unique: true
    },
    location: {
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true });

const panchayatModel = mongoose.model('Panchayat', panchayatSchema);

module.exports = panchayatModel;
