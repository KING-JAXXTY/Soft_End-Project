const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    phone: {
        type: String,
        trim: true
    },
    region: {
        type: String,
        trim: true
    },
    province: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    profilePicture: {
        filename: String,
        path: String
    },
    // Student-specific fields
    studentInfo: {
        institution: String,
        region: String,
        gradeLevel: String,
        gpa: Number,
        major: String,
        graduationYear: Number
    },
    // Student favorites
    favoriteScholarships: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scholarship'
    }],
    // Sponsor-specific fields
    sponsorInfo: {
        organization: String,
        website: String,
        contactEmail: String,
        description: String,
        verified: {
            type: Boolean,
            default: false
        }
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        linkedin: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
ProfileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Profile', ProfileSchema);
