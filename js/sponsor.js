// Sponsor Dashboard functionality

// Check authentication
function checkAuth() {
    const currentUser = API.getCurrentUser();
    
    // Auto-clear corrupted cache
    if (currentUser && !currentUser.role) {
        console.warn('⚠️ Corrupted user data detected - clearing cache');
        localStorage.clear();
        sessionStorage.clear();
        alert('Session data was corrupted. Please login again.');
        window.location.href = 'login.html';
        return null;
    }
    
    if (!currentUser || currentUser.role !== 'sponsor') {
        window.location.href = 'login.html';
        return null;
    }
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    return currentUser;
}

let allScholarships = [];
let allApplications = [];
let currentReviewApp = null;
let isLoading = false;

// Load dashboard data
async function loadDashboard() {
    if (isLoading) return; // Prevent multiple simultaneous loads
    
    isLoading = true;
    
    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingEl);
    
    try {
        console.log('🔄 Loading dashboard data...');
        
        // Load scholarships and applications in parallel for faster loading
        const [scholarships, applications] = await Promise.all([
            API.getSponsorScholarships(),
            API.getSponsorApplications()
        ]);
        
        console.log('📚 Loaded scholarships:', scholarships.length);
        console.log('📝 Loaded applications:', applications.length);
        
        allScholarships = scholarships;
        allApplications = applications;
        
        // Update stats (calculate from loaded data, no need for separate API call)
        document.getElementById('totalScholarships').textContent = scholarships.length;
        document.getElementById('totalApplicants').textContent = applications.length;
        document.getElementById('pendingReviews').textContent = 
            applications.filter(a => a.status === 'pending').length;
        document.getElementById('approvedCount').textContent = 
            applications.filter(a => a.status === 'approved').length;
        
        displayScholarships(scholarships);
        displayApplications(applications);
        
        console.log('✅ Dashboard loaded successfully');
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        alert('Error loading dashboard data. Please refresh the page.');
    } finally {
        isLoading = false;
        // Remove loading indicator
        const loadingEl = document.querySelector('.loading-overlay');
        if (loadingEl) loadingEl.remove();
    }
}

