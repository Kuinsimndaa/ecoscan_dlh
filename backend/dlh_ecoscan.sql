/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE TABLE IF NOT EXISTS `armada` (
  `id` int NOT NULL AUTO_INCREMENT,
  `namaPetugas` varchar(100) DEFAULT NULL,
  `mandor` varchar(100) DEFAULT NULL,
  `jenisArmada` varchar(50) DEFAULT NULL,
  `wilayah` varchar(100) DEFAULT NULL,
  `tarif` decimal(10,2) DEFAULT NULL,
  `qrcode` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4;

REPLACE INTO `armada` (`id`, `namaPetugas`, `mandor`, `jenisArmada`, `wilayah`, `tarif`, `qrcode`, `createdAt`) VALUES
	(2, 'IBAD', 'SARWADI', 'GEROBAK', 'PAKEMBARAN', 40000.00, 'ECO-1768629240754-342', '2026-01-17 05:54:00'),
	(3, 'WAWAN', 'ATMIARDI', 'TOSSA', 'DUKUH SEMBUNG', 60000.00, 'ECO-1768724153026-506', '2026-01-18 08:15:53'),
	(4, 'HENDRO', 'WIHANTO', 'GEROBAK', 'SLAWI WETAN', 40000.00, 'ECO-1768724347924-566', '2026-01-18 08:19:07'),
	(5, 'WAHAB', 'SYAMDANI', 'TOSSA', 'Perumahan Saphire townhouse (KALISAPU)', 60000.00, 'ECO-1768724421846-795', '2026-01-18 08:20:21'),
	(6, 'HERI', 'YESSY', 'GEROBAK', 'DUKUHRINGIN', 40000.00, 'ECO-1768724466698-398', '2026-01-18 08:21:06'),
	(7, 'IPANK', 'DIAN', 'TOSSA', 'PROCOT', 40000.00, 'ECO-1768812394452-988', '2026-01-19 08:46:34'),
	(18, 'kopral', 'sarwadi', 'TOSSA', 'slawi', 50000.00, 'ECO-1769135065147-49', '2026-01-23 02:24:25');

CREATE TABLE IF NOT EXISTS `id_billing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `periode_bulan` varchar(7) NOT NULL,
  `periode_tanggal` date DEFAULT NULL,
  `armada_id` int DEFAULT NULL,
  `nama_petugas` varchar(100) NOT NULL,
  `jenis_armada` varchar(50) DEFAULT NULL,
  `wilayah` varchar(100) DEFAULT NULL,
  `mandor` varchar(100) DEFAULT NULL,
  `tarif_satuan` decimal(10,2) NOT NULL,
  `jumlah_kedatangan` int DEFAULT '0',
  `total_tagihan` decimal(10,2) DEFAULT '0.00',
  `status` enum('Pending','Verifikasi','Selesai') DEFAULT 'Pending',
  `keterangan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_armada` FOREIGN KEY (`armada_id`) REFERENCES `armada` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `laporan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `qrcode` varchar(255) DEFAULT NULL,
  `namaPetugas` varchar(100) DEFAULT NULL,
  `jenisArmada` varchar(50) DEFAULT NULL,
  `wilayah` varchar(100) DEFAULT NULL,
  `tarif` decimal(10,2) DEFAULT NULL,
  `mandor` varchar(100) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `waktu` time DEFAULT NULL,
  `kedatanganKe` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','mandor') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

REPLACE INTO `users` (`id`, `nama`, `email`, `password`, `role`, `created_at`) VALUES
	(1, 'Admin DLH Slawi', 'admin@tegal.go.id', 'admin123', 'admin', '2026-01-05 06:16:29'),
	(2, 'Petugas Scan', 'petugas@ecoscan.com', 'petugas123', 'mandor', '2026-01-05 06:16:29');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;