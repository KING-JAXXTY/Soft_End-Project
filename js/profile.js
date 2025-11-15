// Profile functionality

// Municipalities/Cities by region
const municipalitiesByRegion = {
    'National Capital Region': [
        'Manila', 'Binondo', 'Ermita', 'Intramuros', 'Malate', 'Paco', 
        'Pandacan', 'Port Area', 'Quiapo', 'Sampaloc', 'San Andres', 
        'San Miguel', 'San Nicolas', 'Santa Ana', 'Santa Cruz', 'Tondo'
    ],
    'Ilocos Region': [
        'Laoag City', 'Batac City', 'Adams', 'Bacarra', 'Badoc', 'Bangui', 
        'Burgos', 'Carasi', 'Currimao', 'Dingras', 'Dumalneg', 'Espiritu', 
        'Marcos', 'Nueva Era', 'Pagudpud', 'Paoay', 'Pasuquin', 'Piddig', 
        'Pinili', 'San Nicolas', 'Sarrat', 'Solsona', 'Vintar',
        'Vigan City', 'Candon City', 'Alilem', 'Banayoyo', 'Bantay', 
        'Caoayan', 'Cervantes', 'Galimuyod', 'Gregorio del Pilar', 'Lidlidda', 
        'Magsingal', 'Nagbukel', 'Narvacan', 'Quirino', 'Salcedo', 'San Emilio', 
        'San Esteban', 'San Ildefonso', 'San Juan', 'San Vicente', 'Santa', 
        'Santa Catalina', 'Santa Cruz', 'Santa Lucia', 'Santa Maria', 'Santiago', 
        'Santo Domingo', 'Sigay', 'Sinait', 'Sugpon', 'Suyo', 'Tagudin'
    ],
    'Cagayan Valley': [
        'Tuguegarao City', 'Abulug', 'Alcala', 'Allacapan', 'Amulung', 'Aparri', 
        'Baggao', 'Ballesteros', 'Buguey', 'Calayan', 'Camalaniugan', 'Claveria', 
        'Enrile', 'Gattaran', 'Gonzaga', 'Iguig', 'Lal-lo', 'Lasam', 'Pamplona', 
        'Peñablanca', 'Piat', 'Rizal', 'Sanchez-Mira', 'Santa Ana', 'Santa Praxedes', 
        'Santa Teresita', 'Solana', 'Tuao'
    ]
};

// Institution data by region
const institutionsByRegion = {
    'Ilocos Region': [
        // Ilocos Norte - Universities & Colleges
        'Mariano Marcos State University',
        'Northwestern University',
        'Divine Word College of Laoag',
        'Data Center College of the Philippines - Laoag',
        'Ilocos Norte College of Arts and Trades',
        'AMA Computer University - Laoag',
        // Ilocos Norte - High Schools
        'Ilocos Norte National High School',
        'Laoag City National Science High School',
        'Mariano Marcos State University Laboratory High School',
        'Ilocos Norte College of Arts and Trades High School',
        // Ilocos Sur - Universities & Colleges
        'University of Northern Philippines',
        'Ilocos Sur Polytechnic State College',
        'St. Paul College of Ilocos Sur',
        'Data Center College of the Philippines - Vigan',
        'AMA Computer University - Vigan',
        // Ilocos Sur - High Schools
        'Ilocos Sur National High School',
        'UNP Laboratory High School',
        'Saint Paul College of Ilocos Sur High School',
        'Tagudin National High School'
    ],
    'Cagayan Valley': [
        // Cagayan - Universities & Colleges
        'Cagayan State University',
        'University of Cagayan Valley',
        'St. Paul University Philippines',
        'AMA Computer University - Tuguegarao',
        'International School of Asia and the Pacific',
        // Cagayan - High Schools
        'Cagayan National High School',
        'Tuguegarao City Science High School',
        'St. Paul University High School',
        'CSU Laboratory High School'
    ],
    'National Capital Region': [
        // Metro Manila - Universities & Colleges
        'University of the Philippines',
        'Ateneo de Manila University',
        'De La Salle University',
        'University of Santo Tomas',
        'Mapúa University',
        'Far Eastern University',
        'Polytechnic University of the Philippines',
        'Pamantasan ng Lungsod ng Maynila',
        'Manila Central University',
        // Metro Manila - High Schools
        'Philippine Science High School',
        'Manila Science High School',
        'Quezon City Science High School',
        'Ateneo High School',
        'La Salle Green Hills',
        'St. Scholastica\'s College High School'
    ]
};

