const Help = () => {
  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Pusat Bantuan</h2>
      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-6">
        <p className="text-sm text-green-800">
          Jika terjadi kendala pada sistem scan atau cetak laporan, silakan hubungi pengembang:
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 border rounded-xl">
          <div className="bg-green-100 p-3 rounded-full">📞</div>
          <div>
            <p className="font-bold">WhatsApp Support</p>
            <p className="text-sm text-gray-500">+62 812-3456-7890</p>
          </div>
        </div>
        {/* Tambahkan kontak lainnya */}
      </div>
    </div>
  );
};

export default Help;
