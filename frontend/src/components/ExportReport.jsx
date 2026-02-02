import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportReport = ({ dataBulanan }) => {
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header PDF
    doc.setFontSize(16);
    doc.text('DINAS LINGKUNGAN HIDUP (DLH)', 14, 15);
    doc.setFontSize(10);
    doc.text('Laporan Rekapitulasi Kedatangan TPS - Januari 2026', 14, 22);
    doc.text('Dokumen ini adalah bukti transaksi resmi armada sampah.', 14, 27);

    // Tabel Data
    const tableColumn = ['Nama Pengendara', 'Wilayah', 'Total Datang', 'Total Tagihan'];
    const tableRows = dataBulanan.map((item) => [
      item.nama,
      item.wilayah,
      item.total_datang,
      `Rp ${item.total_tagihan.toLocaleString()}`,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [22, 101, 52] }, // Warna Hijau DLH
    });

    doc.save(`Laporan_Rekap_DLH_${Date.now()}.pdf`);
  };

  return (
    <button
      onClick={downloadPDF}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Cetak Laporan PDF
    </button>
  );
};

export default ExportReport;
