// js/config.js

window.APP_URL = 'https://script.google.com/macros/s/AKfycbyUj-_hBNw2LFuWjxSf0fxrp85Q67qIBryWG-FFsBYZWNxYbI3-AC084jVTjKmDtPL5/exec';

// Deteksi nama halaman otomatis dari URL (misal: "dashboard.html" -> "dashboard")
const path = window.location.pathname;
const page = path.split("/").pop().replace(".html", "");
window.CURRENT_PAGE = page || "index"; // default ke index kalau kosong
