const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Activity route (must be after app is defined)
app.use('/api/activity', require('../routes/activity'));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/scholarships', require('../routes/scholarships'));
app.use('/api/applications', require('../routes/applications'));
app.use('/api/users', require('../routes/users'));
app.use('/api/profile', require('../routes/profile'));
app.use('/api/forum', require('../routes/forum'));
app.use('/api/messages', require('../routes/messages'));
app.use('/api/gemini', require('../routes/gemini'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// Export handler for Vercel serverless
module.exports = app;
module.exports.default = app;
