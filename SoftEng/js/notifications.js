// Toast Notification System
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        const createContainer = () => {
            if (!document.getElementById('toast-container')) {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            } else {
                this.container = document.getElementById('toast-container');
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createContainer);
        } else {
            createContainer();
        }
    }

    show(message, type = 'info', duration = 4000) {
        // Ensure container exists
        if (!this.container || !document.body.contains(this.container)) {
            if (document.getElementById('toast-container')) {
                this.container = document.getElementById('toast-container');
            } else {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }

    success(message, duration = 4000) {
        this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        this.show(message, 'error', duration);
    }

    warning(message, duration = 4500) {
        this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        this.show(message, 'info', duration);
    }

    // Custom confirm dialog
    confirm(message, onConfirm, onCancel) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            
            overlay.innerHTML = `
                <div class="confirm-dialog">
                    <div class="confirm-icon">⚠</div>
                    <div class="confirm-message">${message}</div>
                    <div class="confirm-buttons">
                        <button class="confirm-btn confirm-btn-cancel">Cancel</button>
                        <button class="confirm-btn confirm-btn-confirm">Confirm</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            const cancelBtn = overlay.querySelector('.confirm-btn-cancel');
            const confirmBtn = overlay.querySelector('.confirm-btn-confirm');
            
            const cleanup = () => {
                overlay.style.animation = 'fadeOut 0.2s ease-in';
                setTimeout(() => overlay.remove(), 200);
            };
            
            cancelBtn.onclick = () => {
                cleanup();
                resolve(false);
                if (onCancel) onCancel();
            };
            
            confirmBtn.onclick = () => {
                cleanup();
                resolve(true);
                if (onConfirm) onConfirm();
            };
            
            // Close on overlay click
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                    if (onCancel) onCancel();
                }
            };
        });
    }
}

// Create global instance
const notify = new NotificationSystem();

// Make it globally available
window.notify = notify;

// Override alert function to use notification system immediately
// This ensures all alert() calls use the toast system
(function() {
    const originalAlert = window.alert;
    window.alertOriginal = originalAlert;
    
    window.alert = function(message) {
        console.log('🔔 Toast notification:', message);
        
        // Determine type based on message content
        const lowerMessage = String(message).toLowerCase();
        let type = 'info';
        
        if (lowerMessage.includes('success') || lowerMessage.includes('successfully') || lowerMessage.includes('deleted') || lowerMessage.includes('created') || lowerMessage.includes('updated')) {
            type = 'success';
        } else if (lowerMessage.includes('error') || lowerMessage.includes('failed') || lowerMessage.includes('fail')) {
            type = 'error';
        } else if (lowerMessage.includes('please') || lowerMessage.includes('must') || lowerMessage.includes('required') || lowerMessage.includes('not found')) {
            type = 'warning';
        }
        
        notify.show(String(message), type);
    };
})();
