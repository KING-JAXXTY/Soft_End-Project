const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Function to generate unique user ID
function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'TA-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

const UserSchema = new mongoose.Schema({
    uniqueId: {
        type: String,
        unique: true,
        sparse: true // Allow null temporarily for migration
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    firstName: {
        type: String,
        required: [true, 'Please provide first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please provide last name']
    },
    role: {
        type: String,
        enum: ['student', 'sponsor', 'admin'],
        default: 'student'
    },
    avatar: {
        type: String,
        default: 'avatar1' // Default avatar
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    suspendedAt: {
        type: Date,
        default: null
    },
    suspendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    suspensionReason: {
        type: String,
        default: null
    },
    warnings: {
        type: Number,
        default: 0
    },
    warningHistory: [{
        reason: String,
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        issuedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
// uniqueId index is automatic due to unique: true

// Generate unique ID before saving new users
UserSchema.pre('save', async function(next) {
    // Generate uniqueId if not exists (for new users only)
    if (this.isNew && !this.uniqueId) {
        let unique = false;
        while (!unique) {
            this.uniqueId = generateUniqueId();
            const existing = await mongoose.model('User').findOne({ uniqueId: this.uniqueId });
            if (!existing) {
                unique = true;
            }
        }
    }
    
    // Hash password if modified
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
