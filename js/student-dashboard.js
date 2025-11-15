// Student Dashboard functionality

// Check authentication and display account status
function checkAuth() {
    const currentUser = API.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'login.html';
        return null;
    }
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    
    // Display account status alerts
    displayAccountStatus(currentUser);
    
    return currentUser;
}

// Display account status (suspension/warnings)
function displayAccountStatus(user) {
    const alertContainer = document.getElementById('accountStatusAlert');
    if (!alertContainer) return;
    
    if (user.isSuspended) {
        alertContainer.innerHTML = `
            <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 1rem; border-radius: 8px; display: flex; align-items: start; gap: 1rem;">
                <div style="color: #ef4444; font-size: 1.5rem;">🚫</div>
                <div style="flex: 1;">
                    <strong style="color: #ef4444; font-size: 1.125rem;">Account Suspended</strong>
                    <p style="margin-top: 0.5rem; color: #991b1b;">Your account has been suspended and you may have limited access to features. Please contact support for assistance.</p>
                </div>
            </div>
        `;
        alertContainer.style.display = 'block';
    } else if (user.warnings && user.warnings > 0) {
        alertContainer.innerHTML = `
            <div style="background: #fffbeb; border: 2px solid #f59e0b; padding: 1rem; border-radius: 8px; display: flex; align-items: start; gap: 1rem;">
                <div style="color: #f59e0b; font-size: 1.5rem;">⚠️</div>
                <div style="flex: 1;">
                    <strong style="color: #f59e0b; font-size: 1.125rem;">Account Warning</strong>
                    <p style="margin-top: 0.5rem; color: #92400e;">You have ${user.warnings} formal warning${user.warnings > 1 ? 's' : ''} on your account. Please review our community guidelines and terms of service.</p>
                </div>
            </div>
        `;
        alertContainer.style.display = 'block';
    } else {
        alertContainer.style.display = 'none';
    }
}

let allApplications = [];
let carouselInterval = null;
let currentSlide = 0;
let carouselScholarships = [];

