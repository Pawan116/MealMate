/* ============================================================
   auth.js — Login page logic
   ============================================================ */

const API = 'http://localhost:8000/api';

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3200);
}

async function handleLogin() {
  const studentId = document.getElementById('studentId').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!studentId || !password) return showToast('Please fill all fields', 'error');

  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Signing in…';
  btn.classList.add('loading');

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, password })
    });

    const data = await res.json();
    if (!res.ok) return showToast(data.message || 'Login failed', 'error');

    localStorage.setItem('token', data.token);
    localStorage.setItem('role',  data.role);
    localStorage.setItem('name',  data.name);

    showToast(`Welcome back, ${data.name}!`);
    setTimeout(() => {
      window.location.href = data.role === 'admin' ? 'admin.html' : 'dashboard.html';
    }, 900);

  } catch {
    showToast('Server unreachable', 'error');
  } finally {
    btn.textContent = 'Sign In';
    btn.classList.remove('loading');
  }
}

// Enter key support
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});

function goToAdmin() {
  window.location.href = "admin-login.html";
}

const adminRoleBtn = document.getElementById('adminRoleBtn');
if (adminRoleBtn) {
  adminRoleBtn.addEventListener('click', goToAdmin);
}

function forgotPassword() {
  document.getElementById("resetModal").classList.add("open");
}

function closeResetModal(e) {
  if (!e || e.target.id === "resetModal") {
    document.getElementById("resetModal").classList.remove("open");
  }
}

async function handleResetPassword() {
  const studentId = document.getElementById("resetStudentId").value.trim();
  const password = document.getElementById("resetPassword").value;
  const confirmPassword = document.getElementById("resetConfirmPassword").value;

  if (!studentId || !password || !confirmPassword) {
    return showToast("Please fill all fields", "error");
  }

  if (password !== confirmPassword) {
    return showToast("Passwords do not match", "error");
  }

  const btn = document.getElementById("resetBtn");
  btn.textContent = "Resetting…";
  btn.classList.add("loading");

  try {
    const res = await fetch(`${API}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ studentId, newPassword: password })
    });

    const data = await res.json();

    if (!res.ok) {
      return showToast(data.message || "Failed", "error");
    }

    showToast("Password reset successful ✅");
    closeResetModal();

  } catch {
    showToast("Server error", "error");
  } finally {
    btn.textContent = "Reset Password";
    btn.classList.remove("loading");
  }
}