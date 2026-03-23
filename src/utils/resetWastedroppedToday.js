const cron = require("node-cron");
const userModel = require("../models/user.model.js");

cron.schedule("0 0 * * *", async () => {
  await userModel.updateMany({}, {
    $set: { wasteDroppedToday: 0 }
  });
}, {
  timezone: "Asia/Kolkata"
});