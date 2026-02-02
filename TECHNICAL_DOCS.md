# 📚 TECHNICAL DOCUMENTATION - EcoScan-DLH

## Daftar Isi
1. [Arsitektur Aplikasi](#arsitektur-aplikasi)
2. [Komponen Custom](#komponen-custom)
3. [State Management](#state-management)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Styling Guidelines](#styling-guidelines)
7. [Development Guide](#development-guide)

---

## 🏗️ Arsitektur Aplikasi

### Struktur Folder
```
EcoScan-DLH/
├── backend/                      # Express.js API Server
│   ├── src/
│   │   ├── app.js               # Express app configuration
│   │   ├── server.js            # Server entry point
│   │   ├── config/
│   │   │   └── database.js       # MySQL connection
│   │   ├── models/              # Database models
│   │   ├── controllers/         # Business logic
│   │   └── routes/              # API routes
│   ├── package.json
│   └── .env.example
│
└── frontend/                      # React + Vite
    ├── src/
    │   ├── components/          # Reusable components
    │   ├── page/                # Page components
    │   │   ├── admin/           # Admin pages
    │   │   └── mandor/          # Mandor pages
    │   ├── utils/               # Utilities
    │   ├── App.jsx              # Main router
    │   └── main.jsx             # Entry point
    ├── public/                  # Static files
    ├── package.json
    └── vite.config.js
```

### Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Axios
- **Backend:** Node.js, Express.js, MySQL2, JWT, dotenv
- **Database:** MySQL 5.7+
- **Deployment:** Can be deployed to Render, Vercel, or traditional server

---

## 🎨 Komponen Custom

### 1. SimpleCaptcha.jsx
**Location:** `frontend/src/components/SimpleCaptcha.jsx`

**Purpose:** Security verification pada login

**Props:**
```typescript
interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;  // Callback saat user verify
}
```

**Usage:**
```jsx
const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

<SimpleCaptcha onVerify={setIsCaptchaVerified} />

// Disable button sampai verified
<button disabled={!isCaptchaVerified}>Login</button>
```

**Features:**
- 6 random characters (A-Z, 0-9)
- Refresh button untuk regenerate
- Case-insensitive validation
- Error/success feedback

**Implementation Details:**
```javascript
// Kode random generator
const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
```

---

### 2. ConfirmationModal.jsx
**Location:** `frontend/src/components/ConfirmationModal.jsx`

**Purpose:** Unified confirmation dialog

**Props:**
```typescript
interface ConfirmationModalProps {
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

**Usage:**
```jsx
const [confirmModal, setConfirmModal] = useState({
  isOpen: false,
  type: 'warning',
  title: '',
  message: '',
  confirmText: 'Hapus',
  cancelText: 'Batal',
  onConfirm: () => {},
  onCancel: () => {},
});

// Show delete confirmation
const handleDeleteClick = (id) => {
  setConfirmModal({
    isOpen: true,
    type: 'warning',
    title: 'Hapus Armada',
    message: 'Apakah Anda yakin ingin menghapus armada ini?',
    confirmText: 'Hapus',
    cancelText: 'Batal',
    onConfirm: () => deleteArmada(id),
    onCancel: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
  });
};

<ConfirmationModal {...confirmModal} />
```

**Icons by Type:**
- ⚠️ warning (AlertTriangle)
- ❌ error (AlertCircle)
- ℹ️ info (Info)

---

### 3. ProtectedRoute.jsx
**Location:** `frontend/src/components/ProtectedRoute.jsx`

**Purpose:** Route guard untuk authenticated routes

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

**Usage:**
```jsx
// App.jsx
<Route 
  path="/admin/*" 
  element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} 
/>
```

**How it works:**
1. Check localStorage untuk `admin_profile`
2. Validate JSON structure
3. If valid → render children
4. If invalid → redirect ke '/'

**Security Checks:**
```javascript
const token = localStorage.getItem('admin_profile');
try {
  const parsed = JSON.parse(token);
  // Valid token, render component
  return children;
} catch {
  // Invalid token, clear and redirect
  localStorage.removeItem('admin_profile');
  navigate('/');
}
```

---

### 4. Notification.jsx
**Location:** `frontend/src/components/Notification.jsx`

**Purpose:** Toast notification untuk success/error messages

**Props:**
```typescript
interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  duration?: number;  // Auto-hide ms
}
```

**Usage:**
```jsx
const [notification, setNotification] = useState({
  message: '',
  type: 'success',
  isVisible: false,
});

const showNotification = (message, type = 'success') => {
  setNotification({ message, type, isVisible: true });
  setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
};

<Notification {...notification} />
```

---

## 🎯 State Management

### Pattern di aplikasi

**Controlled Component State:**
```jsx
// Local state untuk UI
const [searchTerm, setSearchTerm] = useState('');
const [filteredArmada, setFilteredArmada] = useState([]);
const [confirmationModal, setConfirmationModal] = useState({
  isOpen: false,
  // ... modal properties
});
```

**Important: Functional setState untuk object**
```javascript
// ❌ WRONG - Sering gagal re-render
setConfirmationModal({
  isOpen: false,
});

// ✅ CORRECT - Selalu trigger re-render
setConfirmationModal(prev => ({
  ...prev,
  isOpen: false,
}));
```

**Why?** React hanya re-render jika referensi object berubah. Dengan spread operator, object baru selalu dibuat.

### Global State (localStorage)
```javascript
// Auth state
localStorage.setItem('admin_profile', JSON.stringify({
  id: user.id,
  email: user.email,
  role: 'admin'
}));

localStorage.setItem('login_time', new Date().toISOString());

// Retrieve
const admin = JSON.parse(localStorage.getItem('admin_profile'));
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /auth/login          - Login user
POST   /auth/register       - Register user (if available)
POST   /auth/logout         - Logout
GET    /auth/verify         - Verify token
```

### Armada Management
```
GET    /api/armada          - Get all armada
POST   /api/armada          - Create new armada
GET    /api/armada/:id      - Get armada detail
PUT    /api/armada/:id      - Update armada
DELETE /api/armada/:id      - Delete armada
```

### Scan/Transaction
```
POST   /api/scan            - Create scan record
GET    /api/scan            - Get all scans
GET    /api/scan?date=      - Filter by date
```

### Example Request (Frontend)
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create armada
const createArmada = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/api/armada`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating armada:', error);
    throw error;
  }
};

