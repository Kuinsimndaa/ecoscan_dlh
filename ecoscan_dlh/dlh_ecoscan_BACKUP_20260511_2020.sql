mysqldump.exe : -- Warning: column statistics not supported by the server.
At line:2 char:1
+ & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe" --user= ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (-- Warning: col... by the server.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
-- MySQL dump 10.13  Distrib 8.4.9, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dlh_ecoscan
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `dlh_ecoscan`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `dlh_ecoscan` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `dlh_ecoscan`;

--
-- Table structure for table `armada`
--

DROP TABLE IF EXISTS `armada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `armada` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `namaPetugas` varchar(100) DEFAULT NULL,
  `mandor` varchar(100) DEFAULT NULL,
  `jenisArmada` varchar(50) DEFAULT NULL,
  `wilayah` varchar(100) DEFAULT NULL,
  `tarif` decimal(10,2) DEFAULT NULL,
  `qrcode` varchar(255) DEFAULT NULL,
  `rfid` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `armada`
--

LOCK TABLES `armada` WRITE;
/*!40000 ALTER TABLE `armada` DISABLE KEYS */;
INSERT INTO `armada` VALUES (2,'IBAD','SARWADI','GEROBAK','PAKEMBARAN',40000.00,'ECO-1768629240754-342',NULL,'2026-01-16 22:54:00'),(3,'WAWAN','ATMIARDI','TOSSA','DUKUH SEMBUNG',60000.00,'ECO-1768724153026-506',NULL,'2026-01-18 01:15:53'),(4,'HENDRO','WIHANTO','GEROBAK','SLAWI WETAN',40000.00,'ECO-1768724347924-566',NULL,'2026-01-18 01:19:07'),(5,'WAHAB','SYAMDANI','TOSSA','Perumahan Saphire townhouse (KALISAPU)',60000.00,'ECO-1768724421846-795',NULL,'2026-01-18 01:20:21'),(6,'HERI','YESSY','GEROBAK','DUKUHRINGIN',40000.00,'ECO-1768724466698-398',NULL,'2026-01-18 01:21:06'),(7,'IPANK','DIAN','TOSSA','PROCOT',40000.00,'ECO-1768812394452-988',NULL,'2026-01-19 01:46:34'),(18,'kopral','sarwadi','TOSSA','slawi',50000.00,'ECO-1769135065147-49',NULL,'2026-01-22 19:24:25'),(19,'KUINSI','SARWADI','GEROBAK','SLAWI',40000.00,'ECO-KUINSI-001','EDF61705','2026-05-11 10:09:18'),(20,'VINDY','YANTO','TOSSA','GUMAYUN',60000.00,'ECO-1778500303660-133','4A6E1216','2026-05-11 11:51:43'),(21,'MELINDA','SYUKUR','GEROBAK','MARGASARI',40000.00,'ECO-1778500660472-126',NULL,'2026-05-11 11:57:40');
/*!40000 ALTER TABLE `armada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `id_billing`
--

DROP TABLE IF EXISTS `id_billing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `id_billing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periode_bulan` varchar(7) NOT NULL,
  `periode_tanggal` date DEFAULT NULL,
  `armada_id` int(11) DEFAULT NULL,
  `nama_petugas` varchar(100) NOT NULL,
  `jenis_armada` varchar(50) DEFAULT NULL,
  `wilayah` varchar(100) DEFAULT NULL,
  `mandor` varchar(100) DEFAULT NULL,
  `tarif_satuan` decimal(10,2) NOT NULL,
  `jumlah_kedatangan` int(11) DEFAULT 0,
  `total_tagihan` decimal(10,2) DEFAULT 0.00,
  `status` enum('Pending','Verifikasi','Selesai') DEFAULT 'Pending',
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_armada` (`armada_id`),
  CONSTRAINT `fk_armada` FOREIGN KEY (`armada_id`) REFERENCES `armada` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `id_billing`
--

LOCK TABLES `id_billing` WRITE;
/*!40000 ALTER TABLE `id_billing` DISABLE KEYS */;
/*!40000 ALTER TABLE `id_billing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laporan`
--

DROP TABLE IF EXISTS `laporan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laporan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `qrcode` varchar(255) DEFAULT NULL,
  `rfid` varchar(255) DEFAULT NULL,
  `metode_scan` enum('QR','RFID') DEFAULT 'QR',
  `namaPetugas` varchar(100) DEFAULT NULL,
  `jenisArmada` varchar(50) DEFAULT NULL,
  `wilayah` varchar(100) DEFAULT NULL,
  `tarif` decimal(10,2) DEFAULT NULL,
  `mandor` varchar(100) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `waktu` time DEFAULT NULL,
  `kedatanganKe` int(11) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laporan`
--

LOCK TABLES `laporan` WRITE;
/*!40000 ALTER TABLE `laporan` DISABLE KEYS */;
INSERT INTO `laporan` VALUES (1,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','17:58:55',1,'2026-05-11 10:58:55'),(2,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','18:05:00',2,'2026-05-11 11:05:00'),(3,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','18:16:33',3,'2026-05-11 11:16:33'),(4,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','18:17:02',4,'2026-05-11 11:17:02'),(5,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','18:17:52',5,'2026-05-11 11:17:52'),(6,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','18:24:01',6,'2026-05-11 11:24:01'),(7,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','18:26:04',7,'2026-05-11 11:26:04'),(8,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','18:30:13',8,'2026-05-11 11:30:13'),(9,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','18:31:02',9,'2026-05-11 11:31:02'),(10,'ECO-KUINSI-001','EDF61705','RFID','KUINSI','GEROBAK','SLAWI',40000.00,'SARWADI','2026-05-11','18:31:24',10,'2026-05-11 11:31:24');
/*!40000 ALTER TABLE `laporan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','mandor') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin DLH Slawi','admin@tegal.go.id','$2a$10$iVMXV2t.sazUaUQRd7mRvuU9Vo0Su9XPkucpHbAoe3XjBfmTRsMMK','admin','2026-01-04 23:16:29'),(2,'Petugas Scan','petugas@ecoscan.com','$2a$10$Hfl8qy5AArk/VA3g3f.TceXUwANxjZgoMBIp8dWxhzI5aiOUKwKw6','mandor','2026-01-04 23:16:29');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'dlh_ecoscan'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-11 20:20:52
