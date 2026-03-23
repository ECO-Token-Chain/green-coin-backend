const mongoose = require('mongoose');

const dustbinSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    currentFillLevel:{
        type:Number,
        required:true,
        default:0
    },
    capacity:{
        type:Number,
        required:true,
    }
},{timestamps:true});

const dustbinModel = mongoose.model('Dustbin', dustbinSchema);
module.exports = dustbinModel;