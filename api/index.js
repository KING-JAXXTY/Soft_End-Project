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
let cachedDb = null;

async function connectDB() {
    if (cachedDb) {
        return cachedDb;
    }
    
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        cachedDb = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw error;
    }
}

// Connect to MongoDB
connectDB().catch(err => console.error('MongoDB connection error:', err));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/activity', require('../routes/activity'));
app.use('/api/auth', require('../routes/auth'));
app.use('/api/scholarships', require('../routes/scholarships'));
app.use('/api/applications', require('../routes/applications'));
app.use('/api/users', require('../routes/users'));
app.use('/api/profile', require('../routes/profile'));
app.use('/api/forum', require('../routes/forum'));
app.use('/api/messages', require('../routes/messages'));
app.use('/api/gemini', require('../routes/gemini'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
    });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({ message: 'Scholarship Management System API' });
});

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
