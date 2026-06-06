// ============================================================
// DASHBOARD LOGIC (ANTI-CORS SINKRONISASI)
// ============================================================

let currentFilter = 'monthly';
let trendChart, posChart, bbmChart, perawatanChart, pajakChart;

// Init Jalur Utama
// Di dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const data = await callAPI('getDashboardData', { filter: 'monthly' });
    if (data.success) {
        // Karena _user sudah ter-inject ke window oleh api.js
        document.getElementById('user-name').innerText = `Selamat Datang, ${window._user.name}`;
        updateDashboardUI(data.data);
    }
});
  // 1. Muat komponen UI Navbar
  await loadNavbar();
  
  // 2. Tarik data dari Google Apps Script
  await loadDashboard();
});

async function loadNavbar() {
  try {
    const r = await fetch('navbar-sidebar.html');
    if (!r.ok) throw new Error("File navbar-sidebar.html tidak ditemukan");
    
    const html = await r.text();
    document.getElementById('navbarContainer').innerHTML = html;
    
    // Jalankan script dari navbar secara aman
    const scripts = document.getElementById('navbarContainer').querySelectorAll('script');
    scripts.forEach(s => {
      if (s.textContent.trim()) {
        const newScript = document.createElement('script');
        newScript.textContent = s.textContent;
        document.body.appendChild(newScript);
      }
    });
  } catch (error) {
    console.error('Gagal memuat navbar:', error);
  }
}

async function loadDashboard() {
  try {
    // Memanggil API Backend Apps Script secara pararel (Efisiensi Tinggi)
    const [dashData, pajakData] = await Promise.all([
      callAPI('getDashboardData', { filter: currentFilter }),
      callAPI('getPajakReminders', {})
    ]).catch(err => {
      throw new Error("Gagal melakukan jabat tangan pararel ke Apps Script: " + err.message);
    });

    // Proses Data Core Dashboard & Chart Utama
    if (dashData && dashData.success) {
      renderKPIs(dashData.data.kpi);
      renderPosChart(dashData.data.pengeluaranByPos);
      renderTrendChart(dashData.data.trendData);
      
      document.getElementById('lastUpdated').textContent = 
        'Diperbarui: ' + new Date().toLocaleTimeString('id-ID');
      
      // Set ucapan selamat & nama user berdasarkan session global data
      if (window._user && window._user.name) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Selamat pagi' : hour < 18 ? 'Selamat siang' : 'Selamat malam';
        document.getElementById('dashboardSubtitle').textContent = 
          `${greeting}, ${window._user.name.split(' ')[0]}! Berikut ringkasan bisnis Anda.`;
      }
    } else {
      console.warn("Dashboard data merespon negatif:", dashData);
    }

    // Proses Notifikasi Pajak
    if (pajakData && pajakData.success) {
      renderReminders(pajakData.data);
      if (pajakData.data.length > 0) {
        const notif = document.getElementById('notifDot');
        if (notif) notif.style.display = 'block';
      }
    }

    // Eksekusi load grafik sekunder (BBM, Perawatan, Pajak)
    await loadCharts();

  } catch (err) {
    if (typeof showToast === 'function') showToast('Gagal memuat data dashboard.', 'error');
    console.error("[Dashboard Error]", err);
  }
}

// ============================================================
// RENDER CHARTS (Chart.js Integrations)
// ============================================================
function renderTrendChart(trendData) {
  const el = document.getElementById('chartTrend');
  if (!el || !trendData) return;
  const ctx = el.getContext('2d');
  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.months || [],
      datasets: [
        {
          label: 'Pendapatan',
          data: trendData.pendapatanData || [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#10b981'
        },
        {
          label: 'Pengeluaran',
          data: trendData.pengeluaranData || [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#ef4444'
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } } },
        tooltip: { callbacks: { label: (ctx) => ' ' + ctx.dataset.label + ': ' + formatRupiah(ctx.parsed.y) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          ticks: { callback: v => 'Rp ' + (v/1000000).toFixed(1) + 'jt', font: { size: 11 } },
          grid: { color: 'rgba(0,0,0,.05)' }
        }
      }
    }
  });
}

