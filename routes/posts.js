const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Category = require('../models/Category');

// Get all posts with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || 'published';
        const category = req.query.category;

        const query = { status };
        if (category) {
            query.category = category;
        }

        const posts = await Post.find(query)
            .populate('category', 'name color')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Post.countDocuments(query);

        res.json({
            posts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('category', 'name color');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Increment views
        post.views += 1;
        await post.save();
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create post
router.post('/', async (req, res) => {
    try {
        const { title, content, author, category, tags, status, featured } = req.body;
        
        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const post = new Post({
            title,
            content,
            author,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            status: status || 'draft',
            featured: featured || false,
            slug
        });

        const savedPost = await post.save();
        const populatedPost = await Post.findById(savedPost._id).populate('category', 'name color');
        
        res.status(201).json(populatedPost);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Post slug already exists' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Update post
router.put('/:id', async (req, res) => {
    try {
        const { title, content, author, category, tags, status, featured } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                title,
                content,
                author,
                category,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                status,
                featured,
                slug
            },
            { new: true, runValidators: true }
        ).populate('category', 'name color');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;