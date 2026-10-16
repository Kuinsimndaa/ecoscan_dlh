# CHANGELOG - EcoScan-DLH

## 🎯 Ringkasan Perbaikan (v1.2.0) - Stabilitas Notifikasi & Produksi cPanel
Rilis ini menyelesaikan masalah looping notifikasi, kendala network error API production, penguatan autentikasi database, serta isolasi arsip deployment git.

### 🐛 Bug Fixes & Stabilitas
1. **Idempotensi Notifikasi Scan (`Scanner.jsx`):**
   - Menambahkan pelacakan `Set` (`notifiedScanIdsRef`) untuk mendata setiap scan RFID yang sudah dinotifikasi.
   - Mengeliminasi notifikasi berulang (*infinite notification loop*) saat polling histori 2 detik berjalan.
   - Menambahkan `key` unik pada pemanggilan komponen `<Notification />`.
2. **Hardening Lifecycle Toast (`Notification.jsx`):**
   - Melindungi audio Web Audio API dengan blok `try-catch`.
   - Mengisolasi timer penutupan ganda (`closeTimer`) saat unmount komponen.
   - Menjaga referensi `onClose` via `useRef` agar tidak ter-reset oleh re-render polling parent.
3. **Dynamic API Base URL (`api.js`):**
   - Mengganti fallback hardcoded `127.0.0.1:5000` dengan URL relatif (`""`) pada mode produksi.
   - Mengeliminasi error `ERR_CONNECTION_REFUSED` dan CORS pada arsitektur monolit Express di cPanel.
4. **PWA Service Worker Update (`service-worker.js`):**
   - Bump versi cache ke `v6`.
   - Mengubah background sync URL ke `/api/scan/save` relatif.
5. **Git Hygiene & Pengamanan Arsip:**
   - Menambahkan `*.tar.gz`, `*.tgz`, `*.zip`, dan `public-dashboard-fix.tar.gz` ke `.gitignore`.
   - Memastikan tidak ada file arsip binary yang ter-commit ke Git repository.

---

## 🎯 Ringkasan Perbaikan (v1.1.0)
Rilis ini mencakup 6 perbaikan utama dan fitur baru yang signifikan untuk meningkatkan UX dan keamanan aplikasi.

---

## ✨ Fitur Baru

### 1. **Sistem CAPTCHA pada Login**
**File:** `frontend/src/components/SimpleCaptcha.jsx` (Baru)

**Deskripsi:**
- Implementasi CAPTCHA sederhana dengan kode 6 karakter (A-Z, 0-9)
- User harus memverifikasi CAPTCHA sebelum dapat login
- Tombol login disabled hingga CAPTCHA berhasil diverifikasi

**Fitur:**
- ✅ Kode random 6 karakter otomatis
- ✅ Tombol refresh untuk regenerasi kode
- ✅ Validasi case-insensitive
- ✅ Feedback real-time (✓/✗ icon)
- ✅ Error message yang jelas

**Implementasi:**
```javascript
// Login.jsx
const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

// CAPTCHA harus verified sebelum login
<button disabled={!isCaptchaVerified}>Login</button>
```

**Benefit:** Meningkatkan keamanan login dan mencegah akses otomatis/bot

---

### 2. **Fitur Pencarian Armada Real-Time**
**File:** `frontend/src/page/admin/AddArmada.jsx`

**Deskripsi:**
- Tambahan search input di header halaman TAMBAH ARMADA
- Filter armada berdasarkan nama petugas secara real-time
- Case-insensitive dan responsif

