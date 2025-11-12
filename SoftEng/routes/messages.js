const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory for messages
const uploadsDir = path.join(__dirname, '../uploads/messages');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for message attachments
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, `message-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx|txt|zip/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only documents and images are allowed'));
        }
    }
});

// @route   POST /api/messages/conversation
// @desc    Get or create conversation between two users
// @access  Private
router.post('/conversation', protect, async (req, res) => {
    try {
        const { recipientId } = req.body;
        
        console.log('📞 Creating/getting conversation');
        console.log('   User:', req.user._id);
        console.log('   Recipient:', recipientId);
        
        if (!recipientId) {
            return res.status(400).json({
                success: false,
                message: 'Recipient ID is required'
            });
        }
        
        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, recipientId] }
        }).populate('participants', 'firstName lastName email avatar role');
        
        console.log('   Existing conversation:', conversation ? 'Found' : 'Not found');
        
        // If no conversation exists, create one
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, recipientId],
                unreadCount: {
                    [req.user._id]: 0,
                    [recipientId]: 0
                }
            });
            
            console.log('   ✅ Created new conversation:', conversation._id);
            
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'firstName lastName email avatar role');
        }
        
        res.json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('❌ Error creating/getting conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating conversation'
        });
    }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate('participants', 'firstName lastName email avatar role')
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 });
        
        res.json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('❌ Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations'
        });
    }
});

// @route   GET /api/messages/:conversationId
// @desc    Get messages in a conversation
// @access  Private
router.get('/:conversationId', protect, async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        console.log('📨 Fetching messages for conversation:', conversationId);
        
        // Verify user is part of conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id
        });
        
        if (!conversation) {
            console.log('   ❌ Conversation not found or user not participant');
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        
        console.log('   ✅ Conversation found');
        
        // Get messages
        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'firstName lastName avatar')
            .sort({ createdAt: 1 });
        
        console.log('   📬 Messages found:', messages.length);
        
        // Mark messages as read
        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: req.user._id },
                read: false
            },
            {
                read: true,
                readAt: new Date()
            }
        );
        
        // Reset unread count for this user
        conversation.unreadCount.set(req.user._id.toString(), 0);
        await conversation.save();
        
        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('❌ Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, upload.single('attachment'), async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        
        console.log('📤 Sending message');
        console.log('   Conversation ID:', conversationId);
        console.log('   Content:', content);
        console.log('   Sender:', req.user._id);
        console.log('   File:', req.file ? req.file.originalname : 'None');
        
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: 'Conversation ID is required'
            });
        }
        
        // Verify user is part of conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id
        });
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        
        // Create message data
        const messageData = {
            conversation: conversationId,
            sender: req.user._id,
            content: content || ''
        };
        
        // Add attachment if uploaded
        if (req.file) {
            messageData.attachment = {
                filename: req.file.originalname,
                path: `/uploads/messages/${req.file.filename}`,
                fileType: req.file.mimetype,
                fileSize: req.file.size
            };
        }
        
        // Create message
        const message = await Message.create(messageData);
        
        console.log('   ✅ Message created:', message._id);
        
        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        
        // Increment unread count for recipient
        const recipientId = conversation.participants.find(
            p => p.toString() !== req.user._id.toString()
        ).toString();
        
        const currentCount = conversation.unreadCount.get(recipientId) || 0;
        conversation.unreadCount.set(recipientId, currentCount + 1);
        
        await conversation.save();
        
        // Populate sender info
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'firstName lastName avatar');
        
        console.log('   📨 Populated message:', populatedMessage);
        
        res.status(201).json({
            success: true,
            message: populatedMessage
        });
    } catch (error) {
        console.error('❌ Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        // Only sender can delete
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }
        
        // Delete file if exists
        if (message.attachment && message.attachment.path) {
            const filePath = path.join(__dirname, '..', message.attachment.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        await message.deleteOne();
        
        res.json({
            success: true,
            message: 'Message deleted'
        });
    } catch (error) {
        console.error('❌ Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting message'
        });
    }
});

module.exports = router;
