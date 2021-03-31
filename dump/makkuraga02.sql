/*
 Navicat Premium Data Transfer

 Source Server         : LocalHost
 Source Server Type    : MySQL
 Source Server Version : 100417
 Source Host           : localhost:3306
 Source Schema         : makkuraga02

 Target Server Type    : MySQL
 Target Server Version : 100417
 File Encoding         : 65001

 Date: 06/02/2021 11:22:47
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for akuns
-- ----------------------------
DROP TABLE IF EXISTS `akuns`;
CREATE TABLE `akuns` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `akun` varchar(30) NOT NULL,
  `tipe` enum('neraca','labarugi') DEFAULT 'neraca',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of akuns
-- ----------------------------
BEGIN;
INSERT INTO `akuns` VALUES (1, 'aset', 'neraca', '2021-02-06 11:09:52', '2021-02-06 11:09:52');
INSERT INTO `akuns` VALUES (2, 'kewajiban', 'neraca', '2021-02-06 11:09:52', '2021-02-06 11:09:52');
INSERT INTO `akuns` VALUES (3, 'equitas', 'neraca', '2021-02-06 11:09:52', '2021-02-06 11:09:52');
INSERT INTO `akuns` VALUES (4, 'penghasilan', 'labarugi', '2021-02-06 11:09:52', '2021-02-06 11:09:52');
INSERT INTO `akuns` VALUES (5, 'biaya', 'labarugi', '2021-02-06 11:09:52', '2021-02-06 11:09:52');
COMMIT;

-- ----------------------------
-- Table structure for menudetails
-- ----------------------------
DROP TABLE IF EXISTS `menudetails`;
CREATE TABLE `menudetails` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `subname` varchar(25) NOT NULL,
  `uri` varchar(100) NOT NULL,
  `icon` varchar(30) DEFAULT NULL,
  `urut` int(11) NOT NULL,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `menudetails_subname_unique` (`subname`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of menudetails
-- ----------------------------
BEGIN;
INSERT INTO `menudetails` VALUES (1, 'Unit Bisnis', 'mas.bisnis', 'ti-home', 1, 'Y', '2021-01-31 13:44:57', '2021-01-31 13:45:02');
INSERT INTO `menudetails` VALUES (2, 'Department', '#', 'ti-star', 3, 'Y', '2021-01-31 13:45:51', '2021-01-31 13:45:47');
INSERT INTO `menudetails` VALUES (3, 'Karyawan', '#', 'ti-user', 4, 'Y', '2021-01-31 13:46:26', '2021-01-31 13:46:36');
INSERT INTO `menudetails` VALUES (4, 'Ringkasan', 'fin.ringkasan', 'ti-world', 1, 'Y', '2021-01-31 13:47:16', '2021-01-31 13:47:22');
INSERT INTO `menudetails` VALUES (5, 'User', 'mas.user', 'icon-people', 5, 'Y', '2021-01-31 14:28:12', '2021-01-31 14:28:18');
INSERT INTO `menudetails` VALUES (6, 'Cabang', '#', 'ti-flag-alt', 2, 'Y', '2021-02-01 23:07:37', '2021-02-01 23:07:42');
INSERT INTO `menudetails` VALUES (7, 'Akun Groups', 'fin.coa-group', 'ti-flag', 2, 'Y', '2021-02-02 02:31:00', '2021-02-02 02:31:05');
INSERT INTO `menudetails` VALUES (8, 'Menu User Akses', 'sett.user-menu', 'ti-unlock', 1, 'Y', '2021-02-02 21:51:54', '2021-02-02 21:52:00');
INSERT INTO `menudetails` VALUES (9, 'Akun Sub Groups', 'fin.coa-subgroup', 'ti-flag-alt-2', 3, 'Y', '2021-02-05 04:04:40', '2021-02-05 04:04:45');
COMMIT;

-- ----------------------------
-- Table structure for menumain_menudetails
-- ----------------------------
DROP TABLE IF EXISTS `menumain_menudetails`;
CREATE TABLE `menumain_menudetails` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `group` varchar(30) NOT NULL,
  `menumain_id` int(10) unsigned DEFAULT NULL,
  `menudetail_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menumain_id` (`menumain_id`),
  KEY `menudetail_id` (`menudetail_id`),
  CONSTRAINT `menumain_menudetails_menudetail_id_foreign` FOREIGN KEY (`menudetail_id`) REFERENCES `menudetails` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `menumain_menudetails_menumain_id_foreign` FOREIGN KEY (`menumain_id`) REFERENCES `menumains` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of menumain_menudetails
-- ----------------------------
BEGIN;
INSERT INTO `menumain_menudetails` VALUES (2, 'administrator', 1, 2);
INSERT INTO `menumain_menudetails` VALUES (3, 'administrator', 1, 3);
INSERT INTO `menumain_menudetails` VALUES (5, 'administrator', 1, 5);
INSERT INTO `menumain_menudetails` VALUES (6, 'administrator', 1, 6);
INSERT INTO `menumain_menudetails` VALUES (7, 'administrator', 2, 7);
INSERT INTO `menumain_menudetails` VALUES (8, 'administrator', 3, 8);
INSERT INTO `menumain_menudetails` VALUES (9, 'finance', 1, 1);
INSERT INTO `menumain_menudetails` VALUES (12, 'finance', 2, 4);
INSERT INTO `menumain_menudetails` VALUES (14, 'administrator', 2, 4);
INSERT INTO `menumain_menudetails` VALUES (15, 'administrator', 1, 1);
INSERT INTO `menumain_menudetails` VALUES (16, 'finance', 3, 8);
INSERT INTO `menumain_menudetails` VALUES (17, 'administrator', 2, 9);
COMMIT;

-- ----------------------------
-- Table structure for menumains
-- ----------------------------
DROP TABLE IF EXISTS `menumains`;
CREATE TABLE `menumains` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL,
  `uri` varchar(100) NOT NULL,
  `icon` varchar(30) DEFAULT NULL,
  `urut` int(11) NOT NULL,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `menumains_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of menumains
-- ----------------------------
BEGIN;
INSERT INTO `menumains` VALUES (1, 'Master', '#', 'mdi-database', 1, 'Y', '2021-01-31 13:43:00', '2021-01-31 13:43:05');
INSERT INTO `menumains` VALUES (2, 'Akunting', '#', 'mdi-calculator', 2, 'Y', '2021-01-31 13:43:49', '2021-01-31 13:43:53');
INSERT INTO `menumains` VALUES (3, 'Setting', '#', 'mdi-settings', 3, 'Y', '2021-02-02 21:48:03', '2021-02-02 21:48:09');
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
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sys_options
-- ----------------------------
BEGIN;
INSERT INTO `sys_options` VALUES (1, 'user-groups', 'Administrator', 'administrator', 1, 'Y', NULL, NULL);
INSERT INTO `sys_options` VALUES (2, 'user-groups', 'Direktur', 'direktur', 2, 'Y', NULL, NULL);
INSERT INTO `sys_options` VALUES (3, 'user-groups', 'Finance', 'finance', 3, 'Y', NULL, NULL);
INSERT INTO `sys_options` VALUES (4, 'user-groups', 'Operation', 'operation', 4, 'Y', NULL, NULL);
INSERT INTO `sys_options` VALUES (5, 'user-groups', 'HRD', 'hrd', 5, 'Y', NULL, NULL);
INSERT INTO `sys_options` VALUES (6, 'user-groups', 'Logistik', 'logistik', 6, 'Y', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for user_privileges
-- ----------------------------
DROP TABLE IF EXISTS `user_privileges`;
CREATE TABLE `user_privileges` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `group` varchar(30) NOT NULL,
  `permission` varchar(10) NOT NULL,
  `resource` varchar(30) NOT NULL,
  `status` enum('Y','N') DEFAULT 'Y',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of user_privileges
-- ----------------------------
BEGIN;
INSERT INTO `user_privileges` VALUES (1, 'administrator', 'read', 'bisnis', 'Y', NULL, NULL);
INSERT INTO `user_privileges` VALUES (2, 'administrator', 'create', 'bisnis', 'Y', NULL, NULL);
INSERT INTO `user_privileges` VALUES (3, 'administrator', 'update', 'bisnis', 'Y', NULL, NULL);
INSERT INTO `user_privileges` VALUES (4, 'administrator', 'destroy', 'bisnis', 'Y', NULL, NULL);
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
  `user_group` varchar(30) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `avatar` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO `users` VALUES (1, 'admin', 'admin@localhost.com', '$2a$10$Q53ekxxilYoovFRt3EX8P.aSg0unxG2uIggUY1oia5BaSDFGIoDZm', 'administrator', 'Ayat Ekapoetra', '/avatar/avatar-default.png', '2021-01-31 13:48:35', '2021-01-31 13:48:35');
INSERT INTO `users` VALUES (24, 'ayateka', 'ayat.ekapoetra@gmail.com', '$2a$10$uOKUgkldLPilyFxIkwWXk.oODpw59qpAwRa5yKYeSTpQ//9z/lRVm', 'finance', 'Ayat Eka', NULL, '2021-02-05 07:51:58', '2021-02-05 07:51:58');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
