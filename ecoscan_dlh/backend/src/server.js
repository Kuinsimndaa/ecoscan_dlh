// Load environment variables first
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3030;

// Menjalankan server
app.listen(PORT, async () => {
  console.info(`Server running: http://localhost:${PORT}`);

  // Memanggil fungsi cek database yang didefinisikan di app.js
  if (app.checkDatabaseConnection) {
    await app.checkDatabaseConnection();
  }
});
