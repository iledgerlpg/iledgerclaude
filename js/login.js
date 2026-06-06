// js/login.js

// Hide loader after page ready
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('pageLoader').classList.add('hidden');
  }, 800);
});

// Check if already logged in
(function(){
  const token = localStorage.getItem('il_token');
  if (token) {
    // Sesuaikan dengan nama file dashboard lu
    window.location.href = 'dashboard.html'; 
  }
})();

// Toggle password visibility
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.querySelector('svg').innerHTML = isText
    ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
}

// Handle Enter key
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  clearAlert();

  // Validate
  if (!email) { showAlert('Email wajib diisi.', 'error'); return; }
  if (!password) { showAlert('Password wajib diisi.', 'error'); return; }

  setLoading(true);

  try {
    const res = await callAPI('login', { email, password, rememberMe });

    if (res.success) {
      // Save session
      localStorage.setItem('il_token', res.token);
      localStorage.setItem('il_user', JSON.stringify(res.user));

      showAlert('Login berhasil! Memuat dashboard...', 'success');
      setTimeout(() => {
        // Routing ke HTML lokal
        window.location.href = 'dashboard.html';
      }, 800);
    } else {
      const code = res.code;
      if (code === 'PENDING_APPROVAL') {
        showAlert('<strong>Akun Menunggu Approval</strong><br>HRD belum menyetujui akun Anda.', 'warning');
      } else {
        showAlert(res.error || 'Login gagal.', 'error');
        document.getElementById('password').classList.add('error');
        setTimeout(() => document.getElementById('password').classList.remove('error'), 2000);
      }
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    showAlert('Gagal terhubung ke server.', 'error');
  }

  setLoading(false);
}

function setLoading(state) {
  const btn = document.getElementById('btnLogin');
  const text = btn.querySelector('.btn-text');
  const spinner = document.getElementById('loginSpinner');
  btn.disabled = state;
  text.classList.toggle('hide', state);
  spinner.classList.toggle('show', state);
}

function showAlert(msg, type) {
  const icons = {
    error: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    success: '<polyline points="20 6 9 17 4 12"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>'
  };
  document.getElementById('alertArea').innerHTML = `
    <div class="alert alert-${type}">
      <svg viewBox="0 0 24 24">${icons[type]||icons.error}</svg>
      <span>${msg}</span>
    </div>`;
}

function clearAlert() {
  document.getElementById('alertArea').innerHTML = '';
}

// Helper untuk fetch ke Google Apps Script
function callAPI(action, payload) {
  // Menggunakan window.APP_URL yang di-set di config.js
  return fetch(window.APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload })
  }).then(r => r.json());
}

function showToast(msg, type='success') {
  const tc = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = msg;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
