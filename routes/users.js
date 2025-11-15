const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const ForumPost = require('../models/ForumPost');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users with their profiles
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { role } = req.query;
        
        let query = {};
        if (role) {
            query.role = role;
        }
        
        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        
        // Fetch profiles for all users
        const usersWithProfiles = await Promise.all(users.map(async (user) => {
            const profile = await Profile.findOne({ user: user._id });
            return {
                ...user.toObject(),
                region: profile?.region || profile?.studentInfo?.region || 'N/A',
                phone: profile?.phone || 'N/A'
            };
        }));
        
        res.json({
            success: true,
            count: usersWithProfiles.length,
            users: usersWithProfiles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// @route   DELETE /api/users/account
// @desc    Delete own account (students and sponsors only, not admins)
// @access  Private
router.delete('/account', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Prevent admin from deleting their own account
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admins cannot delete their own accounts'
            });
        }
        
        // Delete associated profile
        await Profile.findOneAndDelete({ user: userId });
        
        // Delete associated applications if student
        if (user.role === 'student') {
            await Application.deleteMany({ student: userId });
        }
        
        // Delete associated scholarships if sponsor
        if (user.role === 'sponsor') {
            await Scholarship.deleteMany({ sponsor: userId });
        }
        
        // Delete forum posts
        await ForumPost.deleteMany({ author: userId });
        
        // Delete messages
        await Message.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] });
        
        // Delete conversations
        await Conversation.deleteMany({ participants: userId });
        
        // Finally delete the user
        await user.deleteOne();
        
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting account'
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user by ID (admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        await user.deleteOne();
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
});

// @route   GET /api/users/public-statistics
// @desc    Get public platform statistics (for landing page)
// @access  Public
router.get('/public-statistics', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalSponsors = await User.countDocuments({ role: 'sponsor' });
        const activeScholarships = await Scholarship.countDocuments({ status: 'active' });
        
        res.json({
            success: true,
            data: {
                totalStudents,
                totalSponsors,
                totalScholarships: activeScholarships
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// @route   GET /api/users/statistics
// @desc    Get platform statistics
// @access  Private (Admin)
router.get('/statistics', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalSponsors = await User.countDocuments({ role: 'sponsor' });
        const activeScholarships = await Scholarship.countDocuments({ status: 'active' });
        const totalScholarships = await Scholarship.countDocuments();
        const totalApplications = await Application.countDocuments();
        const pendingApplications = await Application.countDocuments({ status: 'pending' });
        const approvedApplications = await Application.countDocuments({ status: 'approved' });
        
        res.json({
            success: true,
            statistics: {
                totalUsers,
                totalStudents,
                totalSponsors,
                activeScholarships,
                totalScholarships,
                totalApplications,
                pendingApplications,
                approvedApplications
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// @route   POST /api/users/migrate-unique-ids
// @desc    Generate unique IDs for all existing users
// @access  Private (Admin)
router.post('/migrate-unique-ids', protect, authorize('admin'), async (req, res) => {
    try {
        // Function to generate unique ID
        function generateUniqueId() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let id = 'TA-';
            for (let i = 0; i < 8; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        }

        // Find users without uniqueId
        const usersWithoutId = await User.find({ uniqueId: { $exists: false } }).select('+password');
        
        let updated = 0;
        for (const user of usersWithoutId) {
            let unique = false;
            let uniqueId;
            
            while (!unique) {
                uniqueId = generateUniqueId();
                const existing = await User.findOne({ uniqueId });
                if (!existing) {
                    unique = true;
                }
            }
            
            user.uniqueId = uniqueId;
            await user.save({ validateBeforeSave: false });
            updated++;
        }

        res.json({
            success: true,
            message: `Successfully generated unique IDs for ${updated} users`,
            updated
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error migrating user IDs'
        });
    }
});

// @route   PUT /api/users/:id/suspend
// @desc    Suspend a user (Admin only - Manual action)
// @access  Private (Admin)
router.put('/:id/suspend', protect, authorize('admin'), async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Suspension reason is required'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from suspending themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot suspend yourself'
            });
        }

        // Prevent suspending other admins
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot suspend admin users'
            });
        }

        user.isSuspended = true;
        user.suspendedAt = Date.now();
        user.suspendedBy = req.user._id;
        user.suspensionReason = reason;

        await user.save();

        res.json({
            success: true,
            message: 'User suspended successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                isSuspended: user.isSuspended,
                suspendedAt: user.suspendedAt
            }
        });
    } catch (error) {
        console.error('Suspension error:', error);
        res.status(500).json({
            success: false,
            message: 'Error suspending user'
        });
    }
});

// @route   PUT /api/users/:id/unsuspend
// @desc    Unsuspend a user (Admin only)
// @access  Private (Admin)
router.put('/:id/unsuspend', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isSuspended = false;
        user.suspendedAt = null;
        user.suspendedBy = null;
        user.suspensionReason = null;

        await user.save();

        res.json({
            success: true,
            message: 'User unsuspended successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                isSuspended: user.isSuspended
            }
        });
    } catch (error) {
        console.error('Unsuspension error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unsuspending user'
        });
    }
});

// @route   PUT /api/users/:id/warn
// @desc    Issue a warning to a user (Admin only - Manual action)
// @access  Private (Admin)
router.put('/:id/warn', protect, authorize('admin'), async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Warning reason is required'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent warning yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot warn yourself'
            });
        }

        // Prevent warning other admins
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot warn admin users'
            });
        }

        // Add warning
        user.warnings += 1;
        user.warningHistory.push({
            reason,
            issuedBy: req.user._id,
            issuedAt: Date.now()
        });

        await user.save();

        res.json({
            success: true,
            message: `Warning issued successfully. User now has ${user.warnings} warning(s).`,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                warnings: user.warnings
            }
        });
    } catch (error) {
        console.error('Warning error:', error);
        res.status(500).json({
            success: false,
            message: 'Error issuing warning'
        });
    }
});

// @route   GET /api/users/:id/status
// @desc    Get user suspension and warning status
// @access  Private (Admin)
router.get('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('suspendedBy', 'firstName lastName')
            .populate('warningHistory.issuedBy', 'firstName lastName');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            status: {
                isSuspended: user.isSuspended,
                suspendedAt: user.suspendedAt,
                suspendedBy: user.suspendedBy,
                suspensionReason: user.suspensionReason,
                warnings: user.warnings,
                warningHistory: user.warningHistory,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user status'
        });
    }
});

module.exports = router;
