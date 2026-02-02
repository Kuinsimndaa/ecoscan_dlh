import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, FileText, Receipt, LogOut, Menu, X } from 'lucide-react';

const SidebarAdmin = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'DASHBOARD', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'TAMBAH OBJEK RETRIBUSI', path: '/admin/tambah-armada', icon: <Truck size={20} /> },
    { name: 'REKAPAN LAPORAN', path: '/admin/rekapan-laporan', icon: <FileText size={20} /> },
    { name: 'ID BILLING', path: '/admin/id-billing', icon: <Receipt size={20} /> },
  ];

  // Close sidebar when clicking menu item on mobile
  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop Overlay for Mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white
          flex flex-col z-50 border-r border-slate-800/50 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Area - DLH Pemkab Tegal */}
        <div className="p-6 border-b border-slate-800/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
          <div className="mb-4 p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 text-center">
            <div className="flex items-center justify-center mb-2">
              <img
                src="/logo-pemkab.png"
                alt="Logo DLH Kab Tegal"
                className="h-12 w-12 object-contain"
              />
            </div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em]">
              Dinas Lingkungan Hidup
            </p>
          </div>
          <h1 className="font-black text-lg italic uppercase text-center tracking-tighter leading-tight">
            ECOSCAN
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              ADMIN
            </span>
          </h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-5 space-y-1 mt-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleMenuClick}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 group ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-900/50 border border-green-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <span
                className={`transition-all group-hover:scale-110 ${location.pathname === item.path ? 'text-white' : 'text-slate-500'}`}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Stats Badge */}
        <div className="px-5 py-4 border-t border-slate-800/50 bg-slate-900/50">
          <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Status
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-green-400">Aktif</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-5 border-t border-slate-800/50">
          <Link
            to="/"
            onClick={handleMenuClick}
            className="flex items-center justify-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span>KELUAR</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
export default SidebarAdmin;
