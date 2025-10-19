/* NAF Recruitment Portal - Main Application Script */
document.addEventListener("DOMContentLoaded", () => {

    const NAF_DB = {
        users: "naf_portal_users",
        session: "naf_portal_session",
        appDataPrefix: "naf_app_data_"
    };

    // === UTILITY FUNCTIONS ===

    /** Nuna sako a sama (Toast Notification) */
    function showToast(message, type = 'success') {
        const toast = document.getElementById("toast");
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 3000);
    }

    /** Nuna sako a cikin form */
    function showFormError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = "block";
        }
    }

    /** Boye sako a cikin form */
    function clearFormError(elementId) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = "";
            errorEl.style.display = "none";
        }
    }

    /** Samu bayanai daga localStorage */
    function getFromDB(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    /** Adana bayanai a localStorage */
    function saveToDB(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // === MOBILE MENU LOGIC (Dukkan Shafuka) ===
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains("active")) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // === REQUIREMENTS PAGE LOGIC (requirements.html) ===
    const acceptCheckbox = document.getElementById("acceptGuidelines");
    const proceedBtn = document.getElementById("proceedBtn");
    const acceptError = document.getElementById("acceptError");

    if (acceptCheckbox && proceedBtn) {
        acceptCheckbox.addEventListener("change", () => {
            if (acceptCheckbox.checked) {
                proceedBtn.disabled = false;
                proceedBtn.innerHTML = '<i class="fas fa-lock-open"></i> Proceed to Register';
                proceedBtn.classList.add('btn-success');
                if(acceptError) acceptError.style.display = 'none';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Register';
                proceedBtn.classList.remove('btn-success');
            }
        });

        proceedBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (acceptCheckbox.checked) {
                window.location.href = "register.html";
            } else {
                 if(acceptError) acceptError.style.display = 'block';
            }
        });
    }

    // === REGISTRATION PAGE LOGIC (register.html) ===
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            clearFormError("registerError");

            const fullName = document.getElementById("fullName").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                showFormError("registerError", "Passwords do not match.");
                return;
            }

            let users = getFromDB(NAF_DB.users) || [];
            const existingUser = users.find(user => user.email === email);
            if (existingUser) {
                showFormError("registerError", "Email address is already registered.");
                return;
            }

            const newUser = { fullName, email, password };
            users.push(newUser);
            saveToDB(NAF_DB.users, users);
            saveToDB(NAF_DB.session, { email: newUser.email, fullName: newUser.fullName });
            window.location.href = "apply.html";
        });
    }

    // === LOGIN PAGE LOGIC (login.html) ===
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            clearFormError("loginError");

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            let users = getFromDB(NAF_DB.users) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                saveToDB(NAF_DB.session, { email: user.email, fullName: user.fullName });
                window.location.href = "apply.html";
            } else {
                showFormError("loginError", "Invalid email or password.");
            }
        });
    }


    // === APPLICATION FORM LOGIC (apply.html) ===
    const applicationForm = document.getElementById("applicationForm");

    if (applicationForm) {
        
        const session = getFromDB(NAF_DB.session);
        if (!session) {
            window.location.href = "login.html";
            return;
        }

        const welcomeUser = document.getElementById("welcomeUser");
        const logoutBtn = document.getElementById("logoutBtn");
        if (welcomeUser) welcomeUser.textContent = `Welcome, ${session.fullName}`;
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem(NAF_DB.session);
                window.location.href = "index.html";
            });
        }

        const appDataKey = `${NAF_DB.appDataPrefix}${session.email}`;
        const appEmail = document.getElementById("appEmail");
        const appFullName = document.getElementById("appFullName");
        if(appEmail) appEmail.value = session.email;
        if(appFullName) appFullName.value = session.fullName;

        function loadSavedApplication() {
            const savedData = getFromDB(appDataKey);
            if (savedData) {
                Object.keys(savedData).forEach(key => {
                    const field = applicationForm.elements[key];
                    if (field && field.type !== 'file' && field.type !== 'submit') {
                        field.value = savedData[key];
                    }
                });
                showToast("Previously saved data loaded.", "success");
            }
        }
        loadSavedApplication();

        const steps = Array.from(document.querySelectorAll(".form-step"));
        const wizardSteps = Array.from(document.querySelectorAll(".wizard-step"));
        const nextBtns = document.querySelectorAll("[data-action='next']");
        const prevBtns = document.querySelectorAll("[data-action='prev']");
        let currentStep = 0;

        function showStep(stepIndex) {
            steps.forEach((step, index) => step.classList.toggle("active", index === stepIndex));
            wizardSteps.forEach((step, index) => {
                step.classList.toggle("active", index === stepIndex);
                step.classList.toggle("completed", index < stepIndex);
            });
            currentStep = stepIndex;
        }

        nextBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                if (currentStep < steps.length - 1) showStep(currentStep + 1);
            });
        });
        prevBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                if (currentStep > 0) showStep(currentStep - 1);
            });
        });

        // === SABON AIKIN SUBMIT (Gyara) ===
        applicationForm.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Submitting Application... Please wait.", "success");

            const formData = new FormData(applicationForm);
            const data = {};
            formData.forEach((value, key) => {
                if (!(value instanceof File)) {
                    data[key] = value;
                }
            });

            const photoFile = document.getElementById('filePassport').files[0];

            if (photoFile) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    // Adana hoton a matsayin text (Base64 dataURL)
                    data.passportPhoto = event.target.result;
                    // Adana dukkan bayanan
                    saveToDB(appDataKey, data);
                    // Tura zuwa shafin card
                    window.location.href = "acknowledgement.html";
                };
                reader.readAsDataURL(photoFile); // Wannan shine yake karanta hoton
            } else {
                // Idan babu hoto, a ci gaba
                data.passportPhoto = null; 
                saveToDB(appDataKey, data);
                window.location.href = "acknowledgement.html";
            }
        });
    }

    // === SABON AIKI: ACKNOWLEDGEMENT PAGE (acknowledgement.html) ===
    const ackContainer = document.querySelector(".ack-container");

    if (ackContainer) {
        // Wannan code din zai yi aiki a shafin acknowledgement.html KAWAI

        // 1. Bincika ko an shiga
        const session = getFromDB(NAF_DB.session);
        if (!session) {
            window.location.href = "login.html";
            return;
        }

        // 2. Samo bayanan da aka adana
        const appDataKey = `${NAF_DB.appDataPrefix}${session.email}`;
        const data = getFromDB(appDataKey);

        if (!data) {
            alert("No application data found. Please complete your application first.");
            window.location.href = "apply.html";
            return;
        }

        // 3. Kirkiri Application ID (kamar na hoton)
        const stateCode = data.state ? data.state.substring(0, 3).toUpperCase() : 'NGA';
        const randomNum1 = Math.floor(10000 + Math.random() * 90000);
        const randomNum2 = Math.floor(100000 + Math.random() * 900000);
        const generatedId = `REC/${stateCode}/${randomNum1}/25/${randomNum2}`;

        // 4. Cika bayanan card din
        document.getElementById('ackAppId').textContent = generatedId;
        document.getElementById('ackName').textContent = data.fullName;
        document.getElementById('ackDob').textContent = data.dob;
        document.getElementById('ackState').textContent = data.state;
        document.getElementById('ackLga').textContent = data.lga;
        document.getElementById('ackEmail').textContent = data.email;
        document.getElementById('ackPhone').textContent = data.phone;
        document.getElementById('ackTrade').textContent = "Non-Trade"; // Kamar na hoton
        document.getElementById('ackCentre').textContent = "153 Base Services Group, Yola"; // Kamar na hoton

        // 5. Sanya hoton da aka adana
        const ackPhoto = document.getElementById('ackPhoto');
        if (data.passportPhoto) {
            ackPhoto.src = data.passportPhoto;
        } else {
            ackPhoto.src = "https://via.placeholder.com/200x200.png?text=No+Photo";
        }

        // 6. Maɓallin "Print"
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print(); // Wannan zai bude aikin printing
            });
        }

        // 7. Maɓallin "Logout"
        const ackLogoutBtn = document.getElementById('logoutBtn');
        if (ackLogoutBtn) {
            ackLogoutBtn.addEventListener('click', () => {
                localStorage.removeItem(NAF_DB.session);
                // A wannan karon, share har da data din
                localStorage.removeItem(appDataKey); 
                window.location.href = "index.html";
            });
        }
    }
});
