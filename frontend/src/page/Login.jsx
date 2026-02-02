import { useState } from 'react';
import axios from '../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import SimpleCaptcha from '../components/SimpleCaptcha';
import API_BASE_URL from '../config/api';

const Login = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [email, setEmail] = useState('admin@tegal.go.id');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Cek apakah CAPTCHA sudah diverifikasi
    if (!isCaptchaVerified) {
      setNotification({
        type: 'error',
        title: '✗ VERIFIKASI DIPERLUKAN',
        message: 'Silahkan verifikasi CAPTCHA terlebih dahulu sebelum login.',
        playSound: false,
      });
      return;
    }

    try {
      const endpoint = activeTab === 'admin' ? '/api/auth/login' : '/api/auth/login-petugas';
      const res = await axios.post(endpoint, { email, password });

      if (res.data.success) {
        localStorage.setItem('admin_profile', JSON.stringify(res.data.data));
        localStorage.setItem('login_time', new Date().toISOString());

        // Tampilkan notifikasi sukses
        setNotification({
          type: 'success',
          title: '✓ LOGIN BERHASIL',
          message: `Selamat datang, ${res.data.data.nama}!`,
          playSound: true,
        });

        // Redirect setelah notifikasi ditampilkan (diperpanjang agar stabil)
        setTimeout(() => {
          navigate(activeTab === 'admin' ? '/admin/dashboard' : '/mandor/dashboard');
        }, 2000);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        title: '✗ LOGIN GAGAL',
        message: err.response?.data?.message || 'Gagal terhubung ke server backend!',
        playSound: false,
      });
      // Reset CAPTCHA saat login gagal
      setIsCaptchaVerified(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20 font-sans p-4 sm:p-6 md:p-8">
      <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-6 sm:p-8 md:p-10 rounded-3xl sm:rounded-[3.5rem] shadow-2xl w-full max-w-md sm:max-w-lg border border-slate-100/80 flex flex-col items-center backdrop-blur-sm">
        {/* 1. LOGO PEMKAB / DLH */}
        <img src="/logo-pemkab.png" alt="Logo DLH" className="w-16 sm:w-20 h-auto mb-3 sm:mb-4" />

        {/* 2. JUDUL SISTEM */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black italic text-slate-900 tracking-tighter uppercase">
            ECOSCAN <span className="text-green-600">DLH</span>
          </h1>
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400 mt-1">
            Kabupaten Tegal
          </p>
        </div>

        {/* 3. SELECTOR ROLE (ADMIN & PETUGAS SCAN) */}
        <div className="flex bg-slate-100 p-1.5 sm:p-2 rounded-xl sm:rounded-[1.5rem] mb-8 sm:mb-10 w-full shadow-inner">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all ${activeTab === 'admin' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveTab('petugas')}
            className={`flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all ${activeTab === 'petugas' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
          >
            Petugas Scan
          </button>
        </div>

        {/* FORM LOGIN */}
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 mb-2 block tracking-widest">
              Email Akun
            </label>
            <input
              type="email"
              className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-green-500 focus:bg-white transition-all shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tegal.go.id"
              required
            />
          </div>

          <div className="relative">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 mb-2 block tracking-widest">
              Kata Sandi
            </label>
            <input
              type="password"
              className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-green-500 focus:bg-white transition-all shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* CAPTCHA Section */}
          <div className="bg-gradient-to-br from-slate-100/80 via-blue-50/50 to-slate-100/80 p-6 rounded-2xl border-2 border-slate-200/50 backdrop-blur-sm">
            <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block tracking-widest">
              Verifikasi Keamanan
            </label>
            <SimpleCaptcha onVerify={setIsCaptchaVerified} />
          </div>

          <button
            type="submit"
            className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs mt-6 transition-all shadow-xl ${
              isCaptchaVerified
                ? 'bg-slate-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            disabled={!isCaptchaVerified}
          >
            {isCaptchaVerified ? 'Masuk Sistem' : 'Verifikasi CAPTCHA Terlebih Dahulu'}
          </button>
        </form>

        <p className="mt-12 text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center">
          Dinas Lingkungan Hidup — Jalingkos Slawi
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          playSound={notification.playSound}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Login;
