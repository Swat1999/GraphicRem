window.onerror = function(msg, url, line) {
  console.error(`Frontend Error: ${msg} at ${line} in ${url}`);
  return true;
};
const BASE_URL = "http://127.0.0.1:5500";

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

      fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message || "Signup success!");
          signupForm.reset();
          if (signUpModal) signUpModal.style.display = "none";
          localStorage.removeItem('profileSetupComplete');
          localStorage.setItem('userId', data.user._id);
          window.location.href = 'profileSetup.html';
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

      fetch(`${BASE_URL}/signin`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      })
 .then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  if (data.error) {
    alert(`❌ ${data.error}`);
  } else {
    alert(`✅ ${data.message} Welcome, ${data.user.firstName}!`);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUser', data.user.firstName || email);
    localStorage.setItem('userId', data.user._id);
    if (signInModal) signInModal.style.display = "none";
    signInForm.reset();
    
    const profileSetupComplete = data.user.profileSetupComplete || localStorage.getItem('profileSetupComplete');
    if (profileSetupComplete === 'true') {
      window.location.href = 'Dashboard-User.html';
    } else {
      window.location.href = 'profileSetup.html';
    }
  }
})
.catch(err => {
  alert("⚠️ Error during sign-in. Please check your connection.");
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


        // AI assistant function
        // 1. Modal Elements
const aiAssistantButton = document.getElementById('aiAssistantButton');
const aiModal = document.getElementById('aiAssistantModal');
const recommendationsContainer = document.getElementById('recommendationsContainer');
const saveRecommendationsBtn = document.getElementById('saveRecommendations');
const cancelRecommendationsBtn = document.getElementById('cancelRecommendations');

// 2. Event Listeners
if (aiAssistantButton) {
  aiAssistantButton.addEventListener('click', async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please sign in to use AI Assistant');
      return;
    }
    
    aiModal.style.display = 'flex';
    loadRecommendations(userId);
  });
}

// 3. Core Functions
async function loadRecommendations(userId) {
  try {
    recommendationsContainer.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Analyzing your skills and market trends...</p>
    `;
    
    const response = await fetch('http://localhost:3000/api/ai/get-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: localStorage.getItem('userId') })
    });
    
    const { courses } = await response.json();
    renderCourses(courses);
    
  } catch (error) {
    recommendationsContainer.innerHTML = `
      <p class="error">Error: ${error.message}</p>
    `;
  }
}

function renderCourses(courses) {
  recommendationsContainer.innerHTML = courses.map(course => `
    <div class="course-card">
      <input type="checkbox" id="course_${course.id}" value="${course.id}">
      <label for="course_${course.id}">
        <h4>${course.title}</h4>
        <p class="provider">${course.provider}</p>
        <p class="match-reason">${course.matchReason}</p>
        <a href="${course.url}" target="_blank">Preview</a>
      </label>
    </div>
  `).join('');
}

// 4. Save/Cancel Handlers
if (saveRecommendationsBtn) {
  saveRecommendationsBtn.addEventListener('click', async () => {
    const userId = localStorage.getItem('userId');
    const selected = Array.from(
      document.querySelectorAll('.course-card input:checked')
    ).map(el => el.value);
    
    try {
      await fetch('/api/ai/save-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courses: selected })
      });
      
      aiModal.style.display = 'none';
      refreshDashboardCourses();
    } catch (error) {
      alert('Save failed: ' + error.message);
    }
  });
}

if (cancelRecommendationsBtn) {
  cancelRecommendationsBtn.addEventListener('click', () => {
    aiModal.style.display = 'none';
  });
}

// 5. Dashboard Integration
function refreshDashboardCourses() {
  const container = document.getElementById('userCoursesContainer');
  if (!container) return;
  
  // Temporary content until real data loads
  container.innerHTML = `
    <div class="loading-spinner small"></div>
    <p>Updating your learning path...</p>
  `;
  
  // Load actual courses (implement this next)
  loadUserCourses();
}

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

      //AI Assistant button
      const aiAssistantButton = document.getElementById('aiAssistantButton');
      if (aiAssistantButton) { 
        aiAssistantButton.addEventListener('click', () => {
            alert('AI Assistant clicked!');
        });
      }

      // ===========================================
      // Profile Dropdown Toggle Logic
      // ===========================================
      const profileButton = document.getElementById('profileButton');
      const profileDropdown = document.getElementById('profileDropdown');

      if (profileButton && profileDropdown) { 
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


  // =====================
  //  NEW AI ASSISTANT 
  // =====================

  // AI Assistant Modal Logic
  const aiAssistantButton = document.getElementById('aiAssistantButton');
  const aiModal = document.getElementById('aiAssistantModal');
  const recommendationsContainer = document.getElementById('recommendationsContainer');
  const saveRecommendationsBtn = document.getElementById('saveRecommendations');
  const cancelRecommendationsBtn = document.getElementById('cancelRecommendations');

  if (aiAssistantButton) {
    aiAssistantButton.addEventListener('click', async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Please sign in to use AI Assistant');
        return;
      }
      aiModal.style.display = 'flex';
      loadRecommendations(userId);
    });
  }

  function showErrorState(error = { message: 'Unknown error' }) {
  const recommendationsContainer = document.getElementById('recommendationsContainer');
  if (recommendationsContainer) {
    recommendationsContainer.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${error.message || "Failed to load recommendations"}</p>
      <button onclick="loadRecommendations()">Retry</button>
    </div>
  `;
}
}

  async function loadRecommendations() {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId) throw new Error('User not logged in');

      showLoadingState();
      
      const response = await fetch('http://localhost:3000/api/ai/get-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      renderCourses(data.courses || []);
    
  } catch (error) {
    showErrorState(error);
    console.error('Recommendations error:', error);
  }
}

