// Messages.js - Messaging functionality

let currentConversation = null;
let currentRecipient = null;
let allConversations = [];
let messagePollingInterval = null;

// Check authentication
function checkAuth() {
    const currentUser = API.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    
    // Admin should not access messages
    if (currentUser.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
        return null;
    }
    
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    
    // Set navigation based on role
    const navLinks = document.getElementById('navLinks');
    if (currentUser.role === 'student') {
        navLinks.innerHTML = `
            <a href="student-home.html">Home</a>
            <a href="student-dashboard.html">Dashboard</a>
            <a href="messages.html" class="active">Messages</a>
            <a href="forum.html">Community Forum</a>
            <a href="profile.html">Profile</a>
        `;
    } else if (currentUser.role === 'sponsor') {
        navLinks.innerHTML = `
            <a href="sponsor-dashboard.html">Dashboard</a>
            <a href="messages.html" class="active">Messages</a>
            <a href="forum.html">Community Forum</a>
            <a href="profile.html">Profile</a>
        `;
    }
    
    return currentUser;
}

// Load conversations
async function loadConversations() {
    try {
        const data = await API.getConversations();
        allConversations = data.conversations;
        displayConversations(allConversations);
    } catch (error) {
        console.error('Error loading conversations:', error);
        document.getElementById('conversationsList').innerHTML = '<p class="error">Error loading conversations</p>';
    }
}

