// Add Scholarship functionality

// Check authentication
function checkAuth() {
    const currentUser = API.getCurrentUser();
    if (!currentUser || currentUser.role !== 'sponsor') {
        window.location.href = 'login.html';
        return null;
    }
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    return currentUser;
}

let map;
let marker;
let isEditMode = false;
let scholarshipId = null;

// Institution data by region (same as profile.js)
const institutionsByRegion = {
    'Ilocos Region': [
        'Mariano Marcos State University',
        'Northwestern University',
        'Divine Word College of Laoag',
        'Data Center College of the Philippines - Laoag',
        'Ilocos Norte College of Arts and Trades',
        'AMA Computer University - Laoag',
        'Ilocos Norte National High School',
        'Laoag City National Science High School',
        'Mariano Marcos State University Laboratory High School',
        'Ilocos Norte College of Arts and Trades High School',
        'University of Northern Philippines',
        'Ilocos Sur Polytechnic State College',
        'St. Paul College of Ilocos Sur',
        'Data Center College of the Philippines - Vigan',
        'AMA Computer University - Vigan',
        'Ilocos Sur National High School',
        'UNP Laboratory High School',
        'Saint Paul College of Ilocos Sur High School',
        'Tagudin National High School'
    ],
    'Cagayan Valley': [
        'Cagayan State University',
        'University of Cagayan Valley',
        'St. Paul University Philippines',
        'AMA Computer University - Tuguegarao',
        'International School of Asia and the Pacific',
        'Cagayan National High School',
        'Tuguegarao City Science High School',
        'St. Paul University High School',
        'CSU Laboratory High School'
    ],
    'National Capital Region': [
        'University of the Philippines',
        'Ateneo de Manila University',
        'De La Salle University',
        'University of Santo Tomas',
        'Mapúa University',
        'Far Eastern University',
        'Polytechnic University of the Philippines',
        'Pamantasan ng Lungsod ng Maynila',
        'Manila Central University',
        'Philippine Science High School',
        'Manila Science High School',
        'Quezon City Science High School',
        'Ateneo High School',
        'La Salle Green Hills',
        'St. Scholastica\'s College High School'
    ]
};

// Update institutions dropdown based on selected region
function updateInstitutionsDropdown(region) {
    const dropdown = document.getElementById('affiliatedInstitution');
    const institutions = institutionsByRegion[region] || [];
    
    dropdown.innerHTML = '<option value="">Select Institution</option>';
    
    institutions.forEach(institution => {
        const option = document.createElement('option');
        option.value = institution;
        option.textContent = institution;
        dropdown.appendChild(option);
    });
    
    console.log(`Populated ${institutions.length} institutions for ${region}`);
}

