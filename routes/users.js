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

// @route   DELETE /api/users/:id
// @desc    Delete user
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

// @route   DELETE /api/users/account
// @desc    Delete own account
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

module.exports = router;
