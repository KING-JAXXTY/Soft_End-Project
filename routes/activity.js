const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/activity/recent
// @desc    Get recent system activity for admin dashboard
// @access  Private (Admin)
router.get('/recent', protect, authorize('admin'), async (req, res) => {
    try {
        // Get recent users, scholarships, and applications (last 10 each)
        const [users, scholarships, applications] = await Promise.all([
            User.find().sort({ createdAt: -1 }).limit(10).lean(),
            Scholarship.find().sort({ createdAt: -1 }).limit(10).populate('sponsor', 'firstName lastName').lean(),
            Application.find().sort({ createdAt: -1 }).limit(10).populate('student', 'firstName lastName').populate('scholarship', 'title').lean()
        ]);

        // Format activity log with null checks
        const activities = [
            ...(users || []).map(u => ({
                type: 'user',
                action: 'User Registered',
                user: u && u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : 'Unknown User',
                time: u?.createdAt || new Date()
            })),
            ...(scholarships || []).map(s => ({
                type: 'scholarship',
                action: 'Scholarship Created',
                user: s?.sponsor?.firstName && s?.sponsor?.lastName ? `${s.sponsor.firstName} ${s.sponsor.lastName}` : 'Unknown Sponsor',
                detail: s?.title || 'Untitled Scholarship',
                time: s?.createdAt || new Date()
            })),
            ...(applications || []).map(a => ({
                type: 'application',
                action: 'Application Submitted',
                user: a?.student?.firstName && a?.student?.lastName ? `${a.student.firstName} ${a.student.lastName}` : 'Unknown Student',
                detail: a?.scholarship?.title || 'Unknown Scholarship',
                time: a?.createdAt || new Date()
            }))
        ];

        // Sort all activities by time (desc)
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json({ success: true, activities: activities.slice(0, 20) });
    } catch (error) {
        console.error('Error fetching activity log:', error);
        res.status(500).json({ success: false, message: 'Error fetching activity log', error: error.message });
    }
});

module.exports = router;
