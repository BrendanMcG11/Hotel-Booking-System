// Handle Login Modal Display
const loginBtn = document.getElementById('loginBtn');
const bookBtn = document.getElementById('bookBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');

loginBtn.addEventListener('click', function() {
  loginModal.style.display = 'flex';
});

closeModal.addEventListener('click', function() {
  loginModal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
  if (event.target === loginModal) {
    loginModal.style.display = 'none';
  }
});

// Simple login form submission (for demo purposes)
loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  alert('Logged in successfully!');
  loginModal.style.display = 'none';
});

// Book Now button click event
bookBtn.addEventListener('click', function() {
  // Replace with actual booking page navigation or modal display as needed
  alert('Redirecting to booking page...');
  // window.location.href = 'booking.html';
});
