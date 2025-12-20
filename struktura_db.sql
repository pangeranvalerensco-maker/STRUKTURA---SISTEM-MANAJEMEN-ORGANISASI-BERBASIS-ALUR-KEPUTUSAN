-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: struktura_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!50503 SET NAMES utf8 */
;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */
;
/*!40103 SET TIME_ZONE='+00:00' */
;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */
;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */
;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */
;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `notification` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `created_at` datetime(6) DEFAULT NULL,
    `is_read` bit(1) NOT NULL,
    `message` varchar(255) DEFAULT NULL,
    `recipient_id` bigint(20) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FKfcyn9rsga73dqnorl7owfyl4a` (`recipient_id`),
    CONSTRAINT `FKfcyn9rsga73dqnorl7owfyl4a` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 106 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */
;
INSERT INTO
    `notification`
VALUES (
        1,
        '2025-12-18 13:38:33.000000',
        _binary '',
        'Keanggotaan Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DICABUT. Alasan: asd',
        10
    ),
    (
        2,
        '2025-12-18 13:38:57.000000',
        _binary '',
        'Calon Anggota Baru: Azhar Farizi ingin bergabung.',
        5
    ),
    (
        3,
        '2025-12-18 13:39:10.000000',
        _binary '',
        'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.',
        10
    ),
    (
        4,
        '2025-12-18 14:10:57.000000',
        _binary '',
        'Keanggotaan Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DICABUT. Alasan: aadsfg',
        11
    ),
    (
        5,
        '2025-12-18 14:11:50.000000',
        _binary '',
        'Calon Anggota Baru: Muhammad Farid ingin bergabung.',
        5
    ),
    (
        6,
        '2025-12-18 14:12:04.000000',
        _binary '',
        'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.',
        11
    ),
    (
        7,
        '2025-12-18 14:37:35.000000',
        _binary '',
        'PROKER_NEW:20:asf',
        5
    ),
    (
        8,
        '2025-12-19 02:28:27.000000',
        _binary '',
        'PROKER_NEW:21:asdf',
        5
    ),
    (
        9,
        '2025-12-19 02:45:40.000000',
        _binary '',
        'PROKER_NEW:22:aaaa',
        5
    ),
    (
        10,
        '2025-12-19 02:47:05.000000',
        _binary '',
        'PROKER_NEW:23:farid',
        5
    ),
    (
        11,
        '2025-12-19 02:49:41.000000',
        _binary '',
        'PROKER_NEW:24:Bersih-bersih',
        5
    ),
    (
        12,
        '2025-12-19 03:06:28.000000',
        _binary '',
        'PIC Azhar Farizi telah menyelesaikan proker: asdfg',
        5
    ),
    (
        13,
        '2025-12-19 03:28:57.000000',
        _binary '',
        'PROKER_NEW:25:panferan minta',
        5
    ),
    (
        14,
        '2025-12-19 04:55:57.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'topikkkkkkkk\'. Menunggu persetujuan pimpinan.',
        7
    ),
    (
        15,
        '2025-12-19 04:55:57.000000',
        _binary '',
        'PROKER_NEW:26:topikkkkkkkk',
        5
    ),
    (
        16,
        '2025-12-19 04:56:31.000000',
        _binary '',
        'PROKER_APPROVED: Proker \'topikkkkkkkk\' telah disetujui pimpinan. Silakan mulai jalankan proker!',
        7
    ),
    (
        17,
        '2025-12-19 04:59:31.000000',
        _binary '',
        'Calon Anggota Baru: Izhar Harahap ingin bergabung.',
        5
    ),
    (
        19,
        '2025-12-19 05:01:48.000000',
        _binary '',
        'PROKER_REJECTED: Proker \'aaaa\' ditolak. Alasan: asdadsaadsa',
        10
    ),
    (
        21,
        '2025-12-19 13:17:59.000000',
        _binary '',
        'Calon Anggota Baru: Izhar Harahap ingin bergabung.',
        5
    ),
    (
        22,
        '2025-12-19 13:30:39.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'xcvn\'. Menunggu persetujuan pimpinan.',
        10
    ),
    (
        23,
        '2025-12-19 13:30:39.000000',
        _binary '',
        'PROKER_NEW:27:xcvn',
        5
    ),
    (
        24,
        '2025-12-19 13:34:55.000000',
        _binary '',
        'NEW_MEMBER_REQUEST:Calon Anggota Baru: Izhar Harahap ingin bergabung.',
        5
    ),
    (
        26,
        '2025-12-19 14:38:58.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'asdf\'. Menunggu persetujuan pimpinan.',
        10
    ),
    (
        27,
        '2025-12-19 14:38:58.000000',
        _binary '',
        'PROKER_NEW:28:asdf',
        5
    ),
    (
        28,
        '2025-12-19 14:39:24.000000',
        _binary '',
        'PROKER_APPROVED: Proker \'asdf\' telah disetujui pimpinan. Silakan mulai jalankan proker!',
        10
    ),
    (
        29,
        '2025-12-19 14:53:31.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'sdfgh\'. Menunggu persetujuan pimpinan.',
        10
    ),
    (
        30,
        '2025-12-19 14:53:31.000000',
        _binary '',
        'PROKER_NEW:29:sdfgh',
        5
    ),
    (
        31,
        '2025-12-19 14:54:03.000000',
        _binary '',
        'PROKER_STATUS:Proker \'sdfgh\' telah DISETUJUI. Silakan mulai pelaksanaan.',
        10
    ),
    (
        32,
        '2025-12-19 14:54:33.000000',
        _binary '',
        'PIC Azhar Farizi telah menyelesaikan proker: farid',
        5
    ),
    (
        33,
        '2025-12-19 14:55:33.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'asdfg\'. Menunggu persetujuan pimpinan.',
        10
    ),
    (
        34,
        '2025-12-19 14:55:33.000000',
        _binary '',
        'PROKER_NEW:30:asdfg',
        5
    ),
    (
        35,
        '2025-12-19 14:55:53.000000',
        _binary '',
        'PROKER_STATUS:Proker \'asdfg\' telah DISETUJUI. Silakan mulai pelaksanaan.',
        10
    ),
    (
        36,
        '2025-12-19 15:01:38.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'12311323132131\'. Menunggu persetujuan pimpinan.',
        10
    ),
    (
        37,
        '2025-12-19 15:01:38.000000',
        _binary '',
        'PROKER_NEW:31:12311323132131',
        5
    ),
    (
        38,
        '2025-12-19 15:01:50.000000',
        _binary '',
        'PROKER_STATUS:Proker \'12311323132131\' telah DISETUJUI. Silakan mulai pelaksanaan.',
        10
    ),
    (
        39,
        '2025-12-19 15:01:50.000000',
        _binary '',
        'PROKER_STATUS:Usulan Proker Anda \'12311323132131\' telah DISETUJUI oleh Pimpinan.',
        11
    ),
    (
        40,
        '2025-12-19 15:02:11.000000',
        _binary '',
        'PROKER_FINISH:31:PIC Azhar Farizi telah menyelesaikan proker: 12311323132131',
        5
    ),
    (
        41,
        '2025-12-19 15:08:45.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'magang\'. Menunggu persetujuan pimpinan.',
        10
    ),
    (
        42,
        '2025-12-19 15:08:45.000000',
        _binary '',
        'PROKER_NEW:32:magang',
        5
    ),
    (
        43,
        '2025-12-19 15:09:17.000000',
        _binary '',
        'PROKER_FINISH:28:PIC Azhar Farizi telah menyelesaikan proker: asdf',
        5
    ),
    (
        44,
        '2025-12-19 15:09:19.000000',
        _binary '',
        'PROKER_FINISH:29:PIC Azhar Farizi telah menyelesaikan proker: sdfgh',
        5
    ),
    (
        45,
        '2025-12-19 15:09:21.000000',
        _binary '',
        'PROKER_FINISH:30:PIC Azhar Farizi telah menyelesaikan proker: asdfg',
        5
    ),
    (
        46,
        '2025-12-19 15:10:01.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'kita coba lagi\'. Menunggu persetujuan pimpinan.',
        10
    ),
    (
        47,
        '2025-12-19 15:10:01.000000',
        _binary '',
        'PROKER_NEW:33:kita coba lagi',
        5
    ),
    (
        48,
        '2025-12-19 15:10:15.000000',
        _binary '',
        'PROKER_STATUS:Proker \'kita coba lagi\' telah DISETUJUI. Silakan mulai pelaksanaan.',
        10
    ),
    (
        49,
        '2025-12-19 15:10:15.000000',
        _binary '',
        'PROKER_STATUS:Usulan Proker Anda \'kita coba lagi\' telah DISETUJUI oleh Pimpinan.',
        11
    ),
    (
        50,
        '2025-12-19 15:10:33.000000',
        _binary '',
        'PROKER_STATUS:Proker yang Anda ajukan \'kita coba lagi\' SEKARANG MULAI BERJALAN.',
        11
    ),
    (
        51,
        '2025-12-19 15:10:46.000000',
        _binary '',
        'PROKER_FINISH:33:PIC Azhar Farizi telah menyelesaikan proker: kita coba lagi',
        5
    ),
    (
        52,
        '2025-12-19 15:10:46.000000',
        _binary '',
        'PROKER_STATUS:Proker yang Anda ajukan \'kita coba lagi\' TELAH SELESAI dikerjakan oleh PIC.',
        11
    ),
    (
        53,
        '2025-12-19 16:16:49.000000',
        _binary '',
        'NEW_MEMBER_REQUEST:Calon Anggota Baru: Galang Ponco Maulana ingin bergabung.',
        5
    ),
    (
        54,
        '2025-12-20 00:34:30.000000',
        _binary '\0',
        'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.',
        14
    ),
    (
        55,
        '2025-12-20 01:21:15.000000',
        _binary '',
        'RESIGN_ANGGOTA: Izhar Harahap mengajukan pengunduran diri. Alasan: malasssssss',
        5
    ),
    (
        56,
        '2025-12-20 01:33:26.000000',
        _binary '',
        'NEW_RESIGN_REQUEST: Izhar Harahap ingin resign.',
        5
    ),
    (
        57,
        '2025-12-20 01:39:51.000000',
        _binary '',
        'NEW_RESIGN_REQUEST: Izhar Harahap ingin resign.',
        5
    ),
    (
        58,
        '2025-12-20 01:43:01.000000',
        _binary '',
        'NEW_RESIGN_REQUEST: Izhar Harahap ingin resign.',
        5
    ),
    (
        59,
        '2025-12-20 01:45:39.000000',
        _binary '',
        'NEW_MEMBER_REQUEST:Calon Anggota Baru: M Haikal ingin bergabung.',
        5
    ),
    (
        61,
        '2025-12-20 02:08:39.000000',
        _binary '',
        'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.',
        15
    ),
    (
        62,
        '2025-12-20 14:59:35.000000',
        _binary '',
        'Keanggotaan Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DICABUT. Alasan: benci',
        12
    ),
    (
        63,
        '2025-12-20 15:05:48.000000',
        _binary '',
        'Keanggotaan Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DICABUT. Alasan: asaaa',
        10
    ),
    (
        64,
        '2025-12-20 15:06:57.000000',
        _binary '',
        'NEW_MEMBER_REQUEST:Calon Anggota Baru: Ade Dermawan ingin bergabung.',
        5
    ),
    (
        65,
        '2025-12-20 15:07:21.000000',
        _binary '',
        'NEW_MEMBER_REQUEST:Calon Anggota Baru: Azhar Farizi ingin bergabung.',
        5
    ),
    (
        66,
        '2025-12-20 15:07:33.000000',
        _binary '',
        'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.',
        10
    ),
    (
        67,
        '2025-12-20 15:07:34.000000',
        _binary '\0',
        'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.',
        12
    ),
    (
        68,
        '2025-12-20 15:07:57.000000',
        _binary '',
        'NEW_RESIGN_REQUEST: Azhar Farizi ingin resign.',
        5
    ),
    (
        69,
        '2025-12-20 15:08:05.000000',
        _binary '',
        'Permintaan pengunduran diri Anda DITOLAK. Anda tetap menjadi anggota aktif.',
        10
    ),
    (
        70,
        '2025-12-20 16:15:42.000000',
        _binary '',
        'RESIGN_PIMPINAN: Pimpinan Pangeran Valerensco ingin resign.',
        6
    ),
    (
        71,
        '2025-12-20 16:16:00.000000',
        _binary '',
        'Pengunduran diri Anda telah DISETUJUI oleh pimpinan. Anda sekarang bukan anggota organisasi lagi.',
        8
    ),
    (
        72,
        '2025-12-20 16:39:04.000000',
        _binary '',
        'RESIGN_PIMPINAN: Pimpinan Pangeran Valerensco ingin resign.',
        6
    ),
    (
        73,
        '2025-12-20 16:39:15.000000',
        _binary '',
        'Pengunduran diri Anda telah DISETUJUI oleh pimpinan. Anda sekarang bukan anggota organisasi lagi.',
        8
    ),
    (
        74,
        '2025-12-20 17:24:26.000000',
        _binary '',
        'HANDOVER: Pimpinan organisasi \'Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan)\' telah beralih dari Ikram Fuadi Rambe ke Pangeran Valerensco',
        6
    ),
    (
        75,
        '2025-12-20 17:30:27.000000',
        _binary '',
        'RESIGN_PIMPINAN: Pimpinan Pangeran Valerensco ingin resign.',
        6
    ),
    (
        76,
        '2025-12-20 17:30:34.000000',
        _binary '',
        'Pengunduran diri Anda telah DISETUJUI oleh pimpinan. Anda sekarang bukan anggota organisasi lagi.',
        8
    ),
    (
        77,
        '2025-12-20 17:41:35.000000',
        _binary '',
        'ORGANISASI_BARU: Pangeran Valerensco telah mendaftarkan organisasi baru: Persatuan Anak Pekan Baru',
        6
    ),
    (
        78,
        '2025-12-20 17:42:39.000000',
        _binary '',
        'RESIGN_PIMPINAN: Pimpinan Pangeran Valerensco ingin resign.',
        6
    ),
    (
        79,
        '2025-12-20 17:50:09.000000',
        _binary '',
        'REQUEST_HAPUS: Pimpinan Pangeran Valerensco meminta penghapusan organisasi Persatuan Anak Pekan Baru. Alasan: sudah tidak ada anggota',
        6
    ),
    (
        80,
        '2025-12-20 17:53:49.000000',
        _binary '',
        'Pengunduran diri Anda telah DISETUJUI oleh pimpinan. Anda sekarang bukan anggota organisasi lagi.',
        8
    ),
    (
        81,
        '2025-12-20 21:35:58.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'General Kampus\'. Menunggu persetujuan pimpinan.',
        15
    ),
    (
        82,
        '2025-12-20 21:35:58.000000',
        _binary '',
        'PROKER_NEW:34:General Kampus',
        5
    ),
    (
        83,
        '2025-12-20 21:36:17.000000',
        _binary '',
        'PROKER_STATUS:Proker \'General Kampus\' telah DISETUJUI. Silakan mulai pelaksanaan.',
        15
    ),
    (
        84,
        '2025-12-20 21:36:50.000000',
        _binary '',
        'PROKER_FINISH:34:PIC M Haikal telah menyelesaikan proker: General Kampus',
        5
    ),
    (
        85,
        '2025-12-20 23:49:24.000000',
        _binary '',
        'PESAN_BANTUAN dari Pangeran Valerensco: ini ada apa ini',
        6
    ),
    (
        86,
        '2025-12-21 02:09:15.000000',
        _binary '',
        'ORGANISASI_BARU: Rachel Rakesya Priyanka Hutabarat telah mendaftarkan organisasi baru: CDC',
        6
    ),
    (
        87,
        '2025-12-21 02:31:54.000000',
        _binary '',
        'DELETE_REQUEST:28:CDC Alasan: malassss',
        6
    ),
    (
        88,
        '2025-12-21 02:44:01.000000',
        _binary '',
        'DELETE_REQUEST:28:CDC Alasan: malasssss',
        6
    ),
    (
        89,
        '2025-12-21 02:44:13.000000',
        _binary '',
        'RESIGN_PIMPINAN: Pimpinan Rachel Rakesya Priyanka Hutabarat ingin resign.',
        6
    ),
    (
        90,
        '2025-12-21 02:44:28.000000',
        _binary '',
        'Permintaan pengunduran diri Anda DITOLAK. Anda tetap menjadi anggota aktif.',
        44
    ),
    (
        91,
        '2025-12-21 02:44:37.000000',
        _binary '',
        'RESIGN_PIMPINAN: Pimpinan Rachel Rakesya Priyanka Hutabarat ingin resign.',
        6
    ),
    (
        92,
        '2025-12-21 02:44:49.000000',
        _binary '',
        'Pengunduran diri Anda telah DISETUJUI oleh pimpinan. Anda sekarang bukan anggota organisasi lagi.',
        44
    ),
    (
        93,
        '2025-12-21 02:57:59.000000',
        _binary '',
        'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'Pindahan Asrama\'. Menunggu persetujuan pimpinan.',
        10
    ),
    (
        94,
        '2025-12-21 02:57:59.000000',
        _binary '',
        'PROKER_NEW:35:Pindahan Asrama',
        5
    ),
    (
        95,
        '2025-12-21 02:59:21.000000',
        _binary '',
        'PROKER_FINISH:19:PIC Azhar Farizi telah menyelesaikan proker: asdfg',
        5
    ),
    (
        96,
        '2025-12-21 03:01:16.000000',
        _binary '',
        'PROKER_STATUS:Proker \'Pindahan Asrama\' telah DISETUJUI. Silakan mulai pelaksanaan.',
        10
    ),
    (
        97,
        '2025-12-21 03:01:16.000000',
        _binary '',
        'PROKER_STATUS:Usulan Proker Anda \'Pindahan Asrama\' telah DISETUJUI oleh Pimpinan.',
        11
    ),
    (
        98,
        '2025-12-21 03:01:22.000000',
        _binary '',
        'PROKER_STATUS:Proker \'xcvn\' DITOLAK. Alasan: asdada',
        10
    ),
    (
        99,
        '2025-12-21 03:01:27.000000',
        _binary '',
        'PROKER_STATUS:Proker \'Bersih-bersih\' DITOLAK. Alasan: asdadda',
        11
    ),
    (
        100,
        '2025-12-21 03:03:38.000000',
        _binary '',
        'PESAN_BANTUAN dari Azhar Farizi: kita coba chat admin',
        6
    ),
    (
        101,
        '2025-12-21 03:04:36.000000',
        _binary '\0',
        'PROKER_STATUS:Proker yang Anda ajukan \'Pindahan Asrama\' SEKARANG MULAI BERJALAN.',
        11
    ),
    (
        102,
        '2025-12-21 03:04:44.000000',
        _binary '',
        'PROKER_FINISH:35:PIC Azhar Farizi telah menyelesaikan proker: Pindahan Asrama',
        5
    ),
    (
        103,
        '2025-12-21 03:04:44.000000',
        _binary '\0',
        'PROKER_STATUS:Proker yang Anda ajukan \'Pindahan Asrama\' TELAH SELESAI dikerjakan oleh PIC.',
        11
    ),
    (
        104,
        '2025-12-21 03:08:41.000000',
        _binary '',
        'HANDOVER_INFO: Pimpinan organisasi \'Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan)\' telah beralih dari Pangeran Valerensco ke Ikram Fuadi Rambe',
        6
    ),
    (
        105,
        '2025-12-21 03:09:23.000000',
        _binary '',
        'HANDOVER_INFO: Pimpinan organisasi \'Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan)\' telah beralih dari Ikram Fuadi Rambe ke Pangeran Valerensco',
        6
    );
/*!40000 ALTER TABLE `notification` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `organizations` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `created_date` date DEFAULT NULL,
    `description` varchar(1000) DEFAULT NULL,
    `name` varchar(255) NOT NULL,
    `status` varchar(255) NOT NULL,
    `established_date` date DEFAULT NULL,
    `field` varchar(255) DEFAULT NULL,
    `scope` varchar(255) DEFAULT NULL,
    `vision_mission` varchar(2000) DEFAULT NULL,
    `address` varchar(500) DEFAULT NULL,
    `external_link` varchar(255) DEFAULT NULL,
    `membership_requirement` varchar(255) DEFAULT NULL,
    `period` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 29 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */
;
INSERT INTO
    `organizations`
VALUES (
        2,
        '2025-12-14',
        'Himpunan Mahasiswa Teknik Informatika',
        'HIMATIF',
        'ACTIVE',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '2024/2025'
    ),
    (
        3,
        '2025-12-15',
        'Pemberdayaan Umat Berkelanjutan (PUB) adalah program beasiswa yang diberikan oleh Universitas Nasional PASIM kepada orang yang memiliki kemampuan di atas rata-rata tetapi kurang dalam segi ekonomi. Di program PUB mahasiswa PUB langsung dijuruskan pada program studi D3 Manajemen Informatika selama 2 tahun masa pendidikan dan 1 tahun terakhir sudah bisa bekerja sambil menyusun tugas akhir. ',
        'Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan)',
        'ACTIVE',
        '2002-01-01',
        'Pendidikan',
        'Kampus',
        'VISI\n\nUntuk membuat 2000 lulusan PUB memiliki kualitas dunia dalam pemrograman dan sistem analis pada tahun 2050.\n\nMISI\n\nMelakukan pendidikan berfokus pada penguasaan teknologi komputer. Memberikan pelatihan dalam penguasaan teknologi terbaru dari Pemrograman. Memberikan pelatihan dalam penguasaan berbahasa Inggris. Memberikan bimbingan rohani untuk mengembangkan generasi dalam etika Islam yang dibangun dan moralitas Islamic ethis and morality.',
        'Jl. Dakota Raja No.8a, Sukaraja, Cicendo',
        'https://www.pubpasim.org/',
        NULL,
        '2024/2025'
    ),
    (
        7,
        '2025-12-20',
        'Persyarikatan Islam yang bergerak di bidang dakwah, pendidikan, sosial, dan kemanusiaan di wilayah Kota Sibolga.',
        'Muhammadiyah Kota Sibolga',
        'ACTIVE',
        '1962-01-01',
        'Dakwah, Pendidikan, Sosial',
        'Kota Sibolga',
        'Mewujudkan masyarakat Islam yang sebenar-benarnya melalui dakwah amar ma’ruf nahi munkar.',
        'Sibolga, Sumatera Utara',
        'https://muhammadiyah.or.id',
        'Muslim, berkomitmen pada nilai Muhammadiyah',
        '2024/2025'
    ),
    (
        8,
        '2025-12-20',
        'Organisasi otonom Muhammadiyah yang mewadahi kader muda dalam bidang kepemudaan, kepemimpinan, dan sosial kemasyarakatan.',
        'Pemuda Muhammadiyah Kota Sibolga',
        'ACTIVE',
        '1975-06-01',
        'Kepemudaan, Kaderisasi',
        'Kota Sibolga',
        'Mencetak kader pemuda Islam yang beriman, berilmu, dan berakhlak.',
        'Sibolga, Sumatera Utara',
        'https://pemudamuhammadiyah.or.id',
        'Pemuda usia 17–35 tahun',
        '2024/2025'
    ),
    (
        9,
        '2025-12-20',
        'Organisasi mahasiswa Islam yang berfokus pada intelektualitas, religiusitas, dan humanitas.',
        'Ikatan Mahasiswa Muhammadiyah (IMM) Cabang Sibolga',
        'ACTIVE',
        '1964-03-14',
        'Kemahasiswaan, Intelektual',
        'Perguruan Tinggi Kota Sibolga',
        'Mewujudkan mahasiswa Islam berakhlak mulia dan berkemajuan.',
        'Sibolga, Sumatera Utara',
        'https://imm.or.id',
        'Mahasiswa aktif',
        '2024/2025'
    ),
    (
        10,
        '2025-12-20',
        'Organisasi kemanusiaan yang bergerak di bidang donor darah, kebencanaan, dan pelayanan sosial.',
        'Palang Merah Indonesia (PMI) Kota Sibolga',
        'ACTIVE',
        '1945-09-17',
        'Kemanusiaan, Sosial',
        'Kota Sibolga',
        'Meringankan penderitaan sesama manusia tanpa membedakan latar belakang.',
        'Sibolga, Sumatera Utara',
        'https://pmi.or.id',
        'Sukarela dan siap tugas kemanusiaan',
        '2024/2025'
    ),
    (
        11,
        '2025-12-20',
        'Organisasi pembinaan remaja masjid dalam bidang dakwah, pendidikan Al-Qur’an, dan kepemudaan.',
        'Badan Komunikasi Pemuda Remaja Masjid Indonesia (BKPRMI) Kota Sibolga',
        'ACTIVE',
        '1977-07-03',
        'Dakwah, Kepemudaan',
        'Kota Sibolga',
        'Membina generasi muda masjid yang berakhlak Qur’ani.',
        'Sibolga, Sumatera Utara',
        'https://bkprmi.or.id',
        'Aktif di kegiatan masjid',
        '2024/2025'
    ),
    (
        12,
        '2025-12-20',
        'Lembaga pengelola masjid yang bertanggung jawab atas manajemen, ibadah, dan kegiatan keumatan.',
        'Badan Takmir Masjid (BTM) Kota Sibolga',
        'ACTIVE',
        '1980-01-01',
        'Keagamaan, Manajemen Masjid',
        'Kota Sibolga',
        'Memakmurkan masjid sebagai pusat peradaban umat.',
        'Sibolga, Sumatera Utara',
        '-',
        'Muslim dan aktif di masjid',
        '2024/2025'
    ),
    (
        13,
        '2025-12-20',
        'Organisasi siswa intra sekolah sebagai wadah pengembangan kepemimpinan dan kreativitas pelajar.',
        'OSIS SMA Negeri 1 Sibolga',
        'ACTIVE',
        '1985-07-01',
        'Kesiswaan, Pendidikan',
        'Sekolah Menengah Atas',
        'Membentuk pelajar berkarakter, disiplin, dan berprestasi.',
        'SMA Negeri 1 Sibolga',
        '-',
        'Siswa aktif SMA Negeri 1 Sibolga',
        '2024/2025'
    ),
    (
        14,
        '2025-12-20',
        'Program kepemudaan dan kreativitas pelajar yang diselenggarakan oleh RRI Sibolga.',
        'Festival Pelajar Nusantara RRI Sibolga',
        'ACTIVE',
        '2015-01-01',
        'Seni, Budaya, Kepemudaan',
        'Regional Sibolga dan Sekitarnya',
        'Menyalurkan bakat dan kreativitas pelajar nusantara.',
        'RRI Sibolga',
        'https://rri.co.id',
        'Pelajar tingkat SMP/SMA',
        '2024/2025'
    ),
    (
        15,
        '2025-12-20',
        'Badan Eksekutif Mahasiswa (BEM) STMIK Sibolga merupakan lembaga eksekutif mahasiswa yang bertugas sebagai wadah aspirasi, pengembangan kepemimpinan, serta penggerak kegiatan akademik dan non-akademik di lingkungan kampus STMIK Sibolga.',
        'Badan Eksekutif Mahasiswa STMIK Sibolga',
        'ACTIVE',
        '2004-08-01',
        'Kemahasiswaan, Kepemimpinan',
        'Perguruan Tinggi',
        'Mewujudkan mahasiswa STMIK Sibolga yang kritis, berintegritas, dan berdaya saing melalui gerakan intelektual dan sosial.',
        'Kampus STMIK Sibolga, Kota Sibolga, Sumatera Utara',
        '-',
        'Mahasiswa aktif STMIK Sibolga',
        '2024/2025'
    ),
    (
        16,
        '2025-12-20',
        'Karang Taruna Kota Sibolga adalah organisasi kepemudaan yang bergerak dalam pemberdayaan pemuda di bidang sosial, ekonomi kreatif, dan kegiatan kemasyarakatan di tingkat kota.',
        'Karang Taruna Kota Sibolga',
        'ACTIVE',
        '1985-06-15',
        'Kepemudaan, Sosial',
        'Tingkat Kota',
        'Membentuk generasi muda Sibolga yang mandiri, produktif, dan peduli terhadap lingkungan sosial.',
        'Kantor Dinas Sosial Kota Sibolga, Sumatera Utara',
        '-',
        'Pemuda usia 17–35 tahun berdomisili di Sibolga',
        '2024/2025'
    ),
    (
        17,
        '2025-12-20',
        'Gerakan Pramuka Kwartir Cabang Sibolga merupakan organisasi pendidikan nonformal yang fokus pada pembentukan karakter, kedisiplinan, kepemimpinan, dan jiwa kebangsaan bagi generasi muda.',
        'Pramuka Kwartir Cabang Sibolga',
        'ACTIVE',
        '1964-01-01',
        'Pendidikan Karakter',
        'Tingkat Kota',
        'Membina generasi muda yang beriman, bertakwa, berakhlak mulia, dan cinta tanah air.',
        'Kwartir Cabang Pramuka Sibolga, Sumatera Utara',
        'https://pramuka.or.id',
        'Pelajar dan pemuda yang bersedia mengikuti kegiatan kepramukaan',
        '2024/2025'
    ),
    (
        18,
        '2025-12-20',
        'Forum OSIS Kota Sibolga merupakan wadah koordinasi dan komunikasi antar pengurus OSIS SMA/SMK se-Kota Sibolga untuk meningkatkan kapasitas kepemimpinan dan kolaborasi antar pelajar.',
        'Forum OSIS Kota Sibolga',
        'ACTIVE',
        '2010-03-20',
        'Pendidikan, Kepemimpinan Pelajar',
        'Tingkat Kota',
        'Menciptakan pelajar Sibolga yang aktif, berprestasi, dan berjiwa pemimpin.',
        'Kota Sibolga, Sumatera Utara',
        '-',
        'Pengurus OSIS aktif SMA/SMK se-Kota Sibolga',
        '2024/2025'
    ),
    (
        19,
        '2025-12-20',
        'Komunitas Programmer Sibolga adalah komunitas independen yang menghimpun pelajar, mahasiswa, dan profesional IT untuk belajar, berbagi, dan berkolaborasi dalam bidang teknologi informasi dan pemrograman.',
        'Komunitas Programmer Sibolga',
        'ACTIVE',
        '2018-09-01',
        'Teknologi Informasi',
        'Regional',
        'Membangun ekosistem teknologi lokal Sibolga yang inovatif dan berdaya saing nasional.',
        'Kota Sibolga, Sumatera Utara',
        '-',
        'Terbuka untuk umum yang berminat di bidang IT',
        '2024/2025'
    ),
    (
        20,
        '2025-12-20',
        'UKM Olahraga STMIK Sibolga adalah organisasi mahasiswa yang menaungi minat dan bakat mahasiswa dalam bidang olahraga serta pembinaan prestasi di tingkat kampus dan antar perguruan tinggi.',
        'Unit Kegiatan Mahasiswa Olahraga STMIK Sibolga',
        'ACTIVE',
        '2006-02-10',
        'Olahraga',
        'Perguruan Tinggi',
        'Menumbuhkan sportivitas dan prestasi mahasiswa melalui kegiatan olahraga yang berkelanjutan.',
        'Kampus STMIK Sibolga, Kota Sibolga',
        '-',
        'Mahasiswa aktif STMIK Sibolga',
        '2024/2025'
    );
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `program_kerja`
--

DROP TABLE IF EXISTS `program_kerja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `program_kerja` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `description` varchar(1000) DEFAULT NULL,
    `end_date` date DEFAULT NULL,
    `start_date` date DEFAULT NULL,
    `status` enum(
        'COMPLETED',
        'ON_GOING',
        'PLANNED',
        'PENDING',
        'REJECTED'
    ) DEFAULT NULL,
    `title` varchar(255) NOT NULL,
    `organization_id` bigint(20) DEFAULT NULL,
    `position_requirement` varchar(255) DEFAULT NULL,
    `pic_id` bigint(20) DEFAULT NULL,
    `rincian_anggaran` varchar(2000) DEFAULT NULL,
    `total_anggaran` double DEFAULT NULL,
    `execution_report` varchar(255) DEFAULT NULL,
    `evidence_link` varchar(255) DEFAULT NULL,
    `creator_id` bigint(20) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FKov47yaxrf0gyw6104wasjgiq3` (`organization_id`),
    KEY `FKomeyyneq4nnu4kmaju38nfrt8` (`pic_id`),
    KEY `FKen9ntrkhrqxw8pl0qvr7kv8fk` (`creator_id`),
    CONSTRAINT `FKen9ntrkhrqxw8pl0qvr7kv8fk` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
    CONSTRAINT `FKomeyyneq4nnu4kmaju38nfrt8` FOREIGN KEY (`pic_id`) REFERENCES `users` (`id`),
    CONSTRAINT `FKov47yaxrf0gyw6104wasjgiq3` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 36 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `program_kerja`
--

LOCK TABLES `program_kerja` WRITE;
/*!40000 ALTER TABLE `program_kerja` DISABLE KEYS */
;
INSERT INTO
    `program_kerja`
VALUES (
        5,
        'BERSIH',
        '2025-12-21',
        '2025-12-21',
        'REJECTED',
        'Bersih-bersih Asrama',
        3,
        NULL,
        11,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        8,
        'ngaji',
        '2025-12-21',
        '2025-12-21',
        'COMPLETED',
        'Pengajian Ustadz Deni Albar',
        3,
        NULL,
        5,
        'Konsumsi 500000',
        500000,
        NULL,
        NULL,
        NULL
    ),
    (
        9,
        'bersih',
        '2025-12-21',
        '2025-12-21',
        'COMPLETED',
        'Bersih-bersih Asrama',
        3,
        NULL,
        11,
        'Konsumsi',
        500000,
        NULL,
        NULL,
        NULL
    ),
    (
        11,
        'Ujian Tengah Semester Logika Algoritma angkatan 24',
        '2025-12-15',
        '2025-12-15',
        'REJECTED',
        'UTS Bahasa C',
        3,
        NULL,
        13,
        'Konsumsi: 500000, ATK: 500000',
        10000000,
        NULL,
        NULL,
        NULL
    ),
    (
        12,
        'sdf',
        '2025-12-18',
        '2025-12-02',
        'COMPLETED',
        'asdf',
        3,
        NULL,
        5,
        'konsumsi Rp.300000, makan: Rp.200000',
        500000,
        NULL,
        NULL,
        NULL
    ),
    (
        17,
        'asd',
        '2025-12-12',
        '2025-12-12',
        'COMPLETED',
        'asd',
        3,
        NULL,
        5,
        'sdf5000000',
        5000000,
        'dsfg',
        'https://drive.google.com/drive/folders/1HdPtD1nGd-1gSO3qzAPzfl4hXBZm28pP',
        NULL
    ),
    (
        18,
        'sadf',
        '2025-12-12',
        '2025-12-12',
        'COMPLETED',
        'asdfg',
        3,
        NULL,
        10,
        'konsumsi: 500000',
        500000,
        'HGFDS',
        '',
        NULL
    ),
    (
        19,
        'asdfg',
        '2025-12-12',
        '2025-12-12',
        'COMPLETED',
        'asdfg',
        3,
        NULL,
        10,
        'konsumsi:500000',
        500000,
        'ini hasil projekan ga tidur 3 hari',
        '',
        NULL
    ),
    (
        20,
        'asdf',
        '2025-12-12',
        '2025-12-12',
        'PENDING',
        'asf',
        3,
        NULL,
        10,
        '500000',
        500000,
        NULL,
        NULL,
        NULL
    ),
    (
        21,
        'asdfg',
        '1111-11-11',
        '1222-11-11',
        'PENDING',
        'asdf',
        3,
        NULL,
        10,
        '0000000',
        500000,
        NULL,
        NULL,
        NULL
    ),
    (
        22,
        'aaaa',
        '1111-11-11',
        '0111-11-11',
        'REJECTED',
        'aaaa',
        3,
        NULL,
        10,
        '5000000',
        5000000,
        NULL,
        NULL,
        NULL
    ),
    (
        23,
        'farid',
        '1111-11-11',
        '1111-11-11',
        'COMPLETED',
        'farid',
        3,
        NULL,
        10,
        '5000000',
        5000000,
        'sadfghjkhfdsa',
        '',
        NULL
    ),
    (
        24,
        'c',
        '1111-11-11',
        '1111-11-11',
        'REJECTED',
        'Bersih-bersih',
        3,
        NULL,
        11,
        'sdfghj',
        5000000,
        NULL,
        NULL,
        NULL
    ),
    (
        25,
        'asdaa',
        '1111-11-11',
        '1111-11-11',
        'PLANNED',
        'panferan minta',
        3,
        NULL,
        7,
        '50000000',
        5000000,
        NULL,
        NULL,
        NULL
    ),
    (
        26,
        'ssad',
        '1111-11-11',
        '1111-11-11',
        'PLANNED',
        'topikkkkkkkk',
        3,
        NULL,
        7,
        'WERTFD',
        45678,
        NULL,
        NULL,
        NULL
    ),
    (
        27,
        'sdfghj',
        '1111-11-11',
        '0111-11-11',
        'REJECTED',
        'xcvn',
        3,
        NULL,
        10,
        'fghjk',
        456789,
        NULL,
        NULL,
        NULL
    ),
    (
        28,
        'adsf',
        '1111-11-11',
        '1111-11-11',
        'COMPLETED',
        'asdf',
        3,
        NULL,
        10,
        '1asdadada',
        500000000,
        'saa\n',
        '',
        NULL
    ),
    (
        29,
        'asdfgh',
        '1111-11-11',
        '1111-11-11',
        'COMPLETED',
        'sdfgh',
        3,
        NULL,
        10,
        '',
        500000,
        'asasa',
        '',
        NULL
    ),
    (
        30,
        'asdfg',
        '1111-11-11',
        '1111-11-11',
        'COMPLETED',
        'asdfg',
        3,
        NULL,
        10,
        '',
        43245643234,
        'asasasa',
        '',
        NULL
    ),
    (
        31,
        '324trfdef',
        '1111-11-11',
        '1111-11-11',
        'COMPLETED',
        '12311323132131',
        3,
        NULL,
        10,
        'fdghjkhgf',
        98765432,
        'oke boossss',
        '',
        11
    ),
    (
        32,
        'sdsd',
        '1111-11-11',
        '1111-11-11',
        'PENDING',
        'magang',
        3,
        NULL,
        10,
        '456ytgfds',
        12345675432,
        NULL,
        NULL,
        5
    ),
    (
        33,
        'asfdgdsa',
        '1111-11-11',
        '1111-11-11',
        'COMPLETED',
        'kita coba lagi',
        3,
        NULL,
        10,
        'adsfafa',
        50000000,
        'oke boss bisa',
        '',
        11
    ),
    (
        34,
        'Bersih-bersih Kampus disuruh Rinalwan',
        '2025-12-21',
        '2025-12-21',
        'COMPLETED',
        'General Kampus',
        3,
        NULL,
        15,
        'Beli Perlengkapan Kebersihan',
        20000,
        'Saya sudah menyelesaikan Program Kerja General kampus',
        '',
        15
    ),
    (
        35,
        'Proses Pemindahan ASrama lama ke Asrama baru',
        '2025-12-25',
        '2025-12-21',
        'COMPLETED',
        'Pindahan Asrama',
        3,
        NULL,
        10,
        'Beli Gorengan',
        200000,
        'mari ktai laksanakan',
        '',
        11
    );
/*!40000 ALTER TABLE `program_kerja` ENABLE KEYS */
;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `users` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `email` varchar(255) NOT NULL,
    `experience_summary` varchar(2000) DEFAULT NULL,
    `join_date` date DEFAULT NULL,
    `member_number` varchar(255) DEFAULT NULL,
    `member_status` varchar(255) NOT NULL,
    `name` varchar(100) NOT NULL,
    `password` varchar(255) NOT NULL,
    `role` enum(
        'ADMIN',
        'ANGGOTA',
        'PIMPINAN'
    ) NOT NULL,
    `organization_id` bigint(20) DEFAULT NULL,
    `birth_date` date DEFAULT NULL,
    `gender` enum('FEMALE', 'MALE') DEFAULT NULL,
    `application_reason` varchar(255) DEFAULT NULL,
    `position` varchar(255) DEFAULT NULL,
    `revoke_reason` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
    UNIQUE KEY `UKnflcji8aim2g60tmhm3djgtyb` (`member_number`),
    KEY `FKqpugllwvyv37klq7ft9m8aqxk` (`organization_id`),
    CONSTRAINT `FKqpugllwvyv37klq7ft9m8aqxk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 45 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */
