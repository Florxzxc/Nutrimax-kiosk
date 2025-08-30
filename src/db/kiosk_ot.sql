-- Kiosk OT separate database (to avoid overriding attendance)
-- Create database and required tables

CREATE DATABASE IF NOT EXISTS `kiosk_ot` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `kiosk_ot`;

-- Records a short-lived request to verify a biometric action from the kiosk UI
CREATE TABLE IF NOT EXISTS `pending_verifications` (
  `PendingID` int(11) NOT NULL AUTO_INCREMENT,
  `EmployeeID` int(11) NOT NULL,
  `VerificationType` enum('Overtime','Generic') NOT NULL DEFAULT 'Overtime',
  `RequestedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `ExpiresAt` timestamp NULL DEFAULT NULL,
  `Status` enum('Pending','Completed','Expired','Cancelled') NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (`PendingID`),
  KEY `idx_employee_status_time` (`EmployeeID`,`Status`,`RequestedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Stores the actual verification hits matched from the ADMS push
CREATE TABLE IF NOT EXISTS `biometric_verifications` (
  `VerificationID` int(11) NOT NULL AUTO_INCREMENT,
  `EmployeeID` int(11) NOT NULL,
  `VerificationType` enum('Overtime','Generic') NOT NULL DEFAULT 'Overtime',
  `VerifiedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `DeviceID` varchar(50) DEFAULT NULL,
  `SourceDate` date DEFAULT NULL,
  `SourceTime` time DEFAULT NULL,
  `PendingID` int(11) DEFAULT NULL,
  PRIMARY KEY (`VerificationID`),
  KEY `idx_employee_time` (`EmployeeID`,`VerifiedAt`),
  KEY `idx_pending` (`PendingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


