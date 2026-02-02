const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Helper: verify password (bcrypt or plaintext fallback)
async function verifyAndMigratePassword(user, plainPassword) {
  // If user password looks like a bcrypt hash (starts with $2), try bcrypt
  if (typeof user.password === 'string' && user.password.startsWith('$2')) {
    const match = await bcrypt.compare(plainPassword, user.password);
    return match;
  }

  // Fallback: plaintext match. If match, re-hash and update DB for migration.
  if (user.password === plainPassword) {
    const hashed = await bcrypt.hash(plainPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
    return true;
  }

  return false;
}

// Route Login (untuk Admin dan Petugas)
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      const user = rows[0];
      const ok = await verifyAndMigratePassword(user, password);

      if (ok) {
        return res.status(200).json({
          success: true,
          message: 'Login Berhasil',
          data: {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
          },
        });
      }
    }

    return res.status(401).json({ success: false, message: 'Email atau Password salah!' });
  } catch (error) {
    // Pass to centralized error handler
    return next(error);
  }
});

// Route Login Petugas (alias, gunakan route /login untuk kedua role)
router.post('/login-petugas', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      const user = rows[0];

      // Verify password (with migration fallback)
      const ok = await verifyAndMigratePassword(user, password);

      if (ok) {
        // Accept role: mandor, petugas, or PETUGAS
        if (user.role && (user.role.toLowerCase() === 'mandor' || user.role.toLowerCase() === 'petugas')) {
          return res.status(200).json({
            success: true,
            message: 'Login Berhasil',
            data: {
              id: user.id,
              nama: user.nama,
              email: user.email,
              role: user.role,
            },
          });
        }

        return res.status(401).json({ success: false, message: 'Akun ini bukan Petugas Scan!' });
      }
    }

    return res.status(401).json({ success: false, message: 'Email atau Password salah!' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
