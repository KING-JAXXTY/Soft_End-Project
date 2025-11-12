const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads/applications');
try { if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); } } catch (e) { /* Serverless: read-only filesystem */ }

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, `application-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only documents and images are allowed'));
        }
    }
});

// @route   POST /api/applications
// @desc    Submit scholarship application
// @access  Private (Student)
router.post('/', protect, authorize('student'), upload.array('documents', 5), async (req, res) => {
    try {
        console.log('📥 Received application request');
        console.log('📦 Request body:', req.body);
        console.log('📄 Files:', req.files?.length || 0);
        
        const { scholarshipId, coverLetter } = req.body;
        
        console.log('🎯 Scholarship ID:', scholarshipId);
        console.log('✍️ Cover Letter:', coverLetter?.substring(0, 50) + '...');
        
        if (!scholarshipId) {
            return res.status(400).json({
                success: false,
                message: 'Scholarship ID is required'
            });
        }
        
        if (!coverLetter) {
            return res.status(400).json({
                success: false,
                message: 'Cover letter is required'
            });
        }
        
        // Check if scholarship exists
        const scholarship = await Scholarship.findById(scholarshipId);
        if (!scholarship) {
            console.error('❌ Scholarship not found:', scholarshipId);
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }
        
        console.log('✅ Scholarship found:', scholarship.title);
        
        // Check if deadline has passed
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(scholarship.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today) {
            console.log('❌ Deadline has passed');
            return res.status(400).json({
                success: false,
                message: 'Application deadline has passed for this scholarship'
            });
        }
        
        // Check if scholarship is closed
        if (scholarship.status !== 'active') {
            console.log('❌ Scholarship is closed');
            return res.status(400).json({
                success: false,
                message: 'This scholarship is no longer accepting applications'
            });
        }
        
        // Check if already applied
        console.log('🔍 Checking for existing application...');
        const existingApplication = await Application.findOne({
            scholarship: scholarshipId,
            student: req.user._id
        });
        
        if (existingApplication) {
            console.log('⚠️ Already applied');
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this scholarship'
            });
        }
        
        console.log('✅ No existing application found');
        
        // Process uploaded files
        const documents = req.files ? req.files.map(file => ({
            filename: file.filename,
            path: `/uploads/applications/${file.filename}`,
            uploadDate: new Date()
        })) : [];
        
        console.log('📎 Processed documents:', documents.length);
        
        // Create application
        const application = await Application.create({
            scholarship: scholarshipId,
            student: req.user._id,
            coverLetter,
            documents
        });
        
        console.log('✅ Application created:', application._id);
        
        // Update scholarship applicants count
        await Scholarship.findByIdAndUpdate(scholarshipId, {
            $inc: { applicantsCount: 1 }
        });
        
        console.log('📊 Updated scholarship applicants count');
        
        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        console.error('❌ Application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application'
        });
    }
});

// @route   GET /api/applications/student/my-applications
// @desc    Get applications for logged-in student
// @access  Private (Student)
router.get('/student/my-applications', protect, authorize('student'), async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user._id })
            .populate('scholarship', 'title amount deadline sponsor')
            .populate({
                path: 'scholarship',
                populate: {
                    path: 'sponsor',
                    select: 'firstName lastName'
                }
            })
            .sort({ appliedAt: -1 });
        
        res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications'
        });
    }
});

// @route   GET /api/applications/sponsor/received
// @desc    Get applications for sponsor's scholarships
// @access  Private (Sponsor)
router.get('/sponsor/received', protect, authorize('sponsor'), async (req, res) => {
    try {
        // Get sponsor's scholarships
        const scholarships = await Scholarship.find({ sponsor: req.user._id }).select('_id');
        const scholarshipIds = scholarships.map(s => s._id);
        
        // Get applications for those scholarships
        const applications = await Application.find({ scholarship: { $in: scholarshipIds } })
            .populate('scholarship', 'title amount deadline')
            .populate('student', 'firstName lastName email')
            .sort({ appliedAt: -1 });
        
        res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications'
        });
    }
});

// @route   GET /api/applications/:id/full-details
// @desc    Get full application details for certificate generation
// @access  Private
router.get('/:id/full-details', protect, async (req, res) => {
    try {
        // Validate ObjectId
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID'
            });
        }

        const application = await Application.findById(req.params.id)
            .populate('student', 'firstName lastName email')
            .populate({
                path: 'scholarship',
                populate: {
                    path: 'sponsor',
                    select: 'firstName lastName email'
                }
            });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check authorization - handle missing student reference gracefully
        let isStudent = false;
        let isSponsor = false;
        const isAdmin = req.user.role === 'admin';

        if (application.student) {
            isStudent = req.user._id.toString() === application.student._id.toString();
        }
        
        if (application.scholarship && application.scholarship.sponsor) {
            isSponsor = application.scholarship.sponsor._id.toString() === req.user._id.toString();
        }

        if (!isStudent && !isSponsor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this application'
            });
        }

        // Generate certificate ID if approved and not yet generated
        if (application.status === 'approved' && !application.certificateId) {
            application.certificateId = `CERT-${Date.now()}-${application._id.toString().slice(-6).toUpperCase()}`;
            application.certificateGenerated = true;
            application.certificateGeneratedAt = new Date();
            await application.save();
        }

        res.json({
            success: true,
            application: application,
            scholarship: application.scholarship,
            student: application.student
        });
    } catch (error) {
        console.error('Error fetching application details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching application details'
        });
    }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
const mongoose = require('mongoose');
router.get('/:id', protect, async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID.'
            });
        }
        const application = await Application.findById(req.params.id)
            .populate('scholarship', 'title amount deadline sponsor')
            .populate('student', 'firstName lastName email');
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        // Check authorization
        const isStudent = application.student._id.toString() === req.user._id.toString();
        const isSponsor = application.scholarship.sponsor.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isStudent && !isSponsor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this application'
            });
        }
        res.json({
            success: true,
            application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching application'
        });
    }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Sponsor)
router.put('/:id/status', protect, authorize('sponsor'), async (req, res) => {
    try {
        const { status, reviewNotes } = req.body;
        
        const application = await Application.findById(req.params.id)
            .populate('scholarship', 'sponsor');
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        // Check if sponsor owns the scholarship
        if (application.scholarship.sponsor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this application'
            });
        }
        
        application.status = status;
        application.reviewNotes = reviewNotes;
        application.reviewedBy = req.user._id;
        application.reviewedAt = Date.now();
        
        await application.save();
        
        res.json({
            success: true,
            application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating application status'
        });
    }
});

// @route   DELETE /api/applications/:id
// @desc    Delete application
// @access  Private (Student - own application only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        // Check if user owns this application (students can only delete their own)
        if (application.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this application'
            });
        }
        
        await Application.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting application'
        });
    }
});

module.exports = router;