// Check authentication
function checkAuth() {
    const currentUser = API.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    
    // Set navigation links based on role
    const navLinks = document.getElementById('navLinks');
    if (currentUser.role === 'student') {
        navLinks.innerHTML = `
            <a href="student-home.html">Home</a>
            <a href="student-dashboard.html">Dashboard</a>
            <a href="messages.html">Messages</a>
            <a href="forum.html">Community Forum</a>
            <a href="profile.html" class="active">Profile</a>
        `;
    } else if (currentUser.role === 'sponsor') {
        navLinks.innerHTML = `
            <a href="sponsor-dashboard.html">Dashboard</a>
            <a href="messages.html">Messages</a>
            <a href="forum.html">Community Forum</a>
            <a href="profile.html" class="active">Profile</a>
        `;
    } else if (currentUser.role === 'admin') {
        navLinks.innerHTML = `
            <a href="admin-dashboard.html">Dashboard</a>
            <a href="forum.html">Community Forum</a>
            <a href="profile.html" class="active">Profile</a>
        `;
    }
    
    return currentUser;
}

// Load profile data
async function loadProfile() {
    try {
        // Check if viewing another user's profile
        const urlParams = new URLSearchParams(window.location.search);
        const viewUserId = urlParams.get('id');
        const currentUser = API.getCurrentUser();
        const isViewingOtherProfile = viewUserId && viewUserId !== currentUser._id;
        
        let profileResponse, profile, profileUser;
        
        if (isViewingOtherProfile) {
            // Load another user's profile
            profileResponse = await API.getUserProfile(viewUserId);
            profile = profileResponse.profile || profileResponse;
            profileUser = profile.user || {};
            
            // Update page header for viewing other user's profile
            document.querySelector('.page-header h1').textContent = 'User Profile';
            document.querySelector('.page-header p').textContent = 'Viewing user information';
        } else {
            // Load current user's profile
            profileResponse = await API.getProfile();
            profile = profileResponse.profile || profileResponse;
            profileUser = currentUser;
            
            // Update page header for own profile
            document.querySelector('.page-header h1').textContent = 'My Profile';
            document.querySelector('.page-header p').textContent = 'Manage your account information';
        }
        
        // Get avatar from profile.user (populated from backend) or fallback to currentUser
        const userAvatar = profile.user?.avatar || profileUser.avatar || 'avatar1';
        
        // Populate basic info
        document.getElementById('profileName').textContent = `${profileUser.firstName} ${profileUser.lastName}`;
        const profileRoleBadge = document.getElementById('profileRoleBadge');
        if (profileRoleBadge) {
            profileRoleBadge.textContent = profileUser.role.charAt(0).toUpperCase() + profileUser.role.slice(1);
        }
        
        // Hide email for admin users
        if (profileUser.role === 'admin') {
            document.getElementById('profileEmail').style.display = 'none';
        } else {
            document.getElementById('profileEmail').textContent = profileUser.email;
            document.getElementById('profileEmail').style.display = 'block';
        }
        
        // Set avatar
        const avatarUrl = getAvatarUrl(userAvatar);
        document.getElementById('profileAvatarImg').src = avatarUrl;
        
        // If viewing another user's profile, hide edit controls and show back button
        if (isViewingOtherProfile) {
            setFormReadOnly(true);
            document.getElementById('editProfileBtn').style.display = 'none';
            document.getElementById('saveProfileBtn').style.display = 'none';
            document.getElementById('cancelEditBtn').style.display = 'none';
            document.getElementById('backBtn').style.display = 'inline-block';
            // Hide avatar change button when viewing other profiles
            const changeAvatarBtn = document.getElementById('changeAvatarBtn');
            if (changeAvatarBtn) {
                changeAvatarBtn.style.display = 'none';
            }
        } else {
            // Own profile - show normal controls
            document.getElementById('editProfileBtn').style.display = 'inline-block';
            document.getElementById('backBtn').style.display = 'inline-block';
            const changeAvatarBtn = document.getElementById('changeAvatarBtn');
            if (changeAvatarBtn) {
                changeAvatarBtn.style.display = 'inline-block';
            }
        }
        
        // Set avatar selection
        document.getElementById('avatar').value = userAvatar;
        document.querySelectorAll('.avatar-option').forEach(opt => {
            if (opt.dataset.avatar === userAvatar) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        // Populate form fields
        document.getElementById('firstName').value = profileUser.firstName;
        document.getElementById('lastName').value = profileUser.lastName;
        document.getElementById('email').value = profileUser.email;
        document.getElementById('contactNumber').value = profile.phone || '';
        
        // Set region and populate municipalities
        const regionValue = profile.region || '';
        const provinceValue = profile.province || '';
        
        document.getElementById('region').value = regionValue;
        
        // Populate municipalities for the selected region
        if (regionValue) {
            updateMunicipalities(regionValue);
            // Use setTimeout to ensure dropdown is populated before setting value
            setTimeout(() => {
                document.getElementById('province').value = provinceValue;
            }, 0);
        } else {
            document.getElementById('province').value = '';
        }
        
        document.getElementById('address').value = profile.bio || '';
        
        // Show role-specific fields based on the profile being viewed
        if (profileUser.role === 'student') {
            document.getElementById('studentFields').style.display = 'block';
            document.getElementById('sponsorFields').style.display = 'none';
            
            // Populate student fields
            if (profile.studentInfo) {
                document.getElementById('yearLevel').value = profile.studentInfo.gradeLevel || '';
                document.getElementById('gpa').value = profile.studentInfo.gpa || '';
                document.getElementById('course').value = profile.studentInfo.major || '';
            }
        } else if (currentUser.role === 'sponsor') {
            document.getElementById('studentFields').style.display = 'none';
            document.getElementById('sponsorFields').style.display = 'block';
            
            // Populate institutions dropdown based on region first
            if (regionValue) {
                console.log('Loading sponsor profile - Region:', regionValue);
                updateInstitutions(regionValue);
            }
            
            // Then populate sponsor fields
            if (profile.sponsorInfo) {
                console.log('Saved institution:', profile.sponsorInfo.website);
                document.getElementById('sponsorName').value = profile.sponsorInfo.organization || '';
                document.getElementById('aboutDescription').value = profile.sponsorInfo.description || '';
                // Set affiliated institution after dropdown is populated
                setTimeout(() => {
                    const dropdown = document.getElementById('affiliatedInstitution');
                    console.log('Dropdown options count:', dropdown.options.length);
                    dropdown.value = profile.sponsorInfo.website || '';
                    console.log('Set dropdown value to:', dropdown.value);
                }, 0);
            }
        } else {
            document.getElementById('studentFields').style.display = 'none';
            document.getElementById('sponsorFields').style.display = 'none';
            // Hide contact/location fields for admin and remove required attributes
            if (profileUser.role === 'admin') {
                document.getElementById('personalInfoFields').style.display = 'none';
                
                // Remove required attribute from hidden fields so form can submit
                document.getElementById('contactNumber').removeAttribute('required');
                document.getElementById('region').removeAttribute('required');
                document.getElementById('province').removeAttribute('required');
            }
        }
        
        // Show delete account section only for students and sponsors (not admin or when viewing other profiles)
        const deleteSection = document.getElementById('deleteAccountSection');
        if (deleteSection && !isViewingOtherProfile && (profileUser.role === 'student' || profileUser.role === 'sponsor')) {
            deleteSection.style.display = 'block';
        } else if (deleteSection) {
            deleteSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Update institutions dropdown based on region
function updateInstitutions(region) {
    console.log('updateInstitutions called with region:', region);
    const select = document.getElementById('affiliatedInstitution');
    const institutions = institutionsByRegion[region] || [];
    
    console.log('Available institutions:', institutions.length);
    
    select.innerHTML = '<option value="">Select Institution</option>';
    institutions.forEach(institution => {
        const option = document.createElement('option');
        option.value = institution;
        option.textContent = institution;
        select.appendChild(option);
    });
    
    console.log('Dropdown populated with', select.options.length, 'options');
}

// Update municipalities based on selected region
function updateMunicipalities(region) {
    const select = document.getElementById('province');
    const municipalities = municipalitiesByRegion[region] || [];
    
    select.innerHTML = '<option value="">Select City/Municipality</option>';
    municipalities.forEach(municipality => {
        const option = document.createElement('option');
        option.value = municipality;
        option.textContent = municipality;
        select.appendChild(option);
    });
}

// Region change handler
document.getElementById('region').addEventListener('change', function() {
    const currentUser = API.getCurrentUser();
    
    // Update municipalities when region changes
    updateMunicipalities(this.value);
    
    // Update institutions for sponsors
    if (currentUser.role === 'sponsor') {
        updateInstitutions(this.value);
    }
});

// Bio word count handler
const bioTextarea = document.getElementById('address');
const bioWordCountDisplay = document.getElementById('bioWordCount');
const MAX_WORDS = 200;

function updateWordCount() {
    const text = bioTextarea.value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    
    bioWordCountDisplay.textContent = `${words} / ${MAX_WORDS} words`;
    
    if (words > MAX_WORDS) {
        bioWordCountDisplay.style.color = '#e74c3c';
        bioWordCountDisplay.textContent = `${words} / ${MAX_WORDS} words - Exceeds limit!`;
    } else if (words > MAX_WORDS * 0.9) {
        bioWordCountDisplay.style.color = '#f39c12';
    } else {
        bioWordCountDisplay.style.color = '#666';
    }
}

// Update word count on input
bioTextarea.addEventListener('input', updateWordCount);

// Initialize word count on page load
updateWordCount();

// Handle profile form submission
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    const currentUser = API.getCurrentUser();
    
    // Validate bio word count
    const bioText = document.getElementById('address').value.trim();
    const wordCount = bioText === '' ? 0 : bioText.split(/\s+/).length;
    
    if (wordCount > MAX_WORDS) {
        errorMessage.textContent = `Bio exceeds ${MAX_WORDS} word limit. Current: ${wordCount} words.`;
        errorMessage.style.display = 'block';
        return;
    }
    
    // Prepare profile data based on role
    const profileData = {
        bio: document.getElementById('address').value,
        avatar: document.getElementById('avatar').value  // Include avatar
    };
    
    // Only include contact/location info if not admin (for security)
    if (currentUser.role !== 'admin') {
        profileData.phone = document.getElementById('contactNumber').value;
        profileData.region = document.getElementById('region').value;
        profileData.province = document.getElementById('province').value;
    }
    
    console.log('📝 Saving profile data:', profileData);
    console.log('🎭 User role:', currentUser.role);
    
    if (currentUser.role === 'student') {
        profileData.gradeLevel = document.getElementById('yearLevel')?.value || '';
        profileData.gpa = parseFloat(document.getElementById('gpa')?.value) || 0;
        profileData.major = document.getElementById('course')?.value || '';
    } else if (currentUser.role === 'sponsor') {
        profileData.organization = document.getElementById('sponsorName')?.value || '';
        profileData.description = document.getElementById('aboutDescription')?.value || '';
        profileData.website = document.getElementById('affiliatedInstitution')?.value || '';
    }
    
    try {
        console.log('🚀 Sending update request...');
        const result = await API.updateProfile(profileData);
        console.log('✅ Profile update result:', result);
        
        // Update currentUser in localStorage with new avatar
        currentUser.avatar = profileData.avatar;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        successMessage.textContent = 'Profile updated successfully!';
        successMessage.style.display = 'block';
        
        // Exit edit mode and reload profile
        setTimeout(() => {
            setFormReadOnly(true);
            document.getElementById('editProfileBtn').style.display = 'inline-block';
            document.getElementById('saveProfileBtn').style.display = 'none';
            document.getElementById('cancelEditBtn').style.display = 'none';
            document.getElementById('backBtn').style.display = 'inline-block';
            
            loadProfile(); // Refresh profile to show updated data
            successMessage.style.display = 'none';
        }, 1500);
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        errorMessage.textContent = error.message || 'Failed to update profile';
        errorMessage.style.display = 'block';
    }
});

// Avatar selection handler
document.querySelectorAll('.avatar-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        const selectedAvatar = this.dataset.avatar;
        document.getElementById('avatar').value = selectedAvatar;
        
        // Update preview avatar image
        const profileAvatarImg = document.getElementById('profileAvatarImg');
        profileAvatarImg.src = getAvatarUrl(selectedAvatar);
    });
});