// Display scholarships
function displayScholarships(scholarships) {
    const tbody = document.getElementById('scholarshipsTableBody');
    
    if (scholarships.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No scholarships yet</td></tr>';
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    tbody.innerHTML = scholarships.map(s => {
        const deadlineDate = new Date(s.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        let deadlineStatus = '';
        let deadlineClass = '';
        
        if (daysLeft < 0) {
            deadlineStatus = `<span style="color: #dc3545; font-weight: bold;">Expired</span>`;
            deadlineClass = 'expired';
        } else if (daysLeft === 0) {
            deadlineStatus = `<span style="color: #ffc107; font-weight: bold;">Today!</span>`;
            deadlineClass = 'today';
        } else if (daysLeft <= 3) {
            deadlineStatus = `<span style="color: #ffc107;">${daysLeft} day${daysLeft > 1 ? 's' : ''} left</span>`;
            deadlineClass = 'urgent';
        } else if (daysLeft <= 7) {
            deadlineStatus = `<span style="color: #17a2b8;">${daysLeft} days left</span>`;
            deadlineClass = 'soon';
        } else {
            deadlineStatus = `<span style="color: #28a745;">${daysLeft} days left</span>`;
            deadlineClass = 'active';
        }
        
        return `
        <tr class="deadline-${deadlineClass}">
            <td>${s.title || 'Untitled'}</td>
            <td>${s.scholarshipType || 'N/A'}</td>
            <td>${s.availableSlots || 0}</td>
            <td>
                ${new Date(s.deadline).toLocaleDateString()}<br>
                <small>${deadlineStatus}</small>
            </td>
            <td>${allApplications.filter(a => {
                const scholarshipId = a.scholarship?._id || a.scholarship;
                return scholarshipId?.toString() === s._id?.toString();
            }).length}</td>
            <td><span class="badge badge-${s.status}">${s.status}</span></td>
            <td>
                <button onclick="editScholarship('${s._id}')" class="btn-secondary btn-sm">Edit</button>
                <button onclick="deleteScholarship('${s._id}')" class="btn-danger btn-sm">Delete</button>
            </td>
        </tr>
    `;
    }).join('');
}

// Display applications
function displayApplications(applications) {
    const tbody = document.getElementById('applicationsTableBody');
    
    if (applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No applications yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = applications.map(app => {
        // Handle both populated and non-populated responses
        const studentName = app.student 
            ? `${app.student.firstName || ''} ${app.student.lastName || ''}`.trim() 
            : app.studentName || 'Unknown';
        const scholarshipTitle = app.scholarship 
            ? app.scholarship.title 
            : app.scholarshipTitle || 'Unknown';
        const applicationDate = app.appliedAt || app.applicationDate || new Date();
        
        return `
            <tr>
                <td>${studentName}</td>
                <td>${scholarshipTitle}</td>
                <td>${new Date(applicationDate).toLocaleDateString()}</td>
                <td><span class="badge badge-${app.status}">${app.status}</span></td>
                <td>
                    <button onclick="reviewApplication('${app._id}')" class="btn-primary btn-sm">Review</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter applications
function filterApplications() {
    const status = document.getElementById('statusFilter').value;
    
    if (status) {
        const filtered = allApplications.filter(a => a.status === status);
        displayApplications(filtered);
    } else {
        displayApplications(allApplications);
    }
}

// Review application
function reviewApplication(applicationId) {
    const application = allApplications.find(a => a._id === applicationId);
    if (!application) {
        console.error('Application not found:', applicationId);
        return;
    }
    
    console.log('Reviewing application:', application);
    
    currentReviewApp = applicationId;
    
    const studentName = application.student 
        ? `${application.student.firstName || ''} ${application.student.lastName || ''}`.trim() 
        : 'N/A';
    const studentEmail = application.student?.email || 'N/A';
    const scholarshipTitle = application.scholarship?.title || 'N/A';
    const appliedDate = application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A';
    
    const detailContainer = document.getElementById('applicationDetail');
    detailContainer.innerHTML = `
        <div class="application-review">
            <h3>Student Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name:</span>
                    <span>${studentName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span>${studentEmail}</span>
                </div>
            </div>
            
            <h3>Cover Letter</h3>
            <p style="white-space: pre-wrap;">${application.coverLetter || 'No cover letter provided'}</p>
            
            <h3>Scholarship</h3>
            <p>${scholarshipTitle}</p>
            
            <h3>Application Date</h3>
            <p>${appliedDate}</p>
            
            ${application.documentsLink ? `
                <h3>Submitted Documents</h3>
                <div class="documents-link-container" style="background: var(--background); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                    <p style="margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">
                        View all documents via Google Drive:
                    </p>
                    <a href="${application.documentsLink}" target="_blank" rel="noopener noreferrer" 
                       class="btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Open Documents
                    </a>
                </div>
            ` : '<p><em>No documents link provided</em></p>'}
            
            ${application.additionalInfo ? `
                <h3>Additional Information</h3>
                <p style="white-space: pre-wrap;">${application.additionalInfo}</p>
            ` : ''}
            
            ${application.reviewNotes ? `
                <h3>Review Notes</h3>
                <p>${application.reviewNotes}</p>
            ` : ''}
            
            <div class="modal-actions" style="margin-top: 1.5rem;">
                <button onclick="messageStudent('${application.student._id}')" class="btn-secondary">
                    💬 Message Student
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('reviewModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

// Message student
function messageStudent(studentId) {
    window.location.href = `messages.html?recipient=${studentId}`;
}

// Close review modal
function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    document.body.classList.remove('modal-open');
    currentReviewApp = null;
}

// Submit review
async function submitReview() {
    if (!currentReviewApp) return;
    
    const status = document.getElementById('reviewStatus').value;
    const notes = document.getElementById('reviewNotes').value;
    
    try {
        await API.updateApplicationStatus(currentReviewApp, status, notes);
        alert('Application reviewed successfully');
        closeReviewModal();
        loadDashboard();
    } catch (error) {
        alert('Error reviewing application');
    }
}

// Edit scholarship
function editScholarship(scholarshipId) {
    // For now, just redirect to add scholarship page
    // In a full implementation, you would load the scholarship data
    window.location.href = `add-scholarship.html?id=${scholarshipId}`;
}

// Delete scholarship
async function deleteScholarship(scholarshipId) {
    // Show custom confirmation dialog
    const confirmed = await notify.confirm('Are you sure you want to delete this scholarship? This will also delete all applications.');
    
    if (!confirmed) {
        return; // User cancelled
    }
    
    try {
        await API.deleteScholarship(scholarshipId);
        alert('Scholarship deleted successfully');
        loadDashboard();
    } catch (error) {
        alert('Error deleting scholarship');
    }
}

// Logout
function logout() {
    API.logout();
    window.location.href = 'index.html';
}

// Auto-refresh dashboard data every 30 seconds
let refreshInterval;

function startAutoRefresh() {
    // Refresh every 30 seconds
    refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard...');
        loadDashboard();
    }, 30000); // 30 seconds
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

// Manual refresh function
function refreshDashboard() {
    console.log('🔄 Manually refreshing dashboard...');
    loadDashboard();
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboard();
    startAutoRefresh(); // Start auto-refresh
});

// Stop auto-refresh when leaving page
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});
