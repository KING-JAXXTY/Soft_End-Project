// Student.js - Student Home page functionality

let allScholarships = [];
let isLoading = false;

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

// Load scholarships
async function loadScholarships(filters = {}) {
    if (isLoading) return; // Prevent multiple simultaneous loads
    
    isLoading = true;
    
    console.log('=== LOADING SCHOLARSHIPS ===');
    console.log('Filters:', filters);
    
    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingEl);
    
    try {
        allScholarships = await API.getScholarships(filters);
        console.log('Scholarships received:', allScholarships.length);
        console.log('First scholarship (if any):', allScholarships[0]);
        displayScholarships(allScholarships);
    } catch (error) {
        console.error('Error loading scholarships:', error);
        notify.error('Error loading scholarships. Please refresh the page.');
    } finally {
        isLoading = false;
        // Remove loading indicator
        const loadingEl = document.querySelector('.loading-overlay');
        if (loadingEl) loadingEl.remove();
    }
}

// Display scholarships
function displayScholarships(scholarships) {
    const container = document.getElementById('scholarshipsList');
    const emptyState = document.getElementById('emptyState');
    
    if (scholarships.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = scholarships.map(scholarship => {
        // Extract sponsor name safely
        const sponsor = scholarship.sponsor || {};
        const sponsorName = sponsor.firstName && sponsor.lastName 
            ? `${sponsor.firstName} ${sponsor.lastName}` 
            : 'N/A';
        
        // Get scholarship type and create badge class
        const scholarshipType = scholarship.scholarshipType || 'N/A';
        const badgeClass = scholarshipType.toLowerCase().replace(/\s+/g, '-');
        
        return `
        <div class="scholarship-card">
            <div class="scholarship-header">
                <h3>${scholarship.title}</h3>
                <span class="badge badge-${badgeClass}">${scholarshipType}</span>
            </div>
            <p class="scholarship-description">${scholarship.description.substring(0, 200)}...</p>
            <div class="scholarship-info">
                <div class="info-item">
                    <span class="info-label">Type:</span>
                    <span>${scholarshipType}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Region:</span>
                    <span>${scholarship.region || 'Not specified'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Institution:</span>
                    <span>${scholarship.affiliatedInstitution || 'Not specified'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sponsor:</span>
                    <span>${sponsorName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Deadline:</span>
                    <span>${new Date(scholarship.deadline).toLocaleDateString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Slots:</span>
                    <span>${scholarship.availableSlots}</span>
                </div>
            </div>
            <div class="scholarship-actions">
                <button onclick="viewScholarship('${scholarship._id}')" class="btn-primary btn-sm">View Details</button>
            </div>
        </div>
    `;
    }).join('');
}

// Search scholarships
function searchScholarships() {
    const searchTerm = document.getElementById('searchInput').value;
    filterScholarships();
}

// Filter scholarships
function filterScholarships() {
    const searchTerm = document.getElementById('searchInput').value;
    const region = document.getElementById('regionFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    console.log('=== FILTER DEBUG ===');
    console.log('Search Term:', searchTerm);
    console.log('Region:', region);
    console.log('Type:', type);
    console.log('==================');
    
    loadScholarships({ search: searchTerm, region, type });
}

// View scholarship details
async function viewScholarship(id) {
    try {
        const scholarship = await API.getScholarshipById(id);
        console.log('Scholarship data:', scholarship); // Debug log
        showScholarshipModal(scholarship);
    } catch (error) {
        console.error('Error loading scholarship:', error);
        alert('Error loading scholarship details');
    }
}

// Show scholarship modal
function showScholarshipModal(scholarship) {
    if (!scholarship) {
        console.error('No scholarship data provided');
        return;
    }
    
    const modal = document.getElementById('scholarshipModal');
    const detailContainer = document.getElementById('scholarshipDetail');
    
    // Helper function to conditionally render sections
    const renderIfExists = (value, label) => {
        if (!value) return '';
        return `
            <div class="detail-item">
                <span class="detail-label">${label}:</span>
                <span>${value}</span>
            </div>
        `;
    };
    
    const renderSectionIfExists = (value, title) => {
        if (!value) return '';
        return `
            <div class="detail-section">
                <h3>${title}</h3>
                <p>${value}</p>
            </div>
        `;
    };
    
    detailContainer.innerHTML = `
        <h2>${scholarship.title}</h2>
        <div class="scholarship-detail-content">
            <div class="detail-section">
                <h3>Description</h3>
                <p>${scholarship.description}</p>
            </div>
            
            <div class="detail-section">
                <h3>Eligibility Requirements</h3>
                <p>${scholarship.eligibility || scholarship.eligibilityRequirements || 'Not specified'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Scholarship Details</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Type:</span>
                        <span>${scholarship.scholarshipType}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Available Slots:</span>
                        <span>${scholarship.availableSlots}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Deadline:</span>
                        <span>${new Date(scholarship.deadline).toLocaleDateString()}</span>
                    </div>
                    ${scholarship.amount ? `
                    <div class="detail-item">
                        <span class="detail-label">Scholarship Amount:</span>
                        <span>₱${scholarship.amount.toLocaleString()}</span>
                    </div>
                    ` : ''}
                    ${renderIfExists(scholarship.region, 'Region')}
                    ${renderIfExists(scholarship.affiliatedInstitution, 'Institution')}
                </div>
            </div>
            
            ${renderSectionIfExists(scholarship.benefits, 'Benefits Covered')}
            ${renderSectionIfExists(scholarship.selectionCriteria, 'Selection Criteria')}
            
            <div class="detail-section">
                <h3>Documents Required</h3>
                <p>${scholarship.documentsRequired}</p>
            </div>
            
            ${renderSectionIfExists(scholarship.renewalPolicy, 'Renewal Policy')}
            
            ${scholarship.contactEmail || scholarship.contactPhone || scholarship.applicationLink ? `
                <div class="detail-section">
                    <h3>Contact Information</h3>
                    <div class="detail-grid">
                        ${renderIfExists(scholarship.contactEmail, 'Email')}
                        ${renderIfExists(scholarship.contactPhone, 'Phone')}
                        ${scholarship.applicationLink ? `
                            <div class="detail-item" style="grid-column: 1 / -1;">
                                <span class="detail-label">Application Link:</span>
                                <span><a href="${scholarship.applicationLink}" target="_blank">${scholarship.applicationLink}</a></span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            <div class="detail-section">
                <h3>Sponsor Information</h3>
                <div class="sponsor-info">
                    <p><strong>Name:</strong> ${scholarship.sponsor && scholarship.sponsor.firstName && scholarship.sponsor.lastName ? `${scholarship.sponsor.firstName} ${scholarship.sponsor.lastName}` : 'N/A'}</p>
                    <p><strong>Email:</strong> ${scholarship.sponsor && scholarship.sponsor.email ? scholarship.sponsor.email : 'N/A'}</p>
                </div>
                ${scholarship.sponsor && scholarship.sponsor._id ? `
                <button onclick="messageSponsor('${scholarship.sponsor._id}')" class="btn-secondary" style="margin-top: 1rem;">
                    💬 Message Sponsor
                </button>
                ` : ''}
            </div>
            
            ${(scholarship.location && scholarship.location.latitude && scholarship.location.longitude) || (scholarship.latitude && scholarship.longitude) ? `
                <div class="detail-section">
                    <h3>Location</h3>
                    <div id="modalMap" style="height: 300px; width: 100%;"></div>
                </div>
            ` : ''}
            
            <div class="modal-actions">
                ${(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const deadlineDate = new Date(scholarship.deadline);
                    deadlineDate.setHours(0, 0, 0, 0);
                    const isPastDeadline = deadlineDate < today;
                    const isClosed = scholarship.status !== 'active';
                    
                    if (isPastDeadline || isClosed) {
                        return `<button class="btn-primary" disabled style="background: #ccc; cursor: not-allowed;">
                            ${isPastDeadline ? 'Deadline Passed' : 'Scholarship Closed'}
                        </button>`;
                    } else {
                        return `<button onclick="showApplicationForm('${scholarship._id}')" class="btn-primary">Apply Now</button>`;
                    }
                })()}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Initialize map if coordinates exist - with safer checking
    let lat, lng;
    
    if (scholarship.location && typeof scholarship.location === 'object') {
        lat = scholarship.location.latitude;
        lng = scholarship.location.longitude;
    } else {
        lat = scholarship.latitude;
        lng = scholarship.longitude;
    }
    
    if (lat && lng) {
        setTimeout(() => {
            try {
                const map = L.map('modalMap').setView([lat, lng], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
                L.marker([lat, lng]).addTo(map);
            } catch (error) {
                console.error('Error initializing map:', error);
            }
        }, 100);
    }
}

// Close modal
function closeModal() {
    document.getElementById('scholarshipModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Show application form
function showApplicationForm(scholarshipId) {
    const modal = document.getElementById('scholarshipModal');
    const detailContainer = document.getElementById('scholarshipDetail');
    
    detailContainer.innerHTML = `
        <h2>Apply for Scholarship</h2>
        <form id="applicationForm" class="application-form">
            <div class="form-group">
                <label for="coverLetter">Cover Letter *</label>
                <textarea 
                    id="coverLetter" 
                    name="coverLetter" 
                    rows="8" 
                    required
                    placeholder="Explain why you're applying for this scholarship, your qualifications, and how it will help you achieve your goals..."
                ></textarea>
            </div>
            
            <div class="form-group">
                <label for="documents">Upload Documents (Optional)</label>
                <input 
                    type="file" 
                    id="documents" 
                    name="documents" 
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                >
                <small>Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max 5 files, 5MB each.</small>
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="btn-primary">Submit Application</button>
                <button type="button" onclick="closeModal()" class="btn-secondary">Cancel</button>
            </div>
        </form>
    `;
    
    // Add form submit handler
    document.getElementById('applicationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitApplication(scholarshipId);
    });
}

// Apply for scholarship
async function submitApplication(scholarshipId) {
    const coverLetter = document.getElementById('coverLetter').value;
    const documentsInput = document.getElementById('documents');
    const documents = documentsInput.files;
    
    if (!coverLetter.trim()) {
        alert('Please provide a cover letter');
        return;
    }
    
    const submitBtn = document.querySelector('#applicationForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        console.log('🚀 Submitting application for scholarship:', scholarshipId);
        
        const result = await API.applyForScholarship({
            scholarshipId: scholarshipId,
            coverLetter: coverLetter,
            documents: documents
        });
        
        console.log('✅ Application submitted:', result);
        
        alert(result.message || 'Application submitted successfully!');
        closeModal();
        
        // Redirect to dashboard to see the new application
        window.location.href = 'student-dashboard.html';
    } catch (error) {
        console.error('❌ Application error:', error);
        
        // Show error message to user
        const errorMessage = error.message || error.toString() || 'Error submitting application. Please try again.';
        alert(errorMessage);
        
        // Re-enable button on error
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Legacy function - kept for compatibility
async function applyForScholarship(scholarshipId) {
    showApplicationForm(scholarshipId);
}

// Logout
function logout() {
    API.logout();
    window.location.href = 'index.html';
}

// Message sponsor
function messageSponsor(sponsorId) {
    window.location.href = `messages.html?recipient=${sponsorId}`;
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadScholarships();
    
    // Add search input event listener
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchScholarships();
        }
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('scholarshipModal');
    if (e.target === modal) {
        closeModal();
    }
});
