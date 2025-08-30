-- Enhance overtime table to store full lifecycle data
-- Compatible with MariaDB 10.4 (supports IF NOT EXISTS on columns)

ALTER TABLE `overtime`
  ADD COLUMN IF NOT EXISTS `ActualStart` time NULL AFTER `OvertimeEnd`,
  ADD COLUMN IF NOT EXISTS `ActualEnd` time NULL AFTER `ActualStart`,
  ADD COLUMN IF NOT EXISTS `ActualHours` decimal(5,2) NULL AFTER `ActualEnd`,
  ADD COLUMN IF NOT EXISTS `Status` enum('Pending','In Progress','Completed','Cancelled') NOT NULL DEFAULT 'Pending' AFTER `ActualHours`,
  ADD COLUMN IF NOT EXISTS `DateApplied` date NULL AFTER `Status`;


