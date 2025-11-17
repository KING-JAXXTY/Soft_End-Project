// View User Profile Page functionality

// Check authentication
function checkAuth() {
    const currentUser = API.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    
    // Set navigation links based on role
    const navLinks = document.getElementById('navLinks');
    if (currentUser.role === 'student') {
        navLinks.innerHTML = `
            <a href="student-home.html">Home</a>
            <a href="student-dashboard.html">Dashboard</a>
            <a href="messages.html">Messages</a>
            <a href="forum.html">Community Forum</a>
            <a href="profile.html">Profile</a>
        `;
    } else if (currentUser.role === 'sponsor') {
        navLinks.innerHTML = `
            <a href="sponsor-dashboard.html">Dashboard</a>
            <a href="messages.html">Messages</a>
            <a href="forum.html">Community Forum</a>
            <a href="profile.html">Profile</a>
        `;
    } else if (currentUser.role === 'admin') {
        navLinks.innerHTML = `
            <a href="admin-dashboard.html">Dashboard</a>
            <a href="forum.html">Community Forum</a>
            <a href="profile.html">Profile</a>
        `;
    }
    
    return currentUser;
}

// Get user ID from URL
function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Go back to previous page
function goBack() {
    // Check if there's history to go back to
    if (window.history.length > 1 && document.referrer) {
        window.history.back();
    } else {
        // If opened in new tab or no history, redirect based on role
        const currentUser = API.getCurrentUser();
        if (currentUser) {
            if (currentUser.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else if (currentUser.role === 'sponsor') {
                window.location.href = 'sponsor-dashboard.html';
            } else {
                window.location.href = 'student-home.html';
            }
        } else {
            window.close(); // Try to close the tab if possible
        }
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const userId = getUserIdFromUrl();
        
        if (!userId) {
            notify.error('No user ID provided');
            goBack();
            return;
        }
        
        const currentUser = API.getCurrentUser();
        
        // Prevent viewing own profile on this page
        if (userId === currentUser._id) {
            notify.info('Redirecting to your profile...');
            window.location.href = 'profile.html';
            return;
        }
        
        const response = await API.getUserProfile(userId);
        const profile = response.profile || response;
        
        // Extract user data if nested
        const user = profile.user || {};
        const profileData = {
            _id: user._id || profile._id || userId,
            firstName: user.firstName || profile.firstName,
            lastName: user.lastName || profile.lastName,
            email: user.email || profile.email,
            role: user.role || profile.role,
            avatar: user.avatar || profile.avatar,
            uniqueId: user.uniqueId || profile.uniqueId,
            bio: profile.bio,
            phone: profile.phone,
            region: profile.region,
            province: profile.province,
            address: profile.address || profile.municipality,
            studentInfo: profile.studentInfo,
            sponsorInfo: profile.sponsorInfo,
            socialLinks: profile.socialLinks
        };
        
        displayProfile(profileData);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        notify.error('Failed to load user profile');
        document.getElementById('profileContent').innerHTML = `
            <div class="card">
                <div class="card-body" style="text-align: center; padding: 3rem;">
                    <p style="color: var(--danger-color);">Failed to load profile</p>
                    <button onclick="goBack()" class="btn-secondary" style="margin-top: 1rem;">Go Back</button>
                </div>
            </div>
        `;
    }
}

// Display profile
function displayProfile(profile) {
    const container = document.getElementById('profileContent');
    const currentUser = API.getCurrentUser();
    
    // Determine role badge
    let roleBadge = '';
    if (profile.role === 'student') {
        roleBadge = '<span class="badge badge-primary">Student</span>';
    } else if (profile.role === 'sponsor') {
        roleBadge = '<span class="badge badge-success">Sponsor</span>';
    } else if (profile.role === 'admin') {
        roleBadge = '<span class="badge badge-danger">Admin</span>';
    }
    
    // Get avatar URL
    const avatarUrl = (typeof getAvatarUrl === 'function' && profile.avatar) 
        ? getAvatarUrl(profile.avatar) 
        : '';
    
    // Build profile HTML with professional scholarship theme
    container.innerHTML = `
        <div class="modern-profile-card">
            <!-- Profile Header with Cover -->
            <div class="profile-cover-section">
                <div class="profile-cover-gradient"></div>
                <div class="profile-header-content">
                    <div class="profile-avatar-wrapper">
                        ${avatarUrl ? 
                            `<img src="${avatarUrl}" alt="${profile.firstName} ${profile.lastName}" class="profile-avatar-img" />` :
                            `<div class="profile-avatar-initials">${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}</div>`
                        }
                    </div>
                    <div class="profile-header-info">
                        <h1 class="profile-name">${profile.firstName} ${profile.lastName}</h1>
                        <div class="profile-meta">
                            ${roleBadge}
                            ${profile.uniqueId ? `<span class="profile-id">ID: ${profile.uniqueId}</span>` : ''}
                        </div>
                        ${profile.email && profile.role !== 'admin' ? `<p class="profile-email">${profile.email}</p>` : ''}
                    </div>
                </div>
            </div>

            <!-- Profile Body -->
            <div class="profile-body-content">
                ${profile.bio ? `
                <div class="profile-info-card">
                    <div class="info-card-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <h3>About</h3>
                    </div>
                    <p class="about-text">${profile.bio}</p>
                </div>
                ` : ''}

                ${profile.role === 'student' && profile.studentInfo ? `
                <div class="profile-info-card">
                    <div class="info-card-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                        <h3>Academic Information</h3>
                    </div>
                    <div class="info-grid-modern">
                        ${profile.studentInfo.institution ? `
                        <div class="info-item-modern">
                            <span class="info-icon">🏫</span>
                            <div class="info-content">
                                <span class="info-label-modern">Institution</span>
                                <span class="info-value-modern">${profile.studentInfo.institution}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.region ? `
                        <div class="info-item-modern">
                            <span class="info-icon">📍</span>
                            <div class="info-content">
                                <span class="info-label-modern">Region</span>
                                <span class="info-value-modern">${profile.studentInfo.region}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.major ? `
                        <div class="info-item-modern">
                            <span class="info-icon">📚</span>
                            <div class="info-content">
                                <span class="info-label-modern">Course/Program</span>
                                <span class="info-value-modern">${profile.studentInfo.major}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.gradeLevel ? `
                        <div class="info-item-modern">
                            <span class="info-icon">🎓</span>
                            <div class="info-content">
                                <span class="info-label-modern">Year Level</span>
                                <span class="info-value-modern">${profile.studentInfo.gradeLevel}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.gpa ? `
                        <div class="info-item-modern">
                            <span class="info-icon">⭐</span>
                            <div class="info-content">
                                <span class="info-label-modern">GPA</span>
                                <span class="info-value-modern">${profile.studentInfo.gpa}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.graduationYear ? `
                        <div class="info-item-modern">
                            <span class="info-icon">📅</span>
                            <div class="info-content">
                                <span class="info-label-modern">Expected Graduation</span>
                                <span class="info-value-modern">${profile.studentInfo.graduationYear}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                ${profile.role === 'sponsor' && profile.sponsorInfo ? `
                <div class="profile-info-card">
                    <div class="info-card-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <h3>Organization Details</h3>
                    </div>
                    <div class="info-grid-modern">
                        ${profile.sponsorInfo.organization ? `
                        <div class="info-item-modern">
                            <span class="info-icon">🏢</span>
                            <div class="info-content">
                                <span class="info-label-modern">Organization</span>
                                <span class="info-value-modern">${profile.sponsorInfo.organization}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.sponsorInfo.website ? `
                        <div class="info-item-modern">
                            <span class="info-icon">🏫</span>
                            <div class="info-content">
                                <span class="info-label-modern">Affiliated Institution</span>
                                <span class="info-value-modern">${profile.sponsorInfo.website}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.sponsorInfo.verified ? `
                        <div class="info-item-modern">
                            <span class="info-icon">✓</span>
                            <div class="info-content">
                                <span class="info-label-modern">Status</span>
                                <span class="badge badge-success">Verified Sponsor</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.sponsorInfo.description ? `
                        <div class="info-item-modern full-width">
                            <span class="info-icon">📝</span>
                            <div class="info-content">
                                <span class="info-label-modern">About Organization</span>
                                <span class="info-value-modern">${profile.sponsorInfo.description}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                ${profile.region || profile.province || profile.address ? `
                <div class="profile-info-card">
                    <div class="info-card-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <h3>Location</h3>
                    </div>
                    <div class="info-grid-modern">
                        ${profile.region ? `
                        <div class="info-item-modern">
                            <span class="info-icon">🗺️</span>
                            <div class="info-content">
                                <span class="info-label-modern">Region</span>
                                <span class="info-value-modern">${profile.region}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.province ? `
                        <div class="info-item-modern">
                            <span class="info-icon">🏙️</span>
                            <div class="info-content">
                                <span class="info-label-modern">City/Municipality</span>
                                <span class="info-value-modern">${profile.province}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${profile.address ? `
                        <div class="info-item-modern full-width">
                            <span class="info-icon">📍</span>
                            <div class="info-content">
                                <span class="info-label-modern">Address</span>
                                <span class="info-value-modern">${profile.address}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                ${((currentUser.role === 'student' && profile.role === 'sponsor') || 
                   (currentUser.role === 'sponsor' && profile.role === 'student')) ? `
                <div class="profile-action-section">
                    <button onclick="sendMessage('${profile._id}')" class="btn-message-user">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Send Message
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Send message to user
function sendMessage(userId) {
    // Redirect to messages page with recipient parameter
    window.location.href = `messages.html?recipient=${userId}`;
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserProfile();
});
