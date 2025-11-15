const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private (Student/Sponsor)
router.post('/', protect, authorize('student', 'sponsor'), async (req, res) => {
    try {
        const { reportType, subject, description, reportedUserId, relatedScholarship } = req.body;

        // Validate required fields
        if (!reportType || !subject || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide report type, subject, and description'
            });
        }

        // Create report
        const report = await Report.create({
            reportType,
            subject,
            description,
            reporter: req.user._id,
            reporterRole: req.user.role,
            reportedUserId: reportedUserId || null,
            relatedScholarship: relatedScholarship || null
        });

        await report.populate('reporter', 'firstName lastName email uniqueId role avatar');

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            report
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting report'
        });
    }
});

// @route   GET /api/reports/my-reports
// @desc    Get current user's submitted reports
// @access  Private (Student/Sponsor)
router.get('/my-reports', protect, authorize('student', 'sponsor'), async (req, res) => {
    try {
        const reports = await Report.find({ reporter: req.user._id })
            .populate('resolvedBy', 'firstName lastName uniqueId')
            .populate('relatedScholarship', 'title')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your reports'
        });
    }
});

// @route   GET /api/reports
// @desc    Get all reports (admin only)
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, reportType } = req.query;

        let query = {};
        if (status) query.status = status;
        if (reportType) query.reportType = reportType;

        const reports = await Report.find(query)
            .populate('reporter', 'firstName lastName email uniqueId role avatar')
            .populate('resolvedBy', 'firstName lastName uniqueId')
            .populate('relatedScholarship', 'title')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reports'
        });
    }
});

// @route   GET /api/reports/search
// @desc    Search for user by unique ID
// @access  Private (Admin)
router.get('/search', protect, authorize('admin'), async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user ID'
            });
        }

        const user = await User.findOne({ uniqueId: userId }).select('firstName lastName email uniqueId role avatar');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with that ID'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error searching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching for user'
        });
    }
});

// @route   GET /api/reports/:id
// @desc    Get single report
// @access  Private (Admin)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('reporter', 'firstName lastName email uniqueId role avatar')
            .populate('resolvedBy', 'firstName lastName uniqueId')
            .populate('relatedScholarship', 'title');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching report'
        });
    }
});

// @route   PUT /api/reports/:id/status
// @desc    Update report status
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        report.status = status || report.status;
        report.adminNotes = adminNotes !== undefined ? adminNotes : report.adminNotes;

        if (status === 'Resolved' || status === 'Closed') {
            report.resolvedBy = req.user._id;
            report.resolvedAt = Date.now();
        }

        await report.save();
        await report.populate('reporter', 'firstName lastName email uniqueId role avatar');
        await report.populate('resolvedBy', 'firstName lastName uniqueId');

        res.json({
            success: true,
            message: 'Report updated successfully',
            report
        });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating report'
        });
    }
});

// @route   GET /api/reports/stats/summary
// @desc    Get reports statistics
// @access  Private (Admin)
router.get('/stats/summary', protect, authorize('admin'), async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'Pending' });
        const reviewingReports = await Report.countDocuments({ status: 'Reviewing' });
        const resolvedReports = await Report.countDocuments({ status: 'Resolved' });

        res.json({
            success: true,
            stats: {
                total: totalReports,
                pending: pendingReports,
                reviewing: reviewingReports,
                resolved: resolvedReports
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// @route   GET /api/reports/user/:userId
// @desc    Get all reports about a specific user by their uniqueId
// @access  Private (Admin)
router.get('/user/:userId', protect, authorize('admin'), async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all reports with this user ID
        const reports = await Report.find({ reportedUserId: userId })
            .populate('reporter', 'firstName lastName email uniqueId role avatar')
            .populate('resolvedBy', 'firstName lastName uniqueId')
            .sort({ createdAt: -1 });

        // Get count by status
        const totalCount = reports.length;
        const pendingCount = reports.filter(r => r.status === 'Pending').length;
        const reviewingCount = reports.filter(r => r.status === 'Reviewing').length;
        const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

        res.json({
            success: true,
            count: totalCount,
            stats: {
                total: totalCount,
                pending: pendingCount,
                reviewing: reviewingCount,
                resolved: resolvedCount
            },
            reports
        });
    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user reports'
        });
    }
});

module.exports = router;
