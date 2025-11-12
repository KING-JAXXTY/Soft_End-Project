const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Auto-archive expired scholarships
async function archiveExpiredScholarships() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const result = await Scholarship.updateMany(
            {
                deadline: { $lt: today },
                status: 'active'
            },
            {
                status: 'closed'
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`Auto-archived ${result.modifiedCount} expired scholarship(s)`);
        }
    } catch (error) {
        console.error('Error archiving expired scholarships:', error);
    }
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/scholarships');
try { if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); } } catch (e) { /* Serverless: read-only filesystem */ }

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, `scholarship-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed'));
        }
    }
});

// @route   GET /api/scholarships
// @desc    Get all scholarships
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Auto-archive expired scholarships before fetching
        await archiveExpiredScholarships();
        
        console.log('=== GET SCHOLARSHIPS ===');
        console.log('Query params:', req.query);
        
        const { type, search, region, status = 'active' } = req.query;
        
        let query = { status };
        
        if (type && type !== 'all') {
            query.scholarshipType = type;
        }
        
        if (region && region !== '') {
            query.region = region;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        console.log('Database query:', JSON.stringify(query));
        
        const scholarships = await Scholarship.find(query)
            .populate('sponsor', 'firstName lastName email')
            .sort({ createdAt: -1 });
        
        console.log(`Found ${scholarships.length} scholarships`);
        if (scholarships.length > 0) {
            console.log('First scholarship:', {
                id: scholarships[0]._id,
                title: scholarships[0].title,
                scholarshipType: scholarships[0].scholarshipType,
                region: scholarships[0].region,
                type: scholarships[0].type
            });
        }
        console.log('======================');
        
        res.json({
            success: true,
            count: scholarships.length,
            scholarships
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scholarships'
        });
    }
});

// @route   GET /api/scholarships/:id
// @desc    Get single scholarship
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const scholarship = await Scholarship.findById(req.params.id)
            .populate('sponsor', 'firstName lastName email');
        
        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }
        
        res.json({
            success: true,
            scholarship
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scholarship'
        });
    }
});

// @route   POST /api/scholarships
// @desc    Create a new scholarship
// @access  Private (Sponsor only)
router.post('/', protect, authorize('sponsor'), upload.array('documents', 5), async (req, res) => {
    try {
        console.log('=== CREATE SCHOLARSHIP ===');
        console.log('Request body:', req.body);
        console.log('scholarshipType from body:', req.body.scholarshipType);
        
        const {
            title,
            description,
            amount,
            benefits,
            selectionCriteria,
            contactEmail,
            contactPhone,
            applicationLink,
            renewalPolicy,
            scholarshipType,
            type,
            deadline,
            requirements,
            eligibility,
            documentsRequired,
            availableSlots,
            region,
            affiliatedInstitution,
            latitude,
            longitude,
            address
        } = req.body;
        
        console.log('scholarshipType extracted:', scholarshipType);
        console.log('region extracted:', region);
        
        // Process uploaded files
        const documents = req.files ? req.files.map(file => ({
            filename: file.filename,
            path: `/uploads/scholarships/${file.filename}`,
            uploadDate: new Date()
        })) : [];
        
        const scholarship = await Scholarship.create({
            title,
            description,
            ...(amount && { amount }),
            ...(benefits && { benefits }),
            ...(selectionCriteria && { selectionCriteria }),
            ...(contactEmail && { contactEmail }),
            ...(contactPhone && { contactPhone }),
            ...(applicationLink && { applicationLink }),
            ...(renewalPolicy && { renewalPolicy }),
            scholarshipType,
            type: type || 'other',
            deadline,
            requirements: requirements ? JSON.parse(requirements) : [],
            eligibility,
            documentsRequired,
            availableSlots,
            region,
            affiliatedInstitution,
            location: {
                latitude,
                longitude,
                address
            },
            sponsor: req.user._id,
            documents
        });
        
        console.log('Scholarship created:', {
            id: scholarship._id,
            scholarshipType: scholarship.scholarshipType,
            region: scholarship.region,
            type: scholarship.type
        });
        console.log('========================');
        
        res.status(201).json({
            success: true,
            scholarship
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating scholarship'
        });
    }
});

// @route   PUT /api/scholarships/:id
// @desc    Update scholarship
// @access  Private (Sponsor - own scholarships only)
router.put('/:id', protect, authorize('sponsor'), async (req, res) => {
    try {
        let scholarship = await Scholarship.findById(req.params.id);
        
        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }
        
        // Make sure sponsor owns scholarship
        if (scholarship.sponsor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this scholarship'
            });
        }
        
        scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.json({
            success: true,
            scholarship
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating scholarship'
        });
    }
});

// @route   DELETE /api/scholarships/:id
// @desc    Delete scholarship
// @access  Private (Sponsor/Admin)
router.delete('/:id', protect, authorize('sponsor', 'admin'), async (req, res) => {
    try {
        const scholarship = await Scholarship.findById(req.params.id);
        
        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }
        
        // Check ownership for sponsors
        if (req.user.role === 'sponsor' && scholarship.sponsor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this scholarship'
            });
        }

        // Check if there are pending applications for this scholarship
        const Application = require('../models/Application');
        const pendingApplications = await Application.countDocuments({
            scholarship: scholarship._id,
            status: { $in: ['pending', 'submitted'] }
        });

        if (pendingApplications > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete scholarship with ${pendingApplications} pending application(s). Please review all applications first.`
            });
        }

        await scholarship.deleteOne();

        res.json({
            success: true,
            message: 'Scholarship deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting scholarship'
        });
    }
});

