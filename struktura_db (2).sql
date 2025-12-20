-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 19, 2025 at 08:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `struktura_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `recipient_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`id`, `created_at`, `is_read`, `message`, `recipient_id`) VALUES
(1, '2025-12-18 13:38:33.000000', b'1', 'Keanggotaan Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DICABUT. Alasan: asd', 10),
(2, '2025-12-18 13:38:57.000000', b'1', 'Calon Anggota Baru: Azhar Farizi ingin bergabung.', 5),
(3, '2025-12-18 13:39:10.000000', b'1', 'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.', 10),
(4, '2025-12-18 14:10:57.000000', b'1', 'Keanggotaan Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DICABUT. Alasan: aadsfg', 11),
(5, '2025-12-18 14:11:50.000000', b'1', 'Calon Anggota Baru: Muhammad Farid ingin bergabung.', 5),
(6, '2025-12-18 14:12:04.000000', b'1', 'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.', 11),
(7, '2025-12-18 14:37:35.000000', b'1', 'PROKER_NEW:20:asf', 5),
(8, '2025-12-19 02:28:27.000000', b'1', 'PROKER_NEW:21:asdf', 5),
(9, '2025-12-19 02:45:40.000000', b'1', 'PROKER_NEW:22:aaaa', 5),
(10, '2025-12-19 02:47:05.000000', b'1', 'PROKER_NEW:23:farid', 5),
(11, '2025-12-19 02:49:41.000000', b'1', 'PROKER_NEW:24:Bersih-bersih', 5),
(12, '2025-12-19 03:06:28.000000', b'1', 'PIC Azhar Farizi telah menyelesaikan proker: asdfg', 5),
(13, '2025-12-19 03:28:57.000000', b'1', 'PROKER_NEW:25:panferan minta', 5),
(14, '2025-12-19 04:55:57.000000', b'1', 'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'topikkkkkkkk\'. Menunggu persetujuan pimpinan.', 7),
(15, '2025-12-19 04:55:57.000000', b'1', 'PROKER_NEW:26:topikkkkkkkk', 5),
(16, '2025-12-19 04:56:31.000000', b'1', 'PROKER_APPROVED: Proker \'topikkkkkkkk\' telah disetujui pimpinan. Silakan mulai jalankan proker!', 7),
(17, '2025-12-19 04:59:31.000000', b'1', 'Calon Anggota Baru: Izhar Harahap ingin bergabung.', 5),
(19, '2025-12-19 05:01:48.000000', b'1', 'PROKER_REJECTED: Proker \'aaaa\' ditolak. Alasan: asdadsaadsa', 10),
(21, '2025-12-19 13:17:59.000000', b'1', 'Calon Anggota Baru: Izhar Harahap ingin bergabung.', 5),
(22, '2025-12-19 13:30:39.000000', b'1', 'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'xcvn\'. Menunggu persetujuan pimpinan.', 10),
(23, '2025-12-19 13:30:39.000000', b'1', 'PROKER_NEW:27:xcvn', 5),
(24, '2025-12-19 13:34:55.000000', b'1', 'NEW_MEMBER_REQUEST:Calon Anggota Baru: Izhar Harahap ingin bergabung.', 5),
(26, '2025-12-19 14:38:58.000000', b'1', 'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'asdf\'. Menunggu persetujuan pimpinan.', 10),
(27, '2025-12-19 14:38:58.000000', b'1', 'PROKER_NEW:28:asdf', 5),
(28, '2025-12-19 14:39:24.000000', b'1', 'PROKER_APPROVED: Proker \'asdf\' telah disetujui pimpinan. Silakan mulai jalankan proker!', 10),
(29, '2025-12-19 14:53:31.000000', b'1', 'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'sdfgh\'. Menunggu persetujuan pimpinan.', 10),
(30, '2025-12-19 14:53:31.000000', b'1', 'PROKER_NEW:29:sdfgh', 5),
(31, '2025-12-19 14:54:03.000000', b'1', 'PROKER_STATUS:Proker \'sdfgh\' telah DISETUJUI. Silakan mulai pelaksanaan.', 10),
(32, '2025-12-19 14:54:33.000000', b'1', 'PIC Azhar Farizi telah menyelesaikan proker: farid', 5),
(33, '2025-12-19 14:55:33.000000', b'1', 'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'asdfg\'. Menunggu persetujuan pimpinan.', 10),
(34, '2025-12-19 14:55:33.000000', b'1', 'PROKER_NEW:30:asdfg', 5),
(35, '2025-12-19 14:55:53.000000', b'1', 'PROKER_STATUS:Proker \'asdfg\' telah DISETUJUI. Silakan mulai pelaksanaan.', 10),
(36, '2025-12-19 15:01:38.000000', b'1', 'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'12311323132131\'. Menunggu persetujuan pimpinan.', 10),
(37, '2025-12-19 15:01:38.000000', b'1', 'PROKER_NEW:31:12311323132131', 5),
(38, '2025-12-19 15:01:50.000000', b'1', 'PROKER_STATUS:Proker \'12311323132131\' telah DISETUJUI. Silakan mulai pelaksanaan.', 10),
(39, '2025-12-19 15:01:50.000000', b'1', 'PROKER_STATUS:Usulan Proker Anda \'12311323132131\' telah DISETUJUI oleh Pimpinan.', 11),
(40, '2025-12-19 15:02:11.000000', b'1', 'PROKER_FINISH:31:PIC Azhar Farizi telah menyelesaikan proker: 12311323132131', 5),
(41, '2025-12-19 15:08:45.000000', b'1', 'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'magang\'. Menunggu persetujuan pimpinan.', 10),
(42, '2025-12-19 15:08:45.000000', b'1', 'PROKER_NEW:32:magang', 5),
(43, '2025-12-19 15:09:17.000000', b'1', 'PROKER_FINISH:28:PIC Azhar Farizi telah menyelesaikan proker: asdf', 5),
(44, '2025-12-19 15:09:19.000000', b'1', 'PROKER_FINISH:29:PIC Azhar Farizi telah menyelesaikan proker: sdfgh', 5),
(45, '2025-12-19 15:09:21.000000', b'1', 'PROKER_FINISH:30:PIC Azhar Farizi telah menyelesaikan proker: asdfg', 5),
(46, '2025-12-19 15:10:01.000000', b'1', 'PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker \'kita coba lagi\'. Menunggu persetujuan pimpinan.', 10),
(47, '2025-12-19 15:10:01.000000', b'1', 'PROKER_NEW:33:kita coba lagi', 5),
(48, '2025-12-19 15:10:15.000000', b'1', 'PROKER_STATUS:Proker \'kita coba lagi\' telah DISETUJUI. Silakan mulai pelaksanaan.', 10),
(49, '2025-12-19 15:10:15.000000', b'1', 'PROKER_STATUS:Usulan Proker Anda \'kita coba lagi\' telah DISETUJUI oleh Pimpinan.', 11),
(50, '2025-12-19 15:10:33.000000', b'1', 'PROKER_STATUS:Proker yang Anda ajukan \'kita coba lagi\' SEKARANG MULAI BERJALAN.', 11),
(51, '2025-12-19 15:10:46.000000', b'1', 'PROKER_FINISH:33:PIC Azhar Farizi telah menyelesaikan proker: kita coba lagi', 5),
(52, '2025-12-19 15:10:46.000000', b'1', 'PROKER_STATUS:Proker yang Anda ajukan \'kita coba lagi\' TELAH SELESAI dikerjakan oleh PIC.', 11),
(53, '2025-12-19 16:16:49.000000', b'1', 'NEW_MEMBER_REQUEST:Calon Anggota Baru: Galang Ponco Maulana ingin bergabung.', 5),
(54, '2025-12-20 00:34:30.000000', b'0', 'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.', 14),
(55, '2025-12-20 01:21:15.000000', b'1', 'RESIGN_ANGGOTA: Izhar Harahap mengajukan pengunduran diri. Alasan: malasssssss', 5),
(56, '2025-12-20 01:33:26.000000', b'1', 'NEW_RESIGN_REQUEST: Izhar Harahap ingin resign.', 5),
(57, '2025-12-20 01:39:51.000000', b'1', 'NEW_RESIGN_REQUEST: Izhar Harahap ingin resign.', 5),
(58, '2025-12-20 01:43:01.000000', b'1', 'NEW_RESIGN_REQUEST: Izhar Harahap ingin resign.', 5),
(59, '2025-12-20 01:45:39.000000', b'1', 'NEW_MEMBER_REQUEST:Calon Anggota Baru: M Haikal ingin bergabung.', 5),
(61, '2025-12-20 02:08:39.000000', b'0', 'Selamat! Pengajuan bergabung Anda di Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan) telah DISETUJUI.', 15);

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` bigint(20) NOT NULL,
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
  `membership_requirement` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `created_date`, `description`, `name`, `status`, `established_date`, `field`, `scope`, `vision_mission`, `address`, `external_link`, `membership_requirement`) VALUES
(1, '2025-12-14', 'Ikatan Pelajar Muhammadiyah', 'IPM Sibolga', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, '2025-12-14', 'Himpunan Mahasiswa Teknik Informatika', 'HIMATIF', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, '2025-12-15', 'Pemberdayaan Umat Berkelanjutan (PUB) adalah program beasiswa yang diberikan oleh Universitas Nasional PASIM kepada orang yang memiliki kemampuan di atas rata-rata tetapi kurang dalam segi ekonomi. Di program PUB mahasiswa PUB langsung dijuruskan pada program studi D3 Manajemen Informatika selama 2 tahun masa pendidikan dan 1 tahun terakhir sudah bisa bekerja sambil menyusun tugas akhir. ', 'Program Beasiswa PUB (Pemberdayaan Umat Berkelanjutan)', 'ACTIVE', '2002-01-01', 'Pendidikan', 'Kampus', 'VISI\n\nUntuk membuat 2000 lulusan PUB memiliki kualitas dunia dalam pemrograman dan sistem analis pada tahun 2050.\n\nMISI\n\nMelakukan pendidikan berfokus pada penguasaan teknologi komputer. Memberikan pelatihan dalam penguasaan teknologi terbaru dari Pemrograman. Memberikan pelatihan dalam penguasaan berbahasa Inggris. Memberikan bimbingan rohani untuk mengembangkan generasi dalam etika Islam yang dibangun dan moralitas Islamic ethis and morality.', 'Jl. Dakota Raja No.8a, Sukaraja, Cicendo', 'https://www.pubpasim.org/', NULL),
(4, '2025-12-15', 'Organisasi Intra Siswa Sekolah SMA Negeri 1 Sibolga, Sekolah terbaik di Kota Sibolga', 'OSIS SMA Negeri 1 Sibolga', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, '2025-12-15', 'Facebook', 'Zuckerberg', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, '2025-12-17', 'Badan Komunikasi Pemuda Remaja Masjid Indonesia Kota Sibolga', 'BKPRMI Sibolga', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `program_kerja`
--

CREATE TABLE `program_kerja` (
  `id` bigint(20) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` enum('COMPLETED','ON_GOING','PLANNED','PENDING','REJECTED') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `organization_id` bigint(20) DEFAULT NULL,
  `position_requirement` varchar(255) DEFAULT NULL,
  `pic_id` bigint(20) DEFAULT NULL,
  `rincian_anggaran` varchar(2000) DEFAULT NULL,
  `total_anggaran` double DEFAULT NULL,
  `execution_report` varchar(255) DEFAULT NULL,
  `evidence_link` varchar(255) DEFAULT NULL,
  `creator_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_kerja`