// Delete armada
const deleteArmada = async (id) => {
  try {
    await axios.delete(`${API_URL}/api/armada/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting armada:', error);
    throw error;
  }
};
```

---

## 💾 Database Schema

### Tables

#### armada
```sql
CREATE TABLE armada (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_petugas VARCHAR(100) NOT NULL,
  jenis_armada VARCHAR(50) NOT NULL,
  wilayah VARCHAR(100) NOT NULL,
  mandor VARCHAR(100),
  tarif INT,
  qr_code LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### scan_transaction (atau transaction)
```sql
CREATE TABLE scan_transaction (
  id INT PRIMARY KEY AUTO_INCREMENT,
  armada_id INT,
  tanggal DATE NOT NULL,
  waktu TIME NOT NULL,
  total_masuk INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (armada_id) REFERENCES armada(id)
);
```

#### users (jika ada auth terpisah)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'mandor', 'petugas'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 Styling Guidelines

### Tailwind CSS Classes

**Color Scheme:**
```
Primary: green-600, green-700
Secondary: blue-600
Danger: red-500, red-600
Warning: yellow-500
Info: blue-400
Success: green-500
```

**Button Styles:**
```jsx
// Primary Button
<button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
  Action
</button>

// Secondary Button
<button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded">
  Cancel
</button>

// Danger Button
<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
  Delete
</button>
```

**Table Styles:**
```jsx
<table className="w-full border-collapse">
  <thead>
    <tr className="bg-gray-100 border-b">
      <th className="text-left px-4 py-2">Column</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">Cell</td>
    </tr>
  </tbody>
</table>
```

**Responsive Design:**
```jsx
// Mobile first
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  Responsive container
</div>

// Hide on mobile
<div className="hidden md:block">
  Desktop only
</div>
```

---

## 🛠️ Development Guide

### Setup Environment

**1. Clone Repository**
```bash
git clone https://github.com/Kuinsimndaa/EcoScan-DLH.git
cd EcoScan-DLH
```

**2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env

# Edit .env
# DATABASE_URL=mysql2://user:password@localhost:3306/dlh_ecoscan
# JWT_SECRET=your_secret_key
# PORT=5000
```

**3. Database Setup**
```bash
# Create database
mysql -u root -p
> CREATE DATABASE dlh_ecoscan;

# Or run migrations if available
npm run migrate
```

**4. Frontend Setup**
```bash
cd ../frontend
npm install
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:5000
```

**5. Run Development**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Access
# Frontend: http://localhost:5173 or http://localhost:5050
# Backend: http://localhost:5000
```

### Common Tasks

**Add New Component**
```jsx
// frontend/src/components/MyComponent.jsx
export default function MyComponent({ prop1, prop2 }) {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

**Add New API Endpoint (Backend)**
```javascript
// backend/src/routes/newRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/newController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

module.exports = router;

// backend/src/app.js
app.use('/api/new', require('./routes/newRoutes'));
```

**Update Database Schema**
```javascript
// backend/src/models/NewModel.js
const createNewTable = `
  CREATE TABLE IF NOT EXISTS new_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

db.query(createNewTable);
```

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy (Vercel)
vercel

# Or upload 'dist' folder to hosting
```

### Backend (Render/Railway)
1. Push ke GitHub
2. Connect repository ke Render/Railway
3. Set environment variables
4. Deploy

---

## 📊 Performance Tips

1. **Lazy Loading**
   ```jsx
   const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
   ```

2. **Memoization**
   ```jsx
   const MemoComponent = memo(function Component({ prop }) {
     return <div>{prop}</div>;
   });
   ```

3. **Code Splitting**
   - Router already does this with `lazy()` and `Suspense`

4. **Database Optimization**
   - Add indexes pada frequently searched columns
   - Use pagination untuk large datasets

---

## 🐛 Debugging

### Frontend
- Open DevTools: F12
- Check Network tab untuk API calls
- Check Console untuk errors
- Use React DevTools extension

### Backend
- Check terminal logs
- Use `console.log()` dalam controller
- Check MySQL error logs

### Database
```bash
# Connect to MySQL
mysql -u root -p dlh_ecoscan

# Check table structure
DESCRIBE armada;

# Check data
SELECT * FROM armada;

# Check indexes
SHOW INDEX FROM armada;
```

---

## 📝 Code Quality

### Best Practices
1. Use meaningful variable names
2. Add comments untuk complex logic
3. Separate concerns (components, controllers, utils)
4. Handle errors properly
5. Use async/await untuk promises
6. Validate input data

### ESLint (jika disetup)
```bash
npm run lint
npm run lint:fix
```

---

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Express.js Guide](https://expressjs.com)
- [MySQL Documentation](https://dev.mysql.com/doc)

---

## 📞 Support & Issues

Report issues ke: https://github.com/Kuinsimndaa/EcoScan-DLH/issues

---

**Last Updated:** 2025