// Display conversations
function displayConversations(conversations) {
    const container = document.getElementById('conversationsList');
    const currentUser = API.getCurrentUser();
    
    // Add AI Assistant at the top
    let html = `
        <div class="conversation-item ai-assistant" onclick="openAIChat()">
            <div class="conversation-avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold;">
                AI
            </div>
            <div class="conversation-info">
                <div class="conversation-header-line">
                    <h4>Gemini Assistant</h4>
                    <span class="ai-badge" style="background: #667eea; color: white; padding: 0.2rem 0.5rem; border-radius: 0.5rem; font-size: 0.7rem;">AI</span>
                </div>
                <p class="conversation-role">Scholarship Advisor</p>
                <p class="conversation-preview" style="color: var(--text-secondary); font-size: 0.85rem;">Ask me anything about scholarships</p>
            </div>
        </div>
    `;
    
    if (conversations.length === 0) {
        html += '<p class="empty-state" style="margin-top: 1rem;">No other conversations yet</p>';
        container.innerHTML = html;
        return;
    }
    
    html += conversations.map(conv => {
        // find the other participant safely (IDs may be objects)
        const currentId = String(currentUser._id);
        const otherUser = conv.participants.find(p => String(p._id) !== currentId) || conv.participants[0];
        const unreadCount = (conv.unreadCount && (conv.unreadCount[currentId] || conv.unreadCount.get && conv.unreadCount.get(currentId))) || 0;
        const lastMessageTime = conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : '';
        const avatarUrl = (typeof getAvatarUrl === 'function') ? getAvatarUrl(otherUser.avatar) : (otherUser.avatar || '');

        return `
            <div class="conversation-item ${currentConversation?._id === conv._id ? 'active' : ''}" 
                 onclick="openConversation('${conv._id}')">
                <img src="${avatarUrl}" alt="${otherUser.firstName}" class="conversation-avatar">
                <div class="conversation-info">
                    <div class="conversation-header-line">
                        <h4>${otherUser.firstName} ${otherUser.lastName}</h4>
                        ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                    </div>
                    <p class="conversation-role">${otherUser.role}</p>
                    <p class="conversation-time">${lastMessageTime}</p>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Open conversation
async function openConversation(conversationId) {
    try {
        console.log('🔓 Opening conversation:', conversationId);
        
        currentConversation = allConversations.find(c => String(c._id) === String(conversationId));
        
        if (!currentConversation) {
            console.error('❌ Conversation not found in allConversations');
            return;
        }
        
        console.log('✅ Found conversation:', currentConversation);
        
        const currentUser = API.getCurrentUser();
        const currentId = String(currentUser._id);
        currentRecipient = currentConversation.participants.find(p => String(p._id) !== currentId) || currentConversation.participants[0];
        
        console.log('👤 Current recipient:', currentRecipient.firstName, currentRecipient.lastName);
        
        // Update UI
        const placeholder = document.getElementById('chatPlaceholder');
        const chatWindow = document.getElementById('chatWindow');
        
        console.log('🎨 Updating UI visibility...');
        placeholder.style.display = 'none';
        chatWindow.style.display = 'flex';
        console.log('   Placeholder display:', placeholder.style.display);
        console.log('   Chat window display:', chatWindow.style.display);
        
        // Mobile: Show chat panel
        if (window.innerWidth <= 968) {
            document.querySelector('.messages-container').classList.add('chat-active');
        }
        
        // Set chat header
        const chatAvatarUrl = (typeof getAvatarUrl === 'function') ? getAvatarUrl(currentRecipient.avatar) : (currentRecipient.avatar || '');
        const avatarImg = document.getElementById('chatUserAvatar');
        avatarImg.src = chatAvatarUrl;
        avatarImg.style.display = 'block';
        
        // Hide AI avatar if exists
        const aiAvatar = avatarImg.parentElement.querySelector('.ai-avatar-circle');
        if (aiAvatar) {
            aiAvatar.style.display = 'none';
        }
        
        document.getElementById('chatUserName').textContent = `${currentRecipient.firstName} ${currentRecipient.lastName}`;
        document.getElementById('chatUserRole').textContent = currentRecipient.role;
        
        console.log('💬 Chat header set');
        
        // Load messages
        await loadMessages(conversationId);
        
        // Update conversations list
        displayConversations(allConversations);
        
        // Start polling for new messages (every 10 seconds, not 5)
        if (messagePollingInterval) {
            clearInterval(messagePollingInterval);
        }
        messagePollingInterval = setInterval(() => {
            // Only poll if user isn't typing
            const messageInput = document.getElementById('messageInput');
            if (document.activeElement !== messageInput) {
                loadMessages(conversationId, false); // Don't auto-scroll on poll
            }
        }, 10000);
        
    } catch (error) {
        console.error('Error opening conversation:', error);
    }
}

// Close mobile chat (return to conversations list)
function closeMobileChat() {
    const messagesContainer = document.querySelector('.messages-container');
    messagesContainer.classList.remove('chat-active');
}

// Load messages
async function loadMessages(conversationId, scrollToBottom = true) {
    try {
        console.log('📥 Loading messages for conversation:', conversationId);
        const data = await API.getMessages(conversationId);
        console.log('✅ Messages loaded:', data.messages.length);
        displayMessages(data.messages, scrollToBottom);
    } catch (error) {
        console.error('❌ Error loading messages:', error);
    }
}

// Display messages
function displayMessages(messages, scrollToBottom = true) {
    const container = document.getElementById('messagesArea');
    const currentUser = API.getCurrentUser();
    
    console.log('🖼️ displayMessages called with', messages.length, 'messages');
    console.log('   Current user ID:', currentUser._id);
    console.log('   Container:', container);
    
    if (!container) {
        console.error('❌ CRITICAL: messagesArea container not found in DOM!');
        alert('Error: Messages container not found. Please refresh the page.');
        return;
    }
    
    // Save scroll position to detect if user was at bottom
    const wasAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    
    // Clear container first
    container.innerHTML = '';
    
    if (!messages || messages.length === 0) {
        container.innerHTML = '<p class="empty-state" style="text-align: center; padding: 40px; color: #64748b;">No messages yet. Start the conversation!</p>';
        console.log('   📭 No messages to display');
        return;
    }
    
    console.log('   📝 Rendering', messages.length, 'messages...');
    
    // Build messages HTML
    const messagesHTML = [];
    
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        if (!msg || !msg.sender) {
            console.warn(`   ⚠️ Message ${i} has no sender, skipping`);
            continue;
        }
        
        const isOwn = String(msg.sender._id) === String(currentUser._id);
        const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Get avatar - use a fallback if getAvatarUrl isn't available
        let avatarUrl = '';
        if (typeof getAvatarUrl === 'function' && msg.sender.avatar) {
            avatarUrl = getAvatarUrl(msg.sender.avatar);
        } else {
            avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.firstName}`;
        }
        
        console.log(`   Message ${i+1}:`, {
            sender: msg.sender.firstName,
            isOwn,
            content: msg.content?.substring(0, 30)
        });
        
        const messageHTML = `
            <div class="message ${isOwn ? 'message-own' : 'message-other'}" style="display: flex; gap: 0.75rem; max-width: 70%; margin-bottom: 1rem; ${isOwn ? 'align-self: flex-end; flex-direction: row-reverse;' : 'align-self: flex-start;'}">
                ${!isOwn ? `<img src="${avatarUrl}" alt="${msg.sender.firstName}" class="message-avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">` : ''}
                <div class="message-content" style="background-color: ${isOwn ? '#0066cc' : '#f1f5f9'}; color: ${isOwn ? 'white' : 'black'}; padding: 0.75rem 1rem; border-radius: 12px;">
                    ${msg.content ? `<p style="margin: 0; word-wrap: break-word;">${escapeHtml(msg.content)}</p>` : ''}
                    ${msg.attachment && msg.attachment.path && msg.attachment.filename ? `
                        <div class="message-attachment" style="margin-top: 0.5rem;">
                            <a href="${msg.attachment.path}" target="_blank" style="color: ${isOwn ? 'white' : '#0066cc'};">
                                📎 ${escapeHtml(msg.attachment.filename)}
                            </a>
                        </div>
                    ` : ''}
                    <span class="message-time" style="font-size: 0.75rem; color: ${isOwn ? 'rgba(255,255,255,0.8)' : '#64748b'}; margin-top: 0.5rem; display: block;">${time}</span>
                </div>
            </div>
        `;
        
        messagesHTML.push(messageHTML);
    }
    
    // Insert all messages at once
    container.innerHTML = messagesHTML.join('');
    
    console.log('   ✅ Messages HTML inserted');
    console.log('   📦 Container now has', container.children.length, 'child elements');
    
    // Only scroll if requested AND user was already at bottom
    if (scrollToBottom && wasAtBottom) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
            console.log('   📜 Scrolled to bottom');
        }, 50);
    } else {
        console.log('   📍 Maintaining scroll position');
    }
}

