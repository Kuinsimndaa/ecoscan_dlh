const { SerialPort } = require('serialport');

// Konfigurasi RFID Reader (sesuaikan dengan reader Anda)
const RFID_CONFIG = {
  path: process.env.RFID_PORT || 'COM3', // Port USB, misal COM3 di Windows
  baudRate: parseInt(process.env.RFID_BAUD_RATE || '9600', 10), // Baud rate, sesuaikan dengan reader
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
};

let port = null;
let isConnected = false;

// Testing mode untuk development tanpa reader fisik
const testingMode = process.env.RFID_TEST_MODE === 'true';

const connectRFID = () => {
  if (port && port.isOpen) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    port = new SerialPort(RFID_CONFIG, (err) => {
      if (err) {
        console.error('Gagal menghubungkan ke RFID Reader:', err.message);
        isConnected = false;
        reject(err);
      } else {
        console.log('RFID Reader terhubung pada port:', RFID_CONFIG.path);
        isConnected = true;
        resolve();
      }
    });
  });
};

const disconnectRFID = () => {
  if (port && port.isOpen) {
    port.close();
    isConnected = false;
    console.log('RFID Reader terputus');
  }
};

const readRFIDTag = () => new Promise((resolve, reject) => {
    // Fallback testing mode - gunakan untuk development
    if (testingMode) {
      console.log('RFID Testing Mode: Waiting for tag (akan auto-resolve dalam 3 detik)...');
      setTimeout(() => {
        // Generate testing RFID tag
        const testTag = `TEST-RFID-${Date.now()}`;
        console.log('RFID Testing: Generated tag:', testTag);
        resolve(testTag);
      }, 3000);
      return;
    }

    connectRFID()
      .then(() => {
        let dataBuffer = '';

        const timeout = setTimeout(() => {
          port.removeAllListeners('data');
          reject(new Error('Timeout membaca RFID tag'));
        }, 10000); // Timeout 10 detik

        port.on('data', (data) => {
          const chunk = data.toString('utf8');
          dataBuffer += chunk;

          // Asumsi tag RFID diakhiri dengan newline atau karakter tertentu
          if (dataBuffer.includes('\n') || dataBuffer.includes('\r')) {
            clearTimeout(timeout);
            port.removeAllListeners('data');
            const tag = dataBuffer.trim();
            resolve(tag);
          }
        });

        // Jika reader mengirim data otomatis saat tag dideteksi
        // Jika perlu, kirim command untuk memulai scanning, misal port.write('SCAN\n');
      })
      .catch(reject);
  });

module.exports = {
  connectRFID,
  disconnectRFID,
  readRFIDTag,
  isConnected: () => isConnected,
};