const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    scholarship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scholarship',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'under-review'],
        default: 'pending'
    },
    coverLetter: {
        type: String,
        required: [true, 'Please provide a cover letter']
    },
    documentsLink: {
        type: String,
        required: [true, 'Please provide a Google Drive link to your documents']
    },
    additionalInfo: {
        type: String,
        default: ''
    },
    documents: [{
        filename: String,
        path: String,
        uploadDate: Date
    }],
    reviewNotes: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    certificateGenerated: {
        type: Boolean,
        default: false
    },
    certificateId: {
        type: String
    },
    certificateGeneratedAt: {
        type: Date
    }
});

// Index for faster queries
ApplicationSchema.index({ student: 1, scholarship: 1 });
ApplicationSchema.index({ scholarship: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
