const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const { protect } = require('../middleware/auth');

// @route   GET /api/forum/posts
// @desc    Get all forum posts
// @access  Private
router.get('/posts', protect, async (req, res) => {
    try {
        const { category } = req.query;
        
        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const posts = await ForumPost.find(query)
            .populate('author', 'firstName lastName role avatar')
            .populate('comments.author', 'firstName lastName role avatar')
            .sort({ isPinned: -1, createdAt: -1 });
        
        res.json({
            success: true,
            count: posts.length,
            posts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching forum posts'
        });
    }
});

// @route   GET /api/forum/posts/:id
// @desc    Get single forum post
// @access  Private
router.get('/posts/:id', protect, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id)
            .populate('author', 'firstName lastName role avatar')
            .populate('comments.author', 'firstName lastName role avatar');
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        // Increment views
        post.views += 1;
        await post.save();
        
        res.json({
            success: true,
            post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching post'
        });
    }
});

// @route   POST /api/forum/posts
// @desc    Create a new forum post
// @access  Private
router.post('/posts', protect, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title and content'
            });
        }
        
        const post = await ForumPost.create({
            title,
            content,
            category: category || 'general',
            author: req.user._id
        });
        
        const populatedPost = await ForumPost.findById(post._id)
            .populate('author', 'firstName lastName role avatar');
        
        res.status(201).json({
            success: true,
            post: populatedPost
        });
    } catch (error) {
        console.error('Forum post creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating post'
        });
    }
});

// @route   POST /api/forum/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/posts/:id/comments', protect, async (req, res) => {
    try {
        const { content } = req.body;
        
        const post = await ForumPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        if (post.isLocked) {
            return res.status(403).json({
                success: false,
                message: 'This post is locked and cannot accept new comments'
            });
        }
        
        post.comments.push({
            author: req.user._id,
            content
        });
        
        await post.save();
        
        const updatedPost = await ForumPost.findById(post._id)
            .populate('author', 'firstName lastName role')
            .populate('comments.author', 'firstName lastName role');
        
        res.status(201).json({
            success: true,
            post: updatedPost
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
        });
    }
});

// @route   PUT /api/forum/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.put('/posts/:id/like', protect, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        const likeIndex = post.likes.indexOf(req.user._id);
        
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(req.user._id);
        }
        
        await post.save();
        
        res.json({
            success: true,
            likes: post.likes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating like'
        });
    }
});

// @route   DELETE /api/forum/posts/:id
// @desc    Delete post
// @access  Private (Author, Admin)
router.delete('/posts/:id', protect, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        // Check if user is author or admin
        const isAuthor = post.author.toString() === req.user._id.toString();
        const isModerator = req.user.role === 'admin';
        
        if (!isAuthor && !isModerator) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }
        
        await post.deleteOne();
        
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting post'
        });
    }
});

// @route   DELETE /api/forum/posts/:postId/comments/:commentId
// @desc    Delete comment
// @access  Private (Comment Author, Post Author, Admin)
router.delete('/posts/:postId/comments/:commentId', protect, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        // Find comment
        const comment = post.comments.id(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Check authorization: comment author, post author, or moderator
        const isCommentAuthor = comment.author.toString() === req.user._id.toString();
        const isPostAuthor = post.author.toString() === req.user._id.toString();
        const isModerator = req.user.role === 'admin';
        
        if (!isCommentAuthor && !isPostAuthor && !isModerator) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }
        
        // Remove comment
        comment.deleteOne();
        await post.save();
        
        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment'
        });
    }
});

module.exports = router;