function showLoadingState() {
    recommendationsContainer.innerHTML =  `
       <div class="loading-spinner"></div>
      <p>Scanning 250+ courses across LinkedIn, Udemy and Coursera...</p>
      <div class="progress-bar">
        <div class="progress"></div>
      </div>
    `;
  }
  function renderCourses(courses) {
    recommendationsContainer.innerHTML = courses.length > 0 
      ? courses.map(course => `
          <div class="course-card">
            <input type="checkbox" id="course_${course.id}" checked>
            <label for="course_${course.id}">
              <h4>${course.title}</h4>
              <div class="course-meta">
                <span class="provider">${course.provider}</span>
                <span class="match-score">
                  <i class="fas fa-bolt"></i> ${Math.round(course.matchScore * 100)}% match
                </span>
              </div>
              <p class="match-reason">${course.matchReason}</p>
              <div class="course-footer">
                <a href="${course.url}" target="_blank" class="preview-link">
                  <i class="fas fa-external-link-alt"></i> Preview
                </a>
                ${course.isTrending ? `
                  <span class="trend-badge">
                    <i class="fas fa-fire"></i> Trending
                  </span>
                ` : ''}
              </div>
            </label>
          </div>
        `).join('')
      : `<div class="empty-state">
          <i class="fas fa-robot"></i>
          <p>No courses match your current profile</p>
          <button class="retry-btn" onclick="window.loadRecommendations()">
            <i class="fas fa-sync-alt"></i> Retry Analysis
          </button>
        </div>`;
  }

  if (saveRecommendationsBtn) {
    saveRecommendationsBtn.addEventListener('click', async () => {
      const userId = localStorage.getItem('userId');
      const selected = Array.from(
        document.querySelectorAll('.course-card input:checked')
      ).map(el => {
        const card = el.closest('.course-card');
        return{
          id: el.value,
          title: card.querySelector('h4').textContent,
          provider: card.querySelector('.provider').textContent,
          url: card.querySelector('a').href,
          matchReason: card.querySelector('.match-reason').textContent
        };
      });

       try {
        const response = await fetch('/api/ai/save-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, courses: selected })
        });
        if (!response.ok) throw new Error('Failed to save courses');
        
        aiModal.style.display = 'none';
        refreshDashboardCourses();
      } catch (error) {
        alert('Save failed: ' + error.message);
      }
    });
  }
   if (cancelRecommendationsBtn) {
    cancelRecommendationsBtn.addEventListener('click', () => {
      aiModal.style.display = 'none';
    });
  }

  // Dashboard Integration
  function refreshDashboardCourses() {
    const container = document.getElementById('userCoursesContainer');
    if (!container) return;
    
    container.innerHTML = `
      <div class="loading-spinner small"></div>
      <p>Updating your learning path...</p>
    `;
    
    loadUserCourses();
  }
  async function loadUserCourses() {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:3000/api/ai/user-courses?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load courses');

      const courses = await response.json();
      renderUserCourses(courses || []);
       } catch (error) {
      renderUserCoursesError(error);
    }
  }
      function renderUserCourses(courses) {
      const container = document.getElementById('userCoursesContainer');
      if (!container) return;

      container.innerHTML = courses.length > 0 
        ? courses.map(course => `
            <div class="user-course">
            <div class="course-header">
              <h4>${course.title}</h4>
              <span class="provider">${course.provider}</span>
            </div>
            <div class="course-progress">
              <div class="progress-bar">
                <div class="progress" style="width: ${course.progress || 0}%"></div>
              </div>
            </div>
            <div class="course-actions">
              <a href="${course.url}" target="_blank" class="btn-start">
                <i class="fas fa-external-link-alt"></i> Continue
              </a>
              <button class="btn-complete" data-id="${course.id}">
                <i class="fas fa-check"></i> ${course.completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>
        `).join('')
      : `<div class="empty-state">
          <p>No courses selected yet</p>
          <button id="getRecommendations" class="btn-primary">
            <i class="fas fa-robot"></i> Get Recommendations
          </button>
        </div>`;

  // refresh button handler
  document.getElementById('refreshRecommendations')?.addEventListener('click', loadUserCourses);
    
    // Get Recommendations button handler
    document.getElementById('getRecommendations')?.addEventListener('click', () => {
      document.getElementById('aiAssistantModal').style.display = 'flex';
    });
  } 
  function renderUserCoursesError(error) {
    const container = document.getElementById('userCoursesContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${error.message || 'Failed to load courses'}</p>
        <button class="retry-btn" onclick="window.loadUserCourses()">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
  }
  async function markCourseComplete(e) {
    const courseId = e.target.dataset.id;
    try {
      const response = await fetch('/api/ai/complete-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          courseId
        })
      });
      if (!response.ok) throw new Error('Failed to mark complete');
         loadUserCourses(); // Refresh the list
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
  if (document.getElementById('userCoursesContainer')) {
    loadUserCourses();
  }
window.loadRecommendations = loadRecommendations;
  window.loadUserCourses = loadUserCourses;
});