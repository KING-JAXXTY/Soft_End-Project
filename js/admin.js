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
        const [stats, users, scholarships] = await Promise.all([
            API.getAdminStatistics(),
            API.getAllUsers(),
            API.getScholarships()
        ]);
        
        console.log('📊 Admin stats received:', stats);
        console.log('👥 Users received:', users?.length || 0);
        console.log('🎓 Scholarships received:', scholarships?.length || 0);
        
        allUsers = users;
        allScholarships = scholarships;
        
        // Update stats with fallback values
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalStudents').textContent = stats.totalStudents || 0;
        document.getElementById('totalSponsors').textContent = stats.totalSponsors || 0;
        document.getElementById('totalScholarships').textContent = stats.activeScholarships || 0;
        document.getElementById('totalApplications').textContent = stats.totalApplications || 0;
        document.getElementById('pendingApplications').textContent = stats.pendingApplications || 0;
        
        displayUsers(users);
        displayScholarships(scholarships);
        loadActivityLog();
        
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
function loadActivityLog() {
    const container = document.getElementById('activityLog');
    container.innerHTML = '<div class="activity-loading">Loading activity...</div>';
    fetch('http://localhost:5000/api/activity/recent', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) throw new Error(data.message || 'Failed to fetch activity');
        if (!data.activities || !data.activities.length) {
            container.innerHTML = '<div class="activity-empty">No recent activity found.</div>';
            return;
        }
        container.innerHTML = data.activities.map(activity => {
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
    })
    .catch(err => {
        container.innerHTML = `<div class='activity-error'>Error loading activity: ${err.message}</div>`;
    });
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
