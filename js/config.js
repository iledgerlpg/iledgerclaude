// js/config.js

window.APP_URL = 'https://script.google.com/macros/s/AKfycbzExUurBZQTlNlAzKZLCZZqYMmib2-hE2AL_O2APD58rZuQUB_BEGD-G6LofTXCcbe1/exec';

// Deteksi nama halaman otomatis dari URL (misal: "dashboard.html" -> "dashboard")
const path = window.location.pathname;
const page = path.split("/").pop().replace(".html", "");
window.CURRENT_PAGE = page || "index"; // default ke index kalau kosong
