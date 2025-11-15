// Admin Dashboard functionality

// Check authentication
function checkAuth() {
    const currentUser = API.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'login.html';
        return null;
    }
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    return currentUser;
}

let allUsers = [];
let allScholarships = [];
let allReports = [];
let deleteTarget = null;
let isLoading = false;

// Load dashboard data
async function loadDashboard() {
    if (isLoading) return;
    
    isLoading = true;
    
    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingEl);
    
    try {
        // Load all data in parallel for faster loading
        const [stats, users, scholarships, reportsStats] = await Promise.all([
            API.getAdminStatistics(),
            API.getAllUsers(),
            API.getScholarships(),
            API.getReportsStats()
        ]);
        
        console.log('📊 Admin stats received:', stats);
        console.log('👥 Users received:', users?.length || 0);
        console.log('🎓 Scholarships received:', scholarships?.length || 0);
        console.log('📋 Reports stats received:', reportsStats);
        
        allUsers = users;
        allScholarships = scholarships;
        
        // Update stats with fallback values
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalStudents').textContent = stats.totalStudents || 0;
        document.getElementById('totalSponsors').textContent = stats.totalSponsors || 0;
        document.getElementById('totalScholarships').textContent = stats.activeScholarships || 0;
        document.getElementById('totalApplications').textContent = stats.totalApplications || 0;
        document.getElementById('pendingApplications').textContent = stats.pendingApplications || 0;
        document.getElementById('totalReports').textContent = reportsStats.total || 0;
        
        displayUsers(users);
        displayScholarships(scholarships);
        loadReports();
        
        // Load activity log independently (don't let it block other data)
        loadActivityLog().catch(err => {
            console.error('Activity log error:', err);
            // Activity log failure shouldn't affect dashboard
        });
        
        console.log('✅ Admin dashboard loaded successfully');
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        alert('Error loading dashboard. Please refresh the page.');
    } finally {
        isLoading = false;
        // Remove loading indicator
        const loadingEl = document.querySelector('.loading-overlay');
        if (loadingEl) loadingEl.remove();
    }
}

// Display users
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td><span class="badge badge-${user.role}">${user.role}</span></td>
            <td>${user.region || 'N/A'}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                ${user.role !== 'admin' ? `
                    <button onclick="deleteUserConfirm('${user._id}', '${user.firstName} ${user.lastName}')" class="btn-danger btn-sm">Delete</button>
                ` : '<span class="text-muted">Protected</span>'}
            </td>
        </tr>
    `).join('');
}

// Filter users
function filterUsers() {
    const role = document.getElementById('roleFilter').value;
    
    if (role) {
        const filtered = allUsers.filter(u => u.role === role);
        displayUsers(filtered);
    } else {
        displayUsers(allUsers);
    }
}

// Display scholarships
function displayScholarships(scholarships) {
    const tbody = document.getElementById('scholarshipsTableBody');
    
    if (scholarships.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No scholarships found</td></tr>';
        return;
    }
    
    tbody.innerHTML = scholarships.map(s => `
        <tr>
            <td>${s.title}</td>
            <td>${s.sponsorName}</td>
            <td>${s.scholarshipType}</td>
            <td>${s.availableSlots}</td>
            <td>${new Date(s.deadline).toLocaleDateString()}</td>
            <td><span class="badge badge-${s.status}">${s.status}</span></td>
            <td>
                <button onclick="deleteScholarshipConfirm('${s._id}', '${s.title}')" class="btn-danger btn-sm">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Filter scholarships
function filterScholarships() {
    const status = document.getElementById('scholarshipStatusFilter').value;
    
    if (status) {
        const filtered = allScholarships.filter(s => s.status === status);
        displayScholarships(filtered);
    } else {
        displayScholarships(allScholarships);
    }
}