// Load dashboard data
async function loadDashboard() {
    try {
        const applications = await API.getStudentApplications();
        allApplications = applications;
        
        // Update stats
        document.getElementById('totalApplications').textContent = applications.length;
        document.getElementById('approvedApplications').textContent = 
            applications.filter(a => a.status === 'approved').length;
        document.getElementById('pendingApplications').textContent = 
            applications.filter(a => a.status === 'pending').length;
        document.getElementById('rejectedApplications').textContent = 
            applications.filter(a => a.status === 'rejected').length;
        
        // Load carousel scholarships
        await loadCarouselScholarships();
        
        // Load upcoming deadlines
        loadUpcomingDeadlines(applications);
        
        // Load my reports
        await loadMyReports();
        
        displayApplications(applications);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load user's submitted reports
async function loadMyReports() {
    try {
        const response = await API.getMyReports();
        const reports = response.reports || [];
        displayMyReports(reports);
        
        // Update count badge
        const countBadge = document.getElementById('reportsCount');
        if (countBadge) {
            countBadge.textContent = reports.length;
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        document.getElementById('myReportsEmpty').style.display = 'block';
    }
}

// Toggle reports panel
function toggleReportsPanel() {
    const panel = document.getElementById('myReportsPanel');
    const chevron = document.getElementById('reportsChevron');
    
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        chevron.style.transform = 'rotate(90deg)';
    } else {
        panel.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

// Display user's reports
function displayMyReports(reports) {
    const container = document.getElementById('myReportsList');
    const emptyState = document.getElementById('myReportsEmpty');
    
    if (reports.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#fbbf24',
            'Reviewing': '#3b82f6',
            'Resolved': '#10b981',
            'Closed': '#6b7280'
        };
        return colors[status] || '#6b7280';
    };
    
    container.innerHTML = reports.map(report => `
        <div class="application-card" style="cursor: pointer; padding: 1rem;" onclick="viewReportDetail('${report._id}')">
            <div class="application-header" style="margin-bottom: 0.75rem;">
                <div>
                    <h3 style="font-size: 0.9375rem; margin-bottom: 0.25rem; line-height: 1.3;">${report.subject.length > 40 ? report.subject.substring(0, 40) + '...' : report.subject}</h3>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">
                        ${new Date(report.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <span class="badge" style="background: ${getStatusColor(report.status)}; font-size: 0.75rem; padding: 0.25rem 0.5rem;">
                    ${report.status}
                </span>
            </div>
            
            <div style="margin-top: 0.75rem;">
                <p style="font-size: 0.8125rem; color: var(--text-secondary);">
                    <strong>${report.reportType}</strong>
                </p>
                <p style="font-size: 0.8125rem; margin-top: 0.5rem; color: var(--text-secondary); 
                   display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; 
                   overflow: hidden; line-height: 1.4;">
                    ${report.description}
                </p>
            </div>
            
            ${report.resolvedBy ? `
                <div style="margin-top: 0.75rem; padding: 0.5rem; background: var(--background); 
                     border-radius: 6px; font-size: 0.75rem;">
                    <strong>Resolved by:</strong> ${report.resolvedBy.firstName} ${report.resolvedBy.lastName}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// View report detail in modal
function viewReportDetail(reportId) {
    const response = API.getMyReports();
    response.then(data => {
        const report = data.reports.find(r => r._id === reportId);
        if (report) {
            showReportDetailModal(report);
        }
    });
}

// Show report detail modal
function showReportDetailModal(report) {
    const modal = document.getElementById('reportDetailViewModal');
    if (!modal) {
        // Create modal if it doesn't exist
        const modalHTML = `
            <div id="reportDetailViewModal" class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 600px;">
                    <span class="close" onclick="closeReportDetailViewModal()">&times;</span>
                    <div id="reportDetailViewContent"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#fbbf24',
            'Reviewing': '#3b82f6',
            'Resolved': '#10b981',
            'Closed': '#6b7280'
        };
        return colors[status] || '#6b7280';
    };
    
    const content = document.getElementById('reportDetailViewContent');
    content.innerHTML = `
        <h2 style="margin-bottom: 1.5rem;">Report Details</h2>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <strong>Status:</strong>
                <span class="badge" style="background: ${getStatusColor(report.status)};">
                    ${report.status}
                </span>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Type:</strong>
                <p>${report.reportType}</p>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Submitted:</strong>
                <p>${new Date(report.createdAt).toLocaleDateString()} at ${new Date(report.createdAt).toLocaleTimeString()}</p>
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
            
            ${report.resolvedBy ? `
                <div style="margin-bottom: 1rem; padding: 1rem; background: var(--background); border-radius: 8px;">
                    <strong>Handled by Admin:</strong>
                    <p>${report.resolvedBy.firstName} ${report.resolvedBy.lastName} ${report.resolvedBy.uniqueId ? `(${report.resolvedBy.uniqueId})` : ''}</p>
                </div>
            ` : ''}
            
            ${report.status === 'Pending' ? `
                <div style="padding: 1rem; background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px;">
                    <strong style="color: #f59e0b;">⏳ Your report is pending review</strong>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #92400e;">
                        An administrator will review your report soon. You'll be notified of any updates.
                    </p>
                </div>
            ` : ''}
            
            ${report.status === 'Reviewing' ? `
                <div style="padding: 1rem; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px;">
                    <strong style="color: #3b82f6;">👀 Your report is being reviewed</strong>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #1e40af;">
                        An administrator is currently investigating your report.
                    </p>
                </div>
            ` : ''}
            
            ${report.status === 'Resolved' ? `
                <div style="padding: 1rem; background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px;">
                    <strong style="color: #10b981;">✓ Your report has been resolved</strong>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #065f46;">
                        Thank you for reporting this issue. It has been addressed by our team.
                    </p>
                </div>
            ` : ''}
        </div>
        
        <div style="text-align: right;">
            <button onclick="closeReportDetailViewModal()" class="btn-secondary">Close</button>
        </div>
    `;
    
    document.getElementById('reportDetailViewModal').style.display = 'flex';
}

function closeReportDetailViewModal() {
    const modal = document.getElementById('reportDetailViewModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Display applications
function displayApplications(applications) {
    const container = document.getElementById('applicationsList');
    const emptyState = document.getElementById('emptyState');
    
    if (applications.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = applications.map(app => {
        // Check if scholarship still exists
        const scholarship = app.scholarship || {};
        const scholarshipDeleted = !scholarship.title;
        const scholarshipTitle = scholarship.title || '[Scholarship Deleted]';
        const scholarshipAmount = scholarship.amount || 'N/A';
        const scholarshipDeadline = scholarship.deadline || null;
        const scholarshipId = scholarship._id || app.scholarship;
        
        // Extract sponsor data
        const sponsor = scholarship.sponsor || {};
        const sponsorName = sponsor.firstName && sponsor.lastName 
            ? `${sponsor.firstName} ${sponsor.lastName}` 
            : scholarshipDeleted ? 'N/A' : 'Unknown';
        
        // Application date
        const applicationDate = app.appliedAt || app.createdAt || new Date();
        
        return `
        <div class="application-card ${scholarshipDeleted ? 'scholarship-deleted' : ''}">
            <div class="application-header">
                <h3>${scholarshipTitle}</h3>
                <span class="badge badge-${app.status}">${app.status.toUpperCase()}</span>
            </div>
            ${scholarshipDeleted ? '<p class="warning-text" style="color: #e74c3c; font-size: 0.875rem; margin-bottom: 0.5rem;">⚠️ This scholarship has been deleted</p>' : ''}
            <div class="application-info">
                <div class="info-item">
                    <span class="info-label">Sponsor:</span>
                    <span>${sponsorName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Applied:</span>
                    <span>${new Date(applicationDate).toLocaleDateString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Amount:</span>
                    <span>₱${typeof scholarshipAmount === 'number' ? scholarshipAmount.toLocaleString() : scholarshipAmount}</span>
                </div>
                ${scholarshipDeadline ? `
                <div class="info-item">
                    <span class="info-label">Deadline:</span>
                    <span>${new Date(scholarshipDeadline).toLocaleDateString()}</span>
                </div>
                ` : ''}
            </div>
            ${app.notes ? `<div class="application-notes"><strong>Notes:</strong> ${app.notes}</div>` : ''}
            <div class="application-actions">
                ${app.status === 'approved' ? `<button onclick="showApprovalModal({_id: '${app._id}'})" class="btn-success btn-sm">View Certificate</button>` : ''}
                ${!scholarshipDeleted ? `<button onclick="viewScholarship('${scholarshipId}')" class="btn-secondary btn-sm">View Scholarship</button>` : ''}
                <button onclick="deleteApplication('${app._id}')" class="btn-danger btn-sm">Delete Application</button>
            </div>
            </div>
        </div>
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

// Delete application
async function deleteApplication(applicationId) {
    // Show custom confirmation dialog
    const confirmed = await notify.confirm('Are you sure you want to delete this application? This action cannot be undone.');
    
    if (!confirmed) {
        return; // User cancelled
    }
    
    try {
        console.log('🗑️ Deleting application:', applicationId);
        const result = await API.deleteApplication(applicationId);
        console.log('✅ Delete result:', result);
        
        // Clear all caches
        if (window.apiCache) {
            window.apiCache.clear();
        }
        
        // Force reload from server
        alert('Application deleted successfully');
        window.location.reload();
    } catch (error) {
        console.error('❌ Error deleting application:', error);
        alert('Error deleting application: ' + (error.message || 'Unknown error'));
    }
}

// View scholarship details
function viewScholarship(scholarshipId) {
    if (scholarshipId) {
        window.location.href = `student-home.html#scholarship-${scholarshipId}`;
    } else {
        alert('Scholarship not found');
    }
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

// Toggle AI Section
function toggleAISection() {
    const content = document.getElementById('aiSectionContent');
    const icon = document.getElementById('aiToggleIcon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(90deg)';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

// Submit AI Info and Get Recommendations
async function submitAIInfo() {
    // Validate form inputs
    const gpa = document.getElementById('aiGpa').value.trim();
    const fieldOfStudy = document.getElementById('aiFieldOfStudy').value;
    const yearLevel = document.getElementById('aiYearLevel').value;
    const financialNeed = document.getElementById('aiFinancialNeed').value;
    const achievements = document.getElementById('aiAchievements').value.trim();
    
    // Check if all fields are filled
    if (!gpa || !fieldOfStudy || !yearLevel || !financialNeed || !achievements) {
        notify.error('Please fill in all required fields');
        return;
    }
    
    // Validate GPA
    const gpaNum = parseFloat(gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 5.0) {
        notify.error('Please enter a valid GPA between 0 and 5.0');
        return;
    }
    
    // Hide form and show loading
    document.getElementById('aiInfoForm').style.display = 'none';
    const container = document.getElementById('aiRecommendationsContainer');
    container.style.display = 'block';
    
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: var(--surface); border-radius: 1rem;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 1rem; color: var(--text-secondary);">AI is analyzing your information and matching scholarships...</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">This may take 10-15 seconds</p>
        </div>
    `;
    
    try {
        // Create temporary profile with user input
        const currentUser = API.getCurrentUser();
        const tempProfile = {
            gpa: gpaNum,
            fieldOfStudy: fieldOfStudy,
            yearLevel: yearLevel,
            financialNeed: financialNeed,
            achievements: achievements,
            // Get user's basic info
            firstName: currentUser?.firstName || 'Student',
            lastName: currentUser?.lastName || '',
            region: 'Any'
        };
        
        console.log('📥 Fetching scholarships...');
        const scholarships = await API.getScholarships();
        console.log('✅ Scholarships:', scholarships);
        
        if (!scholarships || scholarships.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--surface); border-radius: 1rem;">
                    <p style="color: var(--text-secondary);">No scholarships available at the moment.</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Check back later when scholarships are added!</p>
                    <button onclick="showAIForm()" class="btn-secondary" style="margin-top: 1rem;">Back to Form</button>
                </div>
            `;
            return;
        }
        
        // Generate AI recommendations with profile data
        const result = await GeminiAPI.recommendScholarships(tempProfile, scholarships);
        
        // Display recommendations
        displayRecommendations(result, container);
        
    } catch (error) {
        console.error('Error getting AI recommendations:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: var(--surface); border-radius: 1rem;">
                <p style="color: var(--danger); margin-bottom: 1rem;">Error: ${error.message}</p>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">${error.stack || ''}</p>
                <button onclick="showAIForm()" class="btn-secondary" style="margin-top: 1rem;">Try Again</button>
            </div>
        `;
    }
}

// Show AI Form Again
function showAIForm() {
    document.getElementById('aiInfoForm').style.display = 'block';
    document.getElementById('aiRecommendationsContainer').style.display = 'none';
}

// AI-Powered Scholarship Recommendations (OLD - Keep for reference)
async function loadAIRecommendations() {
    const btn = document.getElementById('aiRecommendBtn');
    const container = document.getElementById('aiRecommendationsContainer');
    
    // Disable button and show loading
    btn.disabled = true;
    btn.textContent = '🤖 Analyzing...';
    
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: var(--surface); border-radius: 1rem;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 1rem; color: var(--text-secondary);">AI is analyzing your profile and matching scholarships...</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">This may take 10-15 seconds</p>
        </div>
    `;
    
    try {
        // Get student profile and all scholarships
        console.log('📥 Fetching profile...');
        const profile = await API.getProfile();
        console.log('✅ Profile:', profile);
        
        console.log('📥 Fetching scholarships...');
        const scholarships = await API.getScholarships();
        console.log('✅ Scholarships:', scholarships);
        
        if (!scholarships || scholarships.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--surface); border-radius: 1rem;">
                    <p style="color: var(--text-secondary);">No scholarships available at the moment.</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Check back later when scholarships are added!</p>
                </div>
            `;
            btn.textContent = '🤖 Get Recommendations';
            btn.disabled = false;
            return;
        }
        
        console.log('🤖 Generating AI recommendations...');
        
        // Get AI recommendations
        const result = await GeminiAPI.recommendScholarships(profile, scholarships);
        console.log('✅ AI Recommendations:', result);
        
        // Display recommendations
        displayRecommendations(result);
        
        btn.textContent = '🔄 Refresh Recommendations';
        btn.disabled = false;
    } catch (error) {
        console.error('❌ Error getting recommendations:', error);
        console.error('Error stack:', error.stack);
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: var(--surface); border-radius: 1rem; border: 2px solid #fee2e2;">
                <p style="color: #991b1b; font-weight: 600;">Failed to generate recommendations</p>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">${error.message}</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--text-secondary);">Check browser console (F12) for details</p>
                <button onclick="loadAIRecommendations()" class="btn-primary" style="margin-top: 1rem;">Try Again</button>
            </div>
        `;
        btn.textContent = '🤖 Get Recommendations';
        btn.disabled = false;
    }
}

function displayRecommendations(result) {
    const container = document.getElementById('aiRecommendationsContainer');
    
    if (!result.recommendations || result.recommendations.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: var(--surface); border-radius: 1rem;">
                <p style="color: var(--text-secondary);">No recommendations available at this time.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">${result.generalAdvice || 'Try updating your profile or check back when new scholarships are added.'}</p>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: grid; gap: 1.5rem;">';
    
    // Display each recommendation
    result.recommendations.forEach((rec, index) => {
        const matchColor = rec.matchScore >= 80 ? '#065f46' : rec.matchScore >= 60 ? '#92400e' : '#1e40af';
        
        html += `
            <div style="background: var(--surface); border-radius: 1rem; padding: 1.5rem; border-left: 4px solid ${matchColor};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0; color: var(--text); font-size: 1.25rem;">${index + 1}. ${rec.scholarshipTitle}</h3>
                    </div>
                    <div style="background: ${matchColor}; color: white; padding: 0.5rem 1rem; border-radius: 2rem; font-weight: 600; white-space: nowrap; margin-left: 1rem;">
                        ${rec.matchScore}% Match
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <p style="font-weight: 600; color: var(--text); margin-bottom: 0.5rem;">Why this matches you:</p>
                    <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                        ${rec.reasons.map(reason => `<li style="margin-bottom: 0.25rem;">${reason}</li>`).join('')}
                    </ul>
                </div>
                
                ${rec.keyStrengths && rec.keyStrengths.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <p style="font-weight: 600; color: var(--text); margin-bottom: 0.5rem;">Your key strengths:</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${rec.keyStrengths.map(strength => 
                            `<span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.85rem;">${strength}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${rec.actionItems && rec.actionItems.length > 0 ? `
                <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <p style="font-weight: 600; color: #92400e; margin-bottom: 0.5rem;">📝 Action items:</p>
                    <ul style="margin: 0; padding-left: 1.5rem; color: #92400e; font-size: 0.9rem;">
                        ${rec.actionItems.map(item => `<li style="margin-bottom: 0.25rem;">${item}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div style="display: flex; gap: 1rem;">
                    <button onclick="applyToScholarship('${rec.scholarshipId}')" class="btn-primary">View & Apply</button>
                </div>
            </div>
        `;
    });
    
    // Add general advice if available
    if (result.generalAdvice) {
        html += `
            <div style="background: #e0e7ff; border-radius: 1rem; padding: 1.5rem; border-left: 4px solid #3730a3;">
                <p style="font-weight: 600; color: #3730a3; margin-bottom: 0.5rem;">AI Advisor Says:</p>
                <p style="color: #3730a3; margin: 0;">${result.generalAdvice}</p>
            </div>
        `;
    }
    
    // Add "Get New Recommendations" button
    html += `
        <div style="text-align: center; margin-top: 1rem;">
            <button onclick="showAIForm()" class="btn-secondary">
                Update Information & Get New Recommendations
            </button>
        </div>
    `;
    
    html += '</div>';
    container.innerHTML = html;
}

function applyToScholarship(scholarshipId) {
    // Redirect to student home and highlight this scholarship
    window.location.href = `student-home.html?highlight=${scholarshipId}`;
}

// Reload dashboard when page becomes visible (to catch favorites added from other pages)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('🔄 Page visible - refreshing dashboard data');
        loadDashboard();
    }
});

// ============================================
// SCHOLARSHIP CAROUSEL FUNCTIONALITY
// ============================================

async function loadCarouselScholarships() {
    try {
        const allScholarships = await API.getScholarships();
        const currentUser = API.getCurrentUser();
        
        if (!allScholarships || allScholarships.length === 0) {
            displayEmptyCarousel();
            return;
        }
        
        // Get IDs of scholarships student has already applied to
        const appliedScholarshipIds = allApplications.map(app => app.scholarshipId);
        
        // Filter scholarships: active, not applied, and recent (within 14 days)
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        let availableScholarships = allScholarships.filter(scholarship => {
            const createdDate = new Date(scholarship.createdAt || scholarship.datePosted);
            const isRecent = createdDate >= twoWeeksAgo;
            const notApplied = !appliedScholarshipIds.includes(scholarship._id);
            const isActive = scholarship.status === 'active';
            const notExpired = new Date(scholarship.deadline) > now;
            
            return isActive && notExpired && (isRecent || scholarship.featured);
        });
        
        // Sort by priority: featured first, then by date
        availableScholarships.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.createdAt || b.datePosted) - new Date(a.createdAt || a.datePosted);
        });
        
        // Limit to 5 scholarships
        carouselScholarships = availableScholarships.slice(0, 5);
        
        if (carouselScholarships.length === 0) {
            displayEmptyCarousel();
            return;
        }
        
        displayCarousel();
        startCarouselAutoPlay();
    } catch (error) {
        console.error('Error loading carousel scholarships:', error);
        displayEmptyCarousel();
    }
}

function displayCarousel() {
    const slidesContainer = document.getElementById('carouselSlides');
    const dotsContainer = document.getElementById('carouselDots');
    
    // Generate slides
    slidesContainer.innerHTML = carouselScholarships.map((scholarship, index) => {
        const isNew = isScholarshipNew(scholarship);
        const isFeatured = scholarship.featured;
        
        return `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <div class="carousel-content">
                    <div class="carousel-badge ${isFeatured ? 'featured' : ''}">
                        ${isFeatured ? '⭐ FEATURED' : '✨ NEW'}
                    </div>
                    <h3 class="carousel-title">${scholarship.title}</h3>
                    <div class="carousel-meta">
                        <div class="carousel-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <strong>₱${parseFloat(scholarship.amount).toLocaleString()}</strong>
                        </div>
                        <div class="carousel-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Deadline: ${formatDate(scholarship.deadline)}</span>
                        </div>
                        ${scholarship.sponsor ? `
                        <div class="carousel-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>${scholarship.sponsor.firstName} ${scholarship.sponsor.lastName}</span>
                        </div>
                        ` : ''}
                    </div>
                    <p class="carousel-description">${truncateText(scholarship.description, 150)}</p>
                    <div class="carousel-actions">
                        <button onclick="applyToCarouselScholarship('${scholarship._id}')" class="btn-primary">
                            Apply Now
                        </button>
                        <button onclick="viewCarouselScholarship('${scholarship._id}')" class="btn-secondary">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Generate dots
    dotsContainer.innerHTML = carouselScholarships.map((_, index) => 
        `<button class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></button>`
    ).join('');
}

function displayEmptyCarousel() {
    const slidesContainer = document.getElementById('carouselSlides');
    const dotsContainer = document.getElementById('carouselDots');
    
    slidesContainer.innerHTML = `
        <div class="carousel-slide active">
            <div class="carousel-content" style="text-align: center;">
                <svg style="width: 80px; height: 80px; margin: 0 auto 1rem; stroke: var(--text-secondary); opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">All Caught Up!</h3>
                <p style="margin: 0 0 1.5rem 0; color: var(--text-secondary);">No new scholarships at the moment. Check back soon!</p>
                <button onclick="window.location.href='student-home.html'" class="btn-primary">Browse All Scholarships</button>
            </div>
        </div>
    `;
    
    dotsContainer.innerHTML = '';
}

function navigateCarousel(direction) {
    if (carouselScholarships.length === 0) return;
    
    currentSlide = (currentSlide + direction + carouselScholarships.length) % carouselScholarships.length;
    updateCarouselSlide();
    resetCarouselAutoPlay();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarouselSlide();
    resetCarouselAutoPlay();
}

function updateCarouselSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startCarouselAutoPlay() {
    if (carouselInterval) clearInterval(carouselInterval);
    
    carouselInterval = setInterval(() => {
        navigateCarousel(1);
    }, 6000); // Change slide every 6 seconds
}

function resetCarouselAutoPlay() {
    startCarouselAutoPlay();
}

// Pause carousel on hover
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.scholarship-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            if (carouselInterval) clearInterval(carouselInterval);
        });
        
        carousel.addEventListener('mouseleave', () => {
            startCarouselAutoPlay();
        });
    }
});

function applyToCarouselScholarship(scholarshipId) {
    window.location.href = `apply-scholarship.html?id=${scholarshipId}`;
}

function viewCarouselScholarship(scholarshipId) {
    window.location.href = `student-home.html?highlight=${scholarshipId}`;
}

function isScholarshipNew(scholarship) {
    const createdDate = new Date(scholarship.createdAt || scholarship.datePosted);
    const now = new Date();
    const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
}

// ============================================
// DEADLINE TRACKER FUNCTIONALITY
// ============================================

function loadUpcomingDeadlines(applications) {
    const deadlinesList = document.getElementById('deadlinesList');
    const deadlinesEmpty = document.getElementById('deadlinesEmpty');
    
    if (!applications || applications.length === 0) {
        deadlinesList.innerHTML = '';
        deadlinesEmpty.style.display = 'block';
        return;
    }
    
    // Filter applications with upcoming deadlines (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const upcomingDeadlines = applications
        .filter(app => {
            if (!app.scholarship || !app.scholarship.deadline) return false;
            const deadline = new Date(app.scholarship.deadline);
            return deadline > now && deadline <= thirtyDaysFromNow;
        })
        .sort((a, b) => new Date(a.scholarship.deadline) - new Date(b.scholarship.deadline));
    
    if (upcomingDeadlines.length === 0) {
        deadlinesList.innerHTML = '';
        deadlinesEmpty.style.display = 'block';
        return;
    }
    
    deadlinesEmpty.style.display = 'none';
    deadlinesList.innerHTML = upcomingDeadlines.map(app => {
        const scholarship = app.scholarship;
        const deadline = new Date(scholarship.deadline);
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        let urgencyClass = 'ok';
        let urgencyLabel = 'ON TRACK';
        let urgencyIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
        
        if (daysLeft <= 3) {
            urgencyClass = 'urgent';
            urgencyLabel = 'URGENT';
            urgencyIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`;
        } else if (daysLeft <= 7) {
            urgencyClass = 'soon';
            urgencyLabel = 'SOON';
            urgencyIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />`;
        }
        
        return `
            <div class="deadline-card ${urgencyClass}">
                <div class="deadline-info">
                    <div class="deadline-status ${urgencyClass}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            ${urgencyIcon}
                        </svg>
                        ${urgencyLabel}
                    </div>
                    <h3 class="deadline-scholarship-title">${scholarship.title}</h3>
                    <div class="deadline-date-info">
                        <span>Deadline: ${formatDate(scholarship.deadline)}</span>
                        <span>•</span>
                        <span>Status: ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                    </div>
                </div>
                <div class="deadline-countdown">
                    <span class="countdown-number">${daysLeft}</span>
                    <span class="countdown-label">${daysLeft === 1 ? 'day left' : 'days left'}</span>
                </div>
                <div class="deadline-actions">
                    <button onclick="viewScholarship('${scholarship._id}')" class="btn-secondary btn-sm">
                        View Details
                    </button>
                    ${app.status === 'approved' ? `
                        <button onclick="viewCertificate('${app._id}')" class="btn-primary btn-sm">
                            View Certificate
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function viewCertificate(applicationId) {
    window.location.href = `certificate.html?applicationId=${applicationId}`;
}

// ==================== REPORT SYSTEM ====================

function showReportModal() {
    document.getElementById('reportModal').style.display = 'block';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    document.getElementById('reportForm').reset();
}

async function submitReport(event) {
    event.preventDefault();
    
    const reportType = document.getElementById('reportType').value;
    const subject = document.getElementById('reportSubject').value;
    const description = document.getElementById('reportDescription').value;
    const reportedUserId = document.getElementById('reportedUserId').value.trim();
    
    // Validate User ID format if provided
    if (reportedUserId && !/^TA-[A-Z0-9]{8}$/.test(reportedUserId)) {
        notify.error('Invalid User ID format. Format should be: TA-XXXXXXXX');
        return;
    }
    
    try {
        const reportData = {
            reportType,
            subject,
            description,
            reportedUserId: reportedUserId || null
        };
        
        const response = await API.submitReport(reportData);
        
        if (response.success) {
            notify.success('Report submitted successfully. Our team will review it shortly.');
            closeReportModal();
        } else {
            notify.error(response.message || 'Failed to submit report');
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        notify.error('Failed to submit report. Please try again.');
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const reportModal = document.getElementById('reportModal');
    if (event.target === reportModal) {
        closeReportModal();
    }
});

// Initialize on page load
checkAuth();
loadDashboard();

// Also reload when window regains focus
window.addEventListener('focus', () => {
    console.log('🔄 Window focused - refreshing dashboard data');
    loadDashboard();
});
