// Student Dashboard functionality

// Check authentication
function checkAuth() {
    const currentUser = API.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'login.html';
        return null;
    }
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    return currentUser;
}

let allApplications = [];

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
        
        displayApplications(applications);
    } catch (error) {
        console.error('Error loading dashboard:', error);
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
        
        console.log('🤖 Generating AI recommendations with temporary profile...');
        console.log('Temp Profile:', tempProfile);
        
        // Get AI recommendations
        const result = await GeminiAPI.recommendScholarships(tempProfile, scholarships);
        console.log('✅ AI Recommendations:', result);
        
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

// Also reload when window regains focus
window.addEventListener('focus', () => {
    console.log('🔄 Window focused - refreshing dashboard data');
    loadDashboard();
});