// Load activity log
async function loadActivityLog() {
    const container = document.getElementById('activityLog');
    
    if (!container) {
        console.warn('Activity log container not found');
        return;
    }
    
    container.innerHTML = '<div class="activity-loading">Loading activity...</div>';
    
    try {
        const activities = await API.getRecentActivity();
        
        if (!activities || !activities.length) {
            container.innerHTML = '<div class="activity-empty">No recent activity found.</div>';
            return;
        }
        
        container.innerHTML = activities.map(activity => {
            let timeStr = 'N/A';
            if (activity.time) {
                const time = new Date(activity.time);
                if (!isNaN(time.getTime())) {
                    timeStr = time.toLocaleString();
                }
            }
            let detail = activity.detail ? `<span class='activity-detail'>${activity.detail}</span>` : '';
            return `
                <div class="activity-item">
                    <div class="activity-content">
                        <strong>${activity.action}</strong>
                        <span class="activity-user">by ${activity.user}</span>
                        ${detail}
                    </div>
                    <span class="activity-time">${timeStr}</span>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading activity:', err);
        container.innerHTML = `<div class='activity-error'>Error loading activity: ${err.message}</div>`;
    }
}

// Delete user confirmation
function deleteUserConfirm(userId, userName) {
    deleteTarget = { type: 'user', _id: userId };
    document.getElementById('deleteMessage').textContent = 
        `Are you sure you want to delete user "${userName}"? This will also delete all their data including scholarships, applications, and forum posts.`;
    document.getElementById('deleteModal').style.display = 'block';
}

// Delete scholarship confirmation
function deleteScholarshipConfirm(scholarshipId, title) {
    deleteTarget = { type: 'scholarship', _id: scholarshipId };
    document.getElementById('deleteMessage').textContent = 
        `Are you sure you want to delete scholarship "${title}"? This will also delete all applications.`;
    document.getElementById('deleteModal').style.display = 'block';
}

// Confirm delete
async function confirmDelete() {
    if (!deleteTarget) return;
    
    try {
        if (deleteTarget.type === 'user') {
            await API.deleteUser(deleteTarget._id);
            alert('User deleted successfully');
        } else if (deleteTarget.type === 'scholarship') {
            await API.deleteScholarship(deleteTarget._id);
            alert('Scholarship deleted successfully');
        }
        
        closeDeleteModal();
        loadDashboard();
    } catch (error) {
        alert('Error deleting item');
    }
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteTarget = null;
}

// ==================== REPORTS MANAGEMENT ====================

async function loadReports() {
    try {
        const response = await API.getAllReports();
        allReports = response.reports || [];
        displayReports(allReports);
    } catch (error) {
        console.error('Error loading reports:', error);
        document.getElementById('reportsTableBody').innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--danger-color);">
                    Failed to load reports
                </td>
            </tr>
        `;
    }
}

function displayReports(reports) {
    const tbody = document.getElementById('reportsTableBody');
    
    if (!reports || reports.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    No reports found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = reports.map(report => {
        const reporterName = report.reporter 
            ? `${report.reporter.firstName} ${report.reporter.lastName}` 
            : 'Unknown';
        const statusBadge = getStatusBadge(report.status);
        const shortId = report._id.substring(report._id.length - 6).toUpperCase();
        const date = new Date(report.createdAt).toLocaleDateString();
        
        return `
            <tr>
                <td>${shortId}</td>
                <td><span class="badge">${report.reportType}</span></td>
                <td>${report.subject}</td>
                <td>${reporterName}</td>
                <td>${statusBadge}</td>
                <td>${date}</td>
                <td>
                    <button onclick="viewReport('${report._id}')" class="btn-secondary btn-sm">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getStatusBadge(status) {
    const badges = {
        'Pending': '<span class="badge" style="background: #fbbf24;">Pending</span>',
        'Reviewing': '<span class="badge" style="background: #3b82f6;">Reviewing</span>',
        'Resolved': '<span class="badge" style="background: #10b981;">Resolved</span>',
        'Closed': '<span class="badge" style="background: #6b7280;">Closed</span>'
    };
    return badges[status] || '<span class="badge">Unknown</span>';
}

function filterReports() {
    const statusFilter = document.getElementById('reportStatusFilter').value;
    const typeFilter = document.getElementById('reportTypeFilter').value;
    
    let filtered = allReports;
    
    if (statusFilter) {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (typeFilter) {
        filtered = filtered.filter(r => r.reportType === typeFilter);
    }
    
    displayReports(filtered);
}

async function viewReport(reportId) {
    try {
        const report = await API.getReport(reportId);
        displayReportDetail(report);
        document.getElementById('reportDetailModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading report:', error);
        notify.error('Failed to load report details');
    }
}

function displayReportDetail(report) {
    const container = document.getElementById('reportDetailContent');
    const reporterName = report.reporter 
        ? `${report.reporter.firstName} ${report.reporter.lastName}` 
        : 'Unknown';
    const reporterId = report.reporter?.uniqueId || 'N/A';
    const date = new Date(report.createdAt).toLocaleDateString();
    
    // Check if there's a reported user ID and provide search
    let reportedUserSection = '';
    if (report.reportedUserId) {
        reportedUserSection = `
            <div class="form-group">
                <label><strong>Reported User ID:</strong></label>
                <p style="font-family: 'Courier New', monospace; background: var(--background); padding: 0.5rem; border-radius: 4px;">
                    ${report.reportedUserId}
                    <button onclick="searchReportedUser('${report.reportedUserId}')" class="btn-secondary btn-sm" style="margin-left: 0.5rem;">
                        Search User
                    </button>
                </p>
                <div id="searchedUserInfo"></div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <strong>Report Type:</strong>
                    <p><span class="badge">${report.reportType}</span></p>
                </div>
                <div>
                    <strong>Status:</strong>
                    <p>${getStatusBadge(report.status)}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Reporter:</strong>
                <p>${reporterName} (${report.reporterRole}) - ID: ${reporterId}</p>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Date Submitted:</strong>
                <p>${date}</p>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Subject:</strong>
                <p>${report.subject}</p>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Description:</strong>
                <p style="white-space: pre-wrap; background: var(--background); padding: 1rem; border-radius: 8px;">
                    ${report.description}
                </p>
            </div>
            
            ${reportedUserSection}
            
            ${report.adminNotes ? `
                <div style="margin-bottom: 1rem;">
                    <strong>Admin Notes:</strong>
                    <p style="white-space: pre-wrap; background: var(--background); padding: 1rem; border-radius: 8px;">
                        ${report.adminNotes}
                    </p>
                </div>
            ` : ''}
        </div>
        
        <form onsubmit="updateReportStatus(event, '${report._id}')" style="border-top: 2px solid var(--border-color); padding-top: 1.5rem;">
            <div class="form-group">
                <label for="reportStatus">Update Status:</label>
                <select id="reportStatus" class="form-control" required>
                    <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Reviewing" ${report.status === 'Reviewing' ? 'selected' : ''}>Reviewing</option>
                    <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    <option value="Closed" ${report.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="adminNotes">Admin Notes:</label>
                <textarea id="adminNotes" class="form-control" rows="4" placeholder="Add notes about this report...">${report.adminNotes || ''}</textarea>
            </div>
            
            <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button type="button" onclick="closeReportModal()" class="btn-secondary">Close</button>
                <button type="submit" class="btn-primary">Update Report</button>
            </div>
        </form>
    `;
}

async function searchReportedUser(userId) {
    const container = document.getElementById('searchedUserInfo');
    container.innerHTML = '<p style="color: var(--text-secondary);">Searching...</p>';
    
    try {
        const response = await API.searchUserById(userId);
        const user = response.user;
        
        container.innerHTML = `
            <div style="background: var(--surface); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                <strong>User Found:</strong>
                <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> <span class="badge">${user.role}</span></p>
                <p><strong>User ID:</strong> ${user.uniqueId}</p>
                <button onclick="window.open('view-profile.html?id=${user._id}', '_blank')" class="btn-secondary btn-sm">
                    View Profile
                </button>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<p style="color: var(--danger-color);">User not found with ID: ${userId}</p>`;
    }
}

async function updateReportStatus(event, reportId) {
    event.preventDefault();
    
    const status = document.getElementById('reportStatus').value;
    const adminNotes = document.getElementById('adminNotes').value;
    
    try {
        await API.updateReportStatus(reportId, { status, adminNotes });
        notify.success('Report updated successfully');
        closeReportModal();
        loadReports();
        
        // Refresh stats
        const reportsStats = await API.getReportsStats();
        document.getElementById('totalReports').textContent = reportsStats.total || 0;
    } catch (error) {
        console.error('Error updating report:', error);
        notify.error('Failed to update report');
    }
}

function closeReportModal() {
    document.getElementById('reportDetailModal').style.display = 'none';
}

// Close report modal when clicking outside
window.addEventListener('click', function(event) {
    const reportModal = document.getElementById('reportDetailModal');
    if (reportModal && event.target === reportModal) {
        closeReportModal();
    }
});

// Logout
function logout() {
    API.logout();
    window.location.href = 'index.html';
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboard();
});