// Helper to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Send message
document.getElementById('messageForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendMessage();
});

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    console.log('Attempting to send message:', { content, conversation: currentConversation?._id });
    
    if (!content) {
        console.log('No content to send');
        return;
    }
    
    // Check if chatting with AI
    if (currentRecipient && currentRecipient._id === 'gemini-ai') {
        input.value = '';
        await sendAIMessage(content);
        return;
    }
    
    if (!currentConversation) {
        alert('Please select a conversation');
        return;
    }
    
    try {
    console.log('Calling API.sendMessage...');
    const result = await API.sendMessage(currentConversation._id, content);
    console.log('Message sent:', result);
        
    // Clear input
    input.value = '';
    // Reload messages
    console.log('Reloading messages...');
    await loadMessages(currentConversation._id);
    await loadConversations();
    console.log('Messages reloaded');
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message: ' + error.message);
    }
}

// Show attachment preview
// Attachment input removed

function clearAttachment() {
    document.getElementById('attachmentInput').value = '';
    document.getElementById('attachmentPreview').style.display = 'none';
}

// Utility functions
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (ext === 'zip') return '📦';
    return '📎';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Logout
function logout() {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (user) {
        loadConversations();
        
        // Check for recipient in URL (for direct messaging)
        const urlParams = new URLSearchParams(window.location.search);
        const recipientId = urlParams.get('recipient');
        if (recipientId) {
            startConversationWithUser(recipientId);
        }
        
        // Setup mobile back button
        const backButton = document.getElementById('mobileBackButton');
        if (backButton) {
            backButton.addEventListener('click', closeMobileChat);
        }

        // Make chat user name clickable to view profile
        const chatUserName = document.getElementById('chatUserName');
        if (chatUserName) {
            chatUserName.addEventListener('click', () => {
                // Get user ID from currentRecipient or currentConversation
                let userId = null;
                if (currentRecipient && currentRecipient._id) {
                    userId = currentRecipient._id;
                } else if (currentConversation && currentConversation.participants) {
                    // Fallback: get the other participant
                    const currentUser = API.getCurrentUser();
                    userId = currentConversation.participants.find(id => id !== currentUser._id);
                }
                if (userId) {
                    window.location.href = `profile.html?user=${userId}`;
                } else {
                    alert('User profile not found.');
                }
            });
        }
    }
});

// Start conversation with specific user
async function startConversationWithUser(recipientId) {
    try {
        console.log('🚀 Starting conversation with recipient:', recipientId);
        const data = await API.createOrGetConversation(recipientId);
        console.log('✅ Conversation created/retrieved:', data.conversation);
        await loadConversations();
        openConversation(data.conversation._id);
    } catch (error) {
        console.error('❌ Error starting conversation:', error);
        alert('Error starting conversation: ' + error.message);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
});

// AI Chat Functionality
let aiChatHistory = [];

function openAIChat() {
    currentConversation = null;
    currentRecipient = {
        _id: 'gemini-ai',
        firstName: 'Gemini',
        lastName: 'Assistant',
        role: 'AI Advisor',
        avatar: 'ai-assistant'
    };
    
    // Update UI
    document.getElementById('chatPlaceholder').style.display = 'none';
    document.getElementById('chatWindow').style.display = 'flex';
    
    // Mobile: Show chat panel
    if (window.innerWidth <= 968) {
        document.querySelector('.messages-container').classList.add('chat-active');
    }
    
    // Update chat header with correct IDs
    document.getElementById('chatUserName').textContent = 'Gemini Assistant';
    document.getElementById('chatUserRole').textContent = 'AI Scholarship Advisor';
    
    const avatarImg = document.getElementById('chatUserAvatar');
    avatarImg.style.display = 'none';
    const avatarDiv = avatarImg.parentElement;
    let aiAvatar = avatarDiv.querySelector('.ai-avatar-circle');
    if (!aiAvatar) {
        aiAvatar = document.createElement('div');
        aiAvatar.className = 'ai-avatar-circle';
        aiAvatar.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;';
        aiAvatar.textContent = 'AI';
        avatarDiv.appendChild(aiAvatar);
    }
    aiAvatar.style.display = 'flex';
    
    // Display AI welcome message if empty
    displayAIMessages();
    
    // Update active conversation UI
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.ai-assistant')?.classList.add('active');
    
    // Stop polling for regular messages
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
        messagePollingInterval = null;
    }
}

