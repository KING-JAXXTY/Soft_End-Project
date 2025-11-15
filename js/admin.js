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
let currentReportId = null; // Track currently viewed report for auto-refresh

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
        
        // Activity log loaded asynchronously to prevent blocking dashboard load
        loadActivityLog().catch(err => {
            console.error('Activity log error:', err);
            // Activity log failure shouldn't affect dashboard
        });
        
        console.log('✅ Admin dashboard loaded successfully');
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        notify.error('Error loading dashboard. Please refresh the page.');
    } finally {
        isLoading = false;
        // Remove loading indicator
        const loadingEl = document.querySelector('.loading-overlay');
        if (loadingEl) loadingEl.remove();
    }
}

// Display users
async function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No users found</td></tr>';
        return;
    }
    
    // Fetch status for all users in parallel
    const usersWithStatus = await Promise.all(users.map(async user => {
        if (user.role === 'admin') {
            return { ...user, status: null };
        }
        try {
            const status = await API.getUserStatus(user._id);
            return { ...user, status };
        } catch (err) {
            return { ...user, status: null };
        }
    }));
    
    tbody.innerHTML = usersWithStatus.map(user => {
        const status = user.status;
        const isSuspended = status?.isSuspended || false;
        const warnings = status?.warnings || 0;
        
        return `
        <tr>
            <td>
                ${user.firstName} ${user.lastName}
                ${isSuspended ? '<br><span class="badge" style="background: #ef4444;">Suspended</span>' : ''}
                ${warnings > 0 ? `<br><span class="badge" style="background: #f59e0b;">${warnings} Warning${warnings > 1 ? 's' : ''}</span>` : ''}
            </td>
            <td>${user.email}</td>
            <td><span class="badge badge-${user.role}">${user.role}</span></td>
            <td>${user.region || 'N/A'}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                ${user.role !== 'admin' ? `
                    <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                        ${isSuspended ? `
                            <button onclick="unsuspendUser('${user._id}', '${user.firstName} ${user.lastName}')" class="btn-primary btn-sm" title="Remove Suspension">
                                Unsuspend
                            </button>
                        ` : `
                            <button onclick="showSuspendModal('${user._id}', '${user.firstName} ${user.lastName}', '${user.role}')" class="btn-danger btn-sm" title="Suspend User">
                                Suspend
                            </button>
                        `}
                        <button onclick="showWarnModal('${user._id}', '${user.firstName} ${user.lastName}')" class="btn-secondary btn-sm" style="background: #f59e0b; color: white;" title="Issue Warning">
                            Warn
                        </button>
                        ${warnings > 0 ? `
                            <button onclick="removeAllWarnings('${user._id}', '${user.firstName} ${user.lastName}', ${warnings})" class="btn-secondary btn-sm" style="background: #10b981; color: white;" title="Remove All Warnings">
                                Clear
                            </button>
                        ` : ''}
                        <button onclick="deleteUserConfirm('${user._id}', '${user.firstName} ${user.lastName}')" class="btn-danger btn-sm" title="Delete User">
                            Delete
                        </button>
                    </div>
                ` : '<span class="text-muted">Protected</span>'}
            </td>
        </tr>
    `}).join('');
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
            notify.success('User deleted successfully');
        } else if (deleteTarget.type === 'scholarship') {
            await API.deleteScholarship(deleteTarget._id);
            notify.success('Scholarship deleted successfully');
        }
        
        closeDeleteModal();
        loadDashboard();
    } catch (error) {
        notify.error('Error deleting item');
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
        currentReportId = reportId; // Store for auto-refresh
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color);">
            <h3 style="margin: 0;">Report Information</h3>
            <button onclick="analyzeReportWithAI('${report._id}')" class="btn-primary" style="display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                AI Analysis
            </button>
        </div>
        
        <div id="aiAnalysisSection" style="display: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; color: white;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <h4 style="margin: 0; color: white;">AI Analysis</h4>
            </div>
            <div id="aiAnalysisContent">
                <div class="loading-spinner" style="border-color: rgba(255,255,255,0.3); border-top-color: white;"></div>
                <p style="text-align: center; margin-top: 1rem;">Analyzing report...</p>
            </div>
        </div>
        
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
        // First get user info and their report count
        const [userResponse, reportsResponse] = await Promise.all([
            API.searchUserById(userId),
            API.getUserReports(userId)
        ]);
        
        const user = userResponse.user;
        const reportStats = reportsResponse.stats;
        
        // Get user status after we have the user ID
        const userStatus = await API.getUserStatus(user._id).catch(() => ({ 
            isSuspended: false, 
            warnings: 0,
            warningHistory: []
        }));
        
        // Determine warning level based on report count
        let warningBadge = '';
        if (reportStats.total >= 5) {
            warningBadge = '<span class="badge" style="background: #ef4444;">⚠️ HIGH RISK - ' + reportStats.total + ' Reports</span>';
        } else if (reportStats.total >= 3) {
            warningBadge = '<span class="badge" style="background: #f59e0b;">⚠️ MODERATE - ' + reportStats.total + ' Reports</span>';
        } else if (reportStats.total > 0) {
            warningBadge = '<span class="badge" style="background: #fbbf24;">' + reportStats.total + ' Report(s)</span>';
        } else {
            warningBadge = '<span class="badge" style="background: #10b981;">No Reports</span>';
        }
        
        // Status badges
        let statusBadges = '';
        if (userStatus.isSuspended) {
            statusBadges += '<span class="badge" style="background: #ef4444; margin-top: 0.5rem;">🚫 SUSPENDED</span>';
        }
        if (userStatus.warnings > 0) {
            statusBadges += `<span class="badge" style="background: #f59e0b; margin-top: 0.5rem;">⚠️ ${userStatus.warnings} Warning(s)</span>`;
        }
        
        container.innerHTML = `
            <div style="background: var(--surface); border: 2px solid ${userStatus.isSuspended ? '#ef4444' : reportStats.total >= 3 ? '#f59e0b' : 'var(--border-color)'}; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <strong>User Found:</strong>
                        <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Role:</strong> <span class="badge">${user.role}</span></p>
                        <p><strong>User ID:</strong> ${user.uniqueId}</p>
                    </div>
                    <div style="text-align: right;">
                        ${warningBadge}
                        ${statusBadges}
                    </div>
                </div>
                
                ${userStatus.isSuspended ? `
                    <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 0.75rem; border-radius: 6px; margin-top: 1rem;">
                        <strong style="color: #ef4444;">⚠️ Suspended</strong>
                        <p style="margin-top: 0.5rem; font-size: 0.875rem;"><strong>Reason:</strong> ${userStatus.suspensionReason || 'No reason provided'}</p>
                        <p style="font-size: 0.875rem;"><strong>Suspended:</strong> ${new Date(userStatus.suspendedAt).toLocaleString()}</p>
                    </div>
                ` : ''}
                
                ${reportStats.total > 0 ? `
                    <div style="background: var(--background); padding: 0.75rem; border-radius: 6px; margin-top: 1rem;">
                        <strong>Report Breakdown:</strong>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem;">
                            <div>Pending: <strong>${reportStats.pending}</strong></div>
                            <div>Reviewing: <strong>${reportStats.reviewing}</strong></div>
                            <div>Resolved: <strong>${reportStats.resolved}</strong></div>
                        </div>
                    </div>
                ` : ''}
                
                ${userStatus.warningHistory && userStatus.warningHistory.length > 0 ? `
                    <div style="background: #fffbeb; border: 1px solid #f59e0b; padding: 0.75rem; border-radius: 6px; margin-top: 1rem;">
                        <strong style="color: #f59e0b;">⚠️ Warning History (${userStatus.warnings} total)</strong>
                        ${userStatus.warningHistory.slice(-3).reverse().map(w => `
                            <p style="font-size: 0.8125rem; margin-top: 0.5rem; padding-left: 0.5rem; border-left: 2px solid #f59e0b;">
                                <strong>${new Date(w.issuedAt).toLocaleDateString()}:</strong> ${w.reason}
                            </p>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="window.open('view-profile.html?id=${user._id}', '_blank')" class="btn-secondary btn-sm">
                        View Profile
                    </button>
                    ${reportStats.total > 0 ? `
                        <button onclick="viewAllUserReports('${userId}')" class="btn-primary btn-sm">
                            View All ${reportStats.total} Report(s)
                        </button>
                    ` : ''}
                    ${user.role !== 'admin' ? `
                        ${!userStatus.isSuspended ? `
                            <button onclick="showSuspendModal('${user._id}', '${user.firstName} ${user.lastName}', '${user.role}')" class="btn-danger btn-sm">
                                🚫 Suspend User
                            </button>
                        ` : `
                            <button onclick="unsuspendUser('${user._id}', '${user.firstName} ${user.lastName}')" class="btn-primary btn-sm">
                                ✓ Unsuspend User
                            </button>
                        `}
                        <button onclick="showWarnModal('${user._id}', '${user.firstName} ${user.lastName}')" class="btn-secondary btn-sm" style="background: #f59e0b; color: white;">
                            ⚠️ Issue Warning
                        </button>
                        ${userStatus.warnings > 0 ? `
                            <button onclick="removeAllWarnings('${user._id}', '${user.firstName} ${user.lastName}', ${userStatus.warnings})" class="btn-secondary btn-sm" style="background: #10b981; color: white;">
                                ✓ Remove All Warnings
                            </button>
                        ` : ''}
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<p style="color: var(--danger-color);">User not found with ID: ${userId}</p>`;
    }
}

async function viewAllUserReports(userId) {
    try {
        const response = await API.getUserReports(userId);
        
        // Close current modal
        closeReportModal();
        
        // Filter reports to show only this user's reports
        displayReports(response.reports);
        
        // Update filter display
        notify.info(`Showing ${response.count} report(s) about user ${userId}`);
        
        // Scroll to reports section
        document.querySelector('#reportsTableBody').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error loading user reports:', error);
        notify.error('Failed to load user reports');
    }
}

async function updateReportStatus(event, reportId) {
    event.preventDefault();
    
    const status = document.getElementById('reportStatus').value;
    const adminNotes = document.getElementById('adminNotes').value;
    
    try {
        await API.updateReportStatus(reportId, { status, adminNotes });
        notify.success('Report updated successfully');
        
        // Refresh the current report detail
        await refreshReportDetail();
        
        // Refresh reports list and stats
        await loadReports();
        
        const reportsStats = await API.getReportsStats();
        document.getElementById('totalReports').textContent = reportsStats.total || 0;
    } catch (error) {
        console.error('Error updating report:', error);
        notify.error('Failed to update report');
    }
}

// Refresh the currently viewed report detail
async function refreshReportDetail() {
    if (!currentReportId) return;
    
    try {
        const report = await API.getReport(currentReportId);
        displayReportDetail(report);
        
        // Re-search user if there was one searched
        const searchedUserInfo = document.getElementById('searchedUserInfo');
        if (searchedUserInfo && searchedUserInfo.innerHTML && report.reportedUserId) {
            await searchReportedUser(report.reportedUserId);
        }
    } catch (error) {
        console.error('Error refreshing report detail:', error);
    }
}

function closeReportModal() {
    document.getElementById('reportDetailModal').style.display = 'none';
    currentReportId = null; // Clear current report ID
}

// Close report modal when clicking outside
window.addEventListener('click', function(event) {
    const reportModal = document.getElementById('reportDetailModal');
    if (reportModal && event.target === reportModal) {
        closeReportModal();
    }
});

// User Action Modals
let currentActionUserId = null;
let currentActionUserName = null;

function showSuspendModal(userId, userName, userRole) {
    currentActionUserId = userId;
    currentActionUserName = userName;
    document.getElementById('suspendUserName').textContent = userName;
    document.getElementById('suspendReason').value = '';
    
    // Show sponsor warning if applicable
    const sponsorWarning = document.getElementById('sponsorSuspendWarning');
    if (sponsorWarning) {
        sponsorWarning.style.display = userRole === 'sponsor' ? 'block' : 'none';
    }
    
    document.getElementById('suspendModal').style.display = 'flex';
}

function closeSuspendModal() {
    document.getElementById('suspendModal').style.display = 'none';
    currentActionUserId = null;
    currentActionUserName = null;
}

async function confirmSuspend(event) {
    event.preventDefault();
    
    const reason = document.getElementById('suspendReason').value.trim();
    const durationValue = document.getElementById('suspensionDuration').value;
    
    if (!reason) {
        notify.error('Please provide a reason for suspension');
        return;
    }
    
    const isPermanent = durationValue === 'permanent';
    const duration = isPermanent ? null : parseInt(durationValue);
    
    try {
        const response = await API.suspendUser(currentActionUserId, reason, duration, isPermanent);
        
        if (isPermanent) {
            notify.success(`${currentActionUserName} has been permanently suspended`);
        } else {
            notify.success(`${currentActionUserName} has been suspended for ${duration} day(s)`);
        }
        
        // Show additional info if scholarships were deleted
        if (response.scholarshipsDeleted > 0) {
            notify.info(`${response.scholarshipsDeleted} scholarship(s) and ${response.applicationsDeleted} application(s) were deleted`);
        }
        
        closeSuspendModal();
        
        // Refresh the user search if we have a uniqueId to search
        const searchInput = document.getElementById('reportedUserIdInput');
        if (searchInput && searchInput.value) {
            await searchReportedUser(searchInput.value);
        }
        
        // Refresh report detail and reports list
        await refreshReportDetail();
        await loadReports();
    } catch (error) {
        console.error('Suspension error:', error);
        notify.error(error.message || 'Failed to suspend user');
    }
}

function showWarnModal(userId, userName) {
    currentActionUserId = userId;
    currentActionUserName = userName;
    document.getElementById('warnUserName').textContent = userName;
    document.getElementById('warnReason').value = '';
    document.getElementById('warnModal').style.display = 'flex';
}

function closeWarnModal() {
    document.getElementById('warnModal').style.display = 'none';
    currentActionUserId = null;
    currentActionUserName = null;
}

async function confirmWarn(event) {
    event.preventDefault();
    
    const reason = document.getElementById('warnReason').value.trim();
    if (!reason) {
        notify.error('Please provide a reason for the warning');
        return;
    }
    
    try {
        await API.warnUser(currentActionUserId, reason);
        notify.success(`Warning issued to ${currentActionUserName}`);
        closeWarnModal();
        
        // Refresh the user search
        const searchInput = document.getElementById('reportedUserIdInput');
        if (searchInput && searchInput.value) {
            await searchReportedUser(searchInput.value);
        }
        
        // Refresh report detail and reports list
        await refreshReportDetail();
        await loadReports();
    } catch (error) {
        console.error('Warning error:', error);
        notify.error(error.message || 'Failed to issue warning');
    }
}

async function unsuspendUser(userId, userName) {
    showConfirmModal(
        'Unsuspend User',
        `Are you sure you want to unsuspend ${userName}? They will be able to log in again.`,
        async () => {
            try {
                await API.unsuspendUser(userId);
                notify.success(`${userName} has been unsuspended`);
                
                // Refresh the user search
                const searchInput = document.getElementById('reportedUserIdInput');
                if (searchInput && searchInput.value) {
                    await searchReportedUser(searchInput.value);
                }
                
                // Refresh report detail and reports list
                await refreshReportDetail();
                await loadReports();
                await loadDashboard(); // Refresh user table
            } catch (error) {
                console.error('Unsuspension error:', error);
                notify.error(error.message || 'Failed to unsuspend user');
            }
        }
    );
}

async function removeAllWarnings(userId, userName, warningCount) {
    showConfirmModal(
        'Remove All Warnings',
        `Are you sure you want to remove all ${warningCount} warning(s) from ${userName}? This action will clear their warning history.`,
        async () => {
            try {
                await API.removeWarnings(userId);
                notify.success(`All warnings removed from ${userName}`);
                
                // Refresh the user search
                const searchInput = document.getElementById('reportedUserIdInput');
                if (searchInput && searchInput.value) {
                    await searchReportedUser(searchInput.value);
                }
                
                // Refresh report detail and reports list
                await refreshReportDetail();
                await loadReports();
                await loadDashboard(); // Refresh user table
            } catch (error) {
                console.error('Remove warnings error:', error);
                notify.error(error.message || 'Failed to remove warnings');
            }
        }
    );
}

// AI Analysis for Reports
async function analyzeReportWithAI(reportId) {
    const aiSection = document.getElementById('aiAnalysisSection');
    const aiContent = document.getElementById('aiAnalysisContent');
    
    // Show the section with loading state
    aiSection.style.display = 'block';
    aiContent.innerHTML = `
        <div class="loading-spinner" style="border-color: rgba(255,255,255,0.3); border-top-color: white;"></div>
        <p style="text-align: center; margin-top: 1rem;">Analyzing report...</p>
    `;
    
    try {
        const report = await API.getReport(reportId);
        
        // Get user context if available
        let userContext = '';
        if (report.reportedUserId) {
            try {
                const userResponse = await API.searchUserById(report.reportedUserId);
                const reportsResponse = await API.getUserReports(report.reportedUserId);
                const userStatus = await API.getUserStatus(userResponse.user._id);
                
                userContext = `\n\nReported User Context:
- Role: ${userResponse.user.role}
- Total reports against this user: ${reportsResponse.stats.total}
- Current warnings: ${userStatus.warnings}
- Is suspended: ${userStatus.isSuspended ? 'Yes' : 'No'}`;
            } catch (e) {
                console.log('Could not fetch user context');
            }
        }
        
        const prompt = `You are an administrative assistant helping to analyze user reports for a scholarship platform called TulongAral+. Analyze this report and provide a concise analysis.

IMPORTANT FORMATTING RULES:
- Do NOT use asterisks (*), hyphens (-), or any special characters
- Do NOT use bullet points or numbered lists
- Write in plain text paragraphs only
- Keep it brief and to the point

Provide the following in 4 short paragraphs:

1. Summary: Briefly describe what happened in 1-2 sentences.

2. Severity: State the severity level (Low, Medium, High, or Critical) and explain why in 1 sentence.

3. Recommended Action: State one clear action (Dismiss, Warning, Temporary Suspension, or Permanent Suspension) and explain why in 1 sentence.

4. Key Concerns: Mention the most important thing to consider in 1 sentence.

Report Details:
Type: ${report.reportType}
Subject: ${report.subject}
Description: ${report.description}
Reporter Role: ${report.reporterRole}${userContext}

Write in clear, professional language without any special formatting characters.`;

        const analysis = await GeminiAPI.generateText(prompt);
        
        aiContent.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem; white-space: pre-wrap; line-height: 1.6;">
${analysis}
            </div>
            <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.8; text-align: center;">
                Note: This is an AI-generated analysis. Final decisions should be made by administrators.
            </p>
        `;
    } catch (error) {
        console.error('AI analysis error:', error);
        aiContent.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem; text-align: center;">
                <p style="color: #ffebee; margin: 0;">Failed to generate AI analysis</p>
                <p style="opacity: 0.8; margin-top: 0.5rem; font-size: 0.875rem;">${error.message || 'Please try again'}</p>
            </div>
        `;
    }
}

// Close modals on outside click
const suspendModal = document.getElementById('suspendModal');
const warnModal = document.getElementById('warnModal');

window.addEventListener('click', (event) => {
    if (suspendModal && event.target === suspendModal) {
        closeSuspendModal();
    }
    if (warnModal && event.target === warnModal) {
        closeWarnModal();
    }
});

// Generic confirmation modal
function showConfirmModal(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; padding: 1.5rem;">
            <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">${title}</h2>
            <p style="margin: 0 0 1.5rem 0; line-height: 1.5; font-size: 0.95rem;">${message}</p>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-primary confirm-btn">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle confirm button
    const confirmBtn = modal.querySelector('.confirm-btn');
    confirmBtn.addEventListener('click', async () => {
        modal.remove();
        await onConfirm();
    });
    
    // Handle click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

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
