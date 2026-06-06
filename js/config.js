// js/config.js

window.APP_URL = 'https://script.google.com/macros/s/AKfycbwqI576-UPMnoaQyKBiLWprQ4OR-c8Jpexw_vKtjKJ-RMGUO8nYfuOQ0s1xhlF55Fcb/exec';

// Deteksi nama halaman otomatis dari URL (misal: "dashboard.html" -> "dashboard")
const path = window.location.pathname;
const page = path.split("/").pop().replace(".html", "");
window.CURRENT_PAGE = page || "index"; // default ke index kalau kosong
