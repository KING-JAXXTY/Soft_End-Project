// Scholarship Detail Page functionality

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
    }
    
    return currentUser;
}

function goBackToHome() {
    const currentUser = API.getCurrentUser();
    if (currentUser.role === 'student') {
        window.location.href = 'student-home.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Load scholarship details
async function loadScholarshipDetail() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const scholarshipId = urlParams.get('id');
        
        if (!scholarshipId) {
            notify.error('No scholarship ID provided');
            goBackToHome();
            return;
        }
        
        const scholarship = await API.getScholarship(scholarshipId);
        const currentUser = API.getCurrentUser();
        
        // Build the detail view
        const container = document.getElementById('scholarshipDetailContent');
        
        container.innerHTML = `
            <div class="scholarship-detail-header">
                <div class="scholarship-header-content">
                    <h1 class="scholarship-title">${scholarship.title}</h1>
                    <div class="scholarship-meta">
                        <span class="scholarship-type">${scholarship.type}</span>
                        <span class="scholarship-status ${scholarship.status}">${scholarship.status}</span>
                    </div>
                </div>
            </div>

            <div class="scholarship-detail-body">
                <div class="scholarship-main-content">
                    <section class="detail-card">
                        <h2>Description</h2>
                        <p>${scholarship.description}</p>
                    </section>

                    <section class="detail-card">
                        <h2>Eligibility Criteria</h2>
                        <p>${scholarship.eligibility}</p>
                    </section>

                    <section class="detail-card">
                        <h2>Benefits</h2>
                        <p>${scholarship.benefits}</p>
                    </section>

                    ${scholarship.requirements ? `
                    <section class="detail-card">
                        <h2>Requirements</h2>
                        <p>${scholarship.requirements}</p>
                    </section>
                    ` : ''}
                </div>

                <aside class="scholarship-sidebar">
                    <div class="detail-card sidebar-card">
                        <h3>Scholarship Information</h3>
                        <div class="info-row">
                            <span class="info-label">Amount</span>
                            <span class="info-value">₱${scholarship.amount ? scholarship.amount.toLocaleString() : 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Deadline</span>
                            <span class="info-value">${scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Slots Available</span>
                            <span class="info-value">${scholarship.slots || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Region</span>
                            <span class="info-value">${scholarship.region || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Field of Study</span>
                            <span class="info-value">${scholarship.fieldOfStudy || 'N/A'}</span>
                        </div>
                    </div>

                    ${currentUser.role === 'student' ? `
                    <div class="detail-card sidebar-card action-card">
                        <button onclick="applyForScholarship('${scholarship._id}')" class="btn-primary btn-block">
                            Apply Now
                        </button>
                    </div>
                    ` : ''}

                    ${scholarship.location && scholarship.location.latitude && scholarship.location.longitude ? `
                    <div class="detail-card sidebar-card">
                        <h3>Location</h3>
                        <div id="scholarshipMap" style="height: 250px; border-radius: 8px; margin-top: 0.5rem;"></div>
                    </div>
                    ` : ''}
                </aside>
            </div>
        `;
        
        // Initialize map if coordinates exist
        if (scholarship.location && scholarship.location.latitude && scholarship.location.longitude) {
            setTimeout(() => {
                const map = L.map('scholarshipMap').setView([scholarship.location.latitude, scholarship.location.longitude], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
                L.marker([scholarship.location.latitude, scholarship.location.longitude])
                    .addTo(map)
                    .bindPopup(scholarship.title);
            }, 100);
        }
        
    } catch (error) {
        console.error('Error loading scholarship:', error);
        notify.error('Failed to load scholarship details');
    }
}

// Apply for scholarship
async function applyForScholarship(scholarshipId) {
    window.location.href = `student-home.html?apply=${scholarshipId}`;
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadScholarshipDetail();
});
