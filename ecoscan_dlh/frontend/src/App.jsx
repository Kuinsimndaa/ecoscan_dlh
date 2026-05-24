import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InstallPrompt from './components/InstallPrompt';
import ProtectedRoute from './components/ProtectedRoute';

// Import Layouts khusus untuk memisahkan Sidebar Admin dan Mandor
import SidebarAdmin from './components/SidebarAdmin';
import SidebarMandor from './components/SidebarMandor';

// Import Halaman Utama
import Login from './page/Login';

// Import Halaman Admin
import DashboardAdmin from './page/admin/Dashboard';
import AddArmada from './page/admin/AddArmada';
import MonthlyReport from './page/admin/MonthlyReport';
import Billing from './page/admin/Billing';

// Import Halaman Mandor/Scanner
import MandorDashboard from './page/mandor/Dashboard';
import Scanner from './page/mandor/Scanner';

function App() {
  return (
    <>
      <InstallPrompt />
      <Router>
        <Routes>
          {/* HALAMAN UTAMA: Langsung diarahkan ke Login saat aplikasi dijalankan */}
          <Route path="/" element={<Login />} />

          {/* GRUP LAYOUT: ECOSCAN ADMIN */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <div className="flex bg-slate-50 min-h-screen">
                  <SidebarAdmin />
                  <main className="w-full lg:ml-64 min-h-screen p-4 sm:p-6 md:p-8 lg:p-10">
                    <Routes>
                      <Route path="dashboard" element={<DashboardAdmin />} />
                      <Route path="tambah-armada" element={<AddArmada />} />
                      <Route path="rekapan-laporan" element={<MonthlyReport />} />
                      <Route path="id-billing" element={<Billing />} />
                      {/* Redirect jika rute /admin kosong */}
                      <Route index element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* GRUP LAYOUT: PETUGAS SCANNER (MANDOR) */}
          <Route
            path="/mandor/*"
            element={
              <ProtectedRoute>
                <div className="flex bg-slate-50 min-h-screen">
                  <SidebarMandor />
                  <main className="w-full lg:ml-64 min-h-screen p-4 sm:p-6 md:p-8 lg:p-10">
                    <Routes>
                      <Route path="dashboard" element={<MandorDashboard />} />
                      <Route path="scanner" element={<Scanner />} />
                      {/* Rute Riwayat Scan telah dihapus sepenuhnya sesuai instruksi */}
                      <Route index element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Fallback rute jika user mengetik alamat yang salah, akan kembali ke Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
