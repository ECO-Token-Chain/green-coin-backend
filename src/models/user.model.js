const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'Name is required'],
        trim: true
    },

    email:{
        type:String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email']
    },

    password:{
        type:String,
        required: [true, 'Password is required'],
        select: false
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
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

    wasteDroppedToday:{
        type:Number,
        default:0,
    }

}, { timestamps: true });

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    try{
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }catch(err){
        next(err);
    }
});

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;