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
    window.history.back();
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
    
    // Build profile HTML
    container.innerHTML = `
        <div class="card">
            <div class="card-header" style="text-align: center; padding: 2rem;">
                <div class="profile-avatar-large" style="width: 120px; height: 120px; margin: 0 auto 1rem; ${avatarUrl ? `background-image: url('${avatarUrl}'); background-size: cover; background-position: center;` : ''}">
                    ${!avatarUrl ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}` : ''}
                </div>
                <h2 style="margin: 0.5rem 0;">${profile.firstName} ${profile.lastName}</h2>
                <div style="display: flex; justify-content: center; margin: 0.5rem 0;">
                    ${roleBadge}
                </div>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">${profile.email}</p>
            </div>

            <div class="card-body">
                ${profile.bio ? `
                <div class="profile-section">
                    <h3>About</h3>
                    <p>${profile.bio}</p>
                </div>
                ` : ''}

                ${profile.region || profile.address ? `
                <div class="profile-section">
                    <h3>Contact Information</h3>
                    <div class="info-grid">
                        ${profile.region ? `
                        <div class="info-item">
                            <span class="info-label">Region:</span>
                            <span>${profile.region}</span>
                        </div>
                        ` : ''}
                        ${profile.province ? `
                        <div class="info-item">
                            <span class="info-label">City/Municipality:</span>
                            <span>${profile.province}</span>
                        </div>
                        ` : ''}
                        ${profile.address ? `
                        <div class="info-item">
                            <span class="info-label">Address:</span>
                            <span>${profile.address}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                ${profile.role === 'student' && profile.studentInfo ? `
                <div class="profile-section">
                    <h3>Student Information</h3>
                    <div class="info-grid">
                        ${profile.studentInfo.institution ? `
                        <div class="info-item">
                            <span class="info-label">Institution:</span>
                            <span>${profile.studentInfo.institution}</span>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.region ? `
                        <div class="info-item">
                            <span class="info-label">Institution Region:</span>
                            <span>${profile.studentInfo.region}</span>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.gradeLevel ? `
                        <div class="info-item">
                            <span class="info-label">Year Level:</span>
                            <span>${profile.studentInfo.gradeLevel}</span>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.major ? `
                        <div class="info-item">
                            <span class="info-label">Course/Program:</span>
                            <span>${profile.studentInfo.major}</span>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.gpa ? `
                        <div class="info-item">
                            <span class="info-label">GPA:</span>
                            <span>${profile.studentInfo.gpa}</span>
                        </div>
                        ` : ''}
                        ${profile.studentInfo.graduationYear ? `
                        <div class="info-item">
                            <span class="info-label">Expected Graduation:</span>
                            <span>${profile.studentInfo.graduationYear}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                ${profile.role === 'sponsor' && profile.sponsorInfo ? `
                <div class="profile-section">
                    <h3>Sponsor Information</h3>
                    <div class="info-grid">
                        ${profile.sponsorInfo.organization ? `
                        <div class="info-item">
                            <span class="info-label">Organization:</span>
                            <span>${profile.sponsorInfo.organization}</span>
                        </div>
                        ` : ''}
                        ${profile.sponsorInfo.website ? `
                        <div class="info-item">
                            <span class="info-label">Affiliated Institution:</span>
                            <span>${profile.sponsorInfo.website}</span>
                        </div>
                        ` : ''}
                        ${profile.sponsorInfo.contactEmail ? `
                        <div class="info-item">
                            <span class="info-label">Contact Email:</span>
                            <span><a href="mailto:${profile.sponsorInfo.contactEmail}">${profile.sponsorInfo.contactEmail}</a></span>
                        </div>
                        ` : ''}
                        ${profile.sponsorInfo.description ? `
                        <div class="info-item" style="grid-column: 1 / -1;">
                            <span class="info-label">About Organization:</span>
                            <span>${profile.sponsorInfo.description}</span>
                        </div>
                        ` : ''}
                        ${profile.sponsorInfo.verified ? `
                        <div class="info-item">
                            <span class="info-label">Verification Status:</span>
                            <span><span class="badge badge-success">Verified</span></span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                ${profile.socialLinks && (profile.socialLinks.facebook || profile.socialLinks.twitter || profile.socialLinks.linkedin) ? `
                <div class="profile-section">
                    <h3>Social Links</h3>
                    <div class="info-grid">
                        ${profile.socialLinks.facebook ? `
                        <div class="info-item">
                            <span class="info-label">Facebook:</span>
                            <span><a href="${profile.socialLinks.facebook}" target="_blank">View Profile</a></span>
                        </div>
                        ` : ''}
                        ${profile.socialLinks.twitter ? `
                        <div class="info-item">
                            <span class="info-label">Twitter:</span>
                            <span><a href="${profile.socialLinks.twitter}" target="_blank">View Profile</a></span>
                        </div>
                        ` : ''}
                        ${profile.socialLinks.linkedin ? `
                        <div class="info-item">
                            <span class="info-label">LinkedIn:</span>
                            <span><a href="${profile.socialLinks.linkedin}" target="_blank">View Profile</a></span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                ${((currentUser.role === 'student' && profile.role === 'sponsor') || 
                   (currentUser.role === 'sponsor' && profile.role === 'student')) ? `
                <div class="profile-section" style="text-align: center; padding-top: 1.5rem; border-top: 2px solid var(--border-color);">
                    <button onclick="sendMessage('${profile._id}')" class="btn-primary" style="padding: 0.875rem 2rem; font-size: 1rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 0.5rem;">
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
