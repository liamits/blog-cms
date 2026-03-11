class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.posts = [];
        this.categories = [];
        this.init();
    }

    async init() {
        // Check authentication first
        const isAuthenticated = await this.checkAuthentication();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        this.setupEventListeners();
        this.loadDashboardData();
        this.showSection('dashboard');
    }

    async checkAuthentication() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return false;
        }

        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Update user info in header
                const userInfo = document.querySelector('.user-info span');
                if (userInfo && data.user) {
                    userInfo.textContent = data.user.username;
                }
                return true;
            } else {
                // Token is invalid, remove it
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                return false;
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            return false;
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.dataset.section) {
                    e.preventDefault();
                    this.showSection(link.dataset.section);
                }
            });
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });

        // Forms
        document.getElementById('postForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePost();
        });

        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Add logout functionality
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.style.cursor = 'pointer';
            userInfo.addEventListener('click', () => {
                this.showLogoutMenu();
            });
        }
    }

    showLogoutMenu() {
        const existingMenu = document.querySelector('.logout-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'logout-menu';
        menu.innerHTML = `
            <div class="logout-option" onclick="dashboard.logout()">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </div>
        `;
        menu.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 120px;
        `;

        const logoutOption = menu.querySelector('.logout-option');
        logoutOption.style.cssText = `
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #e53e3e;
            font-size: 0.9rem;
            transition: background 0.3s ease;
        `;

        logoutOption.addEventListener('mouseenter', () => {
            logoutOption.style.background = '#f7fafc';
        });

        logoutOption.addEventListener('mouseleave', () => {
            logoutOption.style.background = 'transparent';
        });

        const userInfo = document.querySelector('.user-info');
        userInfo.style.position = 'relative';
        userInfo.appendChild(menu);

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!userInfo.contains(e.target)) {
                    menu.remove();
                }
            }, { once: true });
        }, 100);
    }

    async logout() {
        try {
            const token = localStorage.getItem('authToken');
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).parentElement.classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            posts: 'Posts Management',
            categories: 'Categories Management'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName];

        this.currentSection = sectionName;

        // Load section data
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardStats();
                break;
            case 'posts':
                this.loadPosts();
                this.loadCategoriesForSelect();
                break;
            case 'categories':
                this.loadCategories();
                break;
        }
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadPosts(),
                this.loadCategories()
            ]);
            this.loadDashboardStats();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    loadDashboardStats() {
        const totalPosts = this.posts.length;
        const publishedPosts = this.posts.filter(post => post.status === 'published').length;
        const totalViews = this.posts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalCategories = this.categories.length;

        document.getElementById('totalPosts').textContent = totalPosts;
        document.getElementById('publishedPosts').textContent = publishedPosts;
        document.getElementById('totalViews').textContent = totalViews;
        document.getElementById('totalCategories').textContent = totalCategories;

        // Load recent posts
        const recentPosts = this.posts.slice(0, 5);
        this.renderRecentPosts(recentPosts);
    }

    renderRecentPosts(posts) {
        const tbody = document.getElementById('recentPostsTable');
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${post.title}</td>
                <td>
                    <span class="category-badge" style="background-color: ${post.category?.color || '#3498db'}">
                        ${post.category?.name || 'Uncategorized'}
                    </span>
                </td>
                <td><span class="status-badge status-${post.status}">${post.status}</span></td>
                <td>${post.views || 0}</td>
                <td>${new Date(post.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }

    async loadPosts() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/posts?limit=100', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                this.handleAuthError();
                return;
            }

            const data = await response.json();
            this.posts = data.posts || [];
            this.renderPosts();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showMessage('Error loading posts', 'error');
        }
    }

    renderPosts() {
        const tbody = document.getElementById('postsTable');
        if (!tbody) return;

        tbody.innerHTML = this.posts.map(post => `
            <tr>
                <td>${post.title}</td>
                <td>${post.author}</td>
                <td>
                    <span class="category-badge" style="background-color: ${post.category?.color || '#3498db'}">
                        ${post.category?.name || 'Uncategorized'}
                    </span>
                </td>
                <td><span class="status-badge status-${post.status}">${post.status}</span></td>
                <td>${post.views || 0}</td>
                <td>${new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="dashboard.editPost('${post._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboard.deletePost('${post._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadCategories() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                this.handleAuthError();
                return;
            }

            this.categories = await response.json();
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showMessage('Error loading categories', 'error');
        }
    }

    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        grid.innerHTML = this.categories.map(category => `
            <div class="category-card" style="border-left-color: ${category.color}">
                <div class="category-header">
                    <div class="category-name">${category.name}</div>
                    <div class="category-actions">
                        <button class="btn btn-sm btn-primary" onclick="dashboard.editCategory('${category._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="dashboard.deleteCategory('${category._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="category-description">${category.description || 'No description'}</div>
            </div>
        `).join('');
    }

    loadCategoriesForSelect() {
        const selects = ['postCategory', 'categoryFilter'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = selectId === 'categoryFilter' ? 
                    '<option value="">All Categories</option>' : 
                    '<option value="">Select Category</option>';
                
                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category._id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
                
                select.value = currentValue;
            }
        });
    }

    showPostForm(postId = null) {
        const modal = document.getElementById('postModal');
        const form = document.getElementById('postForm');
        const title = document.getElementById('postModalTitle');

        if (postId) {
            const post = this.posts.find(p => p._id === postId);
            if (post) {
                title.textContent = 'Edit Post';
                document.getElementById('postId').value = post._id;
                document.getElementById('postTitle').value = post.title;
                document.getElementById('postAuthor').value = post.author;
                document.getElementById('postCategory').value = post.category._id;
                document.getElementById('postTags').value = post.tags.join(', ');
                document.getElementById('postContent').value = post.content;
                document.getElementById('postStatus').value = post.status;
                document.getElementById('postFeatured').checked = post.featured;
            }
        } else {
            title.textContent = 'Add New Post';
            form.reset();
            document.getElementById('postId').value = '';
        }

        this.loadCategoriesForSelect();
        modal.style.display = 'block';
    }

    closePostModal() {
        document.getElementById('postModal').style.display = 'none';
    }

    async savePost() {
        const form = document.getElementById('postForm');
        const formData = new FormData(form);
        const postId = document.getElementById('postId').value;

        const postData = {
            title: formData.get('title'),
            author: formData.get('author'),
            category: formData.get('category'),
            tags: formData.get('tags'),
            content: formData.get('content'),
            status: formData.get('status'),
            featured: document.getElementById('postFeatured').checked
        };

        try {
            const token = localStorage.getItem('authToken');
            const url = postId ? `/api/posts/${postId}` : '/api/posts';
            const method = postId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                this.showMessage(postId ? 'Post updated successfully' : 'Post created successfully', 'success');
                this.closePostModal();
                this.loadPosts();
                if (this.currentSection === 'dashboard') {
                    this.loadDashboardStats();
                }
            } else {
                throw new Error('Failed to save post');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            this.showMessage('Error saving post', 'error');
        }
    }

    editPost(postId) {
        this.showPostForm(postId);
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('Post deleted successfully', 'success');
                this.loadPosts();
                if (this.currentSection === 'dashboard') {
                    this.loadDashboardStats();
                }
            } else {
                throw new Error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            this.showMessage('Error deleting post', 'error');
        }
    }

    showCategoryForm(categoryId = null) {
        const modal = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        const title = document.getElementById('categoryModalTitle');

        if (categoryId) {
            const category = this.categories.find(c => c._id === categoryId);
            if (category) {
                title.textContent = 'Edit Category';
                document.getElementById('categoryId').value = category._id;
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categoryDescription').value = category.description || '';
                document.getElementById('categoryColor').value = category.color;
            }
        } else {
            title.textContent = 'Add New Category';
            form.reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryColor').value = '#3498db';
        }

        modal.style.display = 'block';
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').style.display = 'none';
    }

    async saveCategory() {
        const form = document.getElementById('categoryForm');
        const formData = new FormData(form);
        const categoryId = document.getElementById('categoryId').value;

        const categoryData = {
            name: formData.get('name'),
            description: formData.get('description'),
            color: formData.get('color')
        };

        try {
            const url = categoryId ? `/api/categories/${categoryId}` : '/api/categories';
            const method = categoryId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            if (response.ok) {
                this.showMessage(categoryId ? 'Category updated successfully' : 'Category created successfully', 'success');
                this.closeCategoryModal();
                this.loadCategories();
                this.loadCategoriesForSelect();
                if (this.currentSection === 'dashboard') {
                    this.loadDashboardStats();
                }
            } else {
                throw new Error('Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            this.showMessage('Error saving category', 'error');
        }
    }

    editCategory(categoryId) {
        this.showCategoryForm(categoryId);
    }

    async deleteCategory(categoryId) {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('Category deleted successfully', 'success');
                this.loadCategories();
                this.loadCategoriesForSelect();
                if (this.currentSection === 'dashboard') {
                    this.loadDashboardStats();
                }
            } else {
                throw new Error('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showMessage('Error deleting category', 'error');
        }
    }

    filterPosts() {
        // Implementation for filtering posts
        this.loadPosts();
    }

    showMessage(message, type) {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 3000;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    handleAuthError() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
}

// Global functions
function showPostForm() {
    dashboard.showPostForm();
}

function closePostModal() {
    dashboard.closePostModal();
}

function showCategoryForm() {
    dashboard.showCategoryForm();
}

function closeCategoryModal() {
    dashboard.closeCategoryModal();
}

function filterPosts() {
    dashboard.filterPosts();
}

function goToSite() {
    window.open('/', '_blank');
}

// Initialize dashboard
const dashboard = new AdminDashboard();