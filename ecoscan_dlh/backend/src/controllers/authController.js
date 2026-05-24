const db = require('../config/database'); // Sesuaikan nama file

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND password = ?', [
      email,
      password,
    ]);

    if (rows.length > 0) {
      const user = rows[0];
      res.status(200).json({
        success: true,
        message: 'Login Berhasil',
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Email atau Password salah!',
      });
    }
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ success: false, message: 'Kesalahan Server' });
  }
};

module.exports = { login };
