# 🚀 iLedgerV2 – Panduan Deployment Lengkap

> **Enterprise Fleet & Finance Management System**  
> Google Apps Script + Google Spreadsheet + PWA

---

## 📋 DAFTAR ISI

1. [Persiapan Awal](#1-persiapan-awal)
2. [Setup Master Spreadsheet](#2-setup-master-spreadsheet)
3. [Deploy ke Google Apps Script](#3-deploy-ke-google-apps-script)
4. [Konfigurasi Pertama](#4-konfigurasi-pertama)
5. [Setup PWA](#5-setup-pwa)
6. [Struktur Database](#6-struktur-database)
7. [Role & Permissions](#7-role--permissions)
8. [Fitur Sistem](#8-fitur-sistem)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. PERSIAPAN AWAL

### Kebutuhan:
- Akun Google Workspace / Google Account
- Google Drive (min. 2GB kosong)
- Browser modern (Chrome/Edge/Firefox)

### Struktur File yang Perlu Di-upload:
```
iLedgerV2/
├── backend/
│   ├── Code.gs          ← Router utama
│   ├── Auth.gs          ← Authentication
│   ├── Tenant.gs        ← Multi-tenant management
│   ├── Dashboard.gs     ← Dashboard data
│   ├── Expense.gs       ← Pengeluaran + Pemasukan + Pos
│   ├── Modules.gs       ← Armada, BBM, Perawatan, Pajak, Karyawan, Laba Rugi
│   ├── Utils.gs         ← Upload file, Log, Notifikasi, Export
│   └── appsscript.json  ← Manifest Apps Script
├── views/
│   ├── login.html
│   ├── registerPT.html
│   ├── forgotPassword.html
│   ├── resetPassword.html
│   ├── dashboard.html
│   ├── pengeluaran.html
│   ├── pemasukan.html
│   ├── pos.html
│   ├── armada.html
│   ├── bbm.html
│   ├── perawatan.html
│   ├── pajak.html
│   ├── karyawan.html
│   ├── labarugi.html
│   ├── settings.html
│   └── userManagement.html
├── components/
│   └── navbar-sidebar.html  ← Shared navigation
└── pwa/
    ├── manifest.json
    └── service-worker.js
```

---

## 2. SETUP MASTER SPREADSHEET

### Langkah:
1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru → beri nama: **`iLedgerV2 - Master`**
3. Catat Spreadsheet ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
4. Spreadsheet ini akan otomatis diisi saat pertama kali diinisialisasi

---

## 3. DEPLOY KE GOOGLE APPS SCRIPT

### Langkah 1: Buat Project Apps Script
1. Buka [script.google.com](https://script.google.com)
2. Klik **"New Project"**
3. Beri nama: **`iLedgerV2`**

### Langkah 2: Upload File Backend
1. **Hapus** file `Code.gs` yang ada (kosongkan)
2. Klik **"+"** → "Script" → buat file-file berikut:
   - `Code` → paste isi `backend/Code.gs`
   - `Auth` → paste isi `backend/Auth.gs`
   - `Tenant` → paste isi `backend/Tenant.gs`
   - `Dashboard` → paste isi `backend/Dashboard.gs`
   - `Expense` → paste isi `backend/Expense.gs`
   - `Modules` → paste isi `backend/Modules.gs`
   - `Utils` → paste isi `backend/Utils.gs`

### Langkah 3: Upload File HTML
1. Klik **"+"** → "HTML" → buat folder dan file:
   - `views/login`
   - `views/registerPT`
   - `views/forgotPassword`
   - `views/resetPassword`
   - `views/dashboard`
   - `views/pengeluaran`
   - `views/pemasukan`
   - `views/pos`
   - `views/armada`
   - `views/bbm`
   - `views/perawatan`
   - `views/pajak`
   - `views/karyawan`
   - `views/labarugi`
   - `views/settings`
   - `views/userManagement`
   - `components/navbar-sidebar`

### Langkah 4: Edit appsscript.json
1. Klik **"Project Settings"** (gear icon) → aktifkan "Show 'appsscript.json' manifest file"
2. Buka `appsscript.json` di editor
3. Replace isi dengan konten dari `backend/appsscript.json`

### Langkah 5: Set Master Spreadsheet ID
Di file `Code.gs`, baris pertama:
```javascript
const MASTER_SHEET_ID = 'YOUR_MASTER_SPREADSHEET_ID';
// Ganti dengan ID dari langkah 2
```

### Langkah 6: Inisialisasi Master Spreadsheet
1. Di Apps Script editor, pilih function `initializeMasterSpreadsheet`
2. Klik **"Run"**
3. Authorize semua permission yang diminta
4. Cek bahwa sheet `Tenant`, `Users`, `Sessions` sudah terbuat di Master Spreadsheet

### Langkah 7: Setup Triggers
1. Di Apps Script editor, pilih function `setupTriggers`
2. Klik **"Run"**
3. Ini akan membuat trigger harian untuk cek pajak dan cleanup session

### Langkah 8: Deploy sebagai Web App
1. Klik **"Deploy"** → **"New Deployment"**
2. Klik gear icon di "Type" → pilih **"Web App"**
3. Konfigurasi:
   - **Description**: `iLedgerV2 v2.0.0`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` (untuk akses publik)
4. Klik **"Deploy"**
5. **Salin URL Web App** – ini adalah URL aplikasi Anda!

---

## 4. KONFIGURASI PERTAMA

### Daftarkan Perusahaan Pertama:
1. Buka URL Web App
2. Akan muncul halaman login
3. Klik **"Daftar Perusahaan Baru"**
4. Isi form registrasi:
   - Nama PT
   - Email PT
   - Nama Owner (HRD)
   - Email Owner
   - Password (min 8 karakter)
5. Klik **"Daftarkan Perusahaan"**
6. Sistem akan otomatis:
   - Membuat Spreadsheet baru untuk PT tersebut
   - Membuat semua sheet yang dibutuhkan
   - Membuat akun HRD
   - Mengisi Pos default dan Mapping default

### Login:
1. Gunakan email dan password owner yang didaftarkan
2. Masuk ke Dashboard

---

## 5. SETUP PWA (Progressive Web App)

### Cara Install di Android:
1. Buka URL Web App di Chrome Android
2. Tunggu browser mendeteksi PWA
3. Tap **"Tambahkan ke Layar Utama"** / **"Install App"**
4. Aplikasi akan muncul di home screen seperti app Android

### Cara Install di Desktop (Chrome):
1. Buka URL di Chrome
2. Klik ikon install di address bar (📲)
3. Klik "Install"

### Catatan Service Worker:
- File `pwa/service-worker.js` perlu diregister dari halaman HTML
- Tambahkan script ini di setiap HTML page (sudah ada di template):

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.error('SW error:', err));
}
```

---

## 6. STRUKTUR DATABASE

### Master Spreadsheet (1 file):
| Sheet | Fungsi |
|-------|--------|
| `Tenant` | Daftar semua PT + Spreadsheet ID |
| `Users` | Semua akun user (semua PT) |
| `Sessions` | Session token aktif |

### Tenant Spreadsheet (1 per PT):
| Sheet | Fungsi |
|-------|--------|
| `Pengeluaran` | Transaksi pengeluaran |
| `Pemasukan` | Transaksi pendapatan |
| `Pos` | Kategori pengeluaran dinamis |
| `PosMapping` | Smart Pos keyword mapping |
| `Armada` | Data kendaraan |
| `BBM` | Konsumsi bahan bakar |
| `PerawatanArmada` | Riwayat service & perawatan |
| `PajakKendaraan` | Status STNK/KIR/Pajak |
| `Karyawan` | Data karyawan (HRD only) |
| `LabaRugi` | Snapshot laporan |
| `ActivityLog` | Audit trail semua aksi |
| `Settings` | Konfigurasi per PT |

---

## 7. ROLE & PERMISSIONS

| Fitur | HRD | Admin |
|-------|-----|-------|
| Dashboard | ✅ | ✅ |
| Pendapatan | ✅ | ✅ |
| Pengeluaran | ✅ | ✅ |
| Kelola Pos | ✅ | ✅ |
| Data Armada | ✅ | ✅ |
| BBM | ✅ | ✅ |
| Perawatan Armada | ✅ | ✅ |
| Pajak Kendaraan | ✅ | ✅ |
| Export PDF/Excel | ✅ | ✅ |
| Kelola Karyawan | ✅ | ❌ |
| Approval User | ✅ | ❌ |
| User Management | ✅ | ❌ |
| Laba Rugi | ✅ | ❌ |
| Audit Log | ✅ | ❌ |
| Settings | ✅ | ❌ |

---

## 8. FITUR SISTEM

### ✅ Smart Pos Detection
Sistem otomatis mendeteksi pos berdasarkan keyword uraian:
- "solar" / "pertalite" / "bbm" → **BBM**
- "ganti oli" / "service" / "ban" → **Perawatan Armada**
- "stnk" / "kir" / "pajak" → **Pajak Kendaraan**
- HRD bisa tambah keyword baru kapan saja

### ✅ Reminder Otomatis Pajak (Email)
- Trigger berjalan setiap hari jam 07:00 WIB
- Kirim email ke NOTIF_EMAIL jika ada kendaraan H-30, H-14, H-7, H-2
- Email berisi: nomor polisi, jenis dokumen, tanggal jatuh tempo

### ✅ Multi Tenant Isolation
- Setiap PT memiliki Google Spreadsheet sendiri
- Data antar PT tidak bisa saling mengakses
- Admin/HRD PT A tidak bisa lihat data PT B

### ✅ PWA (Progressive Web App)
- Dapat diinstall di Android seperti app native
- Offline fallback page
- Push notification ready
- Background sync ready

### ✅ Export
- **PDF**: Semua halaman menggunakan jsPDF + AutoTable
- **Excel**: Export via Google Sheets API (download URL)

---

## 9. TROUBLESHOOTING

### Error: "Session expired"
- Pastikan `MASTER_SHEET_ID` sudah diisi dengan benar
- Cek sheet `Sessions` di Master Spreadsheet ada dan memiliki header yang benar

### Error: "Tenant not found"
- Cek sheet `Tenant` di Master Spreadsheet
- Pastikan `SpreadsheetID` di kolom F terisi dengan benar

### Error saat upload foto
- Pastikan permission Google Drive sudah diberikan saat authorize
- Cek kuota Google Drive tidak penuh

### Trigger tidak jalan
- Buka Apps Script → Triggers → pastikan `checkPajakReminders` ada
- Jika tidak ada, jalankan `setupTriggers()` lagi

### PWA tidak bisa diinstall
- Pastikan HTTPS (Google Apps Script sudah HTTPS otomatis)
- Buka DevTools → Application → Manifest untuk debug

### Halaman tidak mau load
- Pastikan nama file HTML di Apps Script sesuai persis dengan yang di `doGet()`
- Contoh: file bernama `views/login` → di pageMap: `'login': 'views/login'`

---

## 📞 SUPPORT

Untuk pertanyaan teknis, silakan cek:
- Google Apps Script Documentation: https://developers.google.com/apps-script
- Google Sheets API: https://developers.google.com/sheets/api

---

## 🔄 UPDATE APLIKASI

Untuk update versi baru:
1. Edit file yang perlu diupdate di Apps Script editor
2. Klik **"Deploy"** → **"Manage Deployments"**
3. Klik edit (✏️) pada deployment aktif
4. Ubah version ke "New version"
5. Klik **"Deploy"**

> **Note**: URL Web App tidak berubah saat update deployment!

---

**iLedgerV2** © 2024 — Built with Google Apps Script + Spreadsheet
*Enterprise Fleet & Finance Management System*
