/* ============================================================
   admin.js — FINAL CLEAN VERSION
   ============================================================ */

const API = 'http://localhost:8000/api';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const currentPage = window.location.pathname.split('/').pop();
const isAdminLoginPage = currentPage === 'admin-login.html';
const isAdminDashboardPage = currentPage === 'admin.html';

/* ================= LOGIN ================= */
async function loginAdmin() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);

    window.location.href = "admin.html";
  } catch {
    alert("Server error");
  }
}

if (isAdminLoginPage) {
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginAdmin();
  });
}

/* ================= AUTH GUARD ================= */
if (isAdminDashboardPage) {
  if (!token) window.location.href = 'index.html';
  if (role !== 'admin') window.location.href = 'dashboard.html';

  const now = new Date();
  document.getElementById('todayDate').textContent =
    now.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
}

let allRows = [];

/* ================= TOAST ================= */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ================= LOAD DASHBOARD ================= */
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/meals/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const d = await res.json();

    document.getElementById('statTotal').textContent = d.totalStudents ?? 0;
    document.getElementById('statBreakfast').textContent = d.breakfastCount ?? 0;
    document.getElementById('statLunch').textContent = d.lunchCount ?? 0;
    document.getElementById('statDinner').textContent = d.dinnerCount ?? 0;

  } catch {
    showToast('Failed to load dashboard', 'error');
  }
}

/* ================= LOAD MEALS ================= */
async function loadAllMeals() {
  const tbody = document.getElementById('mealTableBody');

  try {
    const res = await fetch(`${API}/meals/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    allRows = await res.json();
    renderTable(allRows);

  } catch {
    tbody.innerHTML = `
      <tr><td colspan="5">Failed to load data</td></tr>`;
    showToast('Failed to load meals', 'error');
  }
}

/* ================= RENDER TABLE ================= */
function renderTable(meals) {
  const tbody = document.getElementById('mealTableBody');

  if (!meals.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">No students found</div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = meals.map(m => {
    const user = m.userId || {};
    const name = user.name || 'Unknown';
    const studentId = user.studentId || 'N/A';
    const avatar = name ? name.charAt(0).toUpperCase() : '?';
    const isHome = m.status === 'going_home';

    return `
      <tr>
        <td>
          <div class="student-cell">
            <div class="avatar">${avatar}</div>
            <div>
              <div class="student-name">${name}</div>
              <div class="student-email">ID: ${studentId}</div>
            </div>
          </div>
        </td>
        <td>${isHome ? '🏠' : m.breakfast ? '✔' : '—'}</td>
        <td>${isHome ? '🏠' : m.lunch ? '✔' : '—'}</td>
        <td>${isHome ? '🏠' : m.dinner ? '✔' : '—'}</td>
        <td>${isHome ? 'Going Home' : 'Present'}</td>
      </tr>
    `;
  }).join('');
}

/* ================= ADD STUDENT ================= */
async function handleAddStudent() {
  const name = document.getElementById('newName').value.trim();
  const password = document.getElementById('newPassword').value;

  if (!name || !password) {
    return showToast('Please fill all fields', 'error');
  }

  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Adding…';
  btn.classList.add('loading');

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, password, role: 'student' })
    });

    const data = await res.json();

    if (!res.ok) {
      return showToast(data.message || 'Failed', 'error');
    }

    showToast(`${name} added! ID: ${data.studentId} 🎉`);

    closeModal();

    // Refresh UI
    loadDashboard();
    loadAllMeals();

  } catch {
    showToast('Server error', 'error');
  } finally {
    btn.textContent = 'Add Student';
    btn.classList.remove('loading');
  }
}

/* ================= MODAL ================= */
function openModal() {
  document.getElementById('newName').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

/* ================= INIT ================= */
if (isAdminDashboardPage) {
  loadDashboard();
  loadAllMeals();
}