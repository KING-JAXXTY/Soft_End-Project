// API.js - Real Backend API Integration
// Base URL for API calls
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

// Cache for API responses (5 minute TTL)
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Expose cache globally for manual clearing
window.apiCache = apiCache;

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Helper function to get auth headers
function getAuthHeaders() {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Helper function for API calls with caching
async function apiCall(endpoint, options = {}) {
    try {
        const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        
        // Check cache for GET requests
        if ((!options.method || options.method === 'GET') && apiCache.has(cacheKey)) {
            const cached = apiCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                console.log(`📦 Using cached data for: ${endpoint}`);
                return cached.data;
            } else {
                apiCache.delete(cacheKey);
            }
        }
        
        console.log(`🌐 API Call: ${options.method || 'GET'} ${endpoint}`);
        
        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers: {
                ...getAuthHeaders(),
                ...options.headers
            }
        });
        
        clearTimeout(timeoutId);

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Non-JSON response received');
            throw new Error('Server returned non-JSON response. Please check if the server is running.');
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ API Error:', data.message);
            throw new Error(data.message || 'API request failed');
        }
        
        // Cache successful GET requests
        if (!options.method || options.method === 'GET') {
            apiCache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
        } else {
            // Clear cache on mutations
            apiCache.clear();
        }

        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('❌ Request timeout');
            throw new Error('Request timed out. Please check your connection.');
        }
        console.error('❌ API Error:', error);
        throw error;
    }
}

