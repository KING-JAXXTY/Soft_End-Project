const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads/profiles');
try { if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); } } catch (e) { /* Serverless: read-only filesystem */ }

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, `profile-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2MB limit for profile pictures
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'email firstName lastName role avatar');
        
        // Create profile if it doesn't exist
        if (!profile) {
            profile = await Profile.create({ user: req.user._id });
            profile = await Profile.findById(profile._id).populate('user', 'email firstName lastName role avatar');
        }
        
        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// @route   GET /api/profile/:userId
// @desc    Get user profile by ID (public view)
// @access  Private
router.get('/:userId', protect, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'email firstName lastName role avatar');
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        
        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', protect, async (req, res) => {
    try {
        const {
            phone,
            bio,
            region,
            province,
            municipality,
            avatar,
            institution,
            gradeLevel,
            gpa,
            major,
            graduationYear,
            organization,
            website,
            contactEmail,
            description,
            facebook,
            twitter,
            linkedin
        } = req.body;
        
        let profile = await Profile.findOne({ user: req.user._id });
        
        if (!profile) {
            profile = await Profile.create({ user: req.user._id });
        }
        
        // Update basic fields - allow empty strings to clear fields
        if (phone !== undefined) profile.phone = phone;
        if (bio !== undefined) profile.bio = bio;
        if (region !== undefined) profile.region = region;
        if (province !== undefined) profile.province = province;
        if (municipality !== undefined) profile.municipality = municipality;
        
        // Update avatar in User model - always update if provided
        if (avatar !== undefined) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.user._id, { avatar: avatar || 'avatar1' });
        }
        
        // Update student info if user is a student
        if (req.user.role === 'student') {
            if (!profile.studentInfo) {
                profile.studentInfo = {};
            }
            if (institution !== undefined) profile.studentInfo.institution = institution;
            if (gradeLevel !== undefined) profile.studentInfo.gradeLevel = gradeLevel;
            if (gpa !== undefined) profile.studentInfo.gpa = gpa;
            if (major !== undefined) profile.studentInfo.major = major;
            if (graduationYear !== undefined) profile.studentInfo.graduationYear = graduationYear;
        }
        
        // Update sponsor info if user is a sponsor
        if (req.user.role === 'sponsor') {
            if (!profile.sponsorInfo) {
                profile.sponsorInfo = {};
            }
            if (organization !== undefined) profile.sponsorInfo.organization = organization;
            if (website !== undefined) profile.sponsorInfo.website = website;
            if (contactEmail !== undefined) profile.sponsorInfo.contactEmail = contactEmail;
            if (description !== undefined) profile.sponsorInfo.description = description;
            // Keep verified status
            if (profile.sponsorInfo.verified === undefined) {
                profile.sponsorInfo.verified = false;
            }
        }
        
        // Update social links
        if (!profile.socialLinks) {
            profile.socialLinks = {};
        }
        if (facebook !== undefined) profile.socialLinks.facebook = facebook;
        if (twitter !== undefined) profile.socialLinks.twitter = twitter;
        if (linkedin !== undefined) profile.socialLinks.linkedin = linkedin;
        
        await profile.save();
        
        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

// @route   POST /api/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post('/picture', protect, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }
        
        let profile = await Profile.findOne({ user: req.user._id });
        
        if (!profile) {
            profile = await Profile.create({ user: req.user._id });
        }
        
        // Delete old profile picture if exists
        if (profile.profilePicture && profile.profilePicture.filename) {
            const oldPath = path.join(__dirname, '../uploads/profiles', profile.profilePicture.filename);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        
        profile.profilePicture = {
            filename: req.file.filename,
            path: `/uploads/profiles/${req.file.filename}`
        };
        
        await profile.save();
        
        res.json({
            success: true,
            profilePicture: profile.profilePicture
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile picture'
        });
    }
});

module.exports = router;

