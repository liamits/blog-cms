class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingAuth();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Enter key handling
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeForm = document.querySelector('.login-card:not([style*="display: none"]) form, .register-card:not([style*="display: none"]) form');
                if (activeForm) {
                    activeForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }

    async checkExistingAuth() {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const response = await fetch('/api/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    // User is already authenticated, redirect to dashboard
                    window.location.href = '/dashboard';
                }
            } catch (error) {
                // Token is invalid, remove it
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
    }

    async handleLogin() {
        const form = document.getElementById('loginForm');
        const formData = new FormData(form);
        const loginBtn = document.getElementById('loginBtn');
        const errorDiv = document.getElementById('errorMessage');

        // Show loading state
        this.setLoadingState(loginBtn, true);
        this.hideMessage(errorDiv);

        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Remember me functionality
                const rememberMe = document.getElementById('rememberMe').checked;
                if (rememberMe) {
                    localStorage.setItem('rememberLogin', 'true');
                } else {
                    sessionStorage.setItem('authToken', data.token);
                    localStorage.removeItem('rememberLogin');
                }

                // Show success message briefly
                this.showSuccessMessage('Login successful! Redirecting...');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);

            } else {
                this.showError(errorDiv, data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(errorDiv, 'Network error. Please try again.');
        } finally {
            this.setLoadingState(loginBtn, false);
        }
    }

    async handleRegister() {
        const form = document.getElementById('registerForm');
        const formData = new FormData(form);
        const registerBtn = document.getElementById('registerBtn');
        const errorDiv = document.getElementById('registerErrorMessage');

        // Validate passwords match
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            this.showError(errorDiv, 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError(errorDiv, 'Password must be at least 6 characters long');
            return;
        }

        // Show loading state
        this.setLoadingState(registerBtn, true);
        this.hideMessage(errorDiv);

        const registerData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: password,
            role: 'admin' // Default role for registration
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Show success message
                this.showSuccessMessage('Account created successfully! Redirecting...');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);

            } else {
                this.showError(errorDiv, data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError(errorDiv, 'Network error. Please try again.');
        } finally {
            this.setLoadingState(registerBtn, false);
        }
    }

    setLoadingState(button, loading) {
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.loading-spinner');

        if (loading) {
            button.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
        } else {
            button.disabled = false;
            btnText.style.display = 'inline-block';
            spinner.style.display = 'none';
        }
    }

    showError(errorDiv, message) {
        errorDiv.textContent = message;
        errorDiv.className = 'error-message';
        errorDiv.style.display = 'block';
    }

    showSuccessMessage(message) {
        // Create or update success message
        let successDiv = document.querySelector('.success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            const form = document.querySelector('.login-card:not([style*="display: none"]) .login-form, .register-card:not([style*="display: none"]) .login-form');
            form.appendChild(successDiv);
        }
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }

    hideMessage(messageDiv) {
        messageDiv.style.display = 'none';
    }
}

// Global functions for form switching
function showRegisterForm() {
    document.querySelector('.login-card').style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
}

function showLoginForm() {
    document.querySelector('.login-card').style.display = 'block';
    document.getElementById('registerCard').style.display = 'none';
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});