// Toggle avatar selection visibility
document.getElementById('changeAvatarBtn').addEventListener('click', function() {
    const avatarContainer = document.getElementById('avatarSelectionContainer');
    if (avatarContainer.style.display === 'none' || avatarContainer.style.display === '') {
        avatarContainer.style.display = 'grid';
    } else {
        avatarContainer.style.display = 'none';
    }
});

// Go back to previous page
function goBack() {
    // Check if viewing another user's profile
    const urlParams = new URLSearchParams(window.location.search);
    const viewUserId = urlParams.get('id');
    
    if (viewUserId) {
        // Return to forum if viewing another user's profile
        window.location.href = 'forum.html';
        return;
    }
    
    // Otherwise, go to role-specific home
    const currentUser = API.getCurrentUser();
    if (currentUser.role === 'student') {
        window.location.href = 'student-home.html';
    } else if (currentUser.role === 'sponsor') {
        window.location.href = 'sponsor-dashboard.html';
    } else if (currentUser.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'index.html';
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
    loadProfile();
    setFormReadOnly(true); // Start in read-only mode
});

// Set form fields to read-only or editable
function setFormReadOnly(readOnly) {
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input:not([type="hidden"]):not(#email), select, textarea');
    
    inputs.forEach(input => {
        if (readOnly) {
            input.setAttribute('readonly', 'readonly');
            input.setAttribute('disabled', 'disabled');
            if (input.tagName === 'SELECT') {
                input.style.pointerEvents = 'none';
            }
        } else {
            input.removeAttribute('readonly');
            input.removeAttribute('disabled');
            if (input.tagName === 'SELECT') {
                input.style.pointerEvents = 'auto';
            }
        }
    });
    
    // Always keep email disabled
    document.getElementById('email').setAttribute('disabled', 'disabled');
    
    // Handle avatar selection
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.style.pointerEvents = readOnly ? 'none' : 'auto';
        option.style.opacity = readOnly ? '0.6' : '1';
    });
    
    // Handle change avatar button
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.style.display = readOnly ? 'none' : 'inline-block';
    }
    
    // Hide avatar selection when switching to read-only
    if (readOnly) {
        const avatarContainer = document.getElementById('avatarSelectionContainer');
        if (avatarContainer) {
            avatarContainer.style.display = 'none';
        }
    }
}

