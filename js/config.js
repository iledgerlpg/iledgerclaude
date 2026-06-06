// ============================================================
// js/config.js - Global Configuration
// ============================================================

window.APP_URL = 'https://script.google.com/macros/s/AKfycbyLSXR2qitFBVBpwLsYjfIov3tt0IaL5_IxbWbGbj1qiLm597O1BdGf4Xmn6npzrtqs/exec';

// Deteksi nama halaman otomatis dari URL (misal: "dashboard.html" -> "dashboard")
const path = window.location.pathname;
const page = path.split("/").pop().replace(".html", "");
window.CURRENT_PAGE = page || "index"; // default ke index kalau kosong


// ============================================================
// js/api.js - Core API Caller (Super Steril Anti-CORS Version)
// ============================================================

async function callAPI(action, data = {}) {
  // Validasi apakah config.js sudah terbaca
  if (!window.APP_URL) {
    console.error("[iLedger Error] window.APP_URL belum terdefinisi. Pastikan config.js dimuat lebih dulu.");
    return { success: false, error: "Config URL missing" };
  }

  try {
    // Susun payload terpadu untuk dikirim ke Google Apps Script
    const payload = {
      action: action,
      token: localStorage.getItem('token') || '', // Mengambil token login dari storage browser
      ...data
    };

    // 🔥 ANTI-CORS TANPA HEADERS: Sengaja tidak menulis properti headers kustom 
    // agar browser langsung mengirim data sebagai POST murni tanpa pemicu request OPTIONS (Preflight)
    const response = await fetch(window.APP_URL, {
      method: 'POST',
      body: JSON.stringify(payload) // Payload langsung diubah menjadi string JSON biasa
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Otomatis inject data user ke global variable jika ada di response (dibutuhkan dashboard.js)
    if (result.success && result.user) {
      window._user = result.user;
    }

    return result;

  } catch (error) {
    console.error(`[API Error] Gagal pada aksi: ${action}`, error);
    return { 
      success: false, 
      error: error.toString(),
      message: "Gagal terhubung ke backend server." 
    };
  }
}

// Helper global untuk formatting rupiah yang dipanggil di dashboard.js
function formatRupiah(angka) {
  if (angka === undefined || angka === null || isNaN(angka)) return 'Rp 0';
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}
