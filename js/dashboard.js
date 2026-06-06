// ============================================================
// DASHBOARD LOGIC (Production Ready - Anti-Race Condition)
// ============================================================

let currentFilter = 'monthly';
let trendChart, posChart, bbmChart, perawatanChart, pajakChart;
let dashboardController = new AbortController(); // Kontrol pembatalan request

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Validasi Sesi
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Initial Setup
  await loadNavbar();
  await loadDashboard();
});

async function loadNavbar() {
  try {
    const r = await fetch('navbar-sidebar.html');
    if (!r.ok) throw new Error("Navbar gagal dimuat");
    document.getElementById('navbarContainer').innerHTML = await r.text();
  } catch (error) {
    console.error('Navbar Error:', error);
  }
}

async function loadDashboard() {
  // Batalkan request yang masih pending jika user klik filter dengan cepat
  dashboardController.abort();
  dashboardController = new AbortController();

  const grid = document.getElementById('kpiGrid');
  if (grid) grid.style.opacity = '0.5';

  try {
    // Jalankan jabat tangan ke backend
    const [dashData, pajakData] = await Promise.all([
      callAPI('getDashboardData', { filter: currentFilter }),
      callAPI('getPajakReminders', {})
    ]);

    if (grid) grid.style.opacity = '1';

    // Proses Data Utama
    if (dashData?.success) {
      // Set User Greetings
      if (window._user?.name) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Selamat pagi' : hour < 18 ? 'Selamat siang' : 'Selamat malam';
        document.getElementById('dashboardSubtitle').textContent = 
          `${greeting}, ${window._user.name.split(' ')[0]}! Berikut ringkasan bisnis Anda.`;
      }

      renderKPIs(dashData.data.kpi);
      renderPosChart(dashData.data.pengeluaranByPos);
      renderTrendChart(dashData.data.trendData);
      
      document.getElementById('lastUpdated').textContent = 'Diperbarui: ' + new Date().toLocaleTimeString('id-ID');
    }

    // Proses Notifikasi
    if (pajakData?.success) {
      renderReminders(pajakData.data);
      const notif = document.getElementById('notifDot');
      if (notif) notif.style.display = (pajakData.data.length > 0) ? 'block' : 'none';
    }

    // Load Charts Sekunder (Non-blocking)
    loadCharts();

  } catch (err) {
    if (err.name === 'AbortError') return;
    if (typeof showToast === 'function') showToast('Gagal memuat dashboard.', 'error');
    console.error("[Dashboard Error]", err);
  }
}

// ============================================================
// RENDERERS (Chart.js & DOM)
// ============================================================

function renderKPIs(kpi) {
  if (!kpi) return;
  const cards = [
    { label: 'Total Pendapatan', value: formatRupiah(kpi.totalPendapatan), icon: `💰`, bg: '#DBEAFE', color: '#1D4ED8' },
    { label: 'Total Pengeluaran', value: formatRupiah(kpi.totalPengeluaran), icon: `💸`, bg: '#FEE2E2', color: '#DC2626' },
    { label: 'Laba Bersih', value: formatRupiah(kpi.labaBersih), icon: `📈`, bg: kpi.labaBersih >= 0 ? '#DCFCE7' : '#FEE2E2', color: kpi.labaBersih >= 0 ? '#16A34A' : '#DC2626' },
    { label: 'Jumlah Armada', value: (kpi.jumlahArmada || 0) + ' Unit', icon: `🚚`, bg: '#FEF3C7', color: '#D97706' }
  ];

  const grid = document.getElementById('kpiGrid');
  if (grid) {
    grid.innerHTML = cards.map(c => `
      <div class="kpi-card">
        <div class="kpi-icon" style="background:${c.bg};color:${c.color}">${c.icon}</div>
        <div><div class="kpi-label">${c.label}</div><div class="kpi-value">${c.value}</div></div>
      </div>
    `).join('');
  }
}

function renderTrendChart(trendData) {
  const el = document.getElementById('chartTrend');
  if (!el || !trendData) return;
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(el.getContext('2d'), {
    type: 'line',
    data: {
      labels: trendData.months,
      datasets: [
        { label: 'Pendapatan', data: trendData.pendapatanData, borderColor: '#10b981', tension: 0.4 },
        { label: 'Pengeluaran', data: trendData.pengeluaranData, borderColor: '#ef4444', tension: 0.4 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// ============================================================
// CHART LOADERS (Asynchronous)
// ============================================================

async function loadCharts() {
  try {
    const [bbmData, perawatanData, pajakData] = await Promise.all([
      callAPI('getDashboardCharts', { chartType: 'bbm', period: currentFilter }),
      callAPI('getDashboardCharts', { chartType: 'perawatan', period: currentFilter }),
      callAPI('getDashboardCharts', { chartType: 'pajak', period: currentFilter })
    ]);

    if (bbmData?.success) renderBBMChart(bbmData.data);
    if (perawatanData?.success) renderPerawatanChart(perawatanData.data);
    if (pajakData?.success) renderPajakChart(pajakData.data);
  } catch (err) {
    console.error('Error loading sub-charts:', err);
  }
}

// ============================================================
// FILTER HANDLER
// ============================================================

function setFilter(filter) {
  currentFilter = filter;
  // Update UI Active State
  document.querySelectorAll('.filter-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.filter === filter);
  });
  loadDashboard();
}

function refreshDashboard() {
  loadDashboard();
}
