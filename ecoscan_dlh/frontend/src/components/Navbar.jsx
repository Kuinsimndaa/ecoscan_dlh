import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    // Hapus data session
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Cek apakah link aktif untuk styling
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* KIRI: LOGO & BRAND */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.img
            whileHover={{ rotate: 10 }}
            src="/logo-pemkab.png"
            alt="Logo Pemkab Tegal"
            className="w-9 h-9 object-contain"
            onError={(e) => {
              e.target.src =
                'https://upload.wikimedia.org/wikipedia/commons/0/0a/Lambang_Kabupaten_Tegal.png';
            }}
          />
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none tracking-tight">
              EcoScan <span className="text-green-600">DLH</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Kab. Tegal
            </p>
          </div>
        </Link>

        {/* TENGAH: MENU (Hanya untuk Admin) */}
        {user?.role === 'admin' && (
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/admin/dashboard" active={isActive('/admin/dashboard')}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/add-armada" active={isActive('/admin/add-armada')}>
              Armada
            </NavLink>
            <NavLink to="/admin/report" active={isActive('/admin/report')}>
              Laporan
            </NavLink>
          </div>
        )}

        {/* KANAN: USER INFO & LOGOUT */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block border-r pr-4 border-slate-200">
            <p className="text-xs font-black text-slate-800 leading-none">
              {user?.nama || 'Pengguna'}
            </p>
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-tighter mt-1">
              {user?.role === 'admin' ? 'Administrator' : 'Petugas Mandor'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm group"
            title="Keluar Aplikasi"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-active:scale-75 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

// Sub-komponen untuk Link Navigasi agar kode lebih rapi
const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
      active
        ? 'bg-green-50 text-green-700'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
