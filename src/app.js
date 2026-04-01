const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.routes.js');
const wasteLogRouter = require('./routes/wasteLog.route.js');
const adminRouter = require('./routes/admin.route.js');
const productRouter = require('./routes/product.routes.js');
const userRouter = require('./routes/user.routes.js');
const leaderboardRouter = require('./routes/leaderboard.route.js');
const analyticsRouter = require('./routes/analytics.route.js');
const vendorRouter = require('./routes/vendor.route.js');
const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://camera-model-rho.vercel.app", 
        "https://green-coin-frontend.vercel.app",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/iot', wasteLogRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productRouter);
app.use('/api/user', userRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/vendor', vendorRouter);
module.exports = app;