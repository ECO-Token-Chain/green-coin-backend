const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
async function register(req, res) {
  try {
    const { name, email, password, rollNo } = req.body;

    const query = [{ email }];

    if (rollNo) {
      query.push({ rollNo });
    }

    const existingUser = await userModel.findOne({
      $or: query
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or roll number already exists'
      });
    }

    const newUser = await userModel.create({
      name,
      email,
      password,
      role: "user",
      rollNo
    });

    const token = jwt.sign({
      id: newUser._id,
      role: newUser.role
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        rollNo: newUser.rollNo,
        uid: newUser.uid,
        wasteDroppedToday: newUser.wasteDroppedToday,
      }
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

async function login(req,res){
    const { identifier, password } = req.body;
    try{
        const user = await userModel.findOne({
            $or: [
                { email: identifier },
                { rollNo: identifier }
            ]
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNo: user.rollNo,
                uid: user.uid,
                wasteDroppedToday: user.wasteDroppedToday,
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

async function getMe(req,res){
    try{
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        res.status(200).json({
            message: 'User details fetched successfully',
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNo: user.rollNo,
                uid: user.uid,
                wasteDroppedToday: user.wasteDroppedToday,
            }
        })
    }catch(err){
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

module.exports = {
    register,
    login,
    getMe
}