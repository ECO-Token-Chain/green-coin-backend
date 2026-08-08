const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.routes.js');
const wasteLogRouter = require('./routes/wasteLog.route.js');
const adminRouter = require('./routes/admin.route.js');
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/iot', wasteLogRouter);
app.use('/api/admin', adminRouter);
module.exports = app;