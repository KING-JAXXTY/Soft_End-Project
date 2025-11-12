const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodbUri: process.env.MONGODB_URI ? 'set' : 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

let isConnected = false;
let connectingPromise = null;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }
    
    if (connectingPromise) {
        return connectingPromise;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    try {
        connectingPromise = mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 10000,
            maxPoolSize: 5,
            retryWrites: true,
        });
        
        await connectingPromise;
        isConnected = true;
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Error:', error.message);
        isConnected = false;
        connectingPromise = null;
        throw error;
    } finally {
        connectingPromise = null;
    }
};

// Middleware to ensure DB connection for API routes
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('DB Connection Error:', error.message);
        res.status(503).json({ 
            success: false, 
            message: 'Database unavailable: ' + error.message
        });
    }
});

// API Routes ONLY - Vercel serves static files directly
app.use('/api/activity', require('./routes/activity'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/gemini', require('./routes/gemini'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Server Error' 
    });
});

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;