--

INSERT INTO `program_kerja` (`id`, `description`, `end_date`, `start_date`, `status`, `title`, `organization_id`, `position_requirement`, `pic_id`, `rincian_anggaran`, `total_anggaran`, `execution_report`, `evidence_link`, `creator_id`) VALUES
(5, 'BERSIH', '2025-12-21', '2025-12-21', 'REJECTED', 'Bersih-bersih Asrama', 3, NULL, 11, NULL, NULL, NULL, NULL, NULL),
(8, 'ngaji', '2025-12-21', '2025-12-21', 'COMPLETED', 'Pengajian Ustadz Deni Albar', 3, NULL, 5, 'Konsumsi 500000', 500000, NULL, NULL, NULL),
(9, 'bersih', '2025-12-21', '2025-12-21', 'COMPLETED', 'Bersih-bersih Asrama', 3, NULL, 11, 'Konsumsi', 500000, NULL, NULL, NULL),
(11, 'Ujian Tengah Semester Logika Algoritma angkatan 24', '2025-12-15', '2025-12-15', 'REJECTED', 'UTS Bahasa C', 3, NULL, 13, 'Konsumsi: 500000, ATK: 500000', 10000000, NULL, NULL, NULL),
(12, 'sdf', '2025-12-18', '2025-12-02', 'COMPLETED', 'asdf', 3, NULL, 5, 'konsumsi Rp.300000, makan: Rp.200000', 500000, NULL, NULL, NULL),
(17, 'asd', '2025-12-12', '2025-12-12', 'COMPLETED', 'asd', 3, NULL, 5, 'sdf5000000', 5000000, 'dsfg', 'https://drive.google.com/drive/folders/1HdPtD1nGd-1gSO3qzAPzfl4hXBZm28pP', NULL),
(18, 'sadf', '2025-12-12', '2025-12-12', 'COMPLETED', 'asdfg', 3, NULL, 10, 'konsumsi: 500000', 500000, 'HGFDS', '', NULL),
(19, 'asdfg', '2025-12-12', '2025-12-12', 'ON_GOING', 'asdfg', 3, NULL, 10, 'konsumsi:500000', 500000, NULL, NULL, NULL),
(20, 'asdf', '2025-12-12', '2025-12-12', 'PENDING', 'asf', 3, NULL, 10, '500000', 500000, NULL, NULL, NULL),
(21, 'asdfg', '1111-11-11', '1222-11-11', 'PENDING', 'asdf', 3, NULL, 10, '0000000', 500000, NULL, NULL, NULL),
(22, 'aaaa', '1111-11-11', '0111-11-11', 'REJECTED', 'aaaa', 3, NULL, 10, '5000000', 5000000, NULL, NULL, NULL),
(23, 'farid', '1111-11-11', '1111-11-11', 'COMPLETED', 'farid', 3, NULL, 10, '5000000', 5000000, 'sadfghjkhfdsa', '', NULL),
(24, 'c', '1111-11-11', '1111-11-11', 'PENDING', 'Bersih-bersih', 3, NULL, 11, 'sdfghj', 5000000, NULL, NULL, NULL),
(25, 'asdaa', '1111-11-11', '1111-11-11', 'PLANNED', 'panferan minta', 3, NULL, 7, '50000000', 5000000, NULL, NULL, NULL),
(26, 'ssad', '1111-11-11', '1111-11-11', 'PLANNED', 'topikkkkkkkk', 3, NULL, 7, 'WERTFD', 45678, NULL, NULL, NULL),
(27, 'sdfghj', '1111-11-11', '0111-11-11', 'PENDING', 'xcvn', 3, NULL, 10, 'fghjk', 456789, NULL, NULL, NULL),
(28, 'adsf', '1111-11-11', '1111-11-11', 'COMPLETED', 'asdf', 3, NULL, 10, '1asdadada', 500000000, 'saa\n', '', NULL),
(29, 'asdfgh', '1111-11-11', '1111-11-11', 'COMPLETED', 'sdfgh', 3, NULL, 10, '', 500000, 'asasa', '', NULL),
(30, 'asdfg', '1111-11-11', '1111-11-11', 'COMPLETED', 'asdfg', 3, NULL, 10, '', 43245643234, 'asasasa', '', NULL),
(31, '324trfdef', '1111-11-11', '1111-11-11', 'COMPLETED', '12311323132131', 3, NULL, 10, 'fdghjkhgf', 98765432, 'oke boossss', '', 11),
(32, 'sdsd', '1111-11-11', '1111-11-11', 'PENDING', 'magang', 3, NULL, 10, '456ytgfds', 12345675432, NULL, NULL, 5),
(33, 'asfdgdsa', '1111-11-11', '1111-11-11', 'COMPLETED', 'kita coba lagi', 3, NULL, 10, 'adsfafa', 50000000, 'oke boss bisa', '', 11);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `experience_summary` varchar(500) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `member_number` varchar(255) DEFAULT NULL,
  `member_status` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','ANGGOTA','PIMPINAN') NOT NULL,
  `organization_id` bigint(20) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('FEMALE','MALE') DEFAULT NULL,
  `application_reason` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `revoke_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `experience_summary`, `join_date`, `member_number`, `member_status`, `name`, `password`, `role`, `organization_id`, `birth_date`, `gender`, `application_reason`, `position`, `revoke_reason`) VALUES
(5, 'pangeranvalerensco@gmail.com', 'Sekretaris Umum PD IPM Sibolga 2022-2024, Ketua OSIS SMA Negeri 1 Sibolga 2021-2022, Ketua Umum PC IPM Sibolga Kota 2020-2022', NULL, '001', 'ACTIVE', 'Pangeran Valerensco', '12345678', 'PIMPINAN', 3, '2005-10-18', 'MALE', NULL, 'Ketua', NULL),
(6, 'admin@struktura.com', NULL, NULL, NULL, 'ACTIVE', 'Super Admin', 'admin123', 'ADMIN', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'taufik@gmail.com', 'Ketua Kelas di SMK Negeri 3 Sibolga', '2025-12-18', NULL, 'ACTIVE', 'Taufik Rahman Tanjung', '12345678', 'ANGGOTA', 3, '2006-12-11', 'MALE', 'tes', 'Anggota Divisi Pendidikan dan Pelatihan', NULL),
(8, 'pangeran@gmail.com', NULL, NULL, NULL, 'NON_MEMBER', 'Pangeran Valerensco', '123', 'ANGGOTA', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'azhar@gmail.com', 'Ketua Satgas Sidempuan', '2025-12-18', NULL, 'ACTIVE', 'Azhar Farizi', 'azhar123', 'ANGGOTA', 3, '2005-01-01', 'MALE', 'a', 'Anggota Divisi Keasramaan', NULL),
(11, 'farid@gmail.com', 'Ketua ketuaan', '2025-12-18', NULL, 'ACTIVE', 'Muhammad Farid', 'farid123', 'ANGGOTA', 3, '2005-10-15', 'MALE', 'asdf', 'Koordinator Divisi Keasramaan', NULL),
(12, 'ade@gmail.com', NULL, '2025-12-17', NULL, 'ACTIVE', 'Ade Dermawan', 'ade12345', 'PIMPINAN', 2, NULL, NULL, 'asd', 'Ketua', NULL),
(13, 'richky@gmail.com', NULL, '2025-12-17', '006', 'ACTIVE', 'Richky Rahmadan', 'richky123', 'ANGGOTA', 3, NULL, NULL, 'karena pub mantap', 'Koordinator Divisi Pendidikan dan Pelatihan', NULL),
(14, 'galang@gmail.com', 'Ketua Geng anjal gerot', '2025-12-20', NULL, 'ACTIVE', 'Galang Ponco Maulana', 'galang123', 'ANGGOTA', 3, '2006-06-12', 'MALE', 'asdada', 'Anggota Divisi Kesejahteraan', NULL),
(15, 'haikal@gmail.com', 'Ketua HIMAMI', '2025-12-20', NULL, 'ACTIVE', 'M Haikal', 'haikal123', 'ANGGOTA', 3, '1111-11-11', 'MALE', 'asadas', 'Koordinator Divisi Kebersihan', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKfcyn9rsga73dqnorl7owfyl4a` (`recipient_id`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `program_kerja`
--
ALTER TABLE `program_kerja`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKov47yaxrf0gyw6104wasjgiq3` (`organization_id`),
  ADD KEY `FKomeyyneq4nnu4kmaju38nfrt8` (`pic_id`),
  ADD KEY `FKen9ntrkhrqxw8pl0qvr7kv8fk` (`creator_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  ADD UNIQUE KEY `UKnflcji8aim2g60tmhm3djgtyb` (`member_number`),
  ADD KEY `FKqpugllwvyv37klq7ft9m8aqxk` (`organization_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `program_kerja`
--
ALTER TABLE `program_kerja`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `FKfcyn9rsga73dqnorl7owfyl4a` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `program_kerja`
--
ALTER TABLE `program_kerja`
  ADD CONSTRAINT `FKen9ntrkhrqxw8pl0qvr7kv8fk` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKomeyyneq4nnu4kmaju38nfrt8` FOREIGN KEY (`pic_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKov47yaxrf0gyw6104wasjgiq3` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `FKqpugllwvyv37klq7ft9m8aqxk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
