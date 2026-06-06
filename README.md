# iLedgerV2 – Frontend (GitHub Pages)

Sistem Manajemen Keuangan & Armada Enterprise  
**Frontend**: GitHub Pages (HTML/CSS/JS murni)  
**Backend**: Google Apps Script (JSON API)

---

## 🏗️ Arsitektur Baru

```
┌─────────────────────────────────────────────┐
│           GitHub Pages (Frontend)            │
│  login.html, dashboard.html, pengeluaran.html│
│  assets/js/api.js  ←  API Client            │
│  assets/js/nav.js  ←  Navbar/Sidebar        │
└───────────────────┬─────────────────────────┘
                    │ POST (JSON)
                    ▼
┌─────────────────────────────────────────────┐
│       Google Apps Script (Backend API)       │
│  Code.gs  ←  doGet / doPost handler         │
│  Auth.gs, Dashboard.gs, Expense.gs...       │
│  Spreadsheet Google Sheets (Database)        │
└─────────────────────────────────────────────┘
```

---

## 📁 Struktur File

```
/
├── index.html              → Redirect ke login.html
├── login.html              → Halaman login
├── register.html           → Daftar PT baru
├── dashboard.html          → Dashboard utama
├── pengeluaran.html        → Kelola pengeluaran
├── pemasukan.html          → Kelola pendapatan
├── pos.html                → Kelola POS
├── armada.html             → Data armada
├── bbm.html                → Catatan BBM
├── perawatan.html          → Perawatan kendaraan
├── pajak.html              → Pajak kendaraan
├── labarugi.html           → Laporan laba rugi
├── karyawan.html           → Kelola karyawan (HRD)
├── user-management.html    → Manajemen user (HRD)
├── settings.html           → Pengaturan
├── assets/
│   └── js/
│       ├── api.js          → API client (komunikasi ke GAS)
│       └── nav.js          → Navbar + helper global
├── manifest.json           → PWA manifest
├── service-worker.js       → PWA service worker
└── _config.yml             → GitHub Pages config
```

---

## 🚀 Cara Deploy

### 1. Deploy Google Apps Script sebagai API

1. Buka [script.google.com](https://script.google.com)
2. Buat project baru, copy semua file `.gs`
3. Di `Code.gs`, ganti `MASTER_SHEET_ID` dengan ID spreadsheet master Anda
4. Jalankan `initializeMasterSpreadsheet()` sekali untuk inisialisasi
5. Klik **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Access: **Anyone**
6. Copy URL deployment (format: `https://script.google.com/macros/s/XXXX/exec`)

### 2. Deploy Frontend ke GitHub Pages

1. Fork/clone repo ini
2. Push ke GitHub
3. Buka **Settings → Pages → Deploy from branch `main`**
4. Website tersedia di: `https://USERNAME.github.io/REPO-NAME/`

### 3. Konfigurasi URL API

Ada 2 cara:

**Cara A – Edit langsung di `assets/js/api.js`:**
```javascript
BASE_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
```

**Cara B – Via UI (tanpa edit kode):**
1. Buka halaman login
2. Klik "Klik di sini" pada pesan konfigurasi
3. Paste URL Apps Script
4. Klik Simpan

---

## ⚠️ Perbedaan dari Versi Lama

| Fitur | Versi Lama (GAS HTML) | Versi Baru (GitHub Pages) |
|-------|----------------------|--------------------------|
| HTML serving | Apps Script `doGet()` + HtmlService | GitHub Pages static files |
| Routing | `?page=dashboard&token=xxx` | `dashboard.html` langsung |
| Session token | Di URL parameter | Di `localStorage` |
| Navigation | `include('navbar-sidebar')` | `Nav.render()` JavaScript |
| API calls | `google.script.run` | `fetch()` POST ke GAS |

---

## 🔧 File Apps Script yang Diubah

Hanya `Code.gs` yang berubah signifikan:
- Hapus semua `HtmlService.createHtmlOutputFromFile()`
- `doGet()` hanya untuk health check
- `doPost()` tetap sama sebagai API handler

File lain (`Auth.gs`, `Dashboard.gs`, `Expense.gs`, `Modules.gs`, `Tenant.gs`, `Utils.gs`) **tidak perlu diubah sama sekali**.

---

## 🔒 Keamanan

- Token disimpan di `localStorage` (bukan URL)
- CORS: Apps Script menerima POST dari semua origin (by design Google)
- Session expire tetap dihandle di backend
- Password hashing SHA-256 tetap di Apps Script

---

## 📱 PWA

`manifest.json` dan `service-worker.js` sudah disesuaikan untuk GitHub Pages.  
Update `start_url` di `manifest.json`:
```json
"start_url": "https://USERNAME.github.io/REPO-NAME/login.html"
```
