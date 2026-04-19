// API Service
const API = {
    baseUrl: '/api',
    
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Request failed');
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    getOpportunities(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/opportunities${params ? `?${params}` : ''}`);
    },
    
    applyToOpportunity(id) {
        return this.request(`/opportunities/${id}/apply`, { method: 'POST' });
    },
    
    saveOpportunity(id) {
        return this.request(`/opportunities/${id}/save`, { method: 'POST' });
    },
    
    login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    
    register(name, email, password, skills) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, skills })
        });
    },
    
    logout() {
        return this.request('/auth/logout', { method: 'POST' });
    },
    
    getProfile() {
        return this.request('/profile');
    },
    
    updateSkills(skills) {
        return this.request('/profile/skills', {
            method: 'PUT',
            body: JSON.stringify({ skills })
        });
    }
};

// Global state
let currentUser = null;
let userSkills = [];

// Utility Functions
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle"></i>';
    else if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle"></i>';
    else icon = '<i class="fas fa-info-circle"></i>';
    
    toast.innerHTML = `${icon} ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function animateMatchScore(element, targetScore) {
    let current = 0;
    const duration = 1000;
    const steps = 50;
    const increment = targetScore / steps;
    const stepTime = duration / steps;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
            current = targetScore;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, stepTime);
}

// Render opportunities
function renderOpportunities(opportunities) {
    const grid = document.getElementById('opportunitiesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (!opportunities || opportunities.length === 0) {
        grid.innerHTML = '<div style="text-align: center; color: white; padding: 2rem;">No opportunities found</div>';
        return;
    }
    
    opportunities.forEach((opp, index) => {
        const card = document.createElement('div');
        card.className = 'opportunity-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const matchingSkills = opp.skills?.filter(skill => 
            userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
        ) || [];
        
        const missingSkills = opp.skills?.filter(skill => 
            !userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
        ) || [];
        
        card.innerHTML = `
            <div class="card-header">
                <span class="card-type type-${opp.type}">${opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}</span>
                <span class="match-score">${opp.match_score || opp.matchScore || 0}% Match</span>
            </div>
            <div class="card-title">${opp.title}</div>
            <div class="card-company">
                <i class="fas fa-building"></i> ${opp.company}
            </div>
            <div class="card-details">
                <span class="detail"><i class="fas fa-map-marker-alt"></i> ${opp.location.charAt(0).toUpperCase() + opp.location.slice(1)}</span>
                <span class="detail"><i class="fas fa-calendar"></i> ${opp.deadline}</span>
                <span class="detail"><i class="fas fa-dollar-sign"></i> ${opp.salary}</span>
            </div>
            <div class="skills-container">
                ${opp.skills?.map(skill => {
                    const isMatch = userSkills.some(us => us.toLowerCase() === skill.toLowerCase());
                    return `<span class="skill-tag ${isMatch ? 'skill-match' : ''}">${skill} ${isMatch ? '✓' : '○'}</span>`;
                }).join('')}
            </div>
            ${missingSkills.length > 0 ? `
                <div class="skill-gap-warning">
                    <i class="fas fa-lightbulb" style="color: #f59e0b;"></i> 
                    Improve your match: Learn ${missingSkills.slice(0, 2).join(', ')}
                </div>
            ` : ''}
            <div class="card-footer">
                <button class="btn-apply" data-id="${opp.id}">
                    <i class="fas fa-paper-plane"></i> Apply Now
                </button>
                <button class="btn-save" data-id="${opp.id}">
                    <i class="far fa-bookmark"></i>
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.btn-apply').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyToOpportunity(btn.dataset.id);
        });
    });
    
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            saveOpportunity(btn.dataset.id, btn.querySelector('i'));
        });
    });
}

// Load opportunities
async function loadOpportunities() {
    try {
        const searchTerm = document.getElementById('searchInput')?.value || '';
        const type = document.getElementById('typeFilter')?.value || 'all';
        const location = document.getElementById('locationFilter')?.value || 'all';
        
        const filters = {};
        if (searchTerm) filters.search = searchTerm;
        if (type !== 'all') filters.type = type;
        if (location !== 'all') filters.location = location;
        
        const response = await API.getOpportunities(filters);
        if (response.success) {
            renderOpportunities(response.data);
        }
    } catch (error) {
        showToast('Failed to load opportunities', 'error');
    }
}

// Apply to opportunity
async function applyToOpportunity(oppId) {
    if (!currentUser) {
        showToast('Please login to apply', 'warning');
        showLoginModal();
        return;
    }
    
    const btn = event?.target?.closest('.btn-apply');
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
        btn.disabled = true;
        
        try {
            await API.applyToOpportunity(oppId);
            showToast('Application submitted successfully!', 'success');
            btn.innerHTML = '<i class="fas fa-check"></i> Applied!';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        } catch (error) {
            showToast('Failed to apply', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// Save opportunity
async function saveOpportunity(oppId, icon) {
    if (!currentUser) {
        showToast('Please login to save', 'warning');
        showLoginModal();
        return;
    }
    
    try {
        await API.saveOpportunity(oppId);
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#667eea';
            showToast('Opportunity saved!', 'success');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '#a0aec0';
            showToast('Removed from saved', 'warning');
        }
    } catch (error) {
        showToast('Failed to save opportunity', 'error');
    }
}

// Filter opportunities
function filterOpportunities() {
    loadOpportunities();
}

// Login Modal
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeBtn = document.querySelector('.close');

function showLoginModal() {
    if (loginModal) loginModal.style.display = 'block';
}

function hideLoginModal() {
    if (loginModal) loginModal.style.display = 'none';
}

// Login handler
async function handleLogin(email, password) {
    try {
        const response = await API.login(email, password);
        if (response.success) {
            currentUser = response.data;
            userSkills = response.data.skills || [];
            showToast(`Welcome back, ${response.data.name}!`, 'success');
            hideLoginModal();
            await loadUserProfile();
            loadOpportunities();
            updateUIForLoggedInUser();
        }
    } catch (error) {
        showToast('Login failed: ' + error.message, 'error');
    }
}

// Register handler
async function handleRegister(name, email, password, skills) {
    try {
        const response = await API.register(name, email, password, skills);
        if (response.success) {
            currentUser = response.data;
            userSkills = response.data.skills || [];
            showToast('Registration successful! Welcome!', 'success');
            hideLoginModal();
            await loadUserProfile();
            loadOpportunities();
            updateUIForLoggedInUser();
        }
    } catch (error) {
        showToast('Registration failed: ' + error.message, 'error');
    }
}

// Logout handler
async function handleLogout() {
    try {
        await API.logout();
        currentUser = null;
        userSkills = [];
        showToast('Logged out successfully', 'success');
        updateUIForLoggedOutUser();
        loadOpportunities();
    } catch (error) {
        showToast('Logout failed', 'error');
    }
}

// Load user profile
async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        const response = await API.getProfile();
        if (response.success) {
            userSkills = response.data.user.skills || [];
            const matchPercentage = Math.floor(Math.random() * 30) + 70; // Calculate actual match
            const matchElement = document.getElementById('profileMatch');
            if (matchElement) animateMatchScore(matchElement, matchPercentage);
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && currentUser) {
        const welcomeSpan = document.createElement('span');
        welcomeSpan.className = 'user-welcome';
        welcomeSpan.textContent = `Welcome, ${currentUser.name || currentUser.email}`;
        
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.className = 'btn-login';
        logoutLink.textContent = 'Logout →';
        logoutLink.id = 'logoutBtn';
        logoutLink.onclick = (e) => {
            e.preventDefault();
            handleLogout();
        };
        
        // Replace login button with welcome and logout
        const oldLoginBtn = document.getElementById('loginBtn');
        if (oldLoginBtn) {
            oldLoginBtn.remove();
            navLinks.appendChild(welcomeSpan);
            navLinks.appendChild(logoutLink);
        }
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const welcomeSpan = navLinks.querySelector('.user-welcome');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (welcomeSpan) welcomeSpan.remove();
        if (logoutBtn) logoutBtn.remove();
        
        if (!document.getElementById('loginBtn')) {
            const newLoginBtn = document.createElement('a');
            newLoginBtn.href = '#';
            newLoginBtn.className = 'btn-login';
            newLoginBtn.textContent = 'Sign In →';
            newLoginBtn.id = 'loginBtn';
            newLoginBtn.onclick = (e) => {
                e.preventDefault();
                showLoginModal();
            };
            navLinks.appendChild(newLoginBtn);
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Load initial data
    await loadOpportunities();
    await loadUserProfile();
    
    // Setup event listeners
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const getStartedBtn = document.getElementById('getStartedBtn');
    
    if (searchBtn) searchBtn.addEventListener('click', filterOpportunities);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterOpportunities();
    });
    if (typeFilter) typeFilter.addEventListener('change', filterOpportunities);
    if (locationFilter) locationFilter.addEventListener('change', filterOpportunities);
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Welcome to CareerLaunch! Start exploring opportunities →', 'success');
            if (searchInput) searchInput.focus();
        });
    }
    
    // Login modal events
    if (loginBtn) loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });
    
    if (closeBtn) closeBtn.addEventListener('click', hideLoginModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) hideLoginModal();
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            await handleLogin(email, password);
        });
    }
    
    // Simulate real-time updates (optional)
    setInterval(() => {
        loadOpportunities();
    }, 30000);
});