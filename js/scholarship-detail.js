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
                        <span class="scholarship-type">${scholarship.scholarshipType || 'Scholarship'}</span>
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

                    ${scholarship.eligibility ? `
                    <section class="detail-card">
                        <h2>Eligibility Criteria</h2>
                        <p>${scholarship.eligibility}</p>
                    </section>
                    ` : ''}

                    ${scholarship.benefits ? `
                    <section class="detail-card">
                        <h2>Benefits</h2>
                        <p>${scholarship.benefits}</p>
                    </section>
                    ` : ''}

                    ${scholarship.requirements && scholarship.requirements.length > 0 ? `
                    <section class="detail-card">
                        <h2>Requirements</h2>
                        <ul>
                            ${scholarship.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </section>
                    ` : ''}

                    ${scholarship.selectionCriteria ? `
                    <section class="detail-card">
                        <h2>Selection Criteria</h2>
                        <p>${scholarship.selectionCriteria}</p>
                    </section>
                    ` : ''}

                    ${scholarship.renewalPolicy ? `
                    <section class="detail-card">
                        <h2>Renewal Policy</h2>
                        <p>${scholarship.renewalPolicy}</p>
                    </section>
                    ` : ''}

                    ${scholarship.documentsLink ? `
                    <section class="detail-card">
                        <h2>Supporting Documents</h2>
                        <p>Additional scholarship materials and guidelines are available:</p>
                        <a href="${scholarship.documentsLink}" target="_blank" class="btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            View Documents on Google Drive
                        </a>
                    </section>
                    ` : ''}
                </div>

                <aside class="scholarship-sidebar">
                    <div class="detail-card sidebar-card">
                        <h3>Scholarship Information</h3>
                        ${scholarship.amount ? `
                        <div class="info-row">
                            <span class="info-label">Amount</span>
                            <span class="info-value">₱${scholarship.amount.toLocaleString()}</span>
                        </div>
                        ` : ''}
                        ${scholarship.deadline ? `
                        <div class="info-row">
                            <span class="info-label">Deadline</span>
                            <span class="info-value">${new Date(scholarship.deadline).toLocaleDateString()}</span>
                        </div>
                        ` : ''}
                        ${scholarship.availableSlots !== undefined ? `
                        <div class="info-row">
                            <span class="info-label">Slots Available</span>
                            <span class="info-value" style="${scholarship.availableSlots === 0 ? 'color: #dc2626; font-weight: 600;' : ''}">${scholarship.availableSlots}${scholarship.availableSlots === 0 ? ' (FULL)' : ''}</span>
                        </div>
                        ` : ''}
                        ${scholarship.region ? `
                        <div class="info-row">
                            <span class="info-label">Region</span>
                            <span class="info-value">${scholarship.region}</span>
                        </div>
                        ` : ''}
                        ${scholarship.affiliatedInstitution ? `
                        <div class="info-row">
                            <span class="info-label">Institution</span>
                            <span class="info-value">${scholarship.affiliatedInstitution}</span>
                        </div>
                        ` : ''}
                        ${scholarship.contactEmail ? `
                        <div class="info-row">
                            <span class="info-label">Contact Email</span>
                            <span class="info-value"><a href="mailto:${scholarship.contactEmail}">${scholarship.contactEmail}</a></span>
                        </div>
                        ` : ''}
                        ${scholarship.contactPhone ? `
                        <div class="info-row">
                            <span class="info-label">Contact Phone</span>
                            <span class="info-value">${scholarship.contactPhone}</span>
                        </div>
                        ` : ''}
                        ${scholarship.applicationLink ? `
                        <div class="info-row">
                            <span class="info-label">External Application</span>
                            <span class="info-value"><a href="${scholarship.applicationLink}" target="_blank">Visit Site</a></span>
                        </div>
                        ` : ''}
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
    window.location.href = `apply-scholarship.html?id=${scholarshipId}`;
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadScholarshipDetail();
});
