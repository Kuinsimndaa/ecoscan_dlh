const db = require('../config/database');

// 1. FUNGSI SIMPAN DATA (INSERT)
const saveArmada = async (req, res) => {
  try {
    const { namaPetugas, mandor, jenisArmada, wilayah, tarif } = req.body;

    // Membuat string QR Code unik (Variabel qrcodeValue)
    // Format: ECO - [Timestamp] - [Angka Random]
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const qrcodeValue = `ECO-${timestamp}-${randomNum}`;

    // Perintah SQL INSERT dengan 6 kolom (termasuk qrcode)
    const sql = `INSERT INTO armada (namaPetugas, mandor, jenisArmada, wilayah, tarif, qrcode) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

    const [result] = await db.execute(sql, [
      namaPetugas,
      mandor,
      jenisArmada,
      wilayah,
      tarif,
      qrcodeValue, // Memasukkan variabel ke kolom ke-6
    ]);

    // Mengirim respon balik ke Frontend agar QR langsung muncul
    return res.status(201).json({
      success: true,
      message: 'Data armada dan QR Code berhasil disimpan!',
      data: {
        id: result.insertId,
        qrcode: qrcodeValue,
      },
    });
  } catch (error) {
    console.error('Kesalahan Database:', error);
    return res.status(500).json({
      success: false,
      message: `Gagal menyimpan ke database: ${error.message}`,
    });
  }
};

// 2. FUNGSI AMBIL DATA (SELECT)
const getArmada = async (req, res) => {
  try {
    // Mengambil semua data diurutkan dari yang terbaru
    const [rows] = await db.execute('SELECT * FROM armada ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Gagal mengambil data:', error);
    res.status(500).json({ message: 'Gagal mengambil data dari database' });
  }
};

// 3. FUNGSI HAPUS DATA (DELETE)
const deleteArmada = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM armada WHERE id = ?', [id]);
    res.status(200).json({
      success: true,
      message: 'Data armada berhasil dihapus',
    });
  } catch (error) {
    console.error('Gagal menghapus:', error);
    res.status(500).json({ message: 'Gagal menghapus data' });
  }
};

module.exports = {
  getArmada,
  saveArmada,
  deleteArmada,
};
