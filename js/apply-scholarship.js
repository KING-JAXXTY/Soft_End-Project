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

// Load scholarship title and analyze required documents
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
        
        // Analyze required documents with AI
        if (scholarship.documentsRequired || scholarship.requirements) {
            await analyzeRequiredDocuments(scholarship);
        }
        
    } catch (error) {
        console.error('Error loading scholarship:', error);
        notify.error('Failed to load scholarship information');
    }
}

// Analyze scholarship requirements and auto-check relevant documents
async function analyzeRequiredDocuments(scholarship) {
    try {
        // Show analyzing indicator
        const checklistContainer = document.querySelector('.documents-checklist');
        if (!checklistContainer) return;
        
        const analyzeIndicator = document.createElement('div');
        analyzeIndicator.className = 'ai-analyzing';
        analyzeIndicator.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span>AI analyzing required documents...</span>
        `;
        checklistContainer.insertBefore(analyzeIndicator, checklistContainer.firstChild);
        
        // Prepare comprehensive context for AI
        const requirements = scholarship.requirements?.join(', ') || '';
        const documentsText = scholarship.documentsRequired || '';
        const eligibility = scholarship.eligibility || '';
        const description = scholarship.description || '';
        
        const prompt = `Analyze this scholarship information and determine which documents are required:

Scholarship: ${scholarship.title}
Type: ${scholarship.scholarshipType}
Documents Required: ${documentsText}
Requirements: ${requirements}
Eligibility: ${eligibility}
Description: ${description}

Based on the above information, which of these documents are REQUIRED (not optional)?
1. transcript - Transcript of Records / Report Card
2. id - Valid ID (Student ID, Government ID)
3. certifications - Certificates & Awards
4. recommendation - Recommendation Letter
5. financial - Proof of Financial Need
6. other - Other Supporting Documents

Return ONLY a comma-separated list of the document codes that are REQUIRED (e.g., "transcript,id,financial").
If a document type is mentioned as "if applicable", "optional", "if needed", or similar, DO NOT include it.
Only include documents that are explicitly required or clearly mandatory.`;

        const result = await GeminiAPI.generateContent(prompt);
        console.log('AI Document Analysis Result:', result);
        
        // Parse AI response
        const requiredDocs = result.toLowerCase()
            .replace(/[^a-z,]/g, '')
            .split(',')
            .map(doc => doc.trim())
            .filter(doc => doc);
        
        // Auto-check the required documents
        requiredDocs.forEach(docCode => {
            const checkbox = document.getElementById(`doc-${docCode}`);
            if (checkbox) {
                checkbox.checked = true;
                // Add visual indicator that it was AI-suggested
                const label = checkbox.closest('.checklist-item');
                if (label && !label.querySelector('.ai-suggested')) {
                    const badge = document.createElement('span');
                    badge.className = 'ai-suggested';
                    badge.textContent = 'AI Suggested';
                    label.appendChild(badge);
                }
            }
        });
        
        // Remove analyzing indicator
        analyzeIndicator.remove();
        
        // Show success message if documents were identified
        if (requiredDocs.length > 0) {
            const successMsg = document.createElement('div');
            successMsg.className = 'ai-success-msg';
            successMsg.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>AI identified ${requiredDocs.length} required document${requiredDocs.length > 1 ? 's' : ''}</span>
            `;
            checklistContainer.insertBefore(successMsg, checklistContainer.children[1]);
            
            // Auto-remove success message after 5 seconds
            setTimeout(() => successMsg.remove(), 5000);
        }
        
    } catch (error) {
        console.error('Error analyzing documents:', error);
        // Silently fail - checklist will still be available for manual selection
        const analyzeIndicator = document.querySelector('.ai-analyzing');
        if (analyzeIndicator) analyzeIndicator.remove();
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
    const documentsLink = document.getElementById('documentsLink').value.trim();
    const additionalInfo = document.getElementById('additionalInfo').value.trim();
    
    if (!scholarshipId) {
        notify.error('Scholarship ID not found');
        return;
    }
    
    if (!coverLetter) {
        notify.error('Please write a cover letter');
        return;
    }
    
    if (!documentsLink) {
        notify.error('Please provide a Google Drive link to your documents');
        return;
    }
    
    // Validate Google Drive link format
    if (!documentsLink.includes('drive.google.com')) {
        notify.error('Please provide a valid Google Drive link');
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
            documentsLink: documentsLink,
            additionalInfo: additionalInfo || ''
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