function renderPosChart(posData) {
  const el = document.getElementById('chartPosDonut');
  if (!el) return;
  const ctx = el.getContext('2d');
  if (posChart) posChart.destroy();
  
  if (!posData || posData.length === 0) {
    ctx.font = '13px Plus Jakarta Sans';
    return;
  }

  const palette = ['#0D47A1','#1565C0','#1976D2','#1E88E5','#42A5F5','#00BCD4','#26C6DA','#4DD0E1','#80DEEA'];
  
  posChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: posData.map(p => p.pos),
      datasets: [{
        data: posData.map(p => p.total),
        backgroundColor: palette.slice(0, posData.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 8, font: { size: 10 } } },
        tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ': ' + formatRupiah(ctx.parsed) } }
      }
    }
  });
}

async function loadCharts() {
  try {
    const [bbmData, perawatanData, pajakData] = await Promise.all([
      callAPI('getDashboardCharts', { chartType: 'bbm', period: currentFilter }),
      callAPI('getDashboardCharts', { chartType: 'perawatan', period: currentFilter }),
      callAPI('getDashboardCharts', { chartType: 'pajak', period: currentFilter })
    ]);

    if (bbmData && bbmData.success) renderBBMChart(bbmData.data);
    if (perawatanData && perawatanData.success) renderPerawatanChart(perawatanData.data);
    if (pajakData && pajakData.success) renderPajakChart(pajakData.data);

  } catch (err) {
    console.error('Gagal memuat sub-charts pendukung:', err);
  }
}

function renderBBMChart(data) {
  const el = document.getElementById('chartBBM');
  if (!el || !data) return;
  const ctx = el.getContext('2d');
  if (bbmChart) bbmChart.destroy();
  
  bbmChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels || [],
      datasets: [{
        label: 'Liter',
        data: data.liter || [],
        backgroundColor: 'rgba(251,146,60,.7)',
        borderRadius: 4,
        yAxisID: 'y'
      }, {
        label: 'Biaya',
        data: data.biaya || [],
        type: 'line',
        borderColor: '#0D47A1',
        backgroundColor: 'transparent',
        tension: 0.4,
        yAxisID: 'y1'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { font: { size: 10 } } } },
      scales: {
        y: { ticks: { font: { size: 10 } }, grid: { display: false } },
        y1: { position: 'right', ticks: { callback: v => (v/1000000).toFixed(1)+'jt', font: { size: 10 } }, grid: { display: false } },
        x: { ticks: { font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}

function renderPerawatanChart(data) {
  const el = document.getElementById('chartPerawatan');
  if (!el || !data) return;
  const ctx = el.getContext('2d');
  if (perawatanChart) perawatanChart.destroy();
  
  const colors = ['#0D47A1','#1976D2','#42A5F5','#00BCD4','#4DB6AC','#AED581'];
  perawatanChart = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: data.labels || [],
      datasets: [{ data: data.values || [], backgroundColor: colors.map(c => c + 'CC') }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 9 } } } }
    }
  });
}

function renderPajakChart(data) {
  const el = document.getElementById('chartPajak');
  if (!el || !data) return;
  const ctx = el.getContext('2d');
  if (pajakChart) pajakChart.destroy();
  
  pajakChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Aman', 'Segera Jatuh Tempo', 'Terlambat'],
      datasets: [{
        data: [data.aman || 0, data.segeraJatuhTempo || 0, data.terlambat || 0],
        backgroundColor: ['#10b981','#f59e0b','#ef4444'],
        borderWidth: 2, borderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, usePointStyle: true } }
      }
    }
  });
}

