// Apply Scholarship Page functionality

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

// Get scholarship ID from URL
function getScholarshipId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load scholarship title
async function loadScholarshipInfo() {
    try {
        const scholarshipId = getScholarshipId();
        
        if (!scholarshipId) {
            notify.error('No scholarship ID provided');
            goBack();
            return;
        }
        
        const scholarship = await API.getScholarship(scholarshipId);
        document.getElementById('scholarshipTitle').textContent = scholarship.title;
        
    } catch (error) {
        console.error('Error loading scholarship:', error);
        notify.error('Failed to load scholarship information');
    }
}

// Go back to previous page
function goBack() {
    const scholarshipId = getScholarshipId();
    if (scholarshipId) {
        window.location.href = `scholarship-detail.html?id=${scholarshipId}`;
    } else {
        window.location.href = 'student-home.html';
    }
}

// Submit application
async function submitApplication(event) {
    event.preventDefault();
    
    const scholarshipId = getScholarshipId();
    const coverLetter = document.getElementById('coverLetter').value.trim();
    const documentsInput = document.getElementById('documents');
    const documents = documentsInput.files;
    
    if (!scholarshipId) {
        notify.error('Scholarship ID not found');
        return;
    }
    
    if (!coverLetter) {
        notify.error('Please write a cover letter');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const applicationData = {
            scholarshipId: scholarshipId,
            coverLetter: coverLetter,
            documents: documents
        };
        
        await API.applyForScholarship(applicationData);
        notify.success('Application submitted successfully!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = 'student-dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('Application error:', error);
        notify.error(error.message || 'Failed to submit application');
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadScholarshipInfo();
});
