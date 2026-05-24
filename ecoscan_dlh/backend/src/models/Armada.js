const db = require('../config/database');

class Armada {
  static async findByToken(token) {
    const [rows] = await db.query('SELECT * FROM armada WHERE qr_code_token = ?', [token]);
    return rows[0];
  }
}

module.exports = Armada;
