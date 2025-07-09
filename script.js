document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const section = document.querySelector(this.getAttribute('href'));
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Button click action in Hero section
document.querySelector('.hero button').addEventListener('click', () => {
  alert('Welcome aboard! Feel free to explore.');
});

// Form validation example (for future implementation)
function validateForm() {
  const emailInput = document.getElementById('email');
  if (!emailInput.value.includes('@')) {
    alert('Please enter a valid email address.');
    return false;
  }
  return true;
}