**Implementasi:**
```javascript
const [searchTerm, setSearchTerm] = useState('');

const filteredArmada = daftarArmada.filter(armada =>
  armada.nama_petugas.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**UI:**
- Search icon (🔍) di sisi kanan header
- Input placeholder: "Cari nama petugas..."

**Benefit:** Memudahkan user mencari armada tanpa scroll panjang

---

### 3. **Modal Konfirmasi Kustom (ConfirmationModal)**
**File:** `frontend/src/components/ConfirmationModal.jsx` (Baru)

**Deskripsi:**
- Menggantikan `window.confirm()` dengan modal custom yang lebih professional
- Consistent styling di seluruh aplikasi
- Support tipe: warning, error, info

**Props:**
```typescript
interface ConfirmationModal {
  isOpen: boolean;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Digunakan di:**
- ✅ AddArmada - Konfirmasi delete armada
- ✅ MonthlyReport - Konfirmasi delete laporan
- ✅ Export - Konfirmasi export Excel

**Benefit:** 
- UX lebih baik dan konsisten
- Styling sesuai design system
- Kontrol penuh atas UI/UX

---

### 4. **Protected Route (Route Guard)**
**File:** `frontend/src/components/ProtectedRoute.jsx` (Baru)

**Deskripsi:**
- Wrapper untuk route yang memerlukan autentikasi
- Melindungi route `/admin/*` dan `/mandor/*` dari akses tanpa login
- Validasi localStorage untuk admin_profile

**Implementasi:**
```javascript
// App.jsx
<Route path="/admin/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
<Route path="/mandor/*" element={<ProtectedRoute><MandorLayout /></ProtectedRoute>} />
```

**Fitur:**
- ✅ Validasi JSON token
- ✅ Redirect ke login jika unauthorized
- ✅ Clear invalid token

**Benefit:** Mencegah unauthorized access ke halaman protected

---

## 🐛 Bug Fixes

### 1. **Login Redirect Loop (FIXED)**
**Status:** ✅ RESOLVED

**Masalah:**
- User setelah login berhasil, redirect kembali ke halaman login
- User tidak bisa akses halaman admin/mandor dashboard

**Penyebab:**
- Tidak ada route protection
- Tidak ada validasi persistent auth state

**Solusi:**
- Implementasi ProtectedRoute wrapper
- Validasi localStorage sebelum render protected content
- Store `admin_profile` dan `login_time` di localStorage

**Testing:**
- ✅ Login dengan benar → akses dashboard
- ✅ Logout → redirect ke login
- ✅ Manual URL access `/admin` tanpa login → redirect login

---

### 2. **Tombol Delete Hanya Bisa Diklik Sekali**
**Status:** ✅ RESOLVED

**Masalah:**
- Klik delete pertama kali → modal muncul
- Klik cancel/confirm → modal hilang
- Klik delete kedua kali → modal tidak muncul lagi
- Tombol delete menjadi tidak responsif

**Penyebab:**
- State `isOpen` tidak di-reset setelah delete
- React tidak re-render jika state yang di-set sama dengan nilai sebelumnya
- Tidak ada cleanup di `finally` block

**Solusi:**
```javascript
// Before (BROKEN):
setConfirmationModal({
  isOpen: false,
  // ... other state
});

// After (FIXED):
setConfirmationModal(prev => ({
  ...prev,
  isOpen: false
}));
```

**Penjelasan:**
- Gunakan functional setState dengan spread operator
- Memastikan state object baru dibuat walaupun value sama
- Triggerreng re-render yang proper

**Diterapkan di:**
- ✅ AddArmada.jsx - handleDelete
- ✅ MonthlyReport.jsx - handleDelete
- ✅ onCancel handler

**Testing:**
- ✅ Klik delete 3x berturut-turut → modal muncul setiap kali
- ✅ Confirm delete → data terhapus, modal hilang
- ✅ Cancel delete → modal hilang tanpa hapus data

---

### 3. **Ukuran Kolom Tabel (FIXED)**
**Status:** ✅ RESOLVED

**Masalah:**
- Tabel terlalu lebar (minWidth: 1400px)
- Perlu horizontal scroll untuk lihat semua kolom
- Kolom jenis armada dan wilayah menyulitkan
- Mobile view sangat buruk

**Penyebab:**
- Terlalu banyak kolom terpisah
- Auto sizing tidak optimal
- Responsive design tidak dipertimbangkan

**Solusi Restructure:**

**AddArmada - Sebelum:**
```
| No | Nama Petugas | Jenis Armada | Wilayah | Mandor | Tarif | QR | Aksi |
```
(8 kolom → 1400px)

**AddArmada - Sesudah:**
```
| No | Nama Petugas [sub: jenis + wilayah] | Mandor | Tarif | Aksi |
```
(5 kolom → fit screen)

**MonthlyReport - Sebelum:**
```
| Tanggal | Waktu | Nama Petugas | Jenis Armada | Wilayah | Mandor | Total | Tarif | Aksi |
```
(9 kolom → 1400px)

**MonthlyReport - Sesudah:**
```
| Tanggal/Waktu | Nama Petugas [sub: jenis + wilayah] | Mandor | Total | Tarif | Aksi |
```
(6 kolom → fit screen)

**Implementasi:**
```jsx
// Sub-text styling
<span className="text-[9px] font-bold text-green-600">
  {armada.jenis_armada} • {armada.wilayah}
</span>
```

**Benefit:**
- ✅ Fit screen tanpa horizontal scroll
- ✅ Lebih clean dan readable
- ✅ Mobile friendly
- ✅ Semua informasi tetap tersedia (sub-text)

---

### 4. **Notifikasi Tidak Konsisten (FIXED)**
**Status:** ✅ RESOLVED

**Masalah:**
- Beberapa action pakai `window.alert()` (browser default)
- Beberapa action pakai custom toast
- Inconsistent UX

**Penyebab:**
- Development ad-hoc tanpa design system

**Solusi:**
- Implementasi ConfirmationModal component
- Gunakan untuk semua confirmations
- Tambah Notification component untuk success/error

**Diterapkan di:**
- ✅ Delete Armada
- ✅ Delete Report
- ✅ Export Excel
- ✅ Generate QR Code

---

## 📊 Perubahan File

### File Baru (3 files)
```
frontend/src/components/ConfirmationModal.jsx      (NEW)
frontend/src/components/SimpleCaptcha.jsx          (NEW)
frontend/src/components/ProtectedRoute.jsx         (NEW)
```

### File Dimodifikasi (11 files)
```
frontend/src/App.jsx                               (Modified)
frontend/src/page/Login.jsx                        (Modified)
frontend/src/page/admin/AddArmada.jsx              (Modified)
frontend/src/page/admin/MonthlyReport.jsx          (Modified)
frontend/src/components/Notification.jsx           (Modified)
frontend/src/components/ExportReport.jsx           (Modified)
frontend/src/components/Navbar.jsx                 (Modified)
backend/src/controllers/authController.js          (Modified)
backend/src/routes/authRoutes.js                   (Modified)
backend/src/routes/scanRoutes.js                   (Modified)
backend/src/app.js                                 (Modified)
```

---

## 🔄 Testing Checklist

### Login & Authentication
- [x] Login dengan CAPTCHA valid → success
- [x] Login dengan CAPTCHA invalid → error
- [x] Login button disabled sebelum CAPTCHA verified
- [x] Redirect ke dashboard setelah login
- [x] Logout → redirect login
- [x] Direct URL access `/admin` tanpa login → redirect login

### Add Armada Page
- [x] Search filter works real-time
- [x] Delete button klik berkali-kali → modal muncul setiap kali
- [x] Confirm delete → data terhapus
- [x] Cancel delete → modal hilang, data tetap
- [x] Generate QR Code works
- [x] Download QR Code works

### Monthly Report Page
- [x] Table display semua kolom tanpa scroll
- [x] Delete button works multiple times
- [x] Export Excel works
- [x] Filter by date works
- [x] Mobile view responsive

---

## 📈 Performance Impact

| Metrik | Before | After | Change |
|--------|--------|-------|--------|
| Bundle Size | ~450KB | ~465KB | +15KB (CAPTCHA) |
| Table Load | Fast | Fast | No change |
| Delete Response | Normal | Fast | Improved (state fix) |
| Mobile UX | Poor | Good | +++ |

**Catatan:** Penambahan bundle size minimal dan justifiable untuk fitur keamanan & UX

---

## 🚀 Deployment Notes

### Prerequisites
- Node.js 14+
- MySQL 5.7+
- npm atau yarn

### Environment Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET di .env

# Frontend
cd ../frontend
npm install
npm run build
```

### Running
```bash
# Development
npm run dev          # Frontend (5050)
npm run server       # Backend (5000)

# Production
npm run build        # Frontend
npm run start        # Backend
```

### Database
- Auto-migrate table dari controller
- Seed data optional

---

## 📝 Future Improvements

1. **Advanced CAPTCHA** - Image/voice CAPTCHA untuk lebih aman
2. **Email Verification** - 2FA dengan email verification
3. **Audit Log** - Track semua action di aplikasi
4. **Performance** - Code splitting, lazy loading
5. **Testing** - Unit test, integration test coverage

---

## 👥 Contributors
- Kuinsimndaa (Development & Bug Fixes)

---

## 📅 Release Date
- **Version:** 1.1.0
- **Date:** 2025
- **Status:** ✅ Stable

---

## 📞 Support
Untuk issue atau bug report, buka GitHub issue di:
https://github.com/Kuinsimndaa/EcoScan-DLH/issues

