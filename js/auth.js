// Auth.js - Login and Registration functionality
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

// Update municipalities based on selected region
function updateMunicipalities(region) {
    const select = document.getElementById('province');
    if (!select) return;
    
    const municipalities = municipalitiesByRegion[region] || [];
    
    select.innerHTML = '<option value="">Select City/Municipality</option>';
    municipalities.forEach(municipality => {
        const option = document.createElement('option');
        option.value = municipality;
        option.textContent = municipality;
        select.appendChild(option);
    });
}

// Login Form Handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear any existing corrupted data first
        localStorage.clear();
        sessionStorage.clear();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.style.display = 'none';
        
        try {
            console.log('📧 Attempting login for:', email);
            console.log('💾 Remember Me:', rememberMe);
            
            const result = await API.login(email, password, rememberMe);
            
            console.log('✅ Full login response:', result);
            
            // Verify we got all required data
            if (!result) {
                throw new Error('No response from server');
            }
            
            if (!result.success) {
                throw new Error(result.message || 'Login failed');
            }
            
            if (!result.user) {
                throw new Error('No user data in response');
            }
            
            if (!result.user.role) {
                throw new Error('No role in user data');
            }
            
            const role = result.user.role;
            console.log('🎭 User role confirmed:', role);
            
            // Redirect based on role
            let redirectUrl = '';
            switch(role) {
                case 'student':
                    redirectUrl = 'student-home.html';
                    break;
                case 'sponsor':
                    redirectUrl = 'sponsor-dashboard.html';
                    break;
                case 'admin':
                    redirectUrl = 'admin-dashboard.html';
                    break;
                default:
                    throw new Error('Invalid user role: ' + role);
            }
            
            console.log('🚀 Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
            
        } catch (error) {
            console.error('❌ Login error:', error);
            errorMessage.textContent = error.message || 'Login failed';
            errorMessage.style.display = 'block';
            
            // Clear any partial data
            localStorage.clear();
            sessionStorage.clear();
        }
    });
}

// Register Form Handler
if (document.getElementById('registerForm')) {
    // Avatar selection
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const avatarInput = document.getElementById('avatar');
    
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            avatarInput.value = this.dataset.avatar;
        });
    });
    
    // Region change handler
    const regionSelect = document.getElementById('region');
    if (regionSelect) {
        regionSelect.addEventListener('change', function() {
            updateMunicipalities(this.value);
        });
    }
    
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorMessage = document.getElementById('errorMessage');
        
        // Validate password match
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.style.display = 'block';
            return;
        }
        
        const userData = {
            email: document.getElementById('email').value,
            password: password,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            contactNumber: document.getElementById('contactNumber').value,
            region: document.getElementById('region').value,
            province: document.getElementById('province').value,
            role: document.getElementById('role').value,
            avatar: avatarInput.value
        };
        
        try {
            const result = await API.register(userData);
            
            if (result.success) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = API.getCurrentUser();
    
    // Auto-clear corrupted cache if user exists but has no role
    if (currentUser && !currentUser.role) {
        console.warn('⚠️ Detected corrupted user data - auto-clearing cache');
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
        return;
    }
    
    if (currentUser && currentUser.role && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        if (currentUser.role === 'student') {
            window.location.href = 'student-home.html';
        } else if (currentUser.role === 'sponsor') {
            window.location.href = 'sponsor-dashboard.html';
        } else if (currentUser.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        }
    }
});
