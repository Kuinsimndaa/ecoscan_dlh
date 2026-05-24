const express = require('express');
const cors = require('cors');
const db = require('./config/database'); // Pastikan path ini benar (database.js)

const app = express();

// --- Middleware ---
// Configure CORS with environment variable
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5050',
  'http://127.0.0.1:5050',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const armadaRoutes = require('./routes/armadaRoutes');

// --- Registrasi Endpoints ---
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/armada', armadaRoutes);

// --- Fungsi Pengecekan Database ---
// Fungsi ini diekspor agar bisa dipanggil oleh server.js saat start
app.checkDatabaseConnection = async () => {
  try {
    // Melakukan query sederhana untuk mengetes koneksi
    await db.query('SELECT 1');
    console.info('DATABASE: Terhubung ke MySQL');
    return true;
  } catch (err) {
    console.error('DATABASE: Gagal terhubung!');
    console.error(err.message || err);
    return false;
  }
};

const path = require('path');

// --- Melayani File Statis Frontend (Monolith) ---
// Menyajikan file statis dari folder public (di mana file dist React diletakkan)
app.use(express.static(path.join(__dirname, '../public')));

// Route default untuk cek status API
app.get('/api', (req, res) => {
  res.json({ message: 'EcoScan DLH API is Active' });
});

// Fallback untuk React Router (PWA) agar tidak 404 saat direfresh
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Centralized error handler (last middleware)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
