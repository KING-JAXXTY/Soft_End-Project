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

// Analyze scholarship requirements and show AI-generated document list
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
            <span>AI analyzing scholarship requirements...</span>
        `;
        checklistContainer.insertBefore(analyzeIndicator, checklistContainer.firstChild);
        
        // Prepare comprehensive context for AI
        const requirements = scholarship.requirements?.join(', ') || '';
        const documentsText = scholarship.documentsRequired || '';
        const eligibility = scholarship.eligibility || '';
        const description = scholarship.description || '';
        
        const prompt = `You are helping students understand what documents they need to upload to Google Drive for this scholarship application.

Analyze this scholarship information:

Scholarship: ${scholarship.title}
Type: ${scholarship.scholarshipType}
Documents Required: ${documentsText}
Requirements: ${requirements}
Eligibility: ${eligibility}
Description: ${description}

Based on the above information, create a clear, bulleted list of REQUIRED documents that students must upload to their Google Drive folder. 

Rules:
1. List ONLY documents that are explicitly required or clearly mandatory
2. Skip documents mentioned as "optional", "if applicable", "if needed", etc.
3. Be specific and clear (e.g., "Transcript of Records for the last 2 semesters")
4. If financial documents are required, specify which ones
5. Keep each bullet point concise and actionable
6. Use clear, student-friendly language

Format your response as a simple bulleted list using dashes (-), one document per line. Do NOT include any introductory text, explanations, or numbering. Start directly with the list.

Example format:
- Transcript of Records (last 2 semesters)
- Valid Student or Government ID
- Certificate of Enrollment`;

        const result = await GeminiAPI.generateContent(prompt);
        console.log('AI Document Analysis Result:', result);
        
        // Remove analyzing indicator
        analyzeIndicator.remove();
        
        // Clean up the AI response
        let documentList = result
            .trim()
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^[-*•]\s*/, '').trim())
            .filter(line => line);
        
        // Display AI-generated document requirements
        if (documentList.length > 0) {
            const aiRequirements = document.createElement('div');
            aiRequirements.className = 'ai-document-requirements';
            aiRequirements.innerHTML = `
                <div class="ai-requirements-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <strong>AI-Generated Document Requirements</strong>
                </div>
                <p class="ai-requirements-subtitle">Based on the scholarship information, please upload these documents to your Google Drive:</p>
                <ul class="ai-requirements-list">
                    ${documentList.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
                <div class="ai-requirements-tip">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Make sure all documents are clearly labeled and in a single Google Drive folder</span>
                </div>
            `;
            
            // Insert before the checklist
            checklistContainer.parentNode.insertBefore(aiRequirements, checklistContainer);
            
            // Highlight matching documents in the checklist
            highlightRequiredDocuments(documentList);
        } else {
            // Fallback message if AI couldn't determine requirements
            const fallbackMsg = document.createElement('div');
            fallbackMsg.className = 'ai-requirements-fallback';
            fallbackMsg.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Please refer to the scholarship details and upload all required documents to Google Drive</span>
            `;
            checklistContainer.insertBefore(fallbackMsg, checklistContainer.firstChild);
        }
        
    } catch (error) {
        console.error('Error analyzing documents:', error);
        // Silently fail - checklist will still be available for manual selection
        const analyzeIndicator = document.querySelector('.ai-analyzing');
        if (analyzeIndicator) analyzeIndicator.remove();
    }
}

// Highlight required documents in the checklist
function highlightRequiredDocuments(documentList) {
    // Mapping of keywords to document IDs
    const keywordMapping = {
        'transcript': 'doc-transcript',
        'records': 'doc-transcript',
        'grades': 'doc-transcript',
        'report card': 'doc-transcript',
        'id': 'doc-id',
        'identification': 'doc-id',
        'student id': 'doc-id',
        'government id': 'doc-id',
        'certificate': 'doc-certifications',
        'award': 'doc-certifications',
        'achievement': 'doc-certifications',
        'recommendation': 'doc-recommendation',
        'reference': 'doc-recommendation',
        'letter': 'doc-recommendation',
        'financial': 'doc-financial',
        'income': 'doc-financial',
        'indigency': 'doc-financial',
        'need': 'doc-financial',
        'tax': 'doc-financial'
    };
    
    const highlightedDocs = new Set();
    
    // Check each AI-generated document against keywords
    documentList.forEach(docText => {
        const lowerDocText = docText.toLowerCase();
        
        for (const [keyword, docId] of Object.entries(keywordMapping)) {
            if (lowerDocText.includes(keyword) && !highlightedDocs.has(docId)) {
                highlightedDocs.add(docId);
                
                // Highlight the checklist item
                const checkbox = document.getElementById(docId);
                if (checkbox) {
                    const label = checkbox.closest('.checklist-item');
                    const span = label.querySelector('.doc-label');
                    if (span) {
                        span.classList.add('required-doc');
                    }
                }
            }
        }
    });
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
