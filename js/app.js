// Blog App JavaScript

class BlogApp {
    constructor() {
        this.posts = [];
        this.init();
    }

    init() {
        this.loadPosts();
        this.setupEventListeners();
        this.renderPage();
    }

    // Load posts from localStorage (simulating a database)
    loadPosts() {
        const savedPosts = localStorage.getItem('blogPosts');
        if (savedPosts) {
            this.posts = JSON.parse(savedPosts);
        } else {
            // Sample posts
            this.posts = [
                {
                    id: 1,
                    title: "Welcome to My Blog",
                    author: "Admin",
                    date: "2026-03-11",
                    content: "This is the first post on my blog. I will share practical experiences and knowledge about web development, technology, and life.",
                    excerpt: "Welcome post and introduction to the blog..."
                }
            ];
            this.savePosts();
        }
    }

    // Save posts to localStorage
    savePosts() {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }

    // Setup event listeners
    setupEventListeners() {
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        }
    }

    // Render appropriate page content
    renderPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        switch (currentPage) {
            case 'index.html':
            case '':
                this.renderHomePage();
                break;
            case 'post.html':
                this.renderPostPage();
                break;
            case 'admin.html':
                // Admin page is already rendered, just need form handling
                break;
        }
    }

    // Render home page with posts list
    renderHomePage() {
        const container = document.getElementById('posts-container');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = '<p>No posts yet.</p>';
            return;
        }

        const postsHTML = this.posts.map(post => `
            <article class="post">
                <h2>${post.title}</h2>
                <div class="post-meta">
                    Author: ${post.author} | Published: ${this.formatDate(post.date)}
                </div>
                <div class="post-excerpt">
                    ${post.excerpt || post.content.substring(0, 200) + '...'}
                </div>
                <a href="post.html?id=${post.id}" class="read-more">Read More →</a>
            </article>
        `).join('');

        container.innerHTML = postsHTML;
    }

    // Render individual post page
    renderPostPage() {
        const container = document.getElementById('post-content');
        if (!container) return;

        const urlParams = new URLSearchParams(window.location.search);
        const postId = parseInt(urlParams.get('id'));
        const post = this.posts.find(p => p.id === postId);

        if (!post) {
            container.innerHTML = '<p>Post not found.</p>';
            return;
        }

        container.innerHTML = `
            <h1>${post.title}</h1>
            <div class="post-meta">
                Author: ${post.author} | Published: ${this.formatDate(post.date)}
            </div>
            <div class="post-content">
                ${post.content.replace(/\n/g, '<br>')}
            </div>
        `;

        // Update page title
        document.title = `${post.title} - Personal Blog`;
    }

    // Handle post form submission
    handlePostSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newPost = {
            id: Date.now(), // Simple ID generation
            title: formData.get('title'),
            author: formData.get('author'),
            content: formData.get('content'),
            date: new Date().toISOString().split('T')[0],
            excerpt: formData.get('content').substring(0, 200) + '...'
        };

        this.posts.unshift(newPost); // Add to beginning of array
        this.savePosts();

        // Show success message
        this.showMessage('Post published successfully!', 'success');
        
        // Reset form
        e.target.reset();
    }

    // Show message to user
    showMessage(text, type) {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = type;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogApp();
});