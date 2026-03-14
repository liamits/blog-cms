const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_db';

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
    console.log('Database:', MONGODB_URI);
});

// Models
const Category = require('./models/Category');
const Post = require('./models/Post');
const User = require('./models/User');

// Routes
const { router: authRouter, authenticateToken } = require('./routes/auth');
app.use('/api/auth', authRouter);

// Protected API routes (require authentication)
app.use('/api/categories', (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    authenticateToken(req, res, next);
});

app.use('/api/posts', (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    authenticateToken(req, res, next);
});

// Apply routes after middleware
app.use('/api/categories', require('./routes/categories'));
app.use('/api/posts', require('./routes/posts'));

// Public routes (no authentication required)
app.get('/api/public/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;

        const query = { status: 'published' };
        if (category) {
            query.category = category;
        }

        const posts = await Post.find(query)
            .populate('category', 'name color')
            .sort({ publishedAt: -1 })
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

app.get('/api/public/posts/:id', async (req, res) => {
    try {
        const post = await Post.findOne({ 
            _id: req.params.id, 
            status: 'published' 
        }).populate('category', 'name color');
        
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

app.get('/api/public/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Static file routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/post/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/dashboard*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/admin', (req, res) => {
    res.redirect('/login');
});

// Serve React static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// Catch all handler for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// API endpoint to check authentication status
app.get('/api/auth/status', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ authenticated: false });
    }
    
    authenticateToken(req, res, () => {
        res.json({ 
            authenticated: true, 
            user: req.user 
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`Admin login: http://localhost:${PORT}/login`);
    console.log(`Admin dashboard: http://localhost:${PORT}/dashboard`);
});