const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with caching for serverless
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10,
            minPoolSize: 2,
        });

        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB Connected:', db.connection.host);
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        throw error;
    }
};

// Connect to MongoDB (for serverless, this will be called on each request)
if (process.env.VERCEL) {
    // In Vercel, connect on-demand
    app.use(async (req, res, next) => {
        try {
            await connectDB();
            next();
        } catch (error) {
            res.status(500).json({ success: false, message: 'Database connection failed' });
        }
    });
} else {
    // In local development, connect once
    connectDB();
}

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/activity', require('./routes/activity'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/gemini', require('./routes/gemini'));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in serverless environment
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
