// Requirements Page JavaScript
class NAFRequirements {
    constructor() {
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.setupScrollToAccept();
    }

    initializeEventListeners() {
        // Checkbox event listener
        const acceptCheckbox = document.getElementById('acceptGuidelines');
        const proceedBtn = document.getElementById('proceedBtn');

        if (acceptCheckbox && proceedBtn) {
            acceptCheckbox.addEventListener('change', () => {
                proceedBtn.disabled = !acceptCheckbox.checked;
                
                if (!acceptCheckbox.checked) {
                    proceedBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Application';
                    proceedBtn.classList.remove('btn-success');
                    proceedBtn.classList.add('btn-primary');
                } else {
                    proceedBtn.innerHTML = '<i class="fas fa-lock-open"></i> Proceed to Application';
                    proceedBtn.classList.remove('btn-primary');
                    proceedBtn.classList.add('btn-success');
                }
            });
        }

        // Proceed button event
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                this.handleProceedToApplication();
            });
        }

        // Mobile menu setup
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    setupScrollToAccept() {
        // Smooth scroll to acceptance section
        document.querySelectorAll('a[href="#acceptance"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById('acceptance');
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    handleProceedToApplication() {
        const acceptCheckbox = document.getElementById('acceptGuidelines');
        
        if (!acceptCheckbox.checked) {
            this.showError('Please accept the guidelines to proceed.');
            return;
        }

        // Show loading overlay
        this.showLoadingOverlay();

        // Simulate processing delay
        setTimeout(() => {
            // Redirect to registration instructions page
            window.location.href = 'registration-instructions.html';
        }, 3000);
    }

    showLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            
            // Animate progress bar
            const progressFill = overlay.querySelector('.progress-fill');
            if (progressFill) {
                let width = 0;
                const interval = setInterval(() => {
                    if (width >= 100) {
                        clearInterval(interval);
                    } else {
                        width++;
                        progressFill.style.width = width + '%';
                    }
                }, 30);
            }
        }
    }

    showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NAFRequirements();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }
    
    .loading-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        max-width: 400px;
        width: 90%;
    }
    
    .loading-spinner {
        font-size: 3rem;
        color: #0066cc;
        margin-bottom: 1rem;
    }
    
    .loading-progress {
        margin-top: 1rem;
    }
    
    .progress-bar {
        width: 100%;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: #0066cc;
        width: 0%;
        transition: width 0.3s ease;
    }
    
    .checkbox-container {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 2rem;
        cursor: pointer;
    }
    
    .checkbox-container input[type="checkbox"] {
        width: 20px;
        height: 20px;
        margin-top: 0.25rem;
    }
    
    .label-text {
        font-size: 1.1rem;
        font-weight: 600;
    }
`;
document.head.appendChild(style);
