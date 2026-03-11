const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateToken } = require('./auth');

// Get all categories (public route)
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single category (public route)
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Protected routes (require authentication)
// Create category
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, description, color } = req.body;
        
        // Generate slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const category = new Category({
            name,
            description,
            slug,
            color: color || '#3498db'
        });

        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Category name or slug already exists' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Update category
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, slug, color },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete category
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;