// Edit Profile button handler
document.getElementById('editProfileBtn').addEventListener('click', function() {
    setFormReadOnly(false);
    
    // Toggle button visibility
    document.getElementById('editProfileBtn').style.display = 'none';
    document.getElementById('saveProfileBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    document.getElementById('backBtn').style.display = 'none';
});

// Cancel Edit button handler
document.getElementById('cancelEditBtn').addEventListener('click', function() {
    // Reload profile to reset changes
    loadProfile();
    
    setFormReadOnly(true);
    
    // Toggle button visibility
    document.getElementById('editProfileBtn').style.display = 'inline-block';
    document.getElementById('saveProfileBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('backBtn').style.display = 'inline-block';
});

// Delete Account function
async function deleteAccount() {
    const confirmed = await notify.confirm(
        'Are you absolutely sure you want to delete your account? This action cannot be undone. All your data including applications, posts, and messages will be permanently deleted.'
    );
    
    if (!confirmed) {
        return;
    }
    
    // Second confirmation
    const doubleConfirmed = await notify.confirm(
        'Final confirmation: Delete your account permanently?'
    );
    
    if (!doubleConfirmed) {
        return;
    }
    
    try {
        await API.deleteAccount();
        notify.success('Account deleted successfully. You will be logged out.');
        
        // Wait a moment then logout
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Error deleting account:', error);
        notify.error(error.message || 'Failed to delete account');
    }
}
