const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        required: true,
        enum: ['Technical Issue', 'Scholarship Issue', 'User Complaint', 'Payment Issue', 'Feature Request', 'Other']
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reporterRole: {
        type: String,
        required: true,
        enum: ['student', 'sponsor']
    },
    reportedUserId: {
        type: String,
        default: null,
        trim: true
    },
    relatedScholarship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scholarship',
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewing', 'Resolved', 'Closed'],
        default: 'Pending'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
