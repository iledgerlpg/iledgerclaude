document.addEventListener("DOMContentLoaded", () => {
  // 1. INJECT STYLESHEET
  const style = document.createElement("style");
  style.textContent = `
    :root { --primary:#0D47A1; --primary-dark:#0a3880; --accent:#00BCD4; --sidebar-width:260px; --header-height:64px; --bg-body:#f0f4f8; --bg-card:#ffffff; --text-primary:#1e293b; --text-secondary:#475569; --border-color:#e2e8f0; }
    [data-theme="dark"] { --bg-body:#0f172a; --bg-card:#1e293b; --text-primary:#f1f5f9; --text-secondary:#94a3b8; --border-color:#334155; }
    
    /* Layout */
    .sidebar { position:fixed; top:0; left:0; bottom:0; width:var(--sidebar-width); background:linear-gradient(180deg, var(--primary-dark) 0%, var(--primary) 100%); z-index:200; transition:transform .3s cubic-bezier(0.4,0,0.2,1); box-shadow:4px 0 20px rgba(13,71,161,.3); }
    .sidebar.collapsed { transform:translateX(-100%); }
    .main-header { position:fixed; top:0; left:var(--sidebar-width); right:0; height:var(--header-height); background:var(--bg-card); border-bottom:1px solid var(--border-color); display:flex; align-items:center; padding:0 24px; z-index:100; transition:all .3s; }
    .main-header.full { left:0; }
    
    /* Toast Styles */
    .toast-container { position:fixed; top:80px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:8px; }
    .toast { padding:12px 18px; border-radius:10px; font-size:13px; font-weight:500; color:white; display:flex; align-items:center; gap:10px; min-width:280px; animation:toastIn .3s; box-shadow:0 8px 24px rgba(0,0,0,.2); }
    @keyframes toastIn { from { opacity:0; transform:translateX(50px); } to { opacity:1; transform:translateX(0); } }
    .toast-success { background:#166534; } .toast-error { background:#991b1b; }
    
    @media(max-width:768px){ .sidebar { transform:translateX(-100%); } .sidebar.open { transform:translateX(0); } .main-header { left:0 !important; } }
  `;
  document.head.appendChild(style);

  // 2. INJECT HTML
  const container = document.getElementById("navbarContainer");
  if (!container) return;
  container.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon"><svg viewBox="0 0 32 32"><path d="M4 4h10v10H4zm14 0h10v10H18zM4 18h10v10H4zm14 0h10v10H18z" fill="white"/></svg></div>
        <div class="brand-text"><h1>iLedgerV2</h1><p>Fleet Management System</p></div>
      </div>
      <div class="sidebar-user">
        <div class="user-avatar" id="userAvatar">--</div>
        <div class="user-info">
          <div class="user-name" id="userName">Loading...</div>
          <span class="user-role" id="userRole">--</span>
        </div>
      </div>
      <nav class="sidebar-nav" id="sidebarNav">
        <a href="#" class="nav-item" data-page="dashboard" onclick="navigate('dashboard')">Dashboard</a>
        <a href="#" class="nav-item" data-page="pemasukan" onclick="navigate('pemasukan')">Pendapatan</a>
        <a href="#" class="nav-item" data-page="pengeluaran" onclick="navigate('pengeluaran')">Pengeluaran</a>
        <div id="hrdMenus"><span class="nav-section-label">Admin</span>
          <a href="#" class="nav-item" data-page="user-management" onclick="navigate('user-management')">Users</a>
        </div>
      </nav>
      <div class="sidebar-footer"><button class="nav-logout" onclick="handleLogout()">Logout</button></div>
    </aside>

    <header class="main-header" id="mainHeader">
      <button class="header-toggle" onclick="toggleSidebar()">☰</button>
      <div class="header-breadcrumb" id="breadcrumbCurrent">Dashboard</div>
      <div class="header-actions">
        <button class="header-btn" onclick="toggleTheme()">🌙</button>
        <button class="header-btn" id="btnNotif">🔔<span id="notifDot" style="display:none"></span></button>
      </div>
    </header>
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>
    <div class="toast-container" id="toastContainer"></div>
  `;

  // 3. INITIALIZE USER SESSION
  const user = JSON.parse(localStorage.getItem('il_user') || '{}');
  if (!localStorage.getItem('il_token')) window.location.href = 'login.html';

  if (user.name) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = user.name.charAt(0);
    document.getElementById('userRole').textContent = user.role;
    if (user.role !== 'HRD') document.getElementById('hrdMenus').style.display = 'none';
  }

  // Active Menu Highlight
  const page = window.CURRENT_PAGE || 'dashboard';
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
});

// 4. GLOBAL HELPERS
window.navigate = (page) => window.location.href = page + '.html';

window.toggleSidebar = () => {
  const sidebar = document.getElementById('sidebar');
  const header = document.getElementById('mainHeader');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('collapsed');
    header.classList.toggle('full');
  }
};

window.showToast = (msg, type = 'success') => {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
};

window.handleLogout = async () => {
  localStorage.removeItem('il_token');
  localStorage.removeItem('il_user');
  window.location.href = 'login.html';
};

window.toggleTheme = () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('il_theme', next);
};