// @route   GET /api/scholarships/sponsor/my-scholarships
// @desc    Get scholarships created by logged-in sponsor
// @access  Private (Sponsor)
router.get('/sponsor/my-scholarships', protect, authorize('sponsor'), async (req, res) => {
    try {
        const scholarships = await Scholarship.find({ sponsor: req.user._id })
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: scholarships.length,
            scholarships
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scholarships'
        });
    }
});

// @route   GET /api/scholarships/favorites
// @desc    Get user's favorite scholarships
// @access  Private
router.get('/favorites', protect, async (req, res) => {
    try {
        const Profile = require('../models/Profile');
        const profile = await Profile.findOne({ user: req.user._id })
            .populate({
                path: 'favoriteScholarships',
                populate: { path: 'sponsor', select: 'firstName lastName email' }
            });
        
        if (!profile) {
            return res.json({
                success: true,
                favorites: []
            });
        }
        
        res.json({
            success: true,
            favorites: profile.favoriteScholarships || []
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorites'
        });
    }
});

// @route   POST /api/scholarships/:id/favorite
// @desc    Add scholarship to favorites
// @access  Private
router.post('/:id/favorite', protect, async (req, res) => {
    try {
        const Profile = require('../models/Profile');
        const scholarship = await Scholarship.findById(req.params.id);
        
        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }
        
        let profile = await Profile.findOne({ user: req.user._id });
        
        if (!profile) {
            profile = new Profile({ user: req.user._id, favoriteScholarships: [] });
        }
        
        if (!profile.favoriteScholarships) {
            profile.favoriteScholarships = [];
        }
        
        // Check if already favorited
        if (profile.favoriteScholarships.includes(req.params.id)) {
            return res.json({
                success: true,
                message: 'Already in favorites',
                isFavorite: true
            });
        }
        
        profile.favoriteScholarships.push(req.params.id);
        await profile.save();
        
        res.json({
            success: true,
            message: 'Added to favorites',
            isFavorite: true
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding favorite'
        });
    }
});

// @route   DELETE /api/scholarships/:id/favorite
// @desc    Remove scholarship from favorites
// @access  Private
router.delete('/:id/favorite', protect, async (req, res) => {
    try {
        const Profile = require('../models/Profile');
        const profile = await Profile.findOne({ user: req.user._id });
        
        if (!profile || !profile.favoriteScholarships) {
            return res.json({
                success: true,
                message: 'Not in favorites',
                isFavorite: false
            });
        }
        
        profile.favoriteScholarships = profile.favoriteScholarships.filter(
            id => id.toString() !== req.params.id
        );
        
        await profile.save();
        
        res.json({
            success: true,
            message: 'Removed from favorites',
            isFavorite: false
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing favorite'
        });
    }
});

module.exports = router;


