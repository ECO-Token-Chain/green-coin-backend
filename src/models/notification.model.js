const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message:{
        type: String,
    }
},{timestamps: true});

const notificationModel = mongoose.model('Notification', notificationSchema);
module.exports = notificationModel;