// API Object with all methods
const API = {
    // ==================== AUTHENTICATION ====================
    
    async register(userData) {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (data.success && data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        
        return data;
    },

    async login(email, password) {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        console.log('🔐 Login response:', data);
        console.log('👤 User data:', data.user);
        console.log('🎭 User role:', data.user?.role);
        
        if (data.success && data.token && data.user) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            console.log('✅ Stored in localStorage:', {
                token: data.token,
                user: data.user
            });
        } else {
            console.error('❌ Login failed - missing data:', {
                success: data.success,
                hasToken: !!data.token,
                hasUser: !!data.user
            });
        }
        
        return data;
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        return { success: true };
    },

    async checkAuth() {
        try {
            const data = await apiCall('/auth/me', {
                method: 'GET'
            });
            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
            }
            return data;
        } catch (error) {
            this.logout();
            throw error;
        }
    },

    async verifyAccount(email, phone) {
        const data = await apiCall('/auth/verify-account', {
            method: 'POST',
            body: JSON.stringify({ email, phone })
        });
        return data;
    },

    async resetPassword(userId, newPassword) {
        const data = await apiCall('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ userId, newPassword })
        });
        return data;
    },

    // ==================== SCHOLARSHIPS ====================
    
    async getScholarships(filters = {}) {
        console.log('=== API.getScholarships ===');
        console.log('Input filters:', filters);
        
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.search) params.append('search', filters.search);
        if (filters.region) params.append('region', filters.region);
        if (filters.status) params.append('status', filters.status);
        
        const queryString = params.toString();
        const endpoint = `/scholarships${queryString ? '?' + queryString : ''}`;
        
        console.log('API endpoint:', endpoint);
        console.log('Query params:', queryString);
        
        const data = await apiCall(endpoint, { method: 'GET' });
        console.log('API response:', data);
        return data.scholarships || [];
    },

    async getScholarship(id) {
        const data = await apiCall(`/scholarships/${id}`, { method: 'GET' });
        return data.scholarship;
    },

    async getScholarshipById(id) {
        return this.getScholarship(id);
    },

    async getSponsorScholarships() {
        const data = await apiCall('/scholarships/sponsor/my-scholarships', { method: 'GET' });
        return data.scholarships || [];
    },

    async createScholarship(scholarshipData) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        formData.append('title', scholarshipData.title);
        formData.append('description', scholarshipData.description);
        
        // Add optional fields only if they exist
        if (scholarshipData.amount) formData.append('amount', scholarshipData.amount);
        if (scholarshipData.benefits) formData.append('benefits', scholarshipData.benefits);
        if (scholarshipData.selectionCriteria) formData.append('selectionCriteria', scholarshipData.selectionCriteria);
        if (scholarshipData.contactEmail) formData.append('contactEmail', scholarshipData.contactEmail);
        if (scholarshipData.contactPhone) formData.append('contactPhone', scholarshipData.contactPhone);
        if (scholarshipData.applicationLink) formData.append('applicationLink', scholarshipData.applicationLink);
        if (scholarshipData.renewalPolicy) formData.append('renewalPolicy', scholarshipData.renewalPolicy);
        
        formData.append('scholarshipType', scholarshipData.scholarshipType);
        formData.append('deadline', scholarshipData.deadline);
        formData.append('requirements', JSON.stringify(scholarshipData.requirements || []));
        formData.append('eligibility', scholarshipData.eligibilityRequirements || scholarshipData.eligibility);
        formData.append('documentsRequired', scholarshipData.documentsRequired || '');
        formData.append('availableSlots', scholarshipData.availableSlots || 1);
        formData.append('region', scholarshipData.region || '');
        formData.append('affiliatedInstitution', scholarshipData.affiliatedInstitution || '');
        formData.append('latitude', scholarshipData.latitude);
        formData.append('longitude', scholarshipData.longitude);
        formData.append('address', scholarshipData.address || '');
        
        // Append files
        if (scholarshipData.documents && scholarshipData.documents.length > 0) {
            scholarshipData.documents.forEach(file => {
                formData.append('documents', file);
            });
        }
        
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/scholarships`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create scholarship');
        }

        return data;
    },

    async updateScholarship(id, scholarshipData) {
        const data = await apiCall(`/scholarships/${id}`, {
            method: 'PUT',
            body: JSON.stringify(scholarshipData)
        });
        return data.scholarship;
    },

    async deleteScholarship(id) {
        const data = await apiCall(`/scholarships/${id}`, {
            method: 'DELETE'
        });
        return data;
    },

    // ==================== APPLICATIONS ====================
    
    async applyForScholarship(applicationData) {
        console.log('📝 Applying with data:', applicationData);
        console.log('🎯 Scholarship ID:', applicationData.scholarshipId);
        
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                scholarshipId: applicationData.scholarshipId,
                coverLetter: applicationData.coverLetter,
                documentsLink: applicationData.documentsLink,
                additionalInfo: applicationData.additionalInfo || ''
            })
        });

        const data = await response.json();
        console.log('📥 Response received:', { status: response.status, data });
        
        if (!response.ok) {
            console.error('❌ Application failed:', data.message);
            const errorMessage = data.message || 'Failed to submit application';
            throw new Error(errorMessage);
        }

        console.log('✅ Application successful');
        return data;
    },

    async getStudentApplications() {
        const data = await apiCall('/applications/student/my-applications', { method: 'GET' });
        return data.applications || [];
    },

    async getSponsorApplications() {
        const data = await apiCall('/applications/sponsor/received', { method: 'GET' });
        return data.applications || [];
    },

    async getApplication(id) {
        const data = await apiCall(`/applications/${id}`, { method: 'GET' });
        return data.application;
    },

    async updateApplicationStatus(id, status, reviewNotes = '') {
        const data = await apiCall(`/applications/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, reviewNotes })
        });
        return data.application;
    },

    async deleteApplication(id) {
        try {
            console.log('🗑️ API: Deleting application:', id);
            const data = await apiCall(`/applications/${id}`, {
                method: 'DELETE'
            });
            console.log('✅ API: Delete successful:', data);
            
            // Clear entire cache after deletion
            apiCache.clear();
            console.log('🧹 API: Cache cleared');
            
            return data;
        } catch (error) {
            console.error('❌ API: Error deleting application:', error);
            throw error;
        }
    },

    // ==================== USERS ====================
    
    async getAllUsers(role = null) {
        const params = role ? `?role=${role}` : '';
        const data = await apiCall(`/users${params}`, { method: 'GET' });
        return data.users || [];
    },

    async deleteUser(id) {
        const data = await apiCall(`/users/${id}`, {
            method: 'DELETE'
        });
        return data;
    },

    async getStatistics() {
        try {
            // Use public endpoint that doesn't require authentication
            const data = await apiCall('/users/public-statistics', { method: 'GET' });
            return data;
        } catch (error) {
            console.error('Error getting statistics:', error);
            return { success: false, data: { totalScholarships: 0, totalStudents: 0, totalSponsors: 0 } };
        }
    },

    async getAdminStatistics() {
        try {
            // Admin-only endpoint with detailed statistics
            const data = await apiCall('/users/statistics', { method: 'GET' });
            return data.statistics || data.data || {};
        } catch (error) {
            console.error('Error getting admin statistics:', error);
            return {};
        }
    },

    // ==================== PROFILE ====================
    
    async getProfile() {
        const data = await apiCall('/profile', { method: 'GET' });
        return data.profile;
    },

    async getUserProfile(userId) {
        const data = await apiCall(`/profile/${userId}`, { method: 'GET' });
        return data;
    },

    async updateProfile(profileData) {
        const data = await apiCall('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        return data.profile;
    },

    async deleteAccount() {
        const data = await apiCall('/users/account', {
            method: 'DELETE'
        });
        return data;
    },

    async uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/profile/picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload profile picture');
        }

        return data.profilePicture;
    },

    // ==================== FORUM ====================
    
    async getForumPosts(category = null) {
        const params = category && category !== 'all' ? `?category=${category}` : '';
        const data = await apiCall(`/forum/posts${params}`, { method: 'GET' });
        return data.posts || [];
    },

    async getForumPost(id) {
        const data = await apiCall(`/forum/posts/${id}`, { method: 'GET' });
        return data.post;
    },

    async createForumPost(postData) {
        const data = await apiCall('/forum/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
        return data;
    },

    async addComment(postId, content) {
        const data = await apiCall(`/forum/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        return data.post;
    },

    async createForumComment(postId, content) {
        return this.addComment(postId, content);
    },

    async getForumComments(postId) {
        const post = await this.getForumPost(postId);
        return post.comments || [];
    },

    async likePost(postId) {
        const data = await apiCall(`/forum/posts/${postId}/like`, {
            method: 'PUT'
        });
        return data;
    },

    async deleteForumPost(postId) {
        const data = await apiCall(`/forum/posts/${postId}`, {
            method: 'DELETE'
        });
        return data;
    },

    async deleteForumComment(postId, commentId) {
        const data = await apiCall(`/forum/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE'
        });
        return data;
    },

    // ==================== FAVORITES ====================
    
    async getFavorites() {
        try {
            const data = await apiCall('/scholarships/favorites', { method: 'GET' });
            return data.favorites || [];
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    },

    async addFavorite(scholarshipId) {
        try {
            const data = await apiCall(`/scholarships/${scholarshipId}/favorite`, {
                method: 'POST'
            });
            return data;
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    },

    async removeFavorite(scholarshipId) {
        try {
            const data = await apiCall(`/scholarships/${scholarshipId}/favorite`, {
                method: 'DELETE'
            });
            return data;
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    },

    async isFavorite(scholarshipId) {
        try {
            const favorites = await this.getFavorites();
            return favorites.some(fav => fav._id === scholarshipId);
        } catch (error) {
            console.error('Error checking favorite:', error);
            return false;
        }
    },

    // ==================== MESSAGES ====================
    
    async createOrGetConversation(recipientId) {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/messages/conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipientId })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create conversation');
        }

        return data;
    },

    async getConversations() {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch conversations');
        }

        return data;
    },

    async getMessages(conversationId) {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch messages');
        }

        return data;
    },

    async sendMessage(conversationId, content, file = null) {
        const formData = new FormData();
        formData.append('conversationId', conversationId);
        if (content) {
            formData.append('content', content);
        }
        if (file) {
            formData.append('attachment', file);
        }

        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send message');
        }

        return data;
    },

    // ==================== ACTIVITY ====================
    
    async getRecentActivity() {
        const data = await apiCall('/activity/recent', { method: 'GET' });
        return data.activities || [];
    },

    // ==================== REPORTS ====================
    
    async submitReport(reportData) {
        const data = await apiCall('/reports', {
            method: 'POST',
            body: JSON.stringify(reportData)
        });
        return data;
    },

    async getAllReports(filters = {}) {
        let query = '';
        if (filters.status) query += `?status=${filters.status}`;
        if (filters.reportType) query += query ? `&reportType=${filters.reportType}` : `?reportType=${filters.reportType}`;
        
        const data = await apiCall(`/reports${query}`, { method: 'GET' });
        return data;
    },

    async getReport(id) {
        const data = await apiCall(`/reports/${id}`, { method: 'GET' });
        return data.report;
    },

    async updateReportStatus(id, statusData) {
        const data = await apiCall(`/reports/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(statusData)
        });
        return data;
    },

    async getMyReports() {
        const data = await apiCall('/reports/my-reports', { method: 'GET' });
        return data;
    },

    async searchUserById(userId) {
        const data = await apiCall(`/reports/search?userId=${userId}`, { method: 'GET' });
        return data;
    },

    async getReportsStats() {
        const data = await apiCall('/reports/stats/summary', { method: 'GET' });
        return data.stats;
    },

    async getUserReports(userId) {
        const data = await apiCall(`/reports/user/${userId}`, { method: 'GET' });
        return data;
    },

    async suspendUser(userId, reason, duration, isPermanent) {
        const data = await apiCall(`/users/${userId}/suspend`, {
            method: 'PUT',
            body: JSON.stringify({ reason, duration, isPermanent })
        });
        return data;
    },

    async unsuspendUser(userId) {
        const data = await apiCall(`/users/${userId}/unsuspend`, {
            method: 'PUT'
        });
        return data;
    },

    async warnUser(userId, reason) {
        const data = await apiCall(`/users/${userId}/warn`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        });
        return data;
    },

    async removeWarnings(userId) {
        const data = await apiCall(`/users/${userId}/warnings`, {
            method: 'DELETE'
        });
        return data;
    },

    async getUserStatus(userId) {
        const data = await apiCall(`/users/${userId}/status`, { method: 'GET' });
        return data.status;
    },

    async migrateUserIds() {
        const data = await apiCall('/users/migrate-unique-ids', {
            method: 'POST'
        });
        return data;
    },

    // Gemini AI Integration
    async getGeminiResponse(prompt) {
        const data = await apiCall('/gemini/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt })
        });
        return data.text;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