;
INSERT INTO
    `users`
VALUES (
        5,
        'pangeranvalerensco@gmail.com',
        'Sekretaris Umum PD IPM Sibolga 2022-2024, Ketua OSIS SMA Negeri 1 Sibolga 2021-2022, Ketua Umum PC IPM Sibolga Kota 2020-2022',
        NULL,
        '23001',
        'ACTIVE',
        'Pangeran Valerensco',
        '$2a$10$QA.DllWMBJt4qrgb1qzlJev1nNAZjUhGVH8.mLVRPPeIeLfbHXAQq',
        'PIMPINAN',
        3,
        '2005-10-18',
        'MALE',
        NULL,
        'Ketua Umum (Hasil Handover)',
        NULL
    ),
    (
        6,
        'admin@struktura.com',
        NULL,
        NULL,
        NULL,
        'ACTIVE',
        'Super Admin',
        '$2a$10$3KNROFWHcBRIwGyFNUhC9e4C/E78lMRDtE2Cn00ndbIzWcifw5ZXa',
        'ADMIN',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        7,
        'taufik@gmail.com',
        'Ketua Kelas di SMK Negeri 3 Sibolga',
        '2025-12-18',
        '23032',
        'ACTIVE',
        'Taufik Rahman Tanjung',
        '$2a$10$kF.ehozpjPuYkBYI3Ez30eODj5trA1RTePZQ5YLq9GC.eWftS51de',
        'ANGGOTA',
        3,
        '2006-12-11',
        'MALE',
        'tes',
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        8,
        'pangeran@gmail.com',
        NULL,
        '2025-12-21',
        NULL,
        'ACTIVE',
        'Pangeran Valerensco',
        '$2a$10$DxPRLruRVWhBKPJd8L4AGufZ5s2zKjTpW3xvT7Kp9zMiP2bgp8qgu',
        'PIMPINAN',
        11,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        10,
        'azhar@gmail.com',
        'Ketua Satgas Sidempuan',
        '2025-12-20',
        '23019',
        'ACTIVE',
        'Azhar Farizi',
        '$2a$10$9rjZ2jNLuf6YuogFvwpkvOCy4CuBSZjH.1rxdTdh3/tjGMeXJmm0i',
        'ANGGOTA',
        3,
        '2005-01-01',
        'MALE',
        NULL,
        'Anggota Divisi Keasramaan',
        NULL
    ),
    (
        11,
        'farid@gmail.com',
        'Ketua ketuaan',
        '2025-12-18',
        '23008',
        'ACTIVE',
        'Muhammad Farid',
        '$2a$10$6pOHzw1YCEjNS13a27daXudsDQCzpzD0x.a6Q.i83rK9Wds2.ULmu',
        'ANGGOTA',
        3,
        '2005-10-15',
        'MALE',
        'asdf',
        'Koordinator Divisi Keasramaan',
        NULL
    ),
    (
        12,
        'ade@gmail.com',
        'ketua pesantren',
        '2025-12-20',
        '23014',
        'ACTIVE',
        'Ade Dermawan',
        '$2a$10$TP8zKS2jPOy5aBUcQ6RbxuFE2WvYXFrK/WKlUMK4XFEsKAoyC5daa',
        'ANGGOTA',
        3,
        '2005-08-29',
        'MALE',
        'sasa',
        'Anggota Divisi Kerohanian',
        'benci'
    ),
    (
        13,
        'richky@gmail.com',
        NULL,
        '2025-12-17',
        '23006',
        'ACTIVE',
        'Richky Rahmadan',
        '$2a$10$mSqRpbfai.svlyr1G9uOPuCUPBMp1ne/GcB0YRmMnh.PecpbZSYOi',
        'ANGGOTA',
        3,
        NULL,
        'MALE',
        'karena pub mantap',
        'Koordinator Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        14,
        'galang@gmail.com',
        'Ketua Geng anjal gerot',
        '2025-12-20',
        '23023',
        'ACTIVE',
        'Galang Ponco Maulana',
        '$2a$10$RlztlL0PUc6qSw7Mxz5tRe1nn0Hm6Is.lRkdFcoWB0bwByyetPi5G',
        'ANGGOTA',
        3,
        '2006-06-12',
        'MALE',
        'asdada',
        'Anggota Divisi Kesejahteraan',
        NULL
    ),
    (
        15,
        'haikal@gmail.com',
        'Ketua HIMAMI',
        '2025-12-20',
        '23012',
        'ACTIVE',
        'M Haikal',
        '$2a$10$SiIEhBK2OiLD1.dn9oPGaup5Av9IZdTJ5OziyRHdfq/tS328nikea',
        'ANGGOTA',
        3,
        '1111-11-11',
        'MALE',
        'asadas',
        'Koordinator Divisi Kebersihan',
        NULL
    ),
    (
        16,
        'msaroni@gmail.com',
        NULL,
        '2025-12-14',
        '23011',
        'ACTIVE',
        'M Saroni',
        '$2a$10$i7WywvBWvWk3qGz91xwfOuBAIL/Gv6VpDEytPObvGGJ0hDlj8MNrq',
        'ANGGOTA',
        3,
        '2006-12-01',
        'MALE',
        NULL,
        'Koordinator Divisi Kesejahteraan',
        NULL
    ),
    (
        17,
        'zaky@gmail.com',
        NULL,
        '2025-12-14',
        '23010',
        'ACTIVE',
        'Zaky Setiawan',
        '$2a$10$ux.vZpARp6yhBmwZW7doqO6ifwoGhSTcJkKwV45lV2weG/nRKCg.y',
        'ANGGOTA',
        3,
        '2006-03-04',
        'MALE',
        NULL,
        'Koordinator Divisi Bahasa Inggris',
        NULL
    ),
    (
        18,
        'fajar@gmail.com',
        NULL,
        '2025-12-14',
        '23013',
        'ACTIVE',
        'Fajar Sidik',
        '$2a$10$Nb7poVRD/stKX/Typun9I.v2GwT4ha0wkO.4Xy5HmMwHsEBIDxra.',
        'ANGGOTA',
        3,
        '2006-07-14',
        'MALE',
        NULL,
        'Koordinator Divisi Kesehatan',
        NULL
    ),
    (
        19,
        'ahmad@gmail.com',
        NULL,
        '2025-12-14',
        '23009',
        'ACTIVE',
        'Ahmad Zaki Hosammido',
        '$2a$10$wWs4xnqyAd7MJiM5IanylOCNC4d3xm7TlqVGQ9WeetxE.1eww6HK6',
        'ANGGOTA',
        3,
        '2006-05-24',
        'MALE',
        NULL,
        'Koordinator Divisi Kerohanian',
        NULL
    ),
    (
        20,
        'khalisa@gmail.com',
        NULL,
        '2025-12-14',
        '23003',
        'ACTIVE',
        'Khalisa Ulfa Marsha',
        '$2a$10$4nZpe.CnuVSQ9XeLTOCJMe.SNP4HQx24cK2oI26d2LpA/ZUtKVtwi',
        'ANGGOTA',
        3,
        '2006-07-02',
        'FEMALE',
        NULL,
        'Sekretaris Umum',
        NULL
    ),
    (
        21,
        'raysha@gmail.com',
        NULL,
        '2025-12-14',
        '23007',
        'ACTIVE',
        'Raysha Fauziyah Andani',
        '$2a$10$Rfz13/APyg3alObVwBghU..E9JAdEwGiq4kMJmOi38RhJ1BXHt/eS',
        'ANGGOTA',
        3,
        '2006-05-03',
        'FEMALE',
        NULL,
        'Sekretaris Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        22,
        'andini@gmail.com',
        NULL,
        '2025-12-14',
        '23004',
        'ACTIVE',
        'Andini Siti Nurliyanti',
        '$2a$10$9BPFzaZ7ymqv5CJeuVWO6OnWQ/8VBDx0czHlcCNoHLzDpn84uWSl6',
        'ANGGOTA',
        3,
        '2005-12-12',
        'FEMALE',
        NULL,
        'Bendahara Internal',
        NULL
    ),
    (
        23,
        'sri@gmail.com',
        NULL,
        '2025-12-14',
        '23005',
        'ACTIVE',
        'Sri Rahayu Lestari',
        '$2a$10$DhzXHa9y811Oz9EnCIPdC.bftPmPLqv1IGWZ9wBHV1CbQweFztsG6',
        'ANGGOTA',
        3,
        '2005-12-08',
        'FEMALE',
        NULL,
        'Bendahara Eksternal',
        NULL
    ),
    (
        24,
        'mfaiq@gmail.com',
        NULL,
        '2025-12-14',
        '23026',
        'ACTIVE',
        'M Faiq Emil Fuadi',
        '$2a$10$Ri/3tyFNru.M/y2PeH9qT.Kz1M8KttR3HbN1VXxHna5aXUubm0YSi',
        'ANGGOTA',
        3,
        '2005-05-30',
        'MALE',
        NULL,
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        25,
        'yudistira@gmail.com',
        NULL,
        '2025-12-14',
        '23034',
        'ACTIVE',
        'Yudistira Syahputra',
        '$2a$10$0ZDY7iugYV1vFjfuL2ryTe1qV03.NaqQMqqGeGDZ0I1sI6nAYuNrS',
        'ANGGOTA',
        3,
        '2005-07-10',
        'MALE',
        NULL,
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        26,
        'nabila@gmail.com',
        NULL,
        '2025-12-14',
        '23028',
        'ACTIVE',
        'Nabila Monica',
        '$2a$10$z.u8pr4hnlaBbXujSp.zoeJG8x1D3IQEemSiIQzI6W11icaSlDs0a',
        'ANGGOTA',
        3,
        '2006-08-07',
        'FEMALE',
        NULL,
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        27,
        'izhar@gmail.com',
        'Ketua Himpunan Mahasiswa Akuntansi',
        '2025-12-14',
        '23025',
        'ACTIVE',
        'Izhar Harahap',
        '$2a$10$W6AZJPgGdKyugBP6kAIAI.KDxuVGTM1yMedhPhEg3k8Z0ub7HSuXu',
        'ANGGOTA',
        3,
        '2025-09-26',
        'MALE',
        NULL,
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        28,
        'dhea@gmail.com',
        NULL,
        '2025-12-14',
        '23021',
        'ACTIVE',
        'Dhea Firmasari',
        '$2a$10$qj8MW9beOk7wPQ4FgMAlq.07R2SH9i4rvr6WphZ8mU3AJN.W.WyXu',
        'ANGGOTA',
        3,
        '2006-04-14',
        'FEMALE',
        NULL,
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        29,
        'dea@gmail.com',
        NULL,
        '2025-12-14',
        '23020',
        'ACTIVE',
        'Dea Afrilia',
        '$2a$10$90RrmaZXxJ/BVk9JcmrRjuOdkMaz4jRSw1fDSSD5MLchIFUbJ6if2',
        'ANGGOTA',
        3,
        '2006-04-24',
        'FEMALE',
        NULL,
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        30,
        'ines@gmail.com',
        NULL,
        '2025-12-14',
        '23024',
        'ACTIVE',
        'Ines Karlina',
        '$2a$10$hLCPajxzqfIDIPQQ7LYzPe/34uJ9.3rSIhDRO/en0G9YlrTX0Yn3S',
        'ANGGOTA',
        3,
        '2005-08-25',
        'FEMALE',
        NULL,
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        31,
        'miftah@gmail.com',
        NULL,
        '2025-12-14',
        '23027',
        'ACTIVE',
        'Miftahul Jannah Harahap',
        '$2a$10$7EYmZeahnGYSx8UIfPfGPOyeePByz4WE42.6e1cmdg3.XxPZXBwym',
        'ANGGOTA',
        3,
        '2006-05-25',
        'FEMALE',
        NULL,
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        32,
        'alif@gmail.com',
        NULL,
        '2025-12-14',
        '23017',
        'ACTIVE',
        'Alif Rifki Pratama',
        '$2a$10$0QHwP2EHMiK.PT01IvQ1hesgm9AOSwzl9WkfCtlBAYsZJbXTHyPwq',
        'ANGGOTA',
        3,
        '2005-06-11',
        'MALE',
        NULL,
        'Anggota Divisi Pendidikan dan Pelatihan',
        NULL
    ),
    (
        33,
        'april@gmail.com',
        NULL,
        '2025-12-14',
        '23018',
        'ACTIVE',
        'Apriliyanti',
        '$2a$10$c/0Lp6H0QZ9/HCfFDooKf.w9mNYvx19NAz3cvpqCtYkmQUm7duSTy',
        'ANGGOTA',
        3,
        '2005-04-03',
        'FEMALE',
        NULL,
        'Anggota Divisi Bahasa Inggris',
        NULL
    ),
    (
        34,
        'muthia@gmail.com',
        NULL,
        '2025-12-14',
        '23031',
        'ACTIVE',
        'Sri Muthia Ningrum',
        '$2a$10$NyvAKr0ZDaZo1.HXDOUjXOJli0K2vqEaSVQnDJSB6rZmRpmwd3qGC',
        'ANGGOTA',
        3,
        '2006-01-13',
        'FEMALE',
        NULL,
        'Anggota Divisi Bahasa Inggris',
        NULL
    ),
    (
        35,
        'alfarizi@gmail.com',
        NULL,
        '2025-12-14',
        '23015',
        'ACTIVE',
        'Alfa Rizi',
        '$2a$10$Nx0f8xBpM2buPLDZXH6oUOKdDRD4w7SYUXl9uKj7OkAWTIuhtGJBe',
        'ANGGOTA',
        3,
        '2006-07-02',
        'MALE',
        NULL,
        'Anggota Divisi Bahasa Inggris',
        NULL
    ),
    (
        36,
        'ewi@gmail.com',
        NULL,
        '2025-12-14',
        '23022',
        'ACTIVE',
        'Ewi Lestari Harahap',
        '$2a$10$MtOfNckKTGPUJNEVRiGq/eWjl8HT2VffliBbPjxPqvxd0lk29eS8K',
        'ANGGOTA',
        3,
        '2006-07-31',
        'FEMALE',
        NULL,
        'Anggota Divisi Keasramaan',
        NULL
    ),
    (
        37,
        'yusri@gmail.com',
        NULL,
        '2025-12-14',
        '23035',
        'ACTIVE',
        'Yusri Hasanah',
        '$2a$10$RbG.8Ptf8R/A3GUJwjSpCOtrSXfz03lJyqRt0cZqUKIMibV4.r5qm',
        'ANGGOTA',
        3,
        '2005-04-22',
        'FEMALE',
        NULL,
        'Anggota Divisi Keasramaan',
        NULL
    ),
    (
        38,
        'ali@gmail.com',
        NULL,
        '2025-12-14',
        '23016',
        'ACTIVE',
        'Ali Sahroji',
        '$2a$10$KMmFTyVhbIowxJfuXvp/WuS97hN6/Mcag2ZSpCiVCL0EAzFMgGP4q',
        'ANGGOTA',
        3,
        '2006-01-24',
        'MALE',
        NULL,
        'Anggota Divisi Kesejahteraan',
        NULL
    ),
    (
        39,
        'ulil@gmail.com',
        NULL,
        '2025-12-14',
        '23033',
        'ACTIVE',
        'Ulil Arsyad Ramadhan',
        '$2a$10$daYeBqYcIHjX/hujFWyWMeY3laXNIUotEpy3IodonWU3Li5xdj0ym',
        'ANGGOTA',
        3,
        '2005-10-11',
        'MALE',
        NULL,
        'Anggota Divisi Kebersihan',
        NULL
    ),
    (
        40,
        'tegar@gmail.com',
        NULL,
        '2025-12-14',
        '23030',
        'ACTIVE',
        'Raja Tegar Al Baihaqi',
        '$2a$10$GQlh8q/t.44qfirvx3W.ouJ8ajeTockfjHJrtwn0RmK088jdbfTIK',
        'ANGGOTA',
        3,
        '2005-09-24',
        'MALE',
        NULL,
        'Anggota Divisi Kebersihan',
        NULL
    ),
    (
        41,
        'ikram@gmail.com',
        NULL,
        '2025-12-14',
        '23002',
        'ACTIVE',
        'Ikram Fuadi Rambe',
        '$2a$10$0TbvtrCOkzUco47S6.tHLejIvzouqmfQnecTwsM7fcAu22xQAVcoe',
        'ANGGOTA',
        3,
        '2005-02-15',
        'MALE',
        NULL,
        'Mantan Pimpinan / Anggota',
        NULL
    ),
    (
        42,
        'padellan@gmail.com',
        NULL,
        '2025-12-14',
        '23029',
        'ACTIVE',
        'Padellan Riski',
        '$2a$10$LCmyYYJrVLsH2roqozcOCOh9jq64j7HqTQtQ8gKVLnheQGgT2x/9y',
        'ANGGOTA',
        3,
        '2005-11-27',
        'MALE',
        NULL,
        'Anggota Divisi Kesehatan',
        NULL
    ),
    (
        44,
        'r@gmail.com',
        NULL,
        NULL,
        NULL,
        'NON_MEMBER',
        'Rachel Rakesya Priyanka Hutabarat',
        '$2a$10$yMUJGXBLdtjP4O1MQRLaI.cvDqru/IwIreUSXMFvjI8FIbsm1.526',
        'ANGGOTA',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    );
/*!40000 ALTER TABLE `users` ENABLE KEYS */
;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */
;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */
;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */
;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */
;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */
;

-- Dump completed on 2025-12-21  5:39:09