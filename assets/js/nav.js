// ============================================================
// iLedgerV2 - Navigation & Layout Module
// File: assets/js/nav.js
// Pengganti navbar-sidebar.html yang dulunya di-include via GAS
// ============================================================

const Nav = (() => {

  function render(currentPage) {
    const user = API.getUser() || {};

    const navHTML = `
    <style>
    :root {
      --primary:#0D47A1;--primary-light:#1565C0;--primary-dark:#0a3880;
      --accent:#00BCD4;--sidebar-width:260px;--header-height:64px;
      --white:#ffffff;--gray-50:#f8fafc;--gray-100:#f1f5f9;
      --gray-200:#e2e8f0;--gray-400:#94a3b8;--gray-600:#475569;--gray-800:#1e293b;
      --success:#10b981;--error:#ef4444;--warning:#f59e0b;--info:#3b82f6;
      --radius:10px;--radius-lg:16px;
      --shadow-sm:0 1px 3px rgba(0,0,0,.08);--shadow-md:0 4px 16px rgba(0,0,0,.1);
      --font:'Plus Jakarta Sans',sans-serif;
      --bg-body:#f0f4f8;--bg-card:#ffffff;--text-primary:#1e293b;
      --text-secondary:#475569;--border-color:#e2e8f0;
    }
    [data-theme="dark"]{
      --bg-body:#0f172a;--bg-card:#1e293b;--text-primary:#f1f5f9;
      --text-secondary:#94a3b8;--border-color:#334155;
      --gray-50:#1e293b;--gray-100:#273549;--gray-200:#334155;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:var(--font);background:var(--bg-body);color:var(--text-primary);min-height:100vh;transition:background .3s,color .3s}
    .sidebar{position:fixed;top:0;left:0;bottom:0;width:var(--sidebar-width);background:linear-gradient(180deg,var(--primary-dark) 0%,var(--primary) 100%);z-index:200;display:flex;flex-direction:column;transform:translateX(0);transition:transform .3s cubic-bezier(0.4,0,0.2,1);box-shadow:4px 0 20px rgba(13,71,161,.3)}
    .sidebar.collapsed{transform:translateX(-100%)}
    .sidebar-brand{padding:20px 20px 0;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:20px}
    .brand-icon{width:40px;height:40px;background:rgba(255,255,255,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.2);flex-shrink:0}
    .brand-icon svg{width:22px;height:22px;fill:white}
    .brand-text h1{font-size:18px;font-weight:800;color:white;letter-spacing:-.3px}
    .brand-text p{font-size:10px;color:rgba(255,255,255,.55);font-weight:400;margin-top:1px}
    .sidebar-user{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:12px}
    .user-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#0288D1);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:white;flex-shrink:0}
    .user-name{font-size:13px;font-weight:600;color:white;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .user-role{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;padding:2px 8px;border-radius:10px;margin-top:3px;display:inline-block}
    .role-hrd{background:rgba(0,188,212,.25);color:#4DD0E1}
    .role-admin{background:rgba(255,255,255,.15);color:rgba(255,255,255,.8)}
    .sidebar-nav{flex:1;overflow-y:auto;padding:12px 0;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.2) transparent}
    .nav-section-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,255,255,.4);padding:10px 20px 4px;display:block}
    .nav-item{display:flex;align-items:center;gap:12px;padding:10px 20px;cursor:pointer;color:rgba(255,255,255,.7);font-size:13.5px;font-weight:500;text-decoration:none;transition:all .2s;position:relative;margin:1px 8px;border-radius:8px}
    .nav-item:hover{background:rgba(255,255,255,.1);color:white}
    .nav-item.active{background:rgba(255,255,255,.18);color:white;font-weight:600;box-shadow:inset 3px 0 0 var(--accent)}
    .nav-item.active::before{content:'';position:absolute;right:12px;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:var(--accent)}
    .nav-icon{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.8;flex-shrink:0}
    .nav-badge{margin-left:auto;background:var(--error);color:white;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px}
    .sidebar-footer{padding:12px 8px;border-top:1px solid rgba(255,255,255,.1)}
    .nav-logout{display:flex;align-items:center;gap:12px;width:100%;padding:10px 20px;background:rgba(239,68,68,.15);color:rgba(255,180,180,.9);border:none;cursor:pointer;font-family:var(--font);font-size:13px;font-weight:600;border-radius:8px;transition:all .2s}
    .nav-logout:hover{background:rgba(239,68,68,.25);color:white}
    .main-header{position:fixed;top:0;left:var(--sidebar-width);right:0;height:var(--header-height);background:var(--bg-card);border-bottom:1px solid var(--border-color);display:flex;align-items:center;padding:0 24px;z-index:100;transition:left .3s;box-shadow:var(--shadow-sm);gap:16px}
    .main-header.full{left:0}
    .header-toggle{width:36px;height:36px;border-radius:8px;background:transparent;border:1.5px solid var(--border-color);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);transition:all .2s;flex-shrink:0}
    .header-toggle:hover{background:var(--gray-100);color:var(--text-primary)}
    .header-toggle svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2}
    .header-breadcrumb{flex:1;display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary)}
    .breadcrumb-sep{color:var(--border-color)}
    .breadcrumb-current{font-weight:600;color:var(--text-primary)}
    .header-actions{display:flex;align-items:center;gap:8px}
    .header-btn{width:36px;height:36px;border-radius:8px;background:transparent;border:1.5px solid var(--border-color);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);transition:all .2s;position:relative}
    .header-btn:hover{background:var(--gray-100);color:var(--text-primary)}
    .header-btn svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:2}
    .header-company{display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--gray-50);border-radius:8px;border:1px solid var(--border-color);font-size:12px;font-weight:600;color:var(--text-secondary);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .company-dot{width:7px;height:7px;border-radius:50%;background:var(--success);flex-shrink:0}
    .main-content{margin-left:var(--sidebar-width);margin-top:var(--header-height);padding:24px;min-height:calc(100vh - var(--header-height));transition:margin-left .3s}
    .main-content.full{margin-left:0}
    .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:150}
    .toast-container{position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px}
    .toast{padding:12px 18px;border-radius:10px;font-size:13px;font-weight:500;color:white;display:flex;align-items:center;gap:10px;min-width:280px;max-width:360px;animation:toastIn .3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 8px 24px rgba(0,0,0,.2)}
    @keyframes toastIn{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}
    .toast-success{background:#166534;border:1px solid rgba(16,185,129,.3)}
    .toast-error{background:#991b1b;border:1px solid rgba(239,68,68,.3)}
    .toast-warning{background:#92400e;border:1px solid rgba(245,158,11,.3)}
    .toast-info{background:#1e40af;border:1px solid rgba(59,130,246,.3)}
    .toast svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.5;flex-shrink:0}
    .toast-close{margin-left:auto;background:none;border:none;cursor:pointer;color:rgba(255,255,255,.7);padding:0 0 0 6px}
    .page-header{margin-bottom:24px}
    .page-title{font-size:22px;font-weight:800;color:var(--text-primary);letter-spacing:-.4px}
    .page-subtitle{font-size:13px;color:var(--text-secondary);margin-top:4px}
    .card{background:var(--bg-card);border-radius:var(--radius-lg);border:1px solid var(--border-color);box-shadow:var(--shadow-sm)}
    .card-header{padding:18px 20px;border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between}
    .card-title{font-size:15px;font-weight:700;color:var(--text-primary)}
    .card-body{padding:20px}
    .skeleton{background:linear-gradient(90deg,var(--gray-100) 25%,var(--gray-200) 50%,var(--gray-100) 75%);background-size:200% 100%;animation:skeleton 1.5s infinite;border-radius:6px}
    @keyframes skeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .data-table{width:100%;border-collapse:collapse}
    .data-table th{background:var(--gray-50);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text-secondary);padding:12px 16px;border-bottom:1.5px solid var(--border-color);white-space:nowrap}
    .data-table td{padding:12px 16px;font-size:13px;color:var(--text-primary);border-bottom:1px solid var(--border-color)}
    .data-table tr:hover td{background:var(--gray-50)}
    .data-table tr:last-child td{border-bottom:none}
    .table-wrapper{overflow-x:auto;border-radius:var(--radius-lg);border:1px solid var(--border-color)}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
    .badge-success{background:#dcfce7;color:#166534}.badge-error{background:#fee2e2;color:#991b1b}
    .badge-warning{background:#fef3c7;color:#92400e}.badge-info{background:#dbeafe;color:#1e40af}
    .badge-gray{background:var(--gray-100);color:var(--text-secondary)}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:var(--radius);font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;border:none;white-space:nowrap}
    .btn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2}
    .btn-primary{background:linear-gradient(135deg,var(--primary),var(--primary-light));color:white}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 15px rgba(13,71,161,.3)}
    .btn-success{background:#10b981;color:white}.btn-success:hover{background:#059669}
    .btn-danger{background:var(--error);color:white}.btn-danger:hover{background:#dc2626}
    .btn-outline{background:transparent;color:var(--text-secondary);border:1.5px solid var(--border-color)}
    .btn-outline:hover{background:var(--gray-50);color:var(--text-primary)}
    .btn-sm{padding:6px 12px;font-size:12px}.btn-icon{padding:8px;border-radius:8px}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .2s}
    .modal-overlay.show{opacity:1;pointer-events:all}
    .modal{background:var(--bg-card);border-radius:var(--radius-lg);width:100%;max-width:560px;box-shadow:0 20px 60px rgba(0,0,0,.25);transform:scale(.95) translateY(20px);transition:transform .25s;max-height:90vh;overflow:hidden;display:flex;flex-direction:column}
    .modal-overlay.show .modal{transform:scale(1) translateY(0)}
    .modal-header{padding:20px 24px;border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between}
    .modal-title{font-size:16px;font-weight:700;color:var(--text-primary)}
    .modal-close{width:32px;height:32px;border-radius:8px;background:transparent;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);transition:all .2s}
    .modal-close:hover{background:var(--gray-100)}
    .modal-close svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}
    .modal-body{padding:24px;overflow-y:auto;flex:1}
    .modal-footer{padding:16px 24px;border-top:1px solid var(--border-color);display:flex;gap:10px;justify-content:flex-end}
    .form-group-m{margin-bottom:16px}
    .form-label-m{display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px}
    .form-control-m{width:100%;padding:10px 14px;border:1.5px solid var(--border-color);border-radius:var(--radius);font-family:var(--font);font-size:13.5px;color:var(--text-primary);background:var(--bg-card);transition:all .2s;outline:none}
    .form-control-m:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(13,71,161,.1)}
    .form-row-m{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .pagination{display:flex;align-items:center;gap:6px;justify-content:flex-end;margin-top:16px}
    .page-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--border-color);background:var(--bg-card);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;color:var(--text-secondary);transition:all .2s}
    .page-btn:hover{border-color:var(--primary);color:var(--primary)}
    .page-btn.active{background:var(--primary);border-color:var(--primary);color:white}
    .page-btn:disabled{opacity:.4;cursor:not-allowed}
    .kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
    .kpi-card{background:var(--bg-card);border-radius:var(--radius-lg);border:1px solid var(--border-color);padding:20px;display:flex;align-items:flex-start;gap:14px;transition:transform .2s,box-shadow .2s}
    .kpi-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}
    .kpi-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .kpi-icon svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.8}
    .kpi-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-secondary);margin-bottom:4px}
    .kpi-value{font-size:18px;font-weight:800;color:var(--text-primary);letter-spacing:-.5px;line-height:1.2}
    .kpi-value.sm{font-size:15px}
    .search-bar{display:flex;align-items:center;gap:10px;background:var(--bg-card);border:1.5px solid var(--border-color);border-radius:var(--radius);padding:0 14px;transition:border-color .2s}
    .search-bar:focus-within{border-color:var(--primary)}
    .search-bar svg{width:16px;height:16px;stroke:var(--gray-400);fill:none;stroke-width:2;flex-shrink:0}
    .search-input{border:none;outline:none;background:transparent;font-family:var(--font);font-size:13.5px;color:var(--text-primary);padding:10px 0;width:100%}
    .search-input::placeholder{color:var(--gray-400)}
    @media(max-width:768px){
      .sidebar{transform:translateX(-100%);width:280px}
      .sidebar.open{transform:translateX(0)}
      .sidebar-overlay{display:none}
      .sidebar-overlay.show{display:block}
      .main-header{left:0!important}
      .main-content{margin-left:0!important;padding:16px}
      .kpi-grid{grid-template-columns:repeat(2,1fr);gap:12px}
      .form-row-m{grid-template-columns:1fr}
      .btn-text-hide{display:none}
      .header-company{display:none}
    }
    @media(max-width:380px){.kpi-grid{grid-template-columns:1fr}}
    </style>

    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 32 32"><path d="M4 4h10v10H4zm14 0h10v10H18zM4 18h10v10H4zm14 0h10v10H18z" opacity=".4"/><path d="M6 6h6v6H6zm14 0h6v6h-6zM6 20h6v6H6zm14 0h6v6h-6z"/></svg>
        </div>
        <div class="brand-text"><h1>iLedgerV2</h1><p>Fleet Management System</p></div>
      </div>
      <div class="sidebar-user">
        <div class="user-avatar" id="userAvatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
        <div>
          <div class="user-name" id="userName">${user.name || 'Loading...'}</div>
          <span class="user-role ${user.role === 'HRD' ? 'role-hrd' : 'role-admin'}" id="userRole">${user.role || 'ADMIN'}</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <span class="nav-section-label">Utama</span>
        <a href="dashboard.html" class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </a>
        <span class="nav-section-label">Transaksi</span>
        <a href="pemasukan.html" class="nav-item ${currentPage === 'pemasukan' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          Pendapatan
        </a>
        <a href="pengeluaran.html" class="nav-item ${currentPage === 'pengeluaran' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          Pengeluaran
        </a>
        <a href="pos.html" class="nav-item ${currentPage === 'pos' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Kelola Pos
        </a>
        <span class="nav-section-label">Armada</span>
        <a href="armada.html" class="nav-item ${currentPage === 'armada' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          Data Armada
        </a>
        <a href="bbm.html" class="nav-item ${currentPage === 'bbm' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M3 22V6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16"/><path d="M20 9h-2a1 1 0 0 0-1 1v9h3V9z"/><line x1="1" y1="22" x2="23" y2="22"/><rect x="6" y="9" width="5" height="4"/></svg>
          BBM
        </a>
        <a href="perawatan.html" class="nav-item ${currentPage === 'perawatan' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          Perawatan Armada
        </a>
        <a href="pajak.html" class="nav-item ${currentPage === 'pajak' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Pajak Kendaraan
          <span class="nav-badge" id="pajakBadge" style="display:none">!</span>
        </a>
        <span class="nav-section-label">Laporan</span>
        <a href="labarugi.html" class="nav-item ${currentPage === 'labarugi' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Laba Rugi
        </a>
        ${user.role === 'HRD' ? `
        <span class="nav-section-label">SDM</span>
        <a href="karyawan.html" class="nav-item ${currentPage === 'karyawan' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Kelola Karyawan
        </a>
        <span class="nav-section-label">Administrasi</span>
        <a href="user-management.html" class="nav-item ${currentPage === 'user-management' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          User Management
          <span class="nav-badge" id="pendingBadge" style="display:none">0</span>
        </a>
        ` : ''}
        <span class="nav-section-label">Sistem</span>
        <a href="settings.html" class="nav-item ${currentPage === 'settings' ? 'active' : ''}">
          <svg class="nav-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Pengaturan
        </a>
      </nav>
      <div class="sidebar-footer">
        <button class="nav-logout" id="logoutBtn">
          <svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>

    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <div class="toast-container" id="toastContainer"></div>
    `;

    // Inject into body
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('sidebarOverlay').addEventListener('click', toggleSidebar);

    // Apply saved theme
    const savedTheme = localStorage.getItem('il_theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function renderHeader(pageName, companyName = '') {
    const headerHTML = `
    <header class="main-header" id="mainHeader">
      <button class="header-toggle" onclick="Nav.toggleSidebar()">
        <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div class="header-breadcrumb">
        <span>iLedgerV2</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${pageName}</span>
      </div>
      ${companyName ? `<div class="header-company"><span class="company-dot"></span>${companyName}</div>` : ''}
      <div class="header-actions">
        <button class="header-btn" onclick="Nav.toggleTheme()" title="Toggle Dark Mode">
          <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>
    </header>
    `;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const header = document.getElementById('mainHeader');
    const content = document.querySelector('.main-content');

    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    } else {
      sidebar.classList.toggle('collapsed');
      header && header.classList.toggle('full');
      content && content.classList.toggle('full');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('il_theme', next);
  }

  async function handleLogout() {
    if (!confirm('Keluar dari aplikasi?')) return;
    await API.logout(true);
    window.location.href = 'login.html';
  }

  function requireAuth() {
    if (!API.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  return { render, renderHeader, toggleSidebar, toggleTheme, handleLogout, requireAuth };
})();

// ============================================================
// GLOBAL HELPERS (used across all pages)
// ============================================================

function showToast(message, type = 'success', duration = 3500) {
  const icons = {
    success: '<polyline points="20 6 9 17 4 12"/>',
    error: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  };
  const tc = document.getElementById('toastContainer');
  if (!tc) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<svg viewBox="0 0 24 24">${icons[type] || icons.info}</svg><span>${message}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  tc.appendChild(t);
  setTimeout(() => t && t.remove(), duration);
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('show'); document.body.style.overflow = ''; }
}

function confirmAction(msg, cb) { if (confirm(msg)) cb(); }

function formatRupiah(amount) {
  return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let html = `<button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage - 1})">
    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>`;
  const range = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);
  let prev = null;
  range.forEach(p => {
    if (prev && p - prev > 1) html += '<span style="color:var(--gray-400);padding:0 4px">...</span>';
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="(${onPageChange})(${p})">${p}</button>`;
    prev = p;
  });
  html += `<button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage + 1})">
    <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>`;
  el.innerHTML = html;
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});
