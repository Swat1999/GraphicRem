document.addEventListener('DOMContentLoaded', function () {
  // ===========================
  // Welcome Overlay Typing 
  // ===========================
  const welcomeText = document.getElementById("welcome-text");
  const startButton = document.getElementById("start-button");
  const overlay = document.getElementById("welcome-overlay");

  if (welcomeText && startButton && overlay) {
    const message = "Welcome, to the next";
    let index = 0;

    document.body.classList.add('lock-scroll', 'blur-active');
    startButton.style.opacity = '0';
    startButton.style.transition = 'opacity 0.8s ease';

    function typeWriter() {
      if (index < message.length) {
        welcomeText.textContent += message.charAt(index);
        index++;
        setTimeout(typeWriter, 120);
      } else {
        setTimeout(() => {
          startButton.style.opacity = '1';
        }, 1000);
      }
    }

    typeWriter();

    startButton.addEventListener('click', () => {
      overlay.style.transition = 'opacity 1.5s ease-in-out, transform 1.5s ease-in-out';
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(0.95)';
      overlay.style.pointerEvents = 'none';
      overlay.style.visibility = 'hidden';

      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.classList.remove('lock-scroll', 'blur-active');
      }, 1500);
    });
  }

  // ===========================
  // Smooth Scroll
  // ===========================
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const section = document.querySelector(this.getAttribute('href'));
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ===========================
  // Theme Toggle (for landing page only)
  // ===========================
  const toggleBtn = document.getElementById('theme-toggle');
  const body = document.body; 
  if (toggleBtn) { 
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.classList.toggle('light-mode', savedTheme === 'light');
      toggleBtn.textContent = savedTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }

    toggleBtn.addEventListener('click', () => {
      const isLight = body.classList.toggle('light-mode');
      toggleBtn.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  // ===========================
  // Auth Modal Logic
  // ===========================
  const signInBtn = document.getElementById("SignInBtn");
  const signInModal = document.getElementById("signInModal");
  const closeSignInBtn = document.querySelector("#signInModal .close-btn");

  const signUpBtn = document.getElementById("SignUpBtn");
  const signUpModal = document.getElementById("signUpModal");
  const closeSignUpBtn = document.querySelector(".close-signup");

  const showSignInLink = document.getElementById("showSignInLink");
  const signInToSignUpLink = document.getElementById("signInToSignUpLink");

  if (signInBtn && signInModal && closeSignInBtn && signUpBtn && signUpModal && closeSignUpBtn && showSignInLink && signInToSignUpLink) {
    signInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signInModal.style.display = "flex";
    });

    closeSignInBtn.addEventListener("click", () => {
      signInModal.style.display = "none";
    });

    signUpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signUpModal.style.display = "flex";
    });

    closeSignUpBtn.addEventListener("click", () => {
      signUpModal.style.display = "none";
    });

    signInToSignUpLink.addEventListener("click", function (e) {
      e.preventDefault();
      signInModal.style.display = "none";
      signUpModal.style.display = "flex";
    });

    showSignInLink.addEventListener("click", (e) => {
      e.preventDefault();
      signUpModal.style.display = "none";
      signInModal.style.display = "flex";
    });
  }

  // ===========================
  // Sign Up Form
  // ===========================
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return alert("Please fill out all fields.");
      }

      if (password !== confirmPassword) {
        return alert("Passwords do not match!");
      }

      fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message || "Signup success!");
          signupForm.reset();
          if (signUpModal) signUpModal.style.display = "none";
        })
        .catch(err => {
          alert("Error during signup.");
          console.error(err);
        });
    });
  }

  // ===========================
  // Sign In Form
  // ===========================
  const signInForm = document.getElementById("signInForm");

  if (signInForm) {
    signInForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("signinEmail").value.trim();
      const password = document.getElementById("signinPassword").value;

      if (!email || !password) {
        return alert("Please enter both email and password.");
      }

      fetch("http://localhost:3000/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert(`❌ ${data.error}`);
          } else {
            alert(`✅ ${data.message} Welcome, ${data.user.firstName}!`);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', data.user.firstName || email);
            if (signInModal) signInModal.style.display = "none";
            signInForm.reset();
            window.location.href = 'Dashboard-User.html'; // Redirect to dashboard
          }
        })
        .catch(err => {
          alert("⚠️ Error during sign-in.");
          console.error("Login error:", err);
        });
    });
  }

  // ===========================
  // Toggle Password Visibility
  // ===========================
  const togglePassword = (toggleId, inputId) => {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (toggle && input) {
      toggle.addEventListener("click", () => {
        const type = input.type === "password" ? "text" : "password";
        input.type = type;
        toggle.textContent = type === "password" ? "👁️" : "🙈";
      });
    }
  };

  togglePassword("toggleSigninPassword", "signinPassword");
  togglePassword("toggleSignupPassword", "signupPassword");
  togglePassword("toggleConfirmPassword", "confirmPassword");
  togglePassword("toggleNewPassword", "newPassword");
  togglePassword("toggleConfirmNewPassword", "confirmNewPassword");

  // ===========================
  // Newsletter Form
  // ===========================
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletterEmail").value.trim();
      if (!email) return alert("Please enter a valid email.");

      const res = await fetch("http://localhost:3000/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      alert(data.message || "Newsletter subscription failed.");
      if (res.ok) newsletterForm.reset();
    });
  }

  // ===========================
  // Forgot Password Logic
  // ===========================
  const forgotLink = document.getElementById("forgotPasswordLink");
  const forgotModal = document.getElementById("forgotPasswordModal");
  const closeForgotBtn = document.querySelector("#forgotPasswordModal .close-btn");
  const forgotForm = document.getElementById("forgotPasswordForm");

  if (forgotLink && forgotModal && closeForgotBtn && forgotForm) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (signInModal) signInModal.style.display = "none";
      forgotModal.style.display = "flex";
      forgotModal.scrollTop = 0;
    });

    closeForgotBtn.addEventListener("click", () => {
      forgotModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
      if (event.target === forgotModal) {
        forgotModal.style.display = "none";
      }
    });

    forgotForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("forgotEmail").value.trim();
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmNewPassword").value;

      if (!email || !newPassword || !confirmPassword) {
        return alert("⚠️ Please fill out all fields.");
      }

      if (newPassword !== confirmPassword) {
        return alert("❌ Passwords do not match!");
      }

      try {
        const res = await fetch("http://localhost:3000/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("✅ Password changed successfully!");
          forgotForm.reset();
          forgotModal.style.display = "none";
        } else {
          alert(`❌ ${data.error || "Something went wrong."}`);
        }
      } catch (error) {
        console.error("Reset password error:", error);
        alert("⚠️ Error connecting to the server.");
      }
    });
  }


  // ===============================================
  // START OF DASHBOARD-SPECIFIC JAVASCRIPT
  // ===============================================

  const welcomeMessage = document.getElementById('welcomeMessage');
  const profileButton = document.getElementById('profileButton');

  // Check if typical dashboard elements exist before running dashboard specific JS
  if (welcomeMessage && profileButton) { 

      const userName = localStorage.getItem('loggedInUser');
      if (userName) { 
        welcomeMessage.textContent = `Welcome back, ${userName}!`;
      } else {
        welcomeMessage.textContent = 'Welcome back!';
      }

      // Theme Toggle for Dashboard
      const themeToggleButton = document.getElementById('themeToggleButton');

      function updateThemeIcon(theme) {
          if (themeToggleButton) { 
            if (theme === 'dark-mode') {
                themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>'; // Sun for dark background
            } else {
                themeToggleButton.innerHTML = '<i class="fas fa-moon"></i>'; // Moon for light background
            }
          }
      }

      if (themeToggleButton) { 
        const savedTheme = localStorage.getItem('theme') || 'dark-mode';
        body.classList.add(savedTheme);
        updateThemeIcon(savedTheme); 

        themeToggleButton.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                body.classList.replace('dark-mode', 'light-mode');
                localStorage.setItem('theme', 'light-mode');
                updateThemeIcon('light-mode');
            } else {
                body.classList.replace('light-mode', 'dark-mode');
                localStorage.setItem('theme', 'dark-mode');
                updateThemeIcon('dark-mode');
            }
        });
      }


      // Logout functionality
      const logoutButton = document.getElementById('logoutButton');
      if (logoutButton) { 
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUser'); 
            window.location.href = 'index.html';
        });
      }

      // AI Assistant button
      const aiAssistantButton = document.getElementById('aiAssistantButton');
      if (aiAssistantButton) { 
        aiAssistantButton.addEventListener('click', () => {
            alert('AI Assistant clicked!');
        });
      }

      // ===========================================
      // Profile Dropdown Toggle Logic
      // ===========================================
      const profileDropdown = document.getElementById('profileDropdown');

      if (profileDropdown) { 
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!profileDropdown.contains(event.target) && !profileButton.contains(event.target)) {
                profileDropdown.classList.remove('show'); // Hide the dropdown
            }
        });

        profileDropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (event) => {
                profileDropdown.classList.remove('show'); 
            });
        });
      }
  }
}); 