/*
 Navicat Premium Data Transfer

 Source Server         : 127.0.0.1
 Source Server Type    : MySQL
 Source Server Version : 50723
 Source Host           : localhost:3306
 Source Schema         : mam_db

 Target Server Type    : MySQL
 Target Server Version : 50723
 File Encoding         : 65001

 Date: 22/04/2021 15:26:15
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for adonis_schema
-- ----------------------------
DROP TABLE IF EXISTS `adonis_schema`;
CREATE TABLE `adonis_schema` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of adonis_schema
-- ----------------------------
BEGIN;
INSERT INTO `adonis_schema` VALUES (77, '1503248427885_user', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (78, '1503248427886_token', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (79, '1615949155818_profile_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (80, '1615949182872_sys_options_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (81, '1616028897202_mas_department_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (82, '1616031478170_mas_dealers_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (83, '1616031478180_mas_equipment_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (84, '1616031478181_mas_p2h_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (85, '1616031478181_mas_site_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (86, '1616031478182_mas_shift_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (87, '1616031478183_mas_activity_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (88, '1616031478184_mas_pit_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (89, '1616031478185_mas_operator_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (90, '1616035626705_sys_error_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (91, '1616035719149_sys_log_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (92, '1616042931401_sys_menu_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (93, '1616042939809_sys_menu_detail_schema', 1, '2021-04-15 15:08:02');
INSERT INTO `adonis_schema` VALUES (94, '1616044663827_usr_menu_schema', 1, '2021-04-15 15:08:03');
INSERT INTO `adonis_schema` VALUES (95, '1616044683231_usr_menu_detail_schema', 1, '2021-04-15 15:08:03');
INSERT INTO `adonis_schema` VALUES (96, '1616576181508_daily_checklist_schema', 1, '2021-04-15 15:08:03');
INSERT INTO `adonis_schema` VALUES (97, '1616637987424_daily_checkp2h_schema', 1, '2021-04-15 15:08:03');
INSERT INTO `adonis_schema` VALUES (98, '1616638706024_daily_fuelfilling_schema', 1, '2021-04-15 15:08:03');
INSERT INTO `adonis_schema` VALUES (99, '1616641639289_daily_smu_record_schema', 1, '2021-04-15 15:08:03');
INSERT INTO `adonis_schema` VALUES (100, '1616643099001_daily_fleet_schema', 1, '2021-04-15 15:08:03');
INSERT INTO `adonis_schema` VALUES (101, '1616717336543_daily_fleet_hauler_schema', 1, '2021-04-15 15:08:04');
INSERT INTO `adonis_schema` VALUES (102, '1616717647974_daily_fleet_exca_schema', 1, '2021-04-15 15:08:04');
INSERT INTO `adonis_schema` VALUES (103, '1616717772373_fleet_exca_hauler_schema', 1, '2021-04-15 15:08:04');
INSERT INTO `adonis_schema` VALUES (104, '1617063601646_users_group_schema', 1, '2021-04-15 15:08:04');
INSERT INTO `adonis_schema` VALUES (105, '1617067583198_sys_module_schema', 1, '2021-04-15 15:08:04');
INSERT INTO `adonis_schema` VALUES (106, '1617067583199_sys_users_group_schema', 1, '2021-04-15 15:08:04');
INSERT INTO `adonis_schema` VALUES (107, '1617149674953_mas_employee_schema', 1, '2021-04-15 15:08:04');
INSERT INTO `adonis_schema` VALUES (108, '1617605357202_mas_divisi_schema', 1, '2021-04-15 15:08:04');
INSERT INTO `adonis_schema` VALUES (109, '1617605357204_mam_schedule_schema', 1, '2021-04-15 15:08:04');
INSERT INTO `adonis_schema` VALUES (110, '1618273206005_backlog_mechanical_schema', 1, '2021-04-15 15:08:04');
COMMIT;

-- ----------------------------
-- Table structure for backlog_mechanicals
-- ----------------------------
DROP TABLE IF EXISTS `backlog_mechanicals`;
CREATE TABLE `backlog_mechanicals` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `unit_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `backlog_mechanicals_unit_id_foreign` (`unit_id`),
  CONSTRAINT `backlog_mechanicals_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `mas_equipments` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of backlog_mechanicals
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for daily_checklists
-- ----------------------------
DROP TABLE IF EXISTS `daily_checklists`;
CREATE TABLE `daily_checklists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_chk` int(10) unsigned DEFAULT NULL,
  `user_spv` int(10) unsigned DEFAULT NULL,
  `user_lead` int(10) unsigned DEFAULT NULL,
  `unit_id` int(10) unsigned DEFAULT NULL,
  `shift_id` int(10) unsigned DEFAULT NULL,
  `tgl` date NOT NULL,
  `description` text,
  `approved_at` datetime NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `daily_checklists_user_chk_foreign` (`user_chk`),
  KEY `daily_checklists_user_spv_foreign` (`user_spv`),
  KEY `daily_checklists_user_lead_foreign` (`user_lead`),
  KEY `daily_checklists_unit_id_foreign` (`unit_id`),
  KEY `daily_checklists_shift_id_foreign` (`shift_id`),
  CONSTRAINT `daily_checklists_shift_id_foreign` FOREIGN KEY (`shift_id`) REFERENCES `mas_shifts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_checklists_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `mas_equipments` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_checklists_user_chk_foreign` FOREIGN KEY (`user_chk`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_checklists_user_lead_foreign` FOREIGN KEY (`user_lead`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_checklists_user_spv_foreign` FOREIGN KEY (`user_spv`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of daily_checklists
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for daily_checkp2h
-- ----------------------------
DROP TABLE IF EXISTS `daily_checkp2h`;
CREATE TABLE `daily_checkp2h` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `checklist_id` int(10) unsigned DEFAULT NULL,
  `p2h_id` int(10) unsigned DEFAULT NULL,
  `description` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `daily_checkp2h_checklist_id_foreign` (`checklist_id`),
  KEY `daily_checkp2h_p2h_id_foreign` (`p2h_id`),
  CONSTRAINT `daily_checkp2h_checklist_id_foreign` FOREIGN KEY (`checklist_id`) REFERENCES `daily_checklists` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_checkp2h_p2h_id_foreign` FOREIGN KEY (`p2h_id`) REFERENCES `mas_p2h` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of daily_checkp2h
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for daily_fleet_excas
-- ----------------------------
DROP TABLE IF EXISTS `daily_fleet_excas`;
CREATE TABLE `daily_fleet_excas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `hauler_id` int(10) unsigned DEFAULT NULL,
  `opr_id` int(10) unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `daily_fleet_excas_hauler_id_foreign` (`hauler_id`),
  KEY `daily_fleet_excas_opr_id_foreign` (`opr_id`),
  CONSTRAINT `daily_fleet_excas_hauler_id_foreign` FOREIGN KEY (`hauler_id`) REFERENCES `mas_equipments` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_fleet_excas_opr_id_foreign` FOREIGN KEY (`opr_id`) REFERENCES `mas_operators` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of daily_fleet_excas
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for daily_fleet_haulers
-- ----------------------------
DROP TABLE IF EXISTS `daily_fleet_haulers`;
CREATE TABLE `daily_fleet_haulers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `hauler_id` int(10) unsigned DEFAULT NULL,
  `opr_id` int(10) unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `daily_fleet_haulers_hauler_id_foreign` (`hauler_id`),
  KEY `daily_fleet_haulers_opr_id_foreign` (`opr_id`),
  CONSTRAINT `daily_fleet_haulers_hauler_id_foreign` FOREIGN KEY (`hauler_id`) REFERENCES `mas_equipments` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_fleet_haulers_opr_id_foreign` FOREIGN KEY (`opr_id`) REFERENCES `mas_operators` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of daily_fleet_haulers
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for daily_fleets
-- ----------------------------
DROP TABLE IF EXISTS `daily_fleets`;
CREATE TABLE `daily_fleets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pit_id` int(10) unsigned DEFAULT NULL,
  `shift_id` int(10) unsigned DEFAULT NULL,
  `activity_id` int(10) unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `daily_fleets_pit_id_foreign` (`pit_id`),
  KEY `daily_fleets_shift_id_foreign` (`shift_id`),
  KEY `daily_fleets_activity_id_foreign` (`activity_id`),
  CONSTRAINT `daily_fleets_activity_id_foreign` FOREIGN KEY (`activity_id`) REFERENCES `mas_activities` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_fleets_pit_id_foreign` FOREIGN KEY (`pit_id`) REFERENCES `mas_pits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_fleets_shift_id_foreign` FOREIGN KEY (`shift_id`) REFERENCES `mas_shifts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of daily_fleets
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for daily_fuelfillings
-- ----------------------------
DROP TABLE IF EXISTS `daily_fuelfillings`;
CREATE TABLE `daily_fuelfillings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `shift_id` int(10) unsigned DEFAULT NULL,
  `unit_id` int(10) unsigned DEFAULT NULL,
  `smu` float(8,2) NOT NULL,
  `qty` float(8,2) NOT NULL,
  `date_fill` datetime NOT NULL,
  `opr_filler` varchar(255) NOT NULL,
  `opr_unit` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `daily_fuelfillings_shift_id_foreign` (`shift_id`),
  KEY `daily_fuelfillings_unit_id_foreign` (`unit_id`),
  KEY `daily_fuelfillings_opr_unit_foreign` (`opr_unit`),
  CONSTRAINT `daily_fuelfillings_opr_unit_foreign` FOREIGN KEY (`opr_unit`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_fuelfillings_shift_id_foreign` FOREIGN KEY (`shift_id`) REFERENCES `mas_shifts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_fuelfillings_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `mas_equipments` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of daily_fuelfillings
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for daily_smu_records
-- ----------------------------
DROP TABLE IF EXISTS `daily_smu_records`;
CREATE TABLE `daily_smu_records` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `start_date` datetime NOT NULL,
  `start_smu` float(8,2) NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `end_smu` float(8,2) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of daily_smu_records
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fleet_exca_haulers
-- ----------------------------
DROP TABLE IF EXISTS `fleet_exca_haulers`;
CREATE TABLE `fleet_exca_haulers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `fleet_id` int(10) unsigned DEFAULT NULL,
  `exca_id` int(10) unsigned DEFAULT NULL,
  `hauler_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fleet_id` (`fleet_id`),
  KEY `exca_id` (`exca_id`),
  KEY `hauler_id` (`hauler_id`),
  CONSTRAINT `fleet_exca_haulers_exca_id_foreign` FOREIGN KEY (`exca_id`) REFERENCES `daily_fleet_excas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fleet_exca_haulers_fleet_id_foreign` FOREIGN KEY (`fleet_id`) REFERENCES `daily_fleets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fleet_exca_haulers_hauler_id_foreign` FOREIGN KEY (`hauler_id`) REFERENCES `daily_fleet_haulers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of fleet_exca_haulers
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for mam_schedules
-- ----------------------------
DROP TABLE IF EXISTS `mam_schedules`;
CREATE TABLE `mam_schedules` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int(10) unsigned DEFAULT NULL,
  `divisi_id` int(10) unsigned DEFAULT NULL,
  `shift_id` int(10) unsigned DEFAULT NULL,
  `tgl_schdl` date NOT NULL,
  `status` enum('OS','CT','DO','PM') DEFAULT 'OS' COMMENT 'OS=OnShift, CT=Cuti, DO=DayOff, PM=Permit',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mam_schedules_employee_id_foreign` (`employee_id`),
  KEY `mam_schedules_divisi_id_foreign` (`divisi_id`),
  KEY `mam_schedules_shift_id_foreign` (`shift_id`),
  CONSTRAINT `mam_schedules_divisi_id_foreign` FOREIGN KEY (`divisi_id`) REFERENCES `mas_divisis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mam_schedules_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `mas_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mam_schedules_shift_id_foreign` FOREIGN KEY (`shift_id`) REFERENCES `mas_shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mam_schedules
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for mas_activities
-- ----------------------------
DROP TABLE IF EXISTS `mas_activities`;
CREATE TABLE `mas_activities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `kode` varchar(5) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sts` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_activities
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for mas_dealers
-- ----------------------------
DROP TABLE IF EXISTS `mas_dealers`;
CREATE TABLE `mas_dealers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dealer_name` varchar(255) NOT NULL,
  `cp_name` varchar(255) DEFAULT NULL,
  `cp_email` varchar(255) DEFAULT NULL,
  `cp_phone` varchar(255) DEFAULT NULL,
  `dealer_desc` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_dealers
-- ----------------------------
BEGIN;
INSERT INTO `mas_dealers` VALUES (1, 'TRAKINDO', 'Alfatih Kenzie', 'kenzie@poetra.com', '0811231151', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for mas_departments
-- ----------------------------
DROP TABLE IF EXISTS `mas_departments`;
CREATE TABLE `mas_departments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `kode` varchar(5) NOT NULL,
  `nama` varchar(50) NOT NULL,
  `description` text,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_departments
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for mas_divisis
-- ----------------------------
DROP TABLE IF EXISTS `mas_divisis`;
CREATE TABLE `mas_divisis` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dept_id` int(10) unsigned DEFAULT NULL,
  `nama` varchar(50) NOT NULL,
  `description` text,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mas_divisis_dept_id_foreign` (`dept_id`),
  CONSTRAINT `mas_divisis_dept_id_foreign` FOREIGN KEY (`dept_id`) REFERENCES `mas_departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_divisis
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for mas_employees
-- ----------------------------
DROP TABLE IF EXISTS `mas_employees`;
CREATE TABLE `mas_employees` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nik` varchar(25) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `alamat` text,
  `sex` enum('m','f') DEFAULT 'm',
  `t4_lahir` varchar(50) DEFAULT NULL,
  `tgl_lahir` date DEFAULT NULL,
  `agama` varchar(255) DEFAULT NULL,
  `tipe_idcard` enum('KTP','SIM','PASSPORT') DEFAULT 'SIM',
  `no_idcard` varchar(30) DEFAULT NULL,
  `warganegara` varchar(255) DEFAULT NULL,
  `tinggi_bdn` int(11) DEFAULT NULL,
  `berat_bdn` int(11) DEFAULT NULL,
  `sts_kawin` varchar(255) DEFAULT NULL,
  `tipe_employee` varchar(50) DEFAULT NULL COMMENT 'status penerimaan HO atau SITE',
  `sts_employee` varchar(30) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `aktif` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nik_uniq` (`nik`) USING BTREE,
  KEY `created_byx` (`created_by`),
  CONSTRAINT `created_byx` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_employees
-- ----------------------------
BEGIN;
INSERT INTO `mas_employees` VALUES (1, 'MAM-032101001', 'Ayat Ekapoetrax', 'JL. Pacalaya No.06 Kel. Tombolo, Kec. Somba Opu, Kab. Gowa', 'm', 'Makassar', '1980-12-08', 'islam', 'KTP', 'null', 'Indonesia', 168, 47, 'singel', '01', 'permanent', '2021-03-21', '081355719747', 'ayat.ekapoetra@gmail.com', 2, 'Y', '2021-04-17 10:50:22', '2021-04-19 11:26:35');
INSERT INTO `mas_employees` VALUES (3, 'MAM0121040002', 'Alfatih Kenzie Poetra', 'JL. Hertasning 7 No.22c', 'm', 'Makassar', '2014-02-25', 'islam', 'KTP', '123123123123', 'Indonesia', 175, 80, 'singel', '01', 'permanent', '2021-04-01', '08123456789', 'kensie@poetra.co', 2, 'Y', '2021-04-17 11:04:17', '2021-04-19 13:41:29');
COMMIT;

-- ----------------------------
-- Table structure for mas_equipments
-- ----------------------------
DROP TABLE IF EXISTS `mas_equipments`;
CREATE TABLE `mas_equipments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `kode` varchar(25) NOT NULL,
  `unit_sn` varchar(25) NOT NULL,
  `tipe` varchar(255) NOT NULL COMMENT 'sys-options jenis-unit',
  `brand` varchar(255) NOT NULL COMMENT 'sys-options brand-unit',
  `unit_model` varchar(255) NOT NULL,
  `qty_capacity` varchar(255) DEFAULT NULL COMMENT 'Jumlah kapasitas produksi',
  `fuel_capacity` varchar(255) DEFAULT NULL COMMENT 'Jumlah kapasitas bbm',
  `satuan` varchar(255) NOT NULL COMMENT 'sys-options stn_capacity_equipment',
  `engine_model` varchar(255) DEFAULT NULL,
  `engine_sn` varchar(255) DEFAULT NULL,
  `received_date` date NOT NULL COMMENT 'tanggal pembelian',
  `received_hm` float(8,2) DEFAULT '0.00' COMMENT 'HM awal pembelian',
  `remark` text COMMENT 'keterangan detail',
  `is_owned` enum('Y','N') DEFAULT 'Y' COMMENT 'status equipment milik sendiri atau sewa',
  `isMaintenance` varchar(255) DEFAULT 'N' COMMENT 'status equipment under maintenance atau active',
  `is_warranty` enum('Y','N') DEFAULT 'N' COMMENT 'status equipment warranty',
  `warranty_date` date DEFAULT NULL,
  `dealer_id` int(10) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `aktif` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_uniq` (`kode`) USING BTREE,
  UNIQUE KEY `sn_uniq` (`unit_sn`) USING BTREE,
  KEY `mas_equipments_dealer_id_foreign` (`dealer_id`),
  KEY `mas_equipments_created_by_foreign` (`created_by`),
  CONSTRAINT `mas_equipments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `mas_equipments_dealer_id_foreign` FOREIGN KEY (`dealer_id`) REFERENCES `mas_dealers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_equipments
-- ----------------------------
BEGIN;
INSERT INTO `mas_equipments` VALUES (1, 'MD06', '6R201804', 'bulldozer', 'caterpillar', 'D6R', '0.00', '100', 'bcm', 'C9', 'TXD22844', '2019-12-28', 10.00, 'testing', 'Y', 'N', 'N', '2021-04-15', 1, 2, 'N', '2021-04-15 16:09:30', '2021-04-16 14:05:29');
INSERT INTO `mas_equipments` VALUES (2, 'ME0017', 'CAT00320JYBP01007', 'excavator', 'caterpillar', '320YBP', '22', '50', 'bcm', 'C7', 'E7A26940', '2020-01-27', 10.00, 'null', 'Y', 'N', 'Y', '2021-04-16', 1, 2, 'Y', '2021-04-16 08:20:55', '2021-04-16 14:04:14');
COMMIT;

-- ----------------------------
-- Table structure for mas_operators
-- ----------------------------
DROP TABLE IF EXISTS `mas_operators`;
CREATE TABLE `mas_operators` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `identity_tipe` enum('KTP','SIM','PASSPORT') DEFAULT 'SIM',
  `identity_no` varchar(25) DEFAULT NULL,
  `pas_photo` varchar(200) DEFAULT NULL,
  `sts` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mas_operators_user_id_foreign` (`user_id`),
  CONSTRAINT `mas_operators_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_operators
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for mas_p2h
-- ----------------------------
DROP TABLE IF EXISTS `mas_p2h`;
CREATE TABLE `mas_p2h` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `task` text NOT NULL,
  `urut` int(11) NOT NULL,
  `sts` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_p2h
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for mas_pits
-- ----------------------------
DROP TABLE IF EXISTS `mas_pits`;
CREATE TABLE `mas_pits` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `site_id` int(10) unsigned DEFAULT NULL,
  `kode` varchar(5) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `sts` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mas_pits_site_id_foreign` (`site_id`),
  CONSTRAINT `mas_pits_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `mas_sites` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_pits
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for mas_shifts
-- ----------------------------
DROP TABLE IF EXISTS `mas_shifts`;
CREATE TABLE `mas_shifts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `kode` varchar(255) NOT NULL,
  `duration` float(4,1) NOT NULL,
  `start_shift` time NOT NULL,
  `end_shift` time NOT NULL,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_shifts
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for mas_sites
-- ----------------------------
DROP TABLE IF EXISTS `mas_sites`;
CREATE TABLE `mas_sites` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `Keterangan` text,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of mas_sites
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for profiles
-- ----------------------------
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `nm_depan` varchar(30) NOT NULL,
  `nm_belakang` varchar(30) DEFAULT NULL,
  `phone` varchar(30) NOT NULL,
  `jenkel` enum('m','f') DEFAULT 'm',
  `avatar` text,
  `employee_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `profiles_user_id_foreign` (`user_id`),
  KEY `profiles_employee_id_foreign` (`employee_id`),
  CONSTRAINT `profiles_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `mas_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of profiles
-- ----------------------------
BEGIN;
INSERT INTO `profiles` VALUES (1, 2, 'Ayat', 'Ekapoetra', '081355719747', 'm', NULL, NULL, '2021-04-15 15:10:00', '2021-04-15 15:10:03');
INSERT INTO `profiles` VALUES (2, 5, 'Alfatih', 'Kenzie Poetra', '08123456789', 'm', '/avatar/QYaCzg5HIUm8xon.neY96hrszMy_MW.jpeg', 3, '2021-04-20 14:32:07', '2021-04-20 14:32:07');
COMMIT;

-- ----------------------------
-- Table structure for sys_errors
-- ----------------------------
DROP TABLE IF EXISTS `sys_errors`;
CREATE TABLE `sys_errors` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `description` text,
  `error_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sys_errors_error_by_foreign` (`error_by`),
  CONSTRAINT `sys_errors_error_by_foreign` FOREIGN KEY (`error_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of sys_errors
-- ----------------------------
BEGIN;
INSERT INTO `sys_errors` VALUES (1, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-15 15:08:58', '2021-04-15 15:08:58');
INSERT INTO `sys_errors` VALUES (2, 'E_USER_NOT_FOUND', NULL, 'E_INVALID_SESSION', NULL, '2021-04-15 15:09:09', '2021-04-15 15:09:09');
INSERT INTO `sys_errors` VALUES (3, 'E_CANNOT_LOGIN', NULL, 'E_INVALID_SESSION', NULL, '2021-04-15 15:10:21', '2021-04-15 15:10:21');
INSERT INTO `sys_errors` VALUES (4, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-16 08:00:16', '2021-04-16 08:00:16');
INSERT INTO `sys_errors` VALUES (5, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-17 08:02:34', '2021-04-17 08:02:34');
INSERT INTO `sys_errors` VALUES (6, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-19 08:34:12', '2021-04-19 08:34:12');
INSERT INTO `sys_errors` VALUES (7, 'E_USER_NOT_FOUND', NULL, 'E_INVALID_SESSION', NULL, '2021-04-19 14:21:09', '2021-04-19 14:21:09');
INSERT INTO `sys_errors` VALUES (8, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-20 08:08:05', '2021-04-20 08:08:05');
INSERT INTO `sys_errors` VALUES (9, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-21 07:59:31', '2021-04-21 07:59:31');
INSERT INTO `sys_errors` VALUES (10, 'E_PASSWORD_MISMATCH', NULL, 'E_INVALID_SESSION', NULL, '2021-04-21 11:50:59', '2021-04-21 11:50:59');
INSERT INTO `sys_errors` VALUES (11, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-21 11:58:15', '2021-04-21 11:58:15');
INSERT INTO `sys_errors` VALUES (12, 'E_PASSWORD_MISMATCH', NULL, 'E_INVALID_SESSION', NULL, '2021-04-21 11:58:25', '2021-04-21 11:58:25');
INSERT INTO `sys_errors` VALUES (13, 'E_PASSWORD_MISMATCH', NULL, 'E_INVALID_SESSION', NULL, '2021-04-21 11:58:41', '2021-04-21 11:58:41');
INSERT INTO `sys_errors` VALUES (14, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-21 15:55:47', '2021-04-21 15:55:47');
INSERT INTO `sys_errors` VALUES (15, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-22 09:05:58', '2021-04-22 09:05:58');
INSERT INTO `sys_errors` VALUES (16, 'E_INVALID_SESSION', NULL, '', NULL, '2021-04-22 13:39:20', '2021-04-22 13:39:20');
INSERT INTO `sys_errors` VALUES (17, 'ER_NON_UNIQ_ERROR', NULL, '', NULL, '2021-04-22 14:02:24', '2021-04-22 14:02:24');
INSERT INTO `sys_errors` VALUES (18, 'E_USER_NOT_FOUND', NULL, 'E_INVALID_SESSION', NULL, '2021-04-22 14:06:03', '2021-04-22 14:06:03');
COMMIT;

-- ----------------------------
-- Table structure for sys_logs
-- ----------------------------
DROP TABLE IF EXISTS `sys_logs`;
CREATE TABLE `sys_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `keterangan` text,
  `src_data` varchar(255) DEFAULT NULL,
  `action` enum('C','U','D') DEFAULT 'C',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sys_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `sys_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of sys_logs
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_menu_details
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu_details`;
CREATE TABLE `sys_menu_details` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` int(10) unsigned DEFAULT NULL,
  `subname` varchar(25) NOT NULL,
  `uri` varchar(100) NOT NULL,
  `icon` varchar(30) DEFAULT NULL,
  `urut` int(11) NOT NULL,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `sys_menu_details_subname_unique` (`subname`) USING BTREE,
  KEY `sys_menu_details_menu_id_foreign` (`menu_id`) USING BTREE,
  CONSTRAINT `sys_menu_details_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `sys_menus` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of sys_menu_details
-- ----------------------------
BEGIN;
INSERT INTO `sys_menu_details` VALUES (1, 1, 'User', 'mas.user.index', 'icon-people', 1, 'Y', '2021-03-18 13:30:01', '2021-03-30 13:57:41');
INSERT INTO `sys_menu_details` VALUES (2, 1, 'Department', '#', 'ti-briefcase', 2, 'Y', '2021-03-18 13:31:42', '2021-03-18 14:52:02');
INSERT INTO `sys_menu_details` VALUES (3, 1, 'Divisi', '#', 'ti-bag', 3, 'Y', '2021-03-18 13:35:09', '2021-03-18 14:52:14');
INSERT INTO `sys_menu_details` VALUES (4, 1, 'Equipment', 'mas.equipment.index', 'ti-truck', 4, 'Y', '2021-03-18 13:36:16', '2021-04-21 10:46:27');
INSERT INTO `sys_menu_details` VALUES (5, 2, 'Sys Options', 'set.sys-options.index', 'ti-widget-alt', 1, 'Y', '2021-03-18 15:01:03', '2021-03-18 15:13:46');
INSERT INTO `sys_menu_details` VALUES (6, 1, 'Employee', 'mas.employee.index', 'ti-user', 5, 'Y', '2021-03-31 09:22:00', '2021-03-31 09:22:53');
INSERT INTO `sys_menu_details` VALUES (7, 2, 'User Menu', 'set.usr-menu.index', 'ti-microsoft', 2, 'Y', '2021-04-09 09:40:58', '2021-04-09 09:41:31');
INSERT INTO `sys_menu_details` VALUES (8, 3, 'Daily Activity', 'opr.daily-activity.index', 'icon-social-reddit', 1, 'Y', '2021-04-10 12:02:01', '2021-04-10 12:05:44');
INSERT INTO `sys_menu_details` VALUES (9, 2, 'User Akses', 'set.usr-akses.index', 'icon-shield', 3, 'Y', '2021-04-21 16:20:23', '2021-04-22 09:22:24');
COMMIT;

-- ----------------------------
-- Table structure for sys_menus
-- ----------------------------
DROP TABLE IF EXISTS `sys_menus`;
CREATE TABLE `sys_menus` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL,
  `uri` varchar(100) NOT NULL,
  `icon` varchar(30) DEFAULT NULL,
  `urut` int(11) NOT NULL,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `sys_menus_name_unique` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of sys_menus
-- ----------------------------
BEGIN;
INSERT INTO `sys_menus` VALUES (1, 'Master', '#', 'mdi mdi-database', 98, 'Y', '2021-03-18 13:24:52', '2021-03-18 14:41:17');
INSERT INTO `sys_menus` VALUES (2, 'Setting', '#', 'mdi mdi-settings', 99, 'Y', '2021-03-18 13:25:56', '2021-03-18 14:48:40');
INSERT INTO `sys_menus` VALUES (3, 'Operation', '#', 'mdi mdi-android-studio', 1, 'Y', '2021-03-18 13:29:10', '2021-03-18 14:38:28');
COMMIT;

-- ----------------------------
-- Table structure for sys_modules
-- ----------------------------
DROP TABLE IF EXISTS `sys_modules`;
CREATE TABLE `sys_modules` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `method` enum('C','R','U','D') DEFAULT 'R',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of sys_modules
-- ----------------------------
BEGIN;
INSERT INTO `sys_modules` VALUES (1, 'sys-options', 'read module options', 'U', '2021-03-30 09:38:33', '2021-04-22 15:07:44');
INSERT INTO `sys_modules` VALUES (2, 'sys-options', 'create module options', 'C', '2021-03-30 09:38:33', '2021-04-22 12:34:52');
INSERT INTO `sys_modules` VALUES (3, 'sys-options', 'update module options', 'U', '2021-03-30 09:38:33', '2021-03-30 09:38:36');
INSERT INTO `sys_modules` VALUES (4, 'sys-options', 'delete module options', 'D', '2021-03-30 09:38:33', '2021-03-30 09:38:36');
INSERT INTO `sys_modules` VALUES (5, 'user', 'read module users', 'R', '2021-03-30 09:38:33', '2021-03-30 09:38:36');
INSERT INTO `sys_modules` VALUES (6, 'user', 'create module users', 'C', '2021-03-30 09:38:33', '2021-03-30 09:38:36');
INSERT INTO `sys_modules` VALUES (7, 'user', 'update module users', 'U', '2021-04-22 09:52:45', '2021-04-22 09:52:49');
INSERT INTO `sys_modules` VALUES (8, 'user', 'delete module users', 'D', '2021-04-22 09:52:45', '2021-04-22 09:52:49');
INSERT INTO `sys_modules` VALUES (9, 'employee', 'create module employee', 'C', '2021-04-22 10:06:29', '2021-04-22 10:06:29');
INSERT INTO `sys_modules` VALUES (10, 'employee', 'read module employee', 'R', '2021-04-22 10:07:30', '2021-04-22 10:07:30');
INSERT INTO `sys_modules` VALUES (11, 'employee', 'update module employee', 'U', '2021-04-22 10:07:30', '2021-04-22 10:07:30');
INSERT INTO `sys_modules` VALUES (12, 'employee', 'delete module employee', 'D', '2021-04-22 10:07:30', '2021-04-22 10:07:30');
INSERT INTO `sys_modules` VALUES (13, 'usr-menu', 'create module usr-menu', 'C', '2021-04-22 10:13:58', '2021-04-22 10:13:58');
INSERT INTO `sys_modules` VALUES (14, 'usr-menu', 'read module usr-menu', 'R', '2021-04-22 10:13:58', '2021-04-22 13:57:54');
INSERT INTO `sys_modules` VALUES (15, 'usr-menu', 'update module usr-menu', 'U', '2021-04-22 10:13:58', '2021-04-22 10:13:58');
INSERT INTO `sys_modules` VALUES (16, 'usr-menu', 'delete module usr-menu', 'D', '2021-04-22 10:13:58', '2021-04-22 10:13:58');
INSERT INTO `sys_modules` VALUES (17, 'usr-akses', 'create module usr-akses', 'C', '2021-04-22 10:13:58', '2021-04-22 10:13:58');
INSERT INTO `sys_modules` VALUES (18, 'usr-akses', 'read module usr-akses', 'R', '2021-04-22 10:13:58', '2021-04-22 10:13:58');
INSERT INTO `sys_modules` VALUES (19, 'usr-akses', 'update module usr-akses', 'U', '2021-04-22 10:13:58', '2021-04-22 10:13:58');
INSERT INTO `sys_modules` VALUES (20, 'usr-akses', 'delete module usr-akses', 'D', '2021-04-22 10:13:58', '2021-04-22 10:13:58');
INSERT INTO `sys_modules` VALUES (21, 'equipment', 'create module equipment', 'C', '2021-04-22 13:01:37', '2021-04-22 13:01:37');
INSERT INTO `sys_modules` VALUES (22, 'equipment', 'read module equipment', 'R', '2021-04-22 13:01:37', '2021-04-22 13:01:37');
INSERT INTO `sys_modules` VALUES (23, 'equipment', 'update module equipment', 'U', '2021-04-22 13:01:37', '2021-04-22 13:01:37');
INSERT INTO `sys_modules` VALUES (24, 'equipment', 'delete module equipment', 'D', '2021-04-22 13:01:37', '2021-04-22 13:01:37');
COMMIT;

-- ----------------------------
-- Table structure for sys_options
-- ----------------------------
DROP TABLE IF EXISTS `sys_options`;
CREATE TABLE `sys_options` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `group` varchar(30) NOT NULL,
  `teks` varchar(50) NOT NULL,
  `nilai` varchar(50) NOT NULL,
  `urut` int(11) NOT NULL,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of sys_options
-- ----------------------------
BEGIN;
INSERT INTO `sys_options` VALUES (1, 'sex', 'Male', 'm', 1, 'Y', '2021-03-26 13:49:58', '2021-03-27 12:19:26');
INSERT INTO `sys_options` VALUES (2, 'sex', 'Female', 'f', 2, 'Y', '2021-03-26 14:08:38', '2021-03-29 15:31:11');
INSERT INTO `sys_options` VALUES (3, 'jenis-unit', 'Excavator', 'excavator', 1, 'Y', '2021-03-27 12:57:56', '2021-03-27 12:57:56');
INSERT INTO `sys_options` VALUES (4, 'jenis-unit', 'Dump Truck', 'dump truck', 2, 'Y', '2021-03-27 12:58:32', '2021-03-27 12:58:32');
INSERT INTO `sys_options` VALUES (5, 'jenis-unit', 'Wheel Loader', 'wheel loader', 3, 'Y', '2021-03-27 12:58:51', '2021-03-27 12:58:51');
INSERT INTO `sys_options` VALUES (6, 'jenis-unit', 'Belt Conveyor', 'belt conveyor', 4, 'Y', '2021-03-27 12:59:05', '2021-03-27 12:59:05');
INSERT INTO `sys_options` VALUES (7, 'jenis-unit', 'Dragline', 'dragline', 5, 'Y', '2021-03-27 12:59:33', '2021-03-27 12:59:33');
INSERT INTO `sys_options` VALUES (8, 'jenis-unit', 'Bulldozer', 'bulldozer', 6, 'Y', '2021-03-27 12:59:48', '2021-03-27 12:59:48');
INSERT INTO `sys_options` VALUES (9, 'jenis-unit', 'Bucket Wheel Excavator (BWE)', 'bwe', 7, 'Y', '2021-03-27 13:00:17', '2021-03-27 13:00:17');
INSERT INTO `sys_options` VALUES (10, 'user-group', 'Owner', 'owner', 1, 'N', '2021-03-29 09:32:13', '2021-03-29 15:28:57');
INSERT INTO `sys_options` VALUES (11, 'user-group', 'Produksi', 'produksi', 2, 'N', '2021-03-29 09:32:32', '2021-03-29 15:27:25');
INSERT INTO `sys_options` VALUES (12, 'user-tipe', 'administrator', 'administrator', 1, 'Y', '2021-03-29 15:58:17', '2021-03-29 15:58:17');
INSERT INTO `sys_options` VALUES (13, 'user-tipe', 'Owner', 'owner', 2, 'Y', '2021-03-29 15:58:28', '2021-03-29 15:58:28');
INSERT INTO `sys_options` VALUES (14, 'user-tipe', 'Produksi', 'produksi', 3, 'Y', '2021-03-29 15:58:58', '2021-03-29 15:58:58');
INSERT INTO `sys_options` VALUES (15, 'user-tipe	', 'Hrd', 'hrd', 4, 'Y', '2021-03-29 15:59:48', '2021-03-29 16:01:01');
INSERT INTO `sys_options` VALUES (16, 'user-tipe	', 'Finance', 'finance', 5, 'Y', '2021-03-29 16:00:04', '2021-03-29 16:01:05');
INSERT INTO `sys_options` VALUES (17, 'brand-unit', 'Caterpillar', 'caterpillar', 1, 'Y', '2021-03-29 16:07:08', '2021-03-29 16:07:08');
INSERT INTO `sys_options` VALUES (18, 'brand-unit', 'Volvo', 'volvo', 2, 'Y', '2021-03-29 16:07:17', '2021-03-29 16:07:17');
INSERT INTO `sys_options` VALUES (19, 'brand-unit', 'Hino', 'hino', 3, 'Y', '2021-03-29 16:07:34', '2021-03-29 16:07:34');
INSERT INTO `sys_options` VALUES (20, 'brand-unit', 'Hitachi', 'hitachi', 4, 'Y', '2021-03-29 16:08:24', '2021-03-29 16:08:24');
INSERT INTO `sys_options` VALUES (21, 'brand-unit', 'KOMATSU', 'komatsu', 5, 'Y', '2021-03-29 16:08:55', '2021-03-29 16:08:55');
INSERT INTO `sys_options` VALUES (22, 'brand-unit', 'Doosan', 'doosan', 6, 'Y', '2021-03-29 16:09:14', '2021-03-29 16:09:14');
INSERT INTO `sys_options` VALUES (23, 'brand-unit', 'Olympian', 'olympian', 7, 'Y', '2021-03-29 16:09:27', '2021-03-29 16:09:27');
INSERT INTO `sys_options` VALUES (24, 'brand-unit', 'Weir', 'weir', 8, 'Y', '2021-03-29 16:09:42', '2021-03-29 16:09:42');
INSERT INTO `sys_options` VALUES (25, 'nations', 'Warga Negara Indonesia', 'wni', 1, 'Y', '2021-03-31 08:26:16', '2021-03-31 08:26:16');
INSERT INTO `sys_options` VALUES (26, 'nations', 'Warga Negara Asing', 'wna', 2, 'Y', '2021-03-31 08:26:27', '2021-03-31 08:26:27');
INSERT INTO `sys_options` VALUES (27, 'agama', 'Islam', 'islam', 1, 'Y', '2021-03-31 08:27:04', '2021-03-31 08:27:04');
INSERT INTO `sys_options` VALUES (28, 'agama', 'Kristen', 'kristen', 2, 'Y', '2021-03-31 08:27:20', '2021-03-31 08:27:20');
INSERT INTO `sys_options` VALUES (29, 'agama', 'Protestan', 'protestan', 3, 'Y', '2021-03-31 08:27:35', '2021-03-31 08:27:35');
INSERT INTO `sys_options` VALUES (30, 'agama', 'Hindu', 'hindu', 4, 'Y', '2021-03-31 08:27:48', '2021-03-31 08:27:48');
INSERT INTO `sys_options` VALUES (31, 'agama', 'Budha', 'budha', 5, 'Y', '2021-03-31 08:28:04', '2021-03-31 08:28:04');
INSERT INTO `sys_options` VALUES (32, 'agama', 'Lainnya.', 'lainnya', 6, 'Y', '2021-03-31 08:28:17', '2021-04-22 11:11:27');
INSERT INTO `sys_options` VALUES (33, 'sts-perkawinan', 'Single', 'singel', 1, 'Y', '2021-03-31 08:30:07', '2021-03-31 08:30:07');
INSERT INTO `sys_options` VALUES (34, 'sts-perkawinan', 'Menikah', 'menikah', 2, 'Y', '2021-03-31 08:30:39', '2021-03-31 08:30:39');
INSERT INTO `sys_options` VALUES (35, 'sts-perkawinan', 'Cerai', 'cerai', 3, 'Y', '2021-03-31 08:31:04', '2021-03-31 08:31:04');
INSERT INTO `sys_options` VALUES (36, 'sts-employee', 'Permanent', 'permanent', 1, 'Y', '2021-03-31 08:33:54', '2021-03-31 08:33:54');
INSERT INTO `sys_options` VALUES (37, 'sts-employee', 'Part Time', 'pt', 2, 'Y', '2021-03-31 08:34:18', '2021-03-31 08:34:18');
INSERT INTO `sys_options` VALUES (38, 'sts-employee', 'Kontrak', 'pkwt', 3, 'Y', '2021-03-31 08:34:48', '2021-03-31 08:34:48');
INSERT INTO `sys_options` VALUES (39, 'tipe-identitas', 'KTP', 'ktp', 1, 'Y', '2021-03-31 15:09:48', '2021-03-31 15:09:48');
INSERT INTO `sys_options` VALUES (40, 'tipe-identitas', 'SIM', 'sim', 2, 'Y', '2021-03-31 15:10:00', '2021-03-31 15:10:00');
INSERT INTO `sys_options` VALUES (41, 'tipe-identitas', 'PASSPORT', 'passport', 3, 'Y', '2021-03-31 15:10:18', '2021-03-31 15:10:18');
INSERT INTO `sys_options` VALUES (42, 'tipe-employee', 'Head Offices (HO)', '01', 1, 'Y', '2021-03-31 15:16:11', '2021-04-17 10:10:24');
INSERT INTO `sys_options` VALUES (43, 'tipe-employee', 'Site', '03', 2, 'Y', '2021-03-31 15:16:23', '2021-04-17 10:09:07');
INSERT INTO `sys_options` VALUES (44, 'satuan-unit', 'Bank Cubic Metre (bcm)', 'bcm', 1, 'Y', '2021-04-15 08:33:16', '2021-04-15 08:33:16');
INSERT INTO `sys_options` VALUES (45, 'satuan-unit', 'Meter/Cubic', 'm/c', 2, 'Y', '2021-04-15 08:34:29', '2021-04-15 08:34:29');
INSERT INTO `sys_options` VALUES (46, 'satuan-unit', 'Ton', 'ton', 3, 'Y', '2021-04-15 08:34:49', '2021-04-15 08:34:49');
INSERT INTO `sys_options` VALUES (47, 'tipe-employee', 'Stavedoring', '02', 3, 'Y', '2021-04-17 10:11:07', '2021-04-17 10:11:07');
INSERT INTO `sys_options` VALUES (48, 'test', 'test', 'test', 1, 'Y', '2021-04-22 12:35:01', '2021-04-22 12:35:01');
COMMIT;

-- ----------------------------
-- Table structure for sys_users_groups
-- ----------------------------
DROP TABLE IF EXISTS `sys_users_groups`;
CREATE TABLE `sys_users_groups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `mod_id` int(10) unsigned DEFAULT NULL,
  `user_tipe` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `mod_id` (`mod_id`),
  CONSTRAINT `sys_users_groups_mod_id_foreign` FOREIGN KEY (`mod_id`) REFERENCES `sys_modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of sys_users_groups
-- ----------------------------
BEGIN;
INSERT INTO `sys_users_groups` VALUES (1, 2, 1, 'administrator');
INSERT INTO `sys_users_groups` VALUES (2, 2, 4, 'administrator');
INSERT INTO `sys_users_groups` VALUES (3, 2, 2, 'administrator');
INSERT INTO `sys_users_groups` VALUES (4, 2, 3, 'administrator');
INSERT INTO `sys_users_groups` VALUES (6, 2, 5, 'administrator');
INSERT INTO `sys_users_groups` VALUES (7, 2, 6, 'administrator');
INSERT INTO `sys_users_groups` VALUES (8, 2, 7, 'administrator');
INSERT INTO `sys_users_groups` VALUES (9, 2, 8, 'administrator');
INSERT INTO `sys_users_groups` VALUES (10, 2, 9, 'administrator');
INSERT INTO `sys_users_groups` VALUES (11, 2, 10, 'administrator');
INSERT INTO `sys_users_groups` VALUES (12, 2, 12, 'administrator');
INSERT INTO `sys_users_groups` VALUES (13, 2, 13, 'administrator');
INSERT INTO `sys_users_groups` VALUES (14, 2, 14, 'administrator');
INSERT INTO `sys_users_groups` VALUES (15, 2, 15, 'administrator');
INSERT INTO `sys_users_groups` VALUES (16, 2, 16, 'administrator');
INSERT INTO `sys_users_groups` VALUES (17, 2, 17, 'administrator');
INSERT INTO `sys_users_groups` VALUES (18, 2, 18, 'administrator');
INSERT INTO `sys_users_groups` VALUES (19, 2, 19, 'administrator');
INSERT INTO `sys_users_groups` VALUES (20, 2, 20, 'administrator');
INSERT INTO `sys_users_groups` VALUES (21, 2, 21, 'administrator');
INSERT INTO `sys_users_groups` VALUES (22, 2, 22, 'administrator');
INSERT INTO `sys_users_groups` VALUES (23, 2, 23, 'administrator');
INSERT INTO `sys_users_groups` VALUES (24, 2, 24, 'administrator');
COMMIT;

-- ----------------------------
-- Table structure for tokens
-- ----------------------------
DROP TABLE IF EXISTS `tokens`;
CREATE TABLE `tokens` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `type` varchar(80) NOT NULL,
  `is_revoked` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tokens_token_unique` (`token`),
  KEY `tokens_user_id_foreign` (`user_id`),
  KEY `tokens_token_index` (`token`),
  CONSTRAINT `tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of tokens
-- ----------------------------
BEGIN;
INSERT INTO `tokens` VALUES (19, 2, '6e4598f1-ec66-42af-a6c7-85c0bbb0974f', 'remember_token', 0, '2021-04-22 15:06:14', '2021-04-22 15:06:14');
COMMIT;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(80) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(60) NOT NULL,
  `user_tipe` varchar(60) NOT NULL,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `users_username_unique` (`username`) USING BTREE,
  UNIQUE KEY `users_email_unique` (`email`) USING BTREE,
  KEY `user_tipe` (`user_tipe`),
  KEY `user_tipe_2` (`user_tipe`,`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO `users` VALUES (2, 'admin', 'ayat.ekapoetra@gmail.com', '$2a$10$8rfvqzmDCiGdoK0mi3qYsO.cKG0sfTc8WrnLV2gt9DJqDEiqprNz2', 'administrator', 'Y', '2021-03-27 08:30:50', '2021-03-27 08:30:50');
INSERT INTO `users` VALUES (3, 'bob', 'uce@nonwuh.io', '$2a$10$8rfvqzmDCiGdoK0mi3qYsO.cKG0sfTc8WrnLV2gt9DJqDEiqprNz2', 'operation', 'Y', '2021-04-09 15:10:00', '2021-04-09 15:10:00');
INSERT INTO `users` VALUES (4, 'xxx', 'azguswo@zu.ph', '$2a$10$XcCFo4bipOC8OglzYtxuROlEx82FfY7GmpSmW9AbG8OPI0qT1SuBS', 'operation', 'Y', '2021-04-09 15:12:07', '2021-04-09 15:12:07');
INSERT INTO `users` VALUES (5, 'kensie', 'kensie@poetra.co', '$2a$10$HIMg791KX.4XdeBOsa9yZe4nOvMd.Y5n6xBi4QLl26ivjIv7RRoR2', 'produksi', 'Y', '2021-04-20 14:32:07', '2021-04-21 16:02:27');
COMMIT;

-- ----------------------------
-- Table structure for users_groups
-- ----------------------------
DROP TABLE IF EXISTS `users_groups`;
CREATE TABLE `users_groups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `group_name` varchar(30) NOT NULL,
  `description` text,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of users_groups
-- ----------------------------
BEGIN;
INSERT INTO `users_groups` VALUES (1, 'HR Site', 'Admin Staff HR Site', 'Y', '2021-03-30 10:41:37', '2021-03-30 10:41:40');
INSERT INTO `users_groups` VALUES (2, 'Engineering Site', 'Admin Staff Engineering Site', 'Y', '2021-03-30 10:41:37', '2021-03-30 10:41:40');
COMMIT;

-- ----------------------------
-- Table structure for usr_menu_details
-- ----------------------------
DROP TABLE IF EXISTS `usr_menu_details`;
CREATE TABLE `usr_menu_details` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `submenu_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `submenu_id` (`submenu_id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  CONSTRAINT `usr_menu_details_submenu_id_foreign` FOREIGN KEY (`submenu_id`) REFERENCES `sys_menu_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usr_menu_details_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of usr_menu_details
-- ----------------------------
BEGIN;
INSERT INTO `usr_menu_details` VALUES (1, 1, 2);
INSERT INTO `usr_menu_details` VALUES (2, 5, 2);
INSERT INTO `usr_menu_details` VALUES (3, 6, 2);
INSERT INTO `usr_menu_details` VALUES (4, 7, 2);
INSERT INTO `usr_menu_details` VALUES (5, 8, 2);
INSERT INTO `usr_menu_details` VALUES (6, 4, 2);
INSERT INTO `usr_menu_details` VALUES (33, 1, 3);
INSERT INTO `usr_menu_details` VALUES (34, 3, 3);
INSERT INTO `usr_menu_details` VALUES (35, 6, 3);
INSERT INTO `usr_menu_details` VALUES (36, 2, 3);
INSERT INTO `usr_menu_details` VALUES (37, 8, 3);
INSERT INTO `usr_menu_details` VALUES (38, 9, 2);
INSERT INTO `usr_menu_details` VALUES (43, 4, 5);
INSERT INTO `usr_menu_details` VALUES (44, 6, 5);
COMMIT;

-- ----------------------------
-- Table structure for usr_menus
-- ----------------------------
DROP TABLE IF EXISTS `usr_menus`;
CREATE TABLE `usr_menus` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `menu_id` (`menu_id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  CONSTRAINT `usr_menus_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `sys_menus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usr_menus_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of usr_menus
-- ----------------------------
BEGIN;
INSERT INTO `usr_menus` VALUES (1, 1, 2);
INSERT INTO `usr_menus` VALUES (2, 2, 2);
INSERT INTO `usr_menus` VALUES (3, 3, 2);
INSERT INTO `usr_menus` VALUES (26, 3, 3);
INSERT INTO `usr_menus` VALUES (27, 2, 3);
INSERT INTO `usr_menus` VALUES (28, 1, 3);
INSERT INTO `usr_menus` VALUES (33, 1, 5);
COMMIT;

-- ----------------------------
-- View structure for v_privileges
-- ----------------------------
DROP VIEW IF EXISTS `v_privileges`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_privileges` AS select `users`.`user_tipe` AS `usertipe`,`sys_users_groups`.`mod_id` AS `idmodule`,`sys_modules`.`name` AS `nm_module`,`sys_modules`.`method` AS `method`,`sys_modules`.`description` AS `descriptions` from ((`users` join `sys_users_groups` on((`users`.`user_tipe` = `sys_users_groups`.`user_tipe`))) join `sys_modules` on((`sys_users_groups`.`mod_id` = `sys_modules`.`id`))) where (`users`.`status` = 'Y');

-- ----------------------------
-- View structure for v_users
-- ----------------------------
DROP VIEW IF EXISTS `v_users`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_users` AS select `users`.`id` AS `id`,`users`.`username` AS `username`,`users`.`email` AS `email`,`users`.`password` AS `password`,`users`.`user_tipe` AS `user_tipe`,`users`.`status` AS `status`,`profiles`.`nm_depan` AS `nm_depan`,`profiles`.`nm_belakang` AS `nm_belakang`,concat(`profiles`.`nm_depan`,' ',`profiles`.`nm_belakang`) AS `nm_lengkap`,`profiles`.`phone` AS `phone`,`profiles`.`jenkel` AS `jenkel`,`profiles`.`avatar` AS `avatar` from (`users` join `profiles` on((`users`.`id` = `profiles`.`user_id`))) where (`users`.`status` = 'Y');

SET FOREIGN_KEY_CHECKS = 1;
