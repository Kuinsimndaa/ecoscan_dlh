# 🔧 Environment Variables Setup - EcoScan DLH

> **PENTING:** File `.env` tidak boleh di-commit ke Git. Sudah didaftar di `.gitignore`.

## 📋 Overview

Proyeksi ini menggunakan **environment variables** untuk semua konfigurasi sensitif dan deployment-specific. Tidak ada hardcoding values di kode sumber.

## 🗂️ Lokasi .env Files

```
ecoscan_dlh/
├── .env                  ← Docker Compose (production)
├── backend/
│   └── .env              ← Backend development
└── frontend/
    └── .env              ← Frontend development
```

---

## 📝 Setup Instructions

### 1️⃣ Root .env (Docker Compose)

**File:** `.env`

```env
# Database Configuration
DB_HOST=mysql
DB_USER=ecoscan_user
DB_PASSWORD=secure_password_here
DB_NAME=dlh_ecoscan
DB_CONNECTION_LIMIT=10

# Backend Configuration
NODE_ENV=production
PORT=3030
CORS_ORIGIN=http://localhost

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3030
VITE_APP_NAME=EcoScan DLH
VITE_PORT=80

# Docker
IMAGE_TAG=latest
GITHUB_REPOSITORY=kuinsimndaa/ecoscan_dlh
```

**Used by:** Docker Compose (`docker-compose.yml`)

---

### 2️⃣ Backend .env (npm start)

**File:** `backend/.env`

```env
# Server Configuration
NODE_ENV=development
PORT=3030

# Database Configuration (local MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=dlh_ecoscan
DB_CONNECTION_LIMIT=10

# CORS Configuration
CORS_ORIGIN=http://localhost:5050
```

**Used by:**
- `backend/src/server.js` (loads with `dotenv`)
- `backend/src/app.js` (CORS middleware)
- `backend/src/config/database.js` (MySQL connection)

---

### 3️⃣ Frontend .env (npm run dev)

**File:** `frontend/.env`

```env
# Server Configuration
VITE_PORT=5050

# API Configuration
VITE_API_BASE_URL=http://localhost:3030

# App Configuration
VITE_APP_NAME=EcoScan DLH
```

**Used by:**
- `frontend/vite.config.js` (dev server port)
- `frontend/src/config/api.js` (API base URL)

**Note:** Vite requires all variables to be prefixed with `VITE_` to expose them to frontend.

---

## 🚀 Development Setup

### Step 1: Copy .env Files

```bash
# From root directory
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
```

### Step 2: Update backend/.env

Edit `backend/.env` with your local MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=dlh_ecoscan
```

### Step 3: Start Development

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker/Production Setup

### Step 1: Update Root .env

Edit `.env` with your production credentials:

```env
DB_HOST=mysql
DB_USER=ecoscan_user
DB_PASSWORD=your_production_password
DB_NAME=dlh_ecoscan

NODE_ENV=production
PORT=3030
CORS_ORIGIN=http://your-domain.com

VITE_API_BASE_URL=http://api.your-domain.com
```

### Step 2: Build & Run

```bash
docker-compose up -d
```

---

## ⚙️ Environment Variables Reference

| Variable | Type | Location | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_ENV` | String | Backend | `development` | `development` or `production` |
| `PORT` | Number | Backend | `3030` | Backend server port |
| `DB_HOST` | String | Backend | `localhost` | Database hostname |
| `DB_USER` | String | Backend | `root` | Database username |
| `DB_PASSWORD` | String | Backend | `` (empty) | Database password |
| `DB_NAME` | String | Backend | `dlh_ecoscan` | Database name |
| `DB_CONNECTION_LIMIT` | Number | Backend | `10` | Max DB connections |
| `CORS_ORIGIN` | String | Backend | `http://localhost:5050` | Allowed frontend URL |
| `VITE_PORT` | Number | Frontend | `5050` | Frontend dev server port |
| `VITE_API_BASE_URL` | String | Frontend | `http://localhost:3030` | Backend API URL |
| `VITE_APP_NAME` | String | Frontend | `EcoScan DLH` | App title |

---

## 🔒 Security Best Practices

✅ **DO:**
- Use strong passwords in production
- Never commit `.env` files
- Use different passwords for dev/production
- Rotate credentials regularly
- Use environment-specific files

❌ **DON'T:**
- Hardcode sensitive values in code
- Share `.env` files via Git
- Use same password everywhere
- Expose `.env` in Docker images
- Log environment variables

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env`
- Ensure MySQL is running
- Verify database exists: `CREATE DATABASE dlh_ecoscan;`

### "Frontend cannot reach backend API"
- Check `VITE_API_BASE_URL` matches backend's actual URL
- Verify `CORS_ORIGIN` in backend `.env`
- Check firewall/network connectivity

### "PORT already in use"
- Change `PORT` (backend) or `VITE_PORT` (frontend) in `.env`
- Or kill process: `lsof -i :3030` (macOS/Linux)

### "Environment variable not loading"
- Ensure file is named exactly `.env` (no `.env.local`, etc.)
- For Vite, prefix with `VITE_` (e.g., `VITE_API_BASE_URL`)
- Restart dev server after changing `.env`

---

## 📚 Related Files

- [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md) - Architecture & API details
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Cloud deployment setup
- [.env.example](./.env.example) - Template for root .env
- [backend/.env.example](./backend/.env.example) - Template for backend
- [frontend/.env.example](./frontend/.env.example) - Template for frontend

---

**Last Updated:** February 2025  
**Maintained By:** [@Kuinsimndaa](https://github.com/Kuinsimndaa)
