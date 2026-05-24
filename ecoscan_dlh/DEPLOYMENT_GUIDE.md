# EcoScan - Deployment Guide (Cloud Gratis)

## 🚀 Deployment dengan Vercel + Render + PlanetScale

Ini adalah panduan lengkap untuk deploy EcoScan ke cloud gratis.

---

## **PART 1: Database Setup (PlanetScale)**

### Step 1: Sign Up PlanetScale
1. Buka https://planetscale.com
2. Sign up dengan GitHub (gratis tier)
3. Klik "Create a new database"

### Step 2: Buat Database
- Nama: `ecoscan`
- Region: `us-east` (atau pilih terdekat Indonesia)
- Tunggu selesai (~2 menit)

### Step 3: Ambil Connection String
1. Di database `ecoscan` → tab **Connections**
2. Pilih **Node.js**
3. Copy connection string:
   ```
   mysql://[username]:[password]@[host]/[database]?sslaccept=strict
   ```

### Step 4: Buat Schema Database

Di MySQL client atau terminal, run:

```sql
CREATE TABLE armada (
  id INT AUTO_INCREMENT PRIMARY KEY,
  namaPetugas VARCHAR(100),
  mandor VARCHAR(100),
  jenisArmada VARCHAR(50),
  wilayah VARCHAR(100),
  tarif DECIMAL(10,2),
  qrcode VARCHAR(100) UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  armadaId INT,
  amount DECIMAL(10,2),
  status VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (armadaId) REFERENCES armada(id)
);
```

**Simpan credentials PlanetScale Anda:**
- Host: 
- Username: 
- Password: 
- Database: ecoscan

---

## **PART 2: Backend Deploy (Render)**

### Step 1: Sign Up Render
1. Buka https://render.com
2. Sign up dengan GitHub
3. Autorize akses ke GitHub

### Step 2: Buat Web Service Baru
1. Dashboard → **New +** → **Web Service**
2. Pilih repository: `EcoScan-DLH`
3. Konfigurasi:
   - **Name:** `ecoscan-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`

### Step 3: Tambah Environment Variables
Di Render, tab **Environment**, tambah:

```
DB_HOST = [dari PlanetScale]
DB_PORT = 3306
DB_USER = [dari PlanetScale]
DB_PASSWORD = [dari PlanetScale]
DB_NAME = ecoscan
NODE_ENV = production
```

### Step 4: Deploy
Klik **Deploy** dan tunggu ~3-5 menit. Cek logs untuk verifikasi.

**Catat URL Backend Render Anda:**
```
https://ecoscan-backend.onrender.com
```

---

## **PART 3: Frontend Deploy (Vercel)**

### Step 1: Sign Up Vercel
1. Buka https://vercel.com
2. Sign up dengan GitHub

### Step 2: Import Repository
1. Dashboard → **Add New...** → **Project**
2. Pilih repository `EcoScan-DLH`

### Step 3: Konfigurasi
- **Framework Preset:** `Vite`
- **Root Directory:** `frontend`

### Step 4: Tambah Environment Variables
Di tab **Environment Variables**, tambah:

```
VITE_API_URL=https://ecoscan-backend.onrender.com/api
```

### Step 5: Deploy
Klik **Deploy** dan tunggu deployment selesai (~2-3 menit).

**URL Frontend Anda:**
```
https://your-project.vercel.app
```

---

## **PART 4: Setup Auto-Deployment**

### Backend Auto-Deploy (Render)
✅ Sudah otomatis! Setiap kali push ke GitHub, Render akan auto-deploy.

### Frontend Auto-Deploy (Vercel)
✅ Sudah otomatis! Setiap kali push ke GitHub, Vercel akan auto-deploy.

---

## **PART 5: Update Frontend untuk Production**

Edit `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ecoscan-backend.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
```

---

## **✅ Testing Live**

1. Buka: `https://your-project.vercel.app`
2. Coba fitur scan/tambah armada
3. Cek console browser (F12) untuk error
4. Cek Render logs untuk backend errors

---

## **🔧 Troubleshooting**

### Backend tidak connect ke database
- Cek environment variables di Render
- Pastikan PlanetScale IP whitelist (biasanya auto)
- Cek connection string format

### Frontend error "Cannot reach API"
- Verifikasi `VITE_API_URL` di Vercel environment
- Pastikan backend URL benar
- Cek CORS di backend `app.js`

### Deploy failed di Render
- Cek logs di Render dashboard
- Pastikan `package.json` di `backend/` folder
- Cek `start` script di `package.json`

---

## **📱 Akses Aplikasi**

- **Frontend:** https://your-project.vercel.app
- **Backend API:** https://ecoscan-backend.onrender.com/api
- **Database:** PlanetScale console

---

## **💾 Push Perubahan ke GitHub**

Setelah konfigurasi selesai:

```bash
git add .
git commit -m "chore: setup deployment config"
git push origin main
```

Vercel & Render akan otomatis deploy! 🚀

---

**Sudah selesai setup? Kasih tahu hasilnya!** ✨
