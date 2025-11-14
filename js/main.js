// Main.js - Landing page functionality

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// Modal functions
function openAboutModal() {
    document.getElementById('aboutModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeAboutModal() {
    document.getElementById('aboutModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

function openPrivacyModal() {
    document.getElementById('privacyModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function closePrivacyModal() {
    document.getElementById('privacyModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const aboutModal = document.getElementById('aboutModal');
    const privacyModal = document.getElementById('privacyModal');
    if (event.target === aboutModal) {
        closeAboutModal();
    }
    if (event.target === privacyModal) {
        closePrivacyModal();
    }
}

// Load real statistics from database
async function loadStatistics() {
    try {
        const stats = await API.getStatistics();
        
        if (stats && stats.success && stats.data) {
            document.getElementById('scholarshipsCount').textContent = stats.data.totalScholarships || 0;
            document.getElementById('studentsCount').textContent = stats.data.totalStudents || 0;
            document.getElementById('sponsorsCount').textContent = stats.data.totalSponsors || 0;
        } else {
            // Show 0 if failed to load
            document.getElementById('scholarshipsCount').textContent = '0';
            document.getElementById('studentsCount').textContent = '0';
            document.getElementById('sponsorsCount').textContent = '0';
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        // Show 0 on error
        document.getElementById('scholarshipsCount').textContent = '0';
        document.getElementById('studentsCount').textContent = '0';
        document.getElementById('sponsorsCount').textContent = '0';
    }
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    // Load real statistics from MongoDB
    loadStatistics();
    
    try {
        const currentUser = API.getCurrentUser();
        if (currentUser && currentUser.role) {
            // Redirect to appropriate dashboard
            if (currentUser.role === 'student') {
                window.location.href = 'student-home.html';
            } else if (currentUser.role === 'sponsor') {
                window.location.href = 'sponsor-dashboard.html';
            } else if (currentUser.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            }
        }
    } catch (error) {
        console.error('Error checking user session:', error);
        // Stay on landing page if there's an error
    }
});
