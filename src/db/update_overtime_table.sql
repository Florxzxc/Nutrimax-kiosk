-- Update overtime table to support new overtime tracking system
-- This script adds necessary columns for tracking actual overtime hours and status

-- Add new columns to overtime table
ALTER TABLE `overtime` 
ADD COLUMN `ActualStart` time DEFAULT NULL AFTER `OvertimeEnd`,
ADD COLUMN `ActualEnd` time DEFAULT NULL AFTER `ActualStart`,
ADD COLUMN `ActualHours` decimal(5,2) DEFAULT NULL AFTER `ActualEnd`,
ADD COLUMN `Status` enum('Pending','In Progress','Completed','Cancelled') DEFAULT 'Pending' AFTER `ActualHours`,
ADD COLUMN `DateApplied` date DEFAULT NULL AFTER `Status`,
ADD COLUMN `DateCompleted` date DEFAULT NULL AFTER `DateApplied`,
ADD COLUMN `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp() AFTER `DateCompleted`,
ADD COLUMN `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() AFTER `CreatedAt`;

-- Add index for better performance
CREATE INDEX `idx_overtime_attendance_status` ON `overtime` (`AttendanceID`, `Status`);
CREATE INDEX `idx_overtime_date` ON `overtime` (`DateApplied`);

-- Update existing overtime records to have proper status
UPDATE `overtime` SET `Status` = 'Completed' WHERE `OvertimeHours` IS NOT NULL;
UPDATE `overtime` SET `Status` = 'Pending' WHERE `OvertimeHours` IS NULL;

-- Add comments to document the new structure
ALTER TABLE `overtime` 
MODIFY COLUMN `OvertimeStart` time DEFAULT NULL COMMENT 'Estimated overtime start time',
MODIFY COLUMN `OvertimeEnd` time DEFAULT NULL COMMENT 'Estimated overtime end time',
MODIFY COLUMN `ActualStart` time DEFAULT NULL COMMENT 'Actual overtime start time (when employee clocks in for overtime)',
MODIFY COLUMN `ActualEnd` time DEFAULT NULL COMMENT 'Actual overtime end time (when employee clocks out from overtime)',
MODIFY COLUMN `ActualHours` decimal(5,2) DEFAULT NULL COMMENT 'Actual overtime hours worked (calculated from ActualStart to ActualEnd)',
MODIFY COLUMN `Status` enum('Pending','In Progress','Completed','Cancelled') DEFAULT 'Pending' COMMENT 'Current status of overtime request';
