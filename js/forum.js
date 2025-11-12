// Forum functionality

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
            <a href="forum.html" class="active">Community Forum</a>
            <a href="profile.html">Profile</a>
        `;
    } else if (currentUser.role === 'sponsor') {
        navLinks.innerHTML = `
            <a href="sponsor-dashboard.html">Dashboard</a>
            <a href="messages.html">Messages</a>
            <a href="forum.html" class="active">Community Forum</a>
            <a href="profile.html">Profile</a>
        `;
    } else if (currentUser.role === 'admin') {
        navLinks.innerHTML = `
            <a href="admin-dashboard.html">Dashboard</a>
            <a href="forum.html" class="active">Community Forum</a>
            <a href="profile.html">Profile</a>
        `;
    }
    
    return currentUser;
}

let allPosts = [];

// Load forum posts
async function loadPosts() {
    try {
        const posts = await API.getForumPosts();
        allPosts = posts;
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Display posts
function displayPosts(posts) {
    const container = document.getElementById('forumPosts');
    const emptyState = document.getElementById('emptyState');
    const currentUser = API.getCurrentUser();
    
    if (posts.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = posts.map(post => {
        const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Anonymous';
        const authorRole = post.author ? post.author.role : 'user';
        const authorAvatar = post.author?.avatar || 'avatar1';
        const authorId = post.author?._id || '';
        const avatarUrl = getAvatarUrl(authorAvatar);
        const commentCount = post.comments ? post.comments.length : 0;
        // Compare IDs as strings to handle ObjectId
        const isOwnPost = currentUser && String(authorId) === String(currentUser._id);
        const isAdmin = currentUser && currentUser.role === 'admin';
        const canDelete = isOwnPost || isAdmin;
        
        console.log('Post check:', { authorId, currentUserId: currentUser?._id, isOwnPost, isAdmin });
        
        return `
            <div class="forum-post-card">
                <div class="post-header">
                    <div class="post-author" onclick="event.stopPropagation(); viewUserProfile('${authorId}')">
                        <div class="post-author-avatar clickable">
                            <img src="${avatarUrl}" alt="${authorName}" />
                        </div>
                        <div class="post-author-info">
                            <strong class="clickable-name">${authorName}</strong>
                            <span class="badge badge-${authorRole}">${authorRole}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                        ${canDelete ? `<button onclick="event.stopPropagation(); deletePost('${post._id}')" class="btn-delete-small" title="${isAdmin && !isOwnPost ? 'Delete post (Admin)' : 'Delete post'}">Delete</button>` : ''}
                    </div>
                </div>
                <div onclick="viewPost('${post._id}')">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-content">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
                    <div class="post-footer">
                        <span class="post-stats">${commentCount} comments</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Search posts
function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm) {
        const filtered = allPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.content.toLowerCase().includes(searchTerm)
        );
        displayPosts(filtered);
    } else {
        displayPosts(allPosts);
    }
}

// Show new post modal
function showNewPostModal() {
    document.getElementById('newPostModal').style.display = 'block';
}

// Close new post modal
function closeNewPostModal() {
    document.getElementById('newPostModal').style.display = 'none';
    document.getElementById('newPostForm').reset();
}