// Load sponsor's profile data (region and affiliated institution)
async function loadAffiliatedInstitution() {
    try {
        const response = await API.getProfile();
        if (response.success && response.data) {
            const profile = response.data;
            
            // Initialize region field from user profile if not in edit mode
            if (profile.region && !isEditMode) {
                document.getElementById('scholarshipRegion').value = profile.region;
                updateInstitutionsDropdown(profile.region);
            }
            
            // Initialize affiliated institution from sponsor profile if available
            if (profile.sponsorInfo && profile.sponsorInfo.website && !isEditMode) {
                const affiliatedInstitution = profile.sponsorInfo.website;
                
                setTimeout(() => {
                    document.getElementById('affiliatedInstitution').value = affiliatedInstitution;
                    
                    // Auto-set the location if institution is selected
                    if (institutionCoordinates[affiliatedInstitution]) {
                        setInstitutionLocation(affiliatedInstitution);
                    }
                }, 0);
            }
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

// Load existing scholarship data for editing
async function loadScholarshipData(id) {
    try {
        console.log('Loading scholarship data for ID:', id);
        const response = await API.getScholarship(id);
        console.log('API response:', response);
        
        // Handle both response formats: { scholarship } or direct scholarship object
        const scholarship = response.scholarship || response;
        
        if (!scholarship || !scholarship._id) {
            throw new Error('Scholarship not found or invalid response');
        }
        
        console.log('Scholarship data loaded:', scholarship);
        
        // Update page title
        document.querySelector('.page-header h1').textContent = 'Edit Scholarship';
        document.querySelector('.page-header p').textContent = 'Update your scholarship program details';
        
        // Populate form fields
        document.getElementById('title').value = scholarship.title || '';
        document.getElementById('description').value = scholarship.description || '';
        document.getElementById('eligibility').value = scholarship.eligibility || ''; // Fixed: was eligibilityRequirements
        document.getElementById('scholarshipType').value = scholarship.scholarshipType || '';
        document.getElementById('slots').value = scholarship.availableSlots || '';
        document.getElementById('deadline').value = scholarship.deadline ? scholarship.deadline.split('T')[0] : '';
        document.getElementById('documentsRequired').value = scholarship.documentsRequired || '';
        document.getElementById('documentsLink').value = scholarship.documentsLink || ''; // Added: Google Drive link
        
        // Optional fields
        document.getElementById('amount').value = scholarship.amount || '';
        document.getElementById('benefits').value = scholarship.benefits || '';
        document.getElementById('selectionCriteria').value = scholarship.selectionCriteria || '';
        document.getElementById('contactEmail').value = scholarship.contactEmail || '';
        document.getElementById('contactPhone').value = scholarship.contactPhone || '';
        document.getElementById('applicationLink').value = scholarship.applicationLink || '';
        document.getElementById('renewalPolicy').value = scholarship.renewalPolicy || '';
        
        // Region and institution
        if (scholarship.region) {
            document.getElementById('scholarshipRegion').value = scholarship.region;
            updateInstitutionsDropdown(scholarship.region);
        }
        
        if (scholarship.affiliatedInstitution) {
            setTimeout(() => {
                document.getElementById('affiliatedInstitution').value = scholarship.affiliatedInstitution;
            }, 100);
        }
        
        // Location coordinates
        if (scholarship.location && scholarship.location.coordinates) {
            const [lng, lat] = scholarship.location.coordinates;
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
            
            // Set marker on map
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker([lat, lng]).addTo(map);
            map.setView([lat, lng], 15);
            
            document.getElementById('coordinates').textContent = 
                `Selected coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
        
        console.log('Form populated with scholarship data');
    } catch (error) {
        console.error('Error loading scholarship:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        alert(`Error loading scholarship data: ${errorMsg}\n\nRedirecting to dashboard...`);
        window.location.href = 'sponsor-dashboard.html';
    }
}

// Set location based on institution selection
function setInstitutionLocation(institutionName) {
    const coords = getInstitutionCoordinates(institutionName);
    
    if (coords) {
        // Remove existing marker
        if (marker) {
            map.removeLayer(marker);
        }
        
        // Set new marker
        marker = L.marker([coords.lat, coords.lng]).addTo(map);
        
        // Update form values
        document.getElementById('latitude').value = coords.lat;
        document.getElementById('longitude').value = coords.lng;
        document.getElementById('coordinates').textContent = 
            `Selected coordinates: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)} (${institutionName})`;
        
        // Pan map to institution
        map.setView([coords.lat, coords.lng], 15);
    }
}

// Initialize map
function initMap() {
    // Center on Philippines
    map = L.map('map').setView([12.8797, 121.7740], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add click event to map
    map.on('click', function(e) {
        if (marker) {
            map.removeLayer(marker);
        }
        
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        
        document.getElementById('latitude').value = e.latlng.lat;
        document.getElementById('longitude').value = e.latlng.lng;
        document.getElementById('coordinates').textContent = 
            `Selected coordinates: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
    });
}

// Handle form submission
document.getElementById('addScholarshipForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
    
    // Validate coordinates
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    
    if (!latitude || !longitude) {
        errorMessage.textContent = 'Please select a location on the map';
        errorMessage.style.display = 'block';
        return;
    }
    
    // Prepare scholarship data (only include non-empty optional fields)
    const scholarshipData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        eligibility: document.getElementById('eligibility').value, // Fixed: was eligibilityRequirements
        scholarshipType: document.getElementById('scholarshipType').value,
        availableSlots: parseInt(document.getElementById('slots').value),
        deadline: document.getElementById('deadline').value,
        documentsRequired: document.getElementById('documentsRequired').value,
        region: document.getElementById('scholarshipRegion').value,
        affiliatedInstitution: document.getElementById('affiliatedInstitution').value,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
    };
    
    // Add optional fields only if they have values
    const amount = document.getElementById('amount').value;
    if (amount) scholarshipData.amount = parseFloat(amount);
    
    const benefits = document.getElementById('benefits').value.trim();
    if (benefits) scholarshipData.benefits = benefits;
    
    const selectionCriteria = document.getElementById('selectionCriteria').value.trim();
    if (selectionCriteria) scholarshipData.selectionCriteria = selectionCriteria;
    
    const contactEmail = document.getElementById('contactEmail').value.trim();
    if (contactEmail) scholarshipData.contactEmail = contactEmail;
    
    const contactPhone = document.getElementById('contactPhone').value.trim();
    if (contactPhone) scholarshipData.contactPhone = contactPhone;
    
    const applicationLink = document.getElementById('applicationLink').value.trim();
    if (applicationLink) scholarshipData.applicationLink = applicationLink;
    
    const renewalPolicy = document.getElementById('renewalPolicy').value.trim();
    if (renewalPolicy) scholarshipData.renewalPolicy = renewalPolicy;
    
    const documentsLink = document.getElementById('documentsLink').value.trim();
    if (documentsLink) scholarshipData.documentsLink = documentsLink;
    
    try {
        let result;
        
        if (isEditMode && scholarshipId) {
            // Update existing scholarship (skip duplicate check for edits)
            console.log('Updating scholarship:', scholarshipId, scholarshipData);
            result = await API.updateScholarship(scholarshipId, scholarshipData);
            
            if (result) {
                alert('Scholarship updated successfully!');
                window.location.href = 'sponsor-dashboard.html';
            }
        } else {
            // Create new scholarship - CHECK FOR DUPLICATES FIRST
            console.log('Creating new scholarship - checking for duplicates...');
            
            // Show checking indicator
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                Checking for duplicates...
            `;
            
            try {
                // Fetch active scholarships to compare
                const currentUser = API.getCurrentUser();
                const response = await API.getScholarships({ status: 'active' });
                const activeScholarships = response || [];
                
                // Filter to only current sponsor's scholarships
                const sponsorScholarships = activeScholarships.filter(s => 
                    s.sponsor._id === currentUser._id || s.sponsor === currentUser._id
                );
                
                // Run duplicate check with Gemini AI
                const duplicateCheck = await GeminiAPI.checkDuplicateScholarship(scholarshipData, sponsorScholarships);
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                if (duplicateCheck.isDuplicate) {
                    // Show warning modal
                    const shouldProceed = confirm(`⚠️ DUPLICATE SCHOLARSHIP DETECTED

Confidence: ${duplicateCheck.confidence?.toUpperCase() || 'HIGH'}
${duplicateCheck.matchedScholarship ? `Similar to: "${duplicateCheck.matchedScholarship}"` : ''}

Reason: ${duplicateCheck.reason || 'This scholarship appears to be very similar to one you already created.'}

Recommendation: ${duplicateCheck.recommendation || 'Please review your existing scholarships or make significant changes to this one.'}

Do you want to go back and make changes?`);
                    
                    if (shouldProceed) {
                        // User wants to fix it - don't submit
                        console.log('User chose to modify scholarship');
                        return;
                    } else {
                        // User insists on proceeding - show final warning
                        const finalConfirm = confirm('⚠️ FINAL WARNING\n\nYou are about to create what appears to be a duplicate scholarship. This may confuse students and violate platform policies.\n\nAre you ABSOLUTELY SURE you want to proceed?');
                        
                        if (!finalConfirm) {
                            console.log('User cancelled after final warning');
                            return;
                        }
                    }
                }
                
                // No duplicate or user confirmed - proceed with creation
                console.log('Creating scholarship:', scholarshipData);
                result = await API.createScholarship(scholarshipData);
                
                if (result) {
                    alert('Scholarship created successfully!');
                    window.location.href = 'sponsor-dashboard.html';
                }
                
            } catch (duplicateError) {
                console.error('Error during duplicate check:', duplicateError);
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // If duplicate check fails, ask user if they want to proceed anyway
                const proceedAnyway = confirm('Could not verify for duplicates. Do you want to proceed with creating this scholarship?');
                if (!proceedAnyway) {
                    return;
                }
                
                // Proceed with creation
                result = await API.createScholarship(scholarshipData);
                if (result) {
                    alert('Scholarship created successfully!');
                    window.location.href = 'sponsor-dashboard.html';
                }
            }
        }
    } catch (error) {
        console.error('Error saving scholarship:', error);
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }
});

// Logout
function logout() {
    API.logout();
    window.location.href = 'index.html';
}

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    initMap();
    
    // Check if we're in edit mode (ID parameter in URL)
    const urlParams = new URLSearchParams(window.location.search);
    scholarshipId = urlParams.get('id');
    
    if (scholarshipId) {
        isEditMode = true;
        console.log('Edit mode detected, loading scholarship:', scholarshipId);
        await loadScholarshipData(scholarshipId);
    } else {
        console.log('Create mode - new scholarship');
        await loadAffiliatedInstitution();
    }
    
    // Set minimum date for deadline
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deadline').setAttribute('min', today);
    
    // Add event listener for region change
    document.getElementById('scholarshipRegion').addEventListener('change', function() {
        if (this.value) {
            updateInstitutionsDropdown(this.value);
        } else {
            document.getElementById('affiliatedInstitution').innerHTML = '<option value="">Select Region First</option>';
        }
    });
    
    // Add event listener for institution selection
    document.getElementById('affiliatedInstitution').addEventListener('change', function() {
        if (this.value) {
            setInstitutionLocation(this.value);
        }
    });
});

// Grammar Fix Functionality
async function fixGrammar(fieldId) {
    const field = document.getElementById(fieldId);
    const originalText = field.value.trim();
    
    if (!originalText) {
        notify.error('Please enter some text first');
        return;
    }
    
    // Find the button that was clicked
    const buttons = document.querySelectorAll(`button[onclick="fixGrammar('${fieldId}')"]`);
    const button = buttons[0];
    const originalButtonText = button.textContent;
    
    // Show loading state
    button.disabled = true;
    button.textContent = 'Fixing...';
    field.disabled = true;
    
    try {
        const prompt = `Fix the grammar, spelling, and improve the clarity of this text. Keep the same meaning and tone. Return ONLY the corrected text without any explanation or special characters like asterisks or hyphens:

"${originalText}"

Corrected text:`;
        
        const response = await GeminiAPI.generateContent(prompt);
        
        // Clean up response (remove quotes, extra spaces, special characters)
        const correctedText = response
            .replace(/^["']|["']$/g, '')  // Remove surrounding quotes
            .replace(/\*\*/g, '')          // Remove bold markdown
            .replace(/\*/g, '')            // Remove asterisks
            .replace(/^[\-\*]\s/gm, '')    // Remove bullet points
            .trim();
        
        // Update field with corrected text
        field.value = correctedText;
        notify.success('Grammar corrected!');
        
    } catch (error) {
        console.error('Grammar fix error:', error);
        notify.error('Failed to fix grammar. Please try again.');
    } finally {
        // Restore button and field
        button.disabled = false;
        button.textContent = originalButtonText;
        field.disabled = false;
    }
}
