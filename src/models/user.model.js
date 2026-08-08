const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    uid: {
        type: String,
        default: null
    },
    rollNo: {
        type: String,
        required: function () {
            return this.role === "user";
        },
        unique: true,
        sparse: true,
        trim: true
    },

    wasteDroppedToday: {
        type: Number,
        default: 0,
    },
    points: {
        type: Number,
        default: 0,
    },
    pointsEarnedToday: {
        type: Number,
        default: 0,
    },
    lastPointUpdateDate: {
        type: String,
        default: "",
    },
    walletAddress: {
        type: String,
        default: "",
    }


}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        this.password = await bcrypt.hash(this.password, 10);
    } catch (err) {
        throw new Error('Error hashing password');
    }
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;