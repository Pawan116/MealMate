/* ============================================================
   dashboard.js — Student meal dashboard logic
   ============================================================ */

const API   = 'http://localhost:8000/api';
const token = localStorage.getItem('token');
const role  = localStorage.getItem('role');
const name  = localStorage.getItem('name');

// Auth guard
if (!token) window.location.href = 'index.html';
if (role === 'admin') window.location.href = 'admin.html';

// Set name in nav
document.getElementById('navName').textContent = name || 'Student';

// Set today's date display
const now = new Date();
document.getElementById('todayDate').textContent = now.toLocaleDateString('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long'
});

// Local state
let state = { breakfast: false, lunch: false, dinner: false, goingHome: false };

/* ── TOGGLE MEAL CARD ── */
function toggleMeal(meal) {
  if (state.goingHome) return showToast('Deselect "Going Home" first', 'error');
  state[meal] = !state[meal];
  document.getElementById(`card-${meal}`).classList.toggle('selected', state[meal]);
  updateStatus();
}

/* ── TOGGLE GOING HOME ── */
function toggleGoingHome() {
  state.goingHome = !state.goingHome;
  if (state.goingHome) {
    state.breakfast = state.lunch = state.dinner = false;
    ['breakfast', 'lunch', 'dinner'].forEach(m =>
      document.getElementById(`card-${m}`).classList.remove('selected')
    );
  }
  document.getElementById('goingHomeCard').classList.toggle('selected', state.goingHome);
  updateStatus();
}

/* ── UPDATE STATUS BANNER ── */
function updateStatus() {
  const dot  = document.getElementById('statusDot');
  const text = document.getElementById('statusText');

  if (state.goingHome) {
    dot.className = 'status-dot home';
    text.textContent = "You're marked as going home today — all meals skipped";
    return;
  }

  const selected = ['breakfast', 'lunch', 'dinner'].filter(m => state[m]);
  dot.className = 'status-dot';
  text.textContent = selected.length
    ? `Meals selected: ${selected.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}`
    : 'No meals selected yet';
}

/* ── SHOW TOAST ── */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── LOAD TODAY'S MEAL FROM API ── */
async function loadTodayMeal() {
  try {
    const res = await fetch(`${API}/meals/today`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (data && data.status) {
      if (data.status === 'going_home') {
        state.goingHome = true;
        document.getElementById('goingHomeCard').classList.add('selected');
      } else {
        state.breakfast = data.breakfast || false;
        state.lunch     = data.lunch     || false;
        state.dinner    = data.dinner    || false;
        if (state.breakfast) document.getElementById('card-breakfast').classList.add('selected');
        if (state.lunch)     document.getElementById('card-lunch').classList.add('selected');
        if (state.dinner)    document.getElementById('card-dinner').classList.add('selected');
      }
      updateStatus();
    } else {
      document.getElementById('statusText').textContent = 'No meals marked yet — select below';
    }
  } catch {
    document.getElementById('statusText').textContent = 'Could not load meals';
  }
}

/* ── SAVE MEALS TO API ── */
async function saveMeals() {
  const btn = document.getElementById('saveBtn');
  btn.textContent = 'Saving…';
  btn.classList.add('loading');

  const body = state.goingHome
    ? { status: 'going_home' }
    : { breakfast: state.breakfast, lunch: state.lunch, dinner: state.dinner, status: 'active' };

  try {
    const res = await fetch(`${API}/meals/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const d = await res.json();
      return showToast(d.error || 'Failed to save', 'error');
    }

    showToast('Meals saved successfully! ✓');
    updateStatus();
  } catch {
    showToast('Server unreachable', 'error');
  } finally {
    btn.textContent = 'Save Meal Preferences';
    btn.classList.remove('loading');
  }
}

/* ── LOGOUT ── */
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Init
loadTodayMeal();