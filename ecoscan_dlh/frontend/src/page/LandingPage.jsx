import { motion } from 'framer-motion'; // Untuk Animasi
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[url('/bg-nature.jpg')] bg-cover bg-center flex items-center justify-center">
      {/* Overlay Hijau Transparan */}
      <div className="absolute inset-0 bg-green-900/40 backdrop-blur-sm"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/90 p-10 rounded-3xl shadow-2xl text-center max-w-md"
      >
        <img src="/logo-dlh.png" alt="Logo DLH" className="w-24 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-green-800 mb-2">EcoScan DLH</h1>
        <p className="text-gray-600 mb-8 italic">
          &quot;Digitalisasi TPS untuk Lingkungan yang Lebih Bersih&quot;
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/login"
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg active:scale-95"
          >
            Masuk ke Aplikasi
          </Link>
          <Link
            to="/register"
            className="text-green-700 border-2 border-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all"
          >
            Daftar Akun Baru
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>© 2026 DLH Digital Transformation Team</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