// Handle new post submission
// Grammar check button logic
document.getElementById('grammarCheckBtn').addEventListener('click', async function() {
    const textarea = document.getElementById('postContent');
    const originalText = textarea.value.trim();
    if (!originalText) {
        notify.warning('Please enter some content to check.');
        return;
    }
    const btn = this;
    btn.disabled = true;
    btn.textContent = 'Checking...';
    try {
        const corrected = await GeminiAPI.grammarCheck(originalText);
        if (corrected && corrected !== originalText) {
            // Show corrected text for review
            const review = await notify.confirmText('Grammar Check Result', corrected, 'Replace original with corrected?');
            if (review) {
                textarea.value = corrected;
            }
        } else {
            notify.info('No grammar improvements found.');
        }
    } catch (err) {
        notify.error('Grammar check failed.');
    }
    btn.disabled = false;
    btn.textContent = 'Check Grammar';
});
document.getElementById('newPostForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    
    // Validate inputs
    if (!title || !content) {
        alert('Please provide both title and content');
        return;
    }
    
    if (title.length > 200) {
        alert('Title must be 200 characters or less');
        return;
    }
    
    if (content.length > 5000) {
        notify.error('Content must be 5000 characters or less');
        return;
    }
    
    const postData = {
        title: title,
        content: content
    };
    
    // Disable submit button to prevent double-clicking
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking content...';
    
    try {
        // AI MODERATION CHECK
        console.log('🤖 AI Moderation: Analyzing post...');
        const moderation = await GeminiAPI.moderatePost(title, content);
        console.log('🤖 AI Moderation Result:', moderation);
        
        if (moderation.shouldDelete || moderation.isInappropriate) {
            notify.error(`Post blocked: ${moderation.reason}`);
            notify.warning('Please revise your post to follow community guidelines.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
        
        if (moderation.category === 'off-topic') {
            const proceed = await notify.confirm(
                'This post may be off-topic for a scholarship forum. Do you want to post it anyway?'
            );
            if (!proceed) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
        }
        
        submitBtn.textContent = 'Posting...';
        console.log('Creating post with data:', postData);
        const result = await API.createForumPost(postData);
        console.log('Post creation result:', result);
        
        if (result && result.success) {
            // Close modal first
            closeNewPostModal();
            // Reload posts to show the new one
            await loadPosts();
            notify.success('Post created successfully!');
        } else {
            notify.error(result?.message || 'Error creating post');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error creating post:', error);
        notify.error('Failed to create post. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// View post details
async function viewPost(postId) {
    try {
        const post = allPosts.find(p => p._id === postId);
        const comments = await API.getForumComments(postId);
        
        showPostDetail(post, comments);
    } catch (error) {
        alert('Error loading post details');
    }
}

// Show post detail modal
function showPostDetail(post, comments) {
    const detailContainer = document.getElementById('postDetail');
    const currentUser = API.getCurrentUser();
    
    const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Anonymous';
    const authorRole = post.author ? post.author.role : 'user';
    const authorAvatar = post.author?.avatar || 'avatar1';
    const authorId = post.author?._id || '';
    const avatarUrl = getAvatarUrl(authorAvatar);
    // Compare IDs as strings to handle ObjectId
    const isOwnPost = currentUser && String(authorId) === String(currentUser._id);
    const isAdmin = currentUser && currentUser.role === 'admin';
    const canDeletePost = isOwnPost || isAdmin;
    
    console.log('Post detail check:', { authorId, currentUserId: currentUser?._id, isOwnPost, isAdmin });
    
    detailContainer.innerHTML = `
        <div class="post-detail">
            <div class="post-detail-header">
                <div class="post-detail-author" onclick="viewUserProfile('${authorId}')" style="cursor: pointer;">
                    <div class="post-author-avatar clickable">
                        <img src="${avatarUrl}" alt="${authorName}" />
                    </div>
                    <div class="post-detail-meta">
                        <h2>${post.title}</h2>
                        <div class="post-meta">
                            <span><strong class="clickable-name">${authorName}</strong></span>
                            <span class="badge badge-${authorRole}">${authorRole}</span>
                            <span>${new Date(post.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="post-detail-content">
                <p>${post.content}</p>
            </div>
            
            <div class="comments-section">
                <h3>Comments (${comments.length})</h3>
                
                <div class="comment-form">
                    <textarea id="commentText" rows="3" placeholder="Write a comment..."></textarea>
                    <button onclick="submitComment('${post._id}')" class="btn-primary">Post Comment</button>
                </div>
                
                <div class="comments-list">
                    ${comments.map(comment => {
                        const commentAuthorName = comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'Anonymous';
                        const commentAuthorRole = comment.author ? comment.author.role : 'user';
                        const commentAvatar = comment.author?.avatar || 'avatar1';
                        const commentAuthorId = comment.author?._id || '';
                        const commentAvatarUrl = getAvatarUrl(commentAvatar);
                        // Compare IDs as strings to handle ObjectId
                        const isOwnComment = currentUser && String(commentAuthorId) === String(currentUser._id);
                        const canDeleteComment = isOwnComment || isAdmin;
                        return `
                            <div class="comment-item">
                                <div class="comment-author-avatar clickable" onclick="viewUserProfile('${commentAuthorId}')" title="View ${commentAuthorName}'s profile">
                                    <img src="${commentAvatarUrl}" alt="${commentAuthorName}" />
                                </div>
                                <div class="comment-content">
                                    <div class="comment-header">
                                        <strong class="clickable-name" onclick="viewUserProfile('${commentAuthorId}')" style="cursor: pointer;">${commentAuthorName}</strong>
                                        <span class="badge badge-${commentAuthorRole}">${commentAuthorRole}</span>
                                        <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                                        ${canDeleteComment ? `<button onclick="deleteComment('${post._id}', '${comment._id}')" class="btn-delete-small" title="${isAdmin && !isOwnComment ? 'Delete comment (Admin)' : 'Delete comment'}">Delete</button>` : ''}
                                    </div>
                                    <p class="comment-text">${comment.content}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    ${comments.length === 0 ? '<p class="empty-message">No comments yet. Be the first to comment!</p>' : ''}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('postDetailModal').style.display = 'block';
}

// Close post detail modal
function closePostDetailModal() {
    document.getElementById('postDetailModal').style.display = 'none';
}

// Show My Posts modal
function showMyPosts() {
    const currentUser = API.getCurrentUser();
    if (!currentUser) {
        alert('Please log in to view your posts');
        return;
    }
    
    // Filter posts by current user
    const myPosts = allPosts.filter(post => String(post.author._id) === String(currentUser._id || currentUser.id));
    
    const myPostsList = document.getElementById('myPostsList');
    
    if (myPosts.length === 0) {
        myPostsList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">You haven\'t created any posts yet.</p>';
    } else {
        myPostsList.innerHTML = myPosts.map(post => {
            const commentCount = post.comments ? post.comments.length : 0;
            return `
                <div class="forum-post-card" style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <div>
                            <h3 class="post-title">${post.title}</h3>
                            <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button onclick="deletePostFromModal('${post._id}')" class="btn-delete" title="Delete post">Delete</button>
                    </div>
                    <p class="post-content">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                    <div class="post-footer">
                        <span class="post-stats">${commentCount} comments</span>
                        <button onclick="viewPost('${post._id}'); closeMyPostsModal();" class="btn-secondary btn-sm">View Post</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('myPostsModal').style.display = 'block';
}

// Close My Posts modal
function closeMyPostsModal() {
    document.getElementById('myPostsModal').style.display = 'none';
}

// Delete post from My Posts modal
async function deletePostFromModal(postId) {
    // Show custom confirmation dialog
    const confirmed = await notify.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    
    if (!confirmed) {
        return; // User cancelled
    }
    
    try {
        await API.deleteForumPost(postId);
        
        // Force page reload to show updated post list
        window.location.reload();
    } catch (error) {
        console.error('Error deleting post:', error);
        alert(error.message || 'Failed to delete post');
    }
}

// Submit comment
async function submitComment(postId) {
    const commentText = document.getElementById('commentText').value.trim();
    
    if (!commentText) {
        alert('Please enter a comment');
        return;
    }
    
    try {
        await API.createForumComment(postId, commentText);
        // Clear the comment text area
        document.getElementById('commentText').value = '';
        // Reload the main posts list to update comment counts
        await loadPosts();
        // Reload the post detail to show the new comment
        viewPost(postId);
    } catch (error) {
        alert('Error posting comment');
    }
}

// Logout
function logout() {
    API.logout();
    window.location.href = 'index.html';
}

// View user profile
function viewUserProfile(userId) {
    if (!userId) {
        alert('User profile not available');
        return;
    }
    window.location.href = `profile.html?id=${userId}`;
}

// Delete post
async function deletePost(postId) {
    // Show custom confirmation dialog
    const confirmed = await notify.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    
    if (!confirmed) {
        return; // User cancelled
    }
    
    try {
        await API.deleteForumPost(postId);
        
        // Close modal if open
        closePostDetailModal();
        
        // Force page reload to refresh the post list
        window.location.reload();
    } catch (error) {
        console.error('Error deleting post:', error);
        alert(error.message || 'Failed to delete post');
    }
}

// Delete comment
async function deleteComment(postId, commentId) {
    // Show custom confirmation dialog
    const confirmed = await notify.confirm('Are you sure you want to delete this comment?');
    
    if (!confirmed) {
        return; // User cancelled
    }
    
    try {
        await API.deleteForumComment(postId, commentId);
        // Reload the main posts list to update comment counts
        await loadPosts();
        // Reload the post to show updated comments
        viewPost(postId);
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert(error.message || 'Failed to delete comment');
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadPosts();
    
    // Auto-refresh posts every 30 seconds to show new posts from other users
    setInterval(async () => {
        const currentPostDetailModal = document.getElementById('postDetailModal');
        // Only auto-refresh the main list if not viewing a post detail
        if (!currentPostDetailModal || currentPostDetailModal.style.display === 'none') {
            await loadPosts();
        }
    }, 30000); // 30 seconds
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const newPostModal = document.getElementById('newPostModal');
    const postDetailModal = document.getElementById('postDetailModal');
    const myPostsModal = document.getElementById('myPostsModal');
    
    if (e.target === newPostModal) {
        closeNewPostModal();
    }
    if (e.target === postDetailModal) {
        closePostDetailModal();
    }
    if (e.target === myPostsModal) {
        closeMyPostsModal();
    }
});
