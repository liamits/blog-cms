const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    publishedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt before saving
postSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = Date.now();
    }
    next();
});

// Generate excerpt if not provided
postSchema.pre('save', function(next) {
    if (!this.excerpt && this.content) {
        this.excerpt = this.content.substring(0, 200) + '...';
    }
    next();
});

module.exports = mongoose.model('Post', postSchema);