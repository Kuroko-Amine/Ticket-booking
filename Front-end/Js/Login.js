function showToast(message, type = 'success') {
  document.querySelectorAll('.toast-notification').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span><div class="toast-progress"></div>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Fonction utilitaire pour obtenir le token de manière cohérente
function getAuthToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
}

// Fonction utilitaire pour définir le token de manière cohérente
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
  // Supprimer l'ancienne clé si elle existe
  localStorage.removeItem('token');
}

// Fonction utilitaire pour supprimer le token
function removeAuthToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes('login.html')) {
      console.log('🚫 Login.js: Not on login page, skipping');
      return;
  }

  console.log('✅ Login.js: Running');

  const container = document.getElementById('container');
  document.getElementById('register')?.addEventListener('click', () => container?.classList.add("active"));
  document.getElementById('login')?.addEventListener('click', () => container?.classList.remove("active"));

  document.getElementById("sp")?.addEventListener("click", e => { e.preventDefault(); registerUser(); });
  document.getElementById("si")?.addEventListener("click", e => { e.preventDefault(); loginUser(); });

  checkRedirect();
});

async function registerUser() {
  const name = document.querySelector(".sign-up input[placeholder='Name']").value.trim();
  const email = document.querySelector(".sign-up input[placeholder='Email']").value.trim();
  const password = document.querySelector(".sign-up input[placeholder='Password']").value;

  const btn = document.getElementById("sp");
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
  btn.disabled = true;

  try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
          showToast("Registration successful! Please check your email.");
          setTimeout(() => location.href = "/html/login.html", 3000);
      } else {
          showToast(data.message || "Registration failed", "error");
      }
  } catch (err) {
      showToast(err.message || "Network error", "error");
  } finally {
      btn.innerHTML = 'Sign Up';
      btn.disabled = false;
  }
}

async function loginUser() {
  const email = document.querySelector(".sign-in input[placeholder='Email']").value.trim();
  const password = document.querySelector(".sign-in input[placeholder='Password']").value;

  const btn = document.getElementById("si");
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  btn.disabled = true;

  try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
          // Use the consistent token storage function
          setAuthToken(data.token);
          showToast("Login successful! Redirecting...");
          
          // Clear any existing redirect URL to prevent loops
          const redirect = localStorage.getItem("redirectUrl") || "/html/home.html";
          localStorage.removeItem("redirectUrl");
          
          setTimeout(() => location.href = redirect, 1500);
      } else {
          showToast(data.message || "Invalid credentials", "error");
      }
  } catch (err) {
      showToast(err.message || "Network error", "error");
  } finally {
      btn.innerHTML = 'Sign In';
      btn.disabled = false;
  }
}

function checkRedirect() {
  const token = getAuthToken();
  
  // Only redirect if user is logged in AND not coming from a specific redirect
  if (token && window.location.pathname.includes('login.html')) {
      // Check if there's a redirect URL - if so, don't show the "already logged in" message
      const hasRedirectUrl = localStorage.getItem("redirectUrl");
      
      if (!hasRedirectUrl) {
          // Verify token is still valid before redirecting
          verifyTokenAndRedirect();
      }
  }
}

async function verifyTokenAndRedirect() {
  const token = getAuthToken();
  
  try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (response.ok) {
          showToast("You're already logged in. Redirecting...");
          setTimeout(() => location.href = '/html/home.html', 1500);
      } else {
          // Token is invalid, remove it
          removeAuthToken();
      }
  } catch (error) {
      console.error('Error verifying token:', error);
      // Remove invalid token
      removeAuthToken();
  }
}