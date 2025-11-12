const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide scholarship title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide description']
    },
    amount: {
        type: Number
    },
    benefits: {
        type: String
    },
    selectionCriteria: {
        type: String
    },
    contactEmail: {
        type: String
    },
    contactPhone: {
        type: String
    },
    applicationLink: {
        type: String
    },
    renewalPolicy: {
        type: String
    },
    scholarshipType: {
        type: String,
        enum: ['Full Scholarship', 'Partial Scholarship', 'Allowance', 'Grant', 'Financial Aid'],
        required: true
    },
    type: {
        type: String,
        enum: ['academic', 'financial-need', 'merit-based', 'sports', 'arts', 'community-service', 'other'],
        default: 'other'
    },
    deadline: {
        type: Date,
        required: [true, 'Please provide deadline']
    },
    requirements: {
        type: [String],
        default: []
    },
    eligibility: {
        type: String,
        required: true
    },
    documentsRequired: {
        type: String,
        default: ''
    },
    availableSlots: {
        type: Number,
        default: 1
    },
    region: {
        type: String,
        default: ''
    },
    affiliatedInstitution: {
        type: String,
        default: ''
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    sponsor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'pending'],
        default: 'active'
    },
    documents: [{
        filename: String,
        path: String,
        uploadDate: Date
    }],
    applicantsCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for faster queries
ScholarshipSchema.index({ sponsor: 1, status: 1 });
ScholarshipSchema.index({ status: 1, deadline: -1 });
ScholarshipSchema.index({ title: 'text', description: 'text' });
ScholarshipSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Scholarship', ScholarshipSchema);