// ============================================================
// RENDER DATA LIST & METRICS
// ============================================================
function renderKPIs(kpi) {
  if (!kpi) return;
  const cards = [
    { label: 'Total Pendapatan', value: formatRupiah(kpi.totalPendapatan), icon: `<svg class="nav-icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`, bg: '#DBEAFE', color: '#1D4ED8' },
    { label: 'Total Pengeluaran', value: formatRupiah(kpi.totalPengeluaran), icon: `<svg class="nav-icon" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`, bg: '#FEE2E2', color: '#DC2626' },
    { label: 'Laba Bersih', value: formatRupiah(kpi.labaBersih), icon: `<svg class="nav-icon" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`, bg: kpi.labaBersih >= 0 ? '#DCFCE7' : '#FEE2E2', color: kpi.labaBersih >= 0 ? '#16A34A' : '#DC2626' },
    { label: 'Jumlah Armada', value: (kpi.jumlahArmada || 0) + ' Unit', icon: `<svg class="nav-icon" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`, bg: '#FEF3C7', color: '#D97706' },
    { label: 'Jumlah Karyawan', value: (kpi.jumlahKaryawan || 0) + ' Orang', icon: `<svg class="nav-icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, bg: '#F0FDF4', color: '#16A34A' },
    { label: 'BBM Bulan Ini', value: formatRupiah(kpi.bbmBulanIni), icon: `<svg class="nav-icon" viewBox="0 0 24 24"><path d="M3 22V6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16"/><rect x="6" y="9" width="5" height="4"/></svg>`, bg: '#FFF7ED', color: '#EA580C' },
    { label: 'Pengeluaran Bulan Ini', value: formatRupiah(kpi.pengeluaranBulanIni), icon: `<svg class="nav-icon" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`, bg: '#F5F3FF', color: '#7C3AED' },
    { label: 'Periode', value: ['Harian','Mingguan','Bulanan','Tahunan'][['daily','weekly','monthly','yearly'].indexOf(currentFilter)], icon: `<svg class="nav-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`, bg: '#EFF6FF', color: '#2563EB' }
  ];

  const grid = document.getElementById('kpiGrid');
  if (grid) {
    grid.innerHTML = cards.map(c => `
      <div class="kpi-card">
        <div class="kpi-icon" style="background:${c.bg};color:${c.color}">${c.icon}</div>
        <div>
          <div class="kpi-label">${c.label}</div>
          <div class="kpi-value sm">${c.value}</div>
        </div>
      </div>
    `).join('');
  }
}

function renderReminders(reminders) {
  const el = document.getElementById('reminderList');
  if (!el) return;
  
  if (!reminders || reminders.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px">✅ Tidak ada reminder pajak saat ini</div>';
    return;
  }

  el.innerHTML = reminders.slice(0, 5).map(r => {
    const isDanger = r.statusSTNK === 'TERLAMBAT' || r.statusKIR === 'TERLAMBAT';
    const cls = isDanger ? 'danger' : 'warning';
    const diff = r.diffSTNK !== null ? r.diffSTNK : r.diffKIR;
    const diffText = diff === null ? '' : diff < 0 ? Math.abs(diff) + ' hari terlambat' : diff + ' hari lagi';
    
    return `
      <div class="reminder-item ${cls}">
        <span class="reminder-badge ${cls}"></span>
        <div class="reminder-detail">
          <div class="reminder-title">${r.noPolisi}</div>
          <div class="reminder-desc">STNK: ${r.tanggalSTNK || '-'} · KIR: ${r.tanggalKIR || '-'}</div>
        </div>
        <span class="reminder-days ${cls}">${diffText}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// FILTER & GLOBAL ACTIONS
// ============================================================
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach((t, i) => {
    t.classList.toggle('active', ['daily','weekly','monthly','yearly'][i] === filter);
  });
  loadDashboard();
}

function refreshDashboard() {
  loadDashboard();
}
