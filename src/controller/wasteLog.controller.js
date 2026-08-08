const wasteLogModel = require("../models/waste.model.js");
const userModel = require("../models/user.model.js");
async function logWasteDeposit(req, res){
    try{
        const { uid, weight } = req.body;

        if(!uid || !weight){
            return res.status(400).json({ message: "UID and weight are required" });
        }
        const user = await userModel.findOne({ uid });

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        const wasteLog = await wasteLogModel.create({
            userId: user._id,
            uid,
            weight
        })

        res.status(201).json({ message: "Waste deposit logged successfully", wasteLog });

        await userModel.findByIdAndUpdate(user._id, { $inc: { wasteDroppedToday: weight } });

    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

module.exports = {
    logWasteDeposit
}