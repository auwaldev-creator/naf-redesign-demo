// Modern JavaScript for NAF Recruitment Portal

class NAFRecruitmentPortal {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.init();
    }

    init() {
        this.initializeTheme();
        this.initializeNavigation();
        this.initializeForm();
        this.initializeEventListeners();
        this.updateFormNavigation();
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('naf-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('naf-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // Navigation
    initializeNavigation() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
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

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Form Management
    initializeForm() {
        this.setupFormSteps();
        this.setupFileUploads();
        this.loadSavedData();
    }

    setupFormSteps() {
        // Show first step
        this.showStep(1);
    }

    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(stepElement => {
            stepElement.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update progress
        this.updateProgress(step);

        // Update navigation buttons
        this.updateFormNavigation();
    }

    updateProgress(step) {
        document.querySelectorAll('.progress-step').forEach(progressStep => {
            const stepNumber = parseInt(progressStep.dataset.step);
            if (stepNumber <= step) {
                progressStep.classList.add('active');
            } else {
                progressStep.classList.remove('active');
            }
        });
    }

    updateFormNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        if (nextBtn && submitBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'flex';
            } else {
                nextBtn.style.display = 'flex';
                submitBtn.style.display = 'none';
            }
        }

        // Update review section if we're on the last step
        if (this.currentStep === this.totalSteps) {
            this.updateReviewSection();
        }
    }

    nextStep() {
        if (this.validateStep(this.currentStep)) {
            this.saveStepData(this.currentStep);
            
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.showStep(this.currentStep);
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    validateStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        const inputs = stepElement.querySelectorAll('input[required], select[required]');
        
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showError(input, 'This field is required');
                isValid = false;
            } else {
                this.clearError(input);
            }

            // Email validation
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    this.showError(input, 'Please enter a valid email address');
                    isValid = false;
                }
            }

            // Phone validation
            if (input.type === 'tel' && input.value) {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                    this.showError(input, 'Please enter a valid phone number');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    showError(input, message) {
        this.clearError(input);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--danger)';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        
        input.style.borderColor = 'var(--danger)';
        input.parentNode.appendChild(errorElement);
    }

    clearError(input) {
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '';
    }

    saveStepData(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        const inputs = stepElement.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.name) {
                if (input.type === 'file') {
                    // Handle file inputs separately
                    if (input.files.length > 0) {
                        this.formData[input.name] = {
                            files: Array.from(input.files).map(file => ({
                                name: file.name,
                                size: file.size,
                                type: file.type
                            })),
                            element: input
                        };
                    }
                } else {
                    this.formData[input.name] = input.value;
                }
            }
        });

        // Save to localStorage
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        const serializableData = { ...this.formData };
        
        // Remove file elements from localStorage data
        Object.keys(serializableData).forEach(key => {
            if (serializableData[key] && typeof serializableData[key] === 'object' && serializableData[key].element) {
                delete serializableData[key].element;
            }
        });

        localStorage.setItem('naf-application-data', JSON.stringify(serializableData));
    }

    loadSavedData() {
        const savedData = localStorage.getItem('naf-application-data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.formData = { ...this.formData, ...data };
                this.populateFormWithSavedData();
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    populateFormWithSavedData() {
        Object.keys(this.formData).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input && this.formData[key] && typeof this.formData[key] !== 'object') {
                input.value = this.formData[key];
            }
        });
    }

    setupFileUploads() {
        document.querySelectorAll('.file-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const label = e.target.nextElementSibling;
                if (e.target.files.length > 0) {
                    const fileNames = Array.from(e.target.files).map(file => file.name).join(', ');
                    label.textContent = `${e.target.files.length} file(s) selected`;
                    label.classList.add('btn-primary');
                    label.classList.remove('btn-outline');
                } else {
                    label.textContent = 'Choose File';
                    label.classList.remove('btn-primary');
                    label.classList.add('btn-outline');
                }
            });
        });
    }

    updateReviewSection() {
        // Personal Information
        const personalInfo = document.getElementById('reviewPersonal');
        if (personalInfo) {
            personalInfo.innerHTML = `
                <p><strong>Name:</strong> ${this.formData.firstName || ''} ${this.formData.lastName || ''}</p>
                <p><strong>Email:</strong> ${this.formData.email || ''}</p>
                <p><strong>Phone:</strong> ${this.formData.phone || ''}</p>
                <p><strong>Date of Birth:</strong> ${this.formData.dob || ''}</p>
                <p><strong>State:</strong> ${this.formData.state || ''}</p>
            `;
        }

        // Education
        const educationInfo = document.getElementById('reviewEducation');
        if (educationInfo) {
            educationInfo.innerHTML = `
                <p><strong>Highest Qualification:</strong> ${this.formData.highestQualification || ''}</p>
                <p><strong>Institution:</strong> ${this.formData.institution || ''}</p>
                <p><strong>Year of Graduation:</strong> ${this.formData.graduationYear || ''}</p>
                <p><strong>Course of Study:</strong> ${this.formData.courseOfStudy || ''}</p>
            `;
        }

        // Documents
        const documentsInfo = document.getElementById('reviewDocuments');
        if (documentsInfo) {
            let documentsHTML = '<p>No documents uploaded yet.</p>';
            
            if (this.formData.passportPhoto && this.formData.passportPhoto.files) {
                documentsHTML = this.formData.passportPhoto.files.map(file => 
                    `<p>📷 ${file.name} (${this.formatFileSize(file.size)})</p>`
                ).join('');
            }

            if (this.formData.certificates && this.formData.certificates.files) {
                documentsHTML += this.formData.certificates.files.map(file => 
                    `<p>📄 ${file.name} (${this.formatFileSize(file.size)})</p>`
                ).join('');
            }

            if (this.formData.medicalCert && this.formData.medicalCert.files) {
                documentsHTML += this.formData.medicalCert.files.map(file => 
                    `<p>🏥 ${file.name} (${this.formatFileSize(file.size)})</p>`
                ).join('');
            }

            documentsInfo.innerHTML = documentsHTML;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async submitApplication() {
        if (!this.validateStep(this.currentStep)) {
            return;
        }

        // Save final step data
        this.saveStepData(this.currentStep);

        // Check declaration
        const declaration = document.getElementById('declaration');
        if (!declaration || !declaration.checked) {
            alert('Please accept the declaration to proceed.');
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate application ID
            const applicationId = 'NAF' + Date.now().toString().slice(-8);

            // Show success message
            this.showSuccessMessage(applicationId);

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showSuccessMessage(applicationId) {
        const successHTML = `
            <div class="success-message" style="
                background: var(--success);
                color: white;
                padding: 2rem;
                border-radius: var(--border-radius-lg);
                text-align: center;
                margin: 2rem 0;
            ">
                <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3 style="margin-bottom: 1rem;">Application Submitted Successfully!</h3>
                <p style="margin-bottom: 1.5rem; font-size: 1.125rem;">
                    Your application has been received and is under review.
                </p>
                <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
                    <strong style="font-size: 1.25rem;">Application ID: ${applicationId}</strong>
                </div>
                <p style="font-size: 0.875rem; opacity: 0.9;">
                    Please save this ID for future reference. You will be contacted via email for the next steps.
                </p>
                <button onclick="location.reload()" class="btn btn-outline" style="margin-top: 1rem; background: rgba(255,255,255,0.2); color: white; border-color: white;">
                    Start New Application
                </button>
            </div>
        `;

        const form = document.getElementById('applicationForm');
        if (form) {
            form.innerHTML = successHTML;
        }

        // Clear localStorage
        localStorage.removeItem('naf-application-data');
    }

    // Event Listeners
    initializeEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Form navigation
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitApplication());
        }

        // Form submission
        const form = document.getElementById('applicationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitApplication();
            });
        }

        // Auto-save on input change
        document.querySelectorAll('#applicationForm input, #applicationForm select').forEach(input => {
            input.addEventListener('change', () => {
                this.saveStepData(this.currentStep);
            });

            input.addEventListener('blur', () => {
                this.saveStepData(this.currentStep);
            });
        });

        // Status check
        const statusForm = document.querySelector('.status-form');
        if (statusForm) {
            statusForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.checkApplicationStatus();
            });
        }
    }

    checkApplicationStatus() {
        const statusInput = document.querySelector('.status-input');
        if (statusInput && statusInput.value) {
            // Simulate status check
            alert(`Application ${statusInput.value} is currently under review. You will be notified via email once there's an update.`);
        } else {
            alert('Please enter your Application ID.');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NAFRecruitmentPortal();
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for global access (if needed)
window.NAFRecruitmentPortal = NAFRecruitmentPortal;