function displayAIMessages() {
    const messagesArea = document.getElementById('messagesArea');
    const currentUser = API.getCurrentUser();
    
    if (aiChatHistory.length === 0) {
        messagesArea.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">AI</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">Gemini Assistant</span>
                        <span class="message-time">Just now</span>
                    </div>
                    <div class="message-text">
                        <p>Hello! I'm your AI scholarship advisor. I can help you with:</p>
                        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                            <li>Finding suitable scholarships</li>
                            <li>Application tips and guidance</li>
                            <li>Eligibility requirements</li>
                            <li>Essay writing advice</li>
                            <li>Interview preparation</li>
                        </ul>
                        <p>How can I assist you today?</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        messagesArea.innerHTML = aiChatHistory.map(msg => {
            if (msg.role === 'user') {
                return `
                    <div class="message sent">
                        <div class="message-content">
                            <div class="message-header">
                                <span class="message-sender">You</span>
                                <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div class="message-text">${msg.text}</div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="message ai-message">
                        <div class="message-avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">AI</div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="message-sender">Gemini Assistant</span>
                                <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div class="message-text">${msg.text.replace(/\n/g, '<br>')}</div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }
    
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

async function sendAIMessage(messageText) {
    const currentUser = API.getCurrentUser();
    
    // Add user message to history
    aiChatHistory.push({
        role: 'user',
        text: messageText,
        timestamp: new Date()
    });
    
    displayAIMessages();
    
    // Show typing indicator
    const messagesArea = document.getElementById('messagesArea');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">AI</div>
        <div class="message-content">
            <div class="message-text">Typing...</div>
        </div>
    `;
    messagesArea.appendChild(typingDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    try {
        // Fetch available scholarships
        const scholarships = await API.getScholarships();
        
        // Build scholarship list for AI context
        const scholarshipInfo = scholarships.map(s => 
            `${s.title} (Type: ${s.scholarshipType}, Region: ${s.region}, Institution: ${s.affiliatedInstitution}, Deadline: ${new Date(s.deadline).toLocaleDateString()})`
        ).join('; ');
        
        // Build context from chat history
        const context = aiChatHistory.slice(-5).map(msg => 
            `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.text}`
        ).join('\n');
        
        const prompt = `You are a helpful scholarship advisor chatbot. The user is ${currentUser.role === 'student' ? 'a student' : 'a scholarship sponsor'}.

AVAILABLE SCHOLARSHIPS:
${scholarshipInfo || 'No scholarships currently available'}

Chat History:
${context}

Current question: ${messageText}

IMPORTANT FORMATTING RULES:
1. Do NOT use asterisks (*) for emphasis or bullets
2. Do NOT use hyphens (-) or dashes for bullets
3. Use numbers (1, 2, 3) or letters (a, b, c) for lists instead
4. Use simple punctuation only
5. Keep responses conversational and easy to read
6. Avoid markdown formatting

Provide helpful, concise advice about scholarships, applications, eligibility, or related topics. When recommending scholarships, mention specific ones from the available list above. Keep responses under 200 words. Use a friendly, professional tone.`;
        
        const response = await GeminiAPI.generateContent(prompt);
        
        // Remove typing indicator
        typingDiv.remove();
        
        // Clean up response (remove any remaining special characters)
        const cleanResponse = response
            .replace(/\*\*/g, '')  // Remove bold markdown
            .replace(/\*/g, '')    // Remove asterisks
            .replace(/^[\-\*]\s/gm, '') // Remove bullet points at start of lines
            .replace(/[\-\*]\s/g, '')   // Remove remaining bullets
            .trim();
        
        // Add AI response to history
        aiChatHistory.push({
            role: 'assistant',
            text: cleanResponse,
            timestamp: new Date()
        });
        
        displayAIMessages();
        
    } catch (error) {
        console.error('AI chat error:', error);
        typingDiv.remove();
        
        aiChatHistory.push({
            role: 'assistant',
            text: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date()
        });
        
        displayAIMessages();

    }
}



