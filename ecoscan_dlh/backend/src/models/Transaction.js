const db = require('../config/database');

class Transaction {
  constructor(armadaId, mandorId, tps) {
    this.armadaId = armadaId;
    this.mandorId = mandorId;
    this.tps = tps;
    this.waktu = new Date();
  }

  // Fungsi Statis untuk menghitung jumlah kedatangan hari ini
  static async getDailyArrivalCount(armadaId) {
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    const [rows] = await db.query(
      `SELECT COUNT(*) as total FROM transaksi 
       WHERE armada_id = ? AND DATE(waktu_scan) = ?`,
      [armadaId, today]
    );
    return rows[0].total;
  }

  async save() {
    const currentCount = await Transaction.getDailyArrivalCount(this.armadaId);
    const arrivalNumber = currentCount + 1;

    const [result] = await db.query(
      `INSERT INTO transaksi (armada_id, mandor_id, waktu_scan, kedatangan_ke) 
       VALUES (?, ?, ?, ?)`,
      [this.armadaId, this.mandorId, this.waktu, arrivalNumber]
    );
    return { id: result.insertId, arrivalNumber };
  }
}

module.exports = Transaction;
