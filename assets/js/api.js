// ============================================================
// iLedgerV2 - API Client
// File: assets/js/api.js
// Komunikasi dengan Google Apps Script backend
// ============================================================

const API = (() => {

  // ============================================================
  // CONFIG - GANTI DENGAN URL APPS SCRIPT ANDA
  // ============================================================
  const CONFIG = {
    // Setelah deploy Apps Script, paste URL-nya di sini
    BASE_URL: localStorage.getItem('il_api_url') || 'https://script.google.com/macros/s/AKfycbxpmoFUfa_BEwp-EiNjB7u0i6T3xT3vp_Mo9jgI-2N73qxaYcUzStypGUY1sQlHDGW0/exec',
    TIMEOUT: 30000, // 30 detik
  };

  // ============================================================
  // STATE
  // ============================================================
  let _token = localStorage.getItem('il_token');
  let _user = null;

  try {
    _user = JSON.parse(localStorage.getItem('il_user') || 'null');
  } catch (e) {
    _user = null;
  }

  // ============================================================
  // CORE FETCH
  // ============================================================
  async function call(action, payload = {}) {
    if (!CONFIG.BASE_URL || CONFIG.BASE_URL.includes('YOUR_DEPLOYMENT_ID')) {
      throw new Error('API URL belum dikonfigurasi. Buka Settings untuk mengatur URL backend.');
    }

    const body = {
      action,
      token: _token,
      ...payload
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    try {
      const response = await fetch(CONFIG.BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      // Session expired → redirect ke login
      if (data.code === 'SESSION_EXPIRED') {
        API.logout(false);
        window.location.href = '/login.html';
        return;
      }

      return data;

    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new Error('Request timeout. Periksa koneksi internet Anda.');
      }

      throw err;
    }
  }

  // ============================================================
  // AUTH
  // ============================================================
  async function login(email, password, rememberMe = false) {
    const result = await call('login', { email, password, rememberMe });
    if (result.success) {
      _token = result.token;
      _user = result.user;
      localStorage.setItem('il_token', _token);
      localStorage.setItem('il_user', JSON.stringify(_user));
    }
    return result;
  }

  async function logout(callServer = true) {
    if (callServer && _token) {
      try { await call('logout', {}); } catch (e) {}
    }
    _token = null;
    _user = null;
    localStorage.removeItem('il_token');
    localStorage.removeItem('il_user');
  }

  function isLoggedIn() {
    return !!_token && !!_user;
  }

  function getUser() {
    return _user;
  }

  function getToken() {
    return _token;
  }

  // ============================================================
  // CONFIG MANAGEMENT
  // ============================================================
  function setApiUrl(url) {
    CONFIG.BASE_URL = url;
    localStorage.setItem('il_api_url', url);
  }

  function getApiUrl() {
    return CONFIG.BASE_URL;
  }

  // ============================================================
  // EXPOSE PUBLIC API
  // ============================================================
  return {
    // Config
    setApiUrl,
    getApiUrl,

    // Auth
    call,
    login,
    logout,
    isLoggedIn,
    getUser,
    getToken,

    // Auth actions
    registerPT: (data) => call('registerPT', data),
    registerAdminUser: (data) => call('registerAdminUser', data),
    forgotPassword: (email) => call('forgotPassword', { email }),
    resetPassword: (data) => call('resetPassword', data),
    changePassword: (data) => call('changePassword', data),

    // Dashboard
    getDashboardData: (filter) => call('getDashboardData', { filter }),
    getDashboardCharts: (chartType, period) => call('getDashboardCharts', { chartType, period }),
    getKPIData: (filter) => call('getKPIData', { filter }),

    // Pengeluaran
    getPengeluaran: (params) => call('getPengeluaran', params),
    addPengeluaran: (data) => call('addPengeluaran', data),
    updatePengeluaran: (data) => call('updatePengeluaran', data),
    deletePengeluaran: (id) => call('deletePengeluaran', { id }),
    exportPengeluaranExcel: (filterMonth) => call('exportPengeluaranExcel', { filterMonth }),

    // Pemasukan
    getPemasukan: (params) => call('getPemasukan', params),
    addPemasukan: (data) => call('addPemasukan', data),
    updatePemasukan: (data) => call('updatePemasukan', data),
    deletePemasukan: (id) => call('deletePemasukan', { id }),

    // Pos
    getPos: (params) => call('getPos', params),
    addPos: (data) => call('addPos', data),
    updatePos: (data) => call('updatePos', data),
    deletePos: (id) => call('deletePos', { id }),
    getPosMapping: () => call('getPosMapping', {}),
    addPosMapping: (data) => call('addPosMapping', data),
    deletePosMapping: (id) => call('deletePosMapping', { id }),
    detectPos: (uraian) => call('detectPos', { uraian }),

    // Armada
    getArmada: (params) => call('getArmada', params),
    addArmada: (data) => call('addArmada', data),
    updateArmada: (data) => call('updateArmada', data),
    deleteArmada: (id) => call('deleteArmada', { id }),

    // BBM
    getBBM: (params) => call('getBBM', params),
    addBBM: (data) => call('addBBM', data),
    updateBBM: (data) => call('updateBBM', data),
    deleteBBM: (id) => call('deleteBBM', { id }),
    getBBMStats: () => call('getBBMStats', {}),

    // Perawatan
    getPerawatan: (params) => call('getPerawatan', params),
    addPerawatan: (data) => call('addPerawatan', data),
    updatePerawatan: (data) => call('updatePerawatan', data),
    deletePerawatan: (id) => call('deletePerawatan', { id }),
    getPerawatanStats: () => call('getPerawatanStats', {}),

    // Pajak
    getPajak: (params) => call('getPajak', params),
    updatePajak: (data) => call('updatePajak', data),
    getPajakReminders: () => call('getPajakReminders', {}),

    // Karyawan
    getKaryawan: (params) => call('getKaryawan', params),
    addKaryawan: (data) => call('addKaryawan', data),
    updateKaryawan: (data) => call('updateKaryawan', data),
    deleteKaryawan: (id) => call('deleteKaryawan', { id }),

    // Laba Rugi
    getLabaRugi: (params) => call('getLabaRugi', params),

    // User Management
    getUsers: () => call('getUsers', {}),
    approveUser: (userId) => call('approveUser', { userId }),
    rejectUser: (userId, reason) => call('rejectUser', { userId, reason }),
    deleteUser: (userId) => call('deleteUser', { userId }),

    // Settings
    getSettings: () => call('getSettings', {}),
    updateSettings: (settings) => call('updateSettings', { settings }),

    // Activity Log
    getActivityLog: (params) => call('getActivityLog', params),
  };
})();
