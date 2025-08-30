-- Complete Nutrimax Kiosk Database
-- This file contains all tables including the updated overtime tracking system
-- Version: 2.0 (with overtime tracking enhancements)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `slice_bread`
--

-- --------------------------------------------------------

--
-- Table structure for table `area`
--

CREATE TABLE `area` (
  `AreaID` int(11) NOT NULL,
  `DepartmentID` int(11) NOT NULL,
  `AreaName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `area`
--

INSERT INTO `area` (`AreaID`, `DepartmentID`, `AreaName`) VALUES
(1, 3, 'Assembly Line'),
(2, 3, 'Packaging'),
(3, 3, 'Quality Control'),
(4, 2, 'Network Support'),
(5, 2, 'Software Development'),
(6, 1, 'Admin Team');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `AttendanceID` int(11) NOT NULL,
  `EmployeeID` int(11) NOT NULL,
  `Date` date NOT NULL,
  `ClockIn` time DEFAULT NULL,
  `ClockOut` time DEFAULT NULL,
  `TotalHours` time DEFAULT NULL,
  `StatusID` int(11) DEFAULT NULL,
  `Shift` varchar(50) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `IsSynced` tinyint(1) DEFAULT 1,
  `Remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`AttendanceID`, `EmployeeID`, `Date`, `ClockIn`, `ClockOut`, `TotalHours`, `StatusID`, `Shift`, `CreatedAt`, `UpdatedAt`, `IsSynced`, `Remarks`) VALUES
(2, 1, '2025-07-17', '15:23:04', '15:27:40', '00:04:36', 1, 'Biometric Shift', '2025-07-17 07:23:02', '2025-07-17 07:27:38', 1, NULL),
(3, 1, '2025-07-17', '16:14:54', '16:29:55', '00:15:01', 1, 'Biometric Shift', '2025-07-17 08:15:20', '2025-07-17 08:29:54', 1, NULL),
(4, 3, '2025-07-17', '16:44:06', '16:48:41', '00:04:35', 1, 'Biometric Shift', '2025-07-17 08:44:04', '2025-07-17 08:48:40', 1, NULL),
(5, 1, '2025-07-19', '11:05:58', '11:11:40', '00:05:42', 1, 'Biometric Shift', '2025-07-19 04:19:50', '2025-07-19 04:19:50', 1, NULL),
(6, 3, '2025-07-19', '11:08:35', '11:31:06', '00:22:31', 1, 'Biometric Shift', '2025-07-19 04:19:50', '2025-07-19 04:19:50', 1, NULL),
(7, 1, '2025-07-19', '11:30:17', '11:32:34', '00:02:17', 1, 'Biometric Shift', '2025-07-19 04:19:50', '2025-07-19 04:19:50', 1, NULL),
(8, 1, '2025-07-19', '12:21:19', '13:44:18', '01:22:59', 1, 'Biometric Shift', '2025-07-19 04:21:18', '2025-07-19 05:44:16', 1, NULL),
(9, 5, '2025-07-19', '13:37:56', '16:27:47', '02:49:51', 1, 'Biometric Shift', '2025-07-19 05:37:55', '2025-07-19 08:27:45', 1, NULL),
(10, 3, '2025-07-19', '13:44:47', '16:29:04', '02:44:17', 1, 'Biometric Shift', '2025-07-19 05:44:45', '2025-07-19 08:29:18', 1, NULL),
(11, 4, '2025-07-19', NULL, NULL, NULL, 2, 'Morning', '2025-07-19 06:25:53', '2025-07-19 06:25:53', 1, NULL),
(12, 1, '2025-07-30', '09:52:16', '10:03:37', '00:11:21', 1, 'Biometric Shift', '2025-07-30 01:52:14', '2025-07-30 02:03:36', 1, NULL),
(13, 5, '2025-07-30', '10:04:22', NULL, NULL, 1, 'Biometric Shift', '2025-07-30 02:04:20', '2025-07-30 02:04:20', 1, NULL),
(14, 1, '2025-07-30', '10:57:56', '16:38:01', '05:40:05', 1, 'Biometric Shift', '2025-07-30 02:57:54', '2025-07-30 08:38:00', 1, NULL),
(15, 6, '2025-07-30', '12:19:05', NULL, NULL, 1, 'Biometric Shift', '2025-07-30 04:19:03', '2025-07-30 04:19:03', 1, NULL),
(16, 1, '2025-07-30', '17:01:15', NULL, NULL, 1, 'Biometric Shift', '2025-07-30 09:01:14', '2025-07-30 09:01:14', 1, NULL),
(17, 1, '2025-08-20', '12:36:59', '13:37:24', '01:00:25', 1, 'Biometric Shift', '2025-08-20 04:36:56', '2025-08-20 05:37:21', 1, NULL),
(18, 1, '2025-08-20', '18:01:10', NULL, NULL, 1, 'Biometric Shift', '2025-08-20 10:01:36', '2025-08-20 10:01:36', 1, NULL),
(19, 4, '2025-08-20', '18:01:43', NULL, NULL, 1, 'Biometric Shift', '2025-08-20 10:01:44', '2025-08-20 10:01:44', 1, NULL),
(20, 1, '2025-08-21', '14:50:56', '15:44:53', '00:53:57', 1, 'Biometric Shift', '2025-08-21 06:50:54', '2025-08-21 07:44:51', 1, NULL),
(21, 4, '2025-08-23', '21:22:06', NULL, NULL, 1, 'Night Shift', '2025-08-23 13:22:03', '2025-08-23 13:22:03', 1, NULL),
(22, 1, '2025-08-23', '21:22:32', NULL, NULL, 1, 'Night Shift', '2025-08-23 13:22:29', '2025-08-23 13:22:29', 1, NULL),
(24, 9, '2025-08-23', '21:31:36', NULL, NULL, 1, 'Night Shift', '2025-08-23 13:31:33', '2025-08-23 13:31:33', 1, NULL),
(25, 1, '2025-08-24', '11:06:31', '11:35:10', '00:28:39', 1, 'Night Shift', '2025-08-24 03:20:41', '2025-08-24 03:35:06', 1, NULL),
(26, 9, '2025-08-24', '11:34:25', '11:36:49', '00:02:24', 4, 'Morning Shift', '2025-08-24 03:34:21', '2025-08-24 03:36:45', 1, 'Invalid attendance - clocked out at 11:36:49'),
(27, 1, '2025-08-24', '12:15:59', '12:58:42', '00:42:43', 1, 'Night Shift', '2025-08-24 04:19:03', '2025-08-24 04:58:38', 1, NULL),
(28, 1, '2025-08-24', '13:28:13', '13:29:20', '00:01:07', 1, 'Night Shift', '2025-08-24 05:28:10', '2025-08-24 05:29:16', 1, NULL),
(29, 7, '2025-08-24', '13:30:43', '14:05:15', '00:34:32', 3, 'Morning Shift', '2025-08-24 05:30:39', '2025-08-24 06:05:12', 1, 'Late arrival - clocked out at 14:05:15'),
(30, 15, '2025-08-24', '13:32:59', NULL, NULL, 4, 'Morning Shift', '2025-08-24 05:32:55', '2025-08-24 05:32:55', 1, 'Invalid: No shift schedule found');

-- --------------------------------------------------------

--
-- Table structure for table `attendancestatus`
--

CREATE TABLE `attendancestatus` (
  `StatusID` int(11) NOT NULL,
  `StatusName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendancestatus`
--

INSERT INTO `attendancestatus` (`StatusID`, `StatusName`) VALUES
(2, 'Absent'),
(4, 'Invalid'),
(3, 'Late'),
(1, 'Present');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_logs`
--

CREATE TABLE `attendance_logs` (
  `LogID` int(11) NOT NULL,
  `EmployeeID` int(11) NOT NULL,
  `LogTime` datetime NOT NULL,
  `LogType` enum('IN','OUT') NOT NULL,
  `DeviceID` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `DepartmentID` int(11) NOT NULL,
  `DepartmentName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`DepartmentID`, `DepartmentName`) VALUES
(2, 'IT Department'),
(1, 'Office Department'),
(3, 'Production');

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `DeviceID` varchar(50) NOT NULL,
  `DeviceName` varchar(100) DEFAULT NULL,
  `Location` varchar(100) DEFAULT NULL,
  `IPAddress` varchar(45) DEFAULT NULL,
  `Active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `EmployeeID` int(11) NOT NULL,
  `EmployeeNumber` varchar(20) DEFAULT NULL,
  `FirstName` varchar(50) NOT NULL,
  `MiddleName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) NOT NULL,
  `Suffix` varchar(10) DEFAULT NULL,
  `Gender` varchar(20) DEFAULT NULL,
  `PositionID` int(11) NOT NULL,
  `DepartmentID` int(11) NOT NULL,
  `ContactNumber` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `BiometricStatus` enum('Enrolled','Not Enrolled') DEFAULT 'Not Enrolled',
  `Status` enum('Active','Inactive') DEFAULT 'Active',
  `AssignedSupervisorID` int(11) DEFAULT NULL,
  `Finger1` tinyint(1) DEFAULT 0 COMMENT 'Fingerprint 1 enrolled status',
  `Finger2` tinyint(1) DEFAULT 0 COMMENT 'Fingerprint 2 enrolled status'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`EmployeeID`, `EmployeeNumber`, `FirstName`, `MiddleName`, `LastName`, `Suffix`, `Gender`, `PositionID`, `DepartmentID`, `ContactNumber`, `Email`, `BiometricStatus`, `Status`, `AssignedSupervisorID`, `Finger1`, `Finger2`) VALUES
(1, '2022110001', 'Joshua', 'Salvaria', 'Baguio', NULL, 'Male', 1, 2, '09659069309', 'baguio.joshua2004@gmail.com', 'Enrolled', 'Active', NULL, 0, 0),
(3, '2022110002', 'Joshua', 'R.', 'Roble', NULL, 'Male', 1, 2, '09123456890', 'joshua.roble@example.com', 'Enrolled', 'Active', 1, 1, 1),
(4, '2022110003', 'Florence', 'F.', 'Salem', 'Jr.', 'Male', 1, 2, '09345674749', 'salem.florence@example.com', 'Enrolled', 'Active', 1, 1, 0),
(5, '2022110004', 'Pamela', 'V.', 'Almonia', NULL, 'Female', 1, 1, '09896758365', 'pamela.almonia@example.com', 'Enrolled', 'Active', 1, 1, 0),
(6, '2022110006', 'Ardiano', 'M.', 'Recaforte', NULL, 'Male', 2, 2, '09567382923', 'recaforte.ardiano@example.com', 'Not Enrolled', 'Inactive', 4, 0, 0),
(7, '202210007', 'Marlou', 'Flores', 'Dalapag', '', 'Non-binary', 3, 3, '09896758365', 'marlou.dalapag@gmail.com', 'Not Enrolled', 'Inactive', 4, 0, 0),
(8, '202210008', 'Juan', 'Dela', 'Cruz', '', 'Male', 1, 1, '09764748291', 'juan.delacruz@gmail.com', 'Not Enrolled', 'Inactive', 1, 1, 0),
(9, '202210009', 'Mikhail', 'A.', 'Walpurgis', '', 'Male', 3, 3, '09634627689', 'walpurgis.mikhail@gmail.com', 'Enrolled', 'Active', 3, 1, 1),
(10, '202210010', 'Vlad', 'H', 'Sora', '', 'Female', 2, 3, '09645327845', 'vlad.sora@gmail.com', 'Enrolled', 'Active', 3, 1, 0),
(11, '202210011', 'Jose', 'P', 'Rizal', '', 'Male', 1, 1, '09784652381', 'jose.rizal@gmail.com', 'Not Enrolled', 'Inactive', 4, 0, 1),
(12, '202210012', 'Unknown', '', 'Employee', '', 'Not Specified', 1, 1, 'Not Provided', 'no-email@example.com', 'Enrolled', 'Active', 4, 0, 0),
(13, '202210013', 'David', 'L.', 'Kushner', '', 'Male', 1, 3, '09654345231', 'david.kushner@gmail.com', 'Enrolled', 'Active', 1, 0, 1),
(14, '202210014', 'Taylor', 'A.', 'Swift', '', 'Female', 3, 1, 'Not Provided', 'no-email@example.com', 'Enrolled', 'Active', 4, 1, 1),
(15, '202210015', 'Emilio', '', 'Aguinaldo', '', 'Male', 1, 3, '09864747368', '--', 'Not Enrolled', 'Active', 3, 0, 0),
(16, '202210016', 'Andres', '', 'Bonifacio', '', 'Male', 3, 3, '09673462754', '--', 'Enrolled', 'Active', 1, 1, 1),
(17, '202210017', 'Melchora', '', 'Aquino', '', 'Female', 1, 1, '09735829576', '--', 'Enrolled', 'Active', 4, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `jobposition`
--

CREATE TABLE `jobposition` (
  `PositionID` int(11) NOT NULL,
  `PositionName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobposition`
--

INSERT INTO `jobposition` (`PositionID`, `PositionName`) VALUES
(2, 'Probationary'),
(1, 'Regular'),
(3, 'Reliever');

-- --------------------------------------------------------

--
-- Table structure for table `overtime` (UPDATED WITH NEW COLUMNS)
--

CREATE TABLE `overtime` (
  `OvertimeID` int(11) NOT NULL,
  `AttendanceID` int(11) NOT NULL,
  `OvertimeStart` time DEFAULT NULL COMMENT 'Estimated overtime start time',
  `OvertimeEnd` time DEFAULT NULL COMMENT 'Estimated overtime end time',
  `OvertimeHours` decimal(5,2) DEFAULT NULL,
  `OvertimeReason` varchar(255) DEFAULT NULL,
  `ActualStart` time DEFAULT NULL COMMENT 'Actual overtime start time (when employee clocks in for overtime)',
  `ActualEnd` time DEFAULT NULL COMMENT 'Actual overtime end time (when employee clocks out from overtime)',
  `ActualHours` decimal(5,2) DEFAULT NULL COMMENT 'Actual overtime hours worked (calculated from ActualStart to ActualEnd)',
  `Status` enum('Pending','In Progress','Completed','Cancelled') DEFAULT 'Pending' COMMENT 'Current status of overtime request',
  `DateApplied` date DEFAULT NULL,
  `DateCompleted` date DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `request`
--

CREATE TABLE `request` (
  `RequestID` int(11) NOT NULL,
  `EmployeeID` int(11) DEFAULT NULL,
  `EmployeeName` varchar(100) DEFAULT NULL,
  `Supervisor` varchar(100) DEFAULT NULL,
  `Department` varchar(100) DEFAULT NULL,
  `RequestType` varchar(100) DEFAULT NULL,
  `Status` enum('Pending','Approved','Disapproved') DEFAULT 'Pending',
  `DateApplied` date DEFAULT NULL,
  `DateApproved` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shift`
--

CREATE TABLE `shift` (
  `ShiftID` int(11) NOT NULL,
  `ShiftName` varchar(100) NOT NULL,
  `ShiftTime` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shift`
--

INSERT INTO `shift` (`ShiftID`, `ShiftName`, `ShiftTime`) VALUES
(1, 'Morning Shift', 'Sat 10AM - 6PM / Sun-Fri 6AM - 6PM'),
(2, 'Night Shift', '6PM - 6AM');

-- --------------------------------------------------------

--
-- Table structure for table `shift_dayoff`
--

CREATE TABLE `shift_dayoff` (
  `DayOffID` int(11) NOT NULL,
  `ScheduleID` int(11) NOT NULL,
  `DayOffDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shift_dayoff`
--

INSERT INTO `shift_dayoff` (`DayOffID`, `ScheduleID`, `DayOffDate`) VALUES
(1, 1, '2025-08-20'),
(2, 2, '2025-09-01'),
(3, 6, '2025-08-23'),
(4, 7, '2025-08-25'),
(5, 8, '2025-08-25'),
(6, 9, '2025-08-26'),
(7, 10, '2025-08-28'),
(8, 12, '2025-08-25'),
(9, 13, '2025-08-29'),
(10, 14, '2025-08-26'),
(11, 15, '2025-08-28'),
(12, 17, '2025-09-01'),
(13, 18, '2025-08-30'),
(14, 19, '2025-08-30');

-- --------------------------------------------------------

--
-- Table structure for table `shift_schedule`
--

CREATE TABLE `shift_schedule` (
  `ScheduleID` int(11) NOT NULL,
  `EmployeeID` int(11) NOT NULL,
  `ShiftID` int(11) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `AreaAssigned` varchar(100) DEFAULT NULL,
  `TeamLeader` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shift_schedule`
--

INSERT INTO `shift_schedule` (`ScheduleID`, `EmployeeID`, `ShiftID`, `StartDate`, `EndDate`, `AreaAssigned`, `TeamLeader`) VALUES
(1, 1, 1, '2025-08-16', '2025-08-22', NULL, NULL),
(2, 3, 2, '2025-09-01', '2025-09-07', NULL, NULL),
(3, 1, 2, '2025-08-23', '2025-08-29', 'Team Leader', NULL),
(4, 16, 2, '2025-08-23', '2025-08-29', 'Admin Team', NULL),
(5, 8, 2, '2025-08-23', '2025-08-29', 'Network Support', NULL),
(6, 14, 2, '2025-08-23', '2025-08-29', 'Quality Control', NULL),
(7, 13, 2, '2025-08-23', '2025-08-29', 'Packaging', NULL),
(8, 3, 2, '2025-08-23', '2025-08-29', 'Team Leader', NULL),
(9, 11, 2, '2025-08-23', '2025-08-29', 'Admin Team', NULL),
(10, 7, 2, '2025-08-23', '2025-08-29', 'Packaging', NULL),
(11, 5, 1, '2025-08-23', '2025-08-29', 'Team Leader', NULL),
(12, 7, 1, '2025-08-23', '2025-08-29', 'Admin Team', 'ALMONIA, PAMELA V.'),
(13, 11, 1, '2025-08-23', '2025-08-29', 'Packaging', NULL),
(14, 13, 1, '2025-08-23', '2025-08-29', 'Software Development', 'ALMONIA, PAMELA V.'),
(15, 10, 1, '2025-08-23', '2025-08-29', 'Network Support', NULL),
(16, 1, 1, '2025-08-30', '2025-09-05', 'Team Leader', NULL),
(17, 8, 1, '2025-08-30', '2025-09-05', 'Network Support', NULL),
(18, 9, 1, '2025-08-30', '2025-09-05', 'Packaging', NULL),
(19, 13, 1, '2025-08-30', '2025-09-05', 'Software Development', 'BAGUIO, JOSHUA SALVARIA');

-- --------------------------------------------------------

--
-- Table structure for table `supervisors`
--

CREATE TABLE `supervisors` (
  `EmployeeID` int(11) NOT NULL,
  `PromotedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supervisors`
--

INSERT INTO `supervisors` (`EmployeeID`, `PromotedAt`) VALUES
(1, '2025-07-19 07:54:43'),
(3, '2025-07-30 03:37:11'),
(4, '2025-07-19 07:51:59');

-- --------------------------------------------------------

--
-- Table structure for table `useraccount`
--

CREATE TABLE `useraccount` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` enum('Admin','Superadmin','Timekeeper','Supervisor') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_employee_display`
-- (See below for the actual view)
--
CREATE TABLE `view_employee_display` (
`EmployeeID` int(11)
,`EmployeeNumber` varchar(9)
,`FullName` varchar(153)
,`DepartmentName` varchar(50)
,`Email` varchar(100)
);

-- --------------------------------------------------------

--
-- Structure for view `view_employee_display`
--
DROP TABLE IF EXISTS `view_employee_display`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_employee_display`  AS SELECT `e`.`EmployeeID` AS `EmployeeID`, concat('20221',lpad(`e`.`EmployeeID`,4,'0')) AS `EmployeeNumber`, concat(`e`.`LastName`,', ',`e`.`FirstName`,' ',ifnull(`e`.`MiddleName`,'')) AS `FullName`, `d`.`DepartmentName` AS `DepartmentName`, `e`.`Email` AS `Email` FROM (`employee` `e` join `department` `d` on(`e`.`DepartmentID` = `d`.`DepartmentID`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`AreaID`),
  ADD KEY `fk_area_department` (`DepartmentID`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`AttendanceID`),
  ADD KEY `StatusID` (`StatusID`),
  ADD KEY `idx_date` (`Date`),
  ADD KEY `idx_employee_date` (`EmployeeID`,`Date`);

--
-- Indexes for table `attendancestatus`
--
ALTER TABLE `attendancestatus`
  ADD PRIMARY KEY (`StatusID`),
  ADD UNIQUE KEY `StatusName` (`StatusName`);

--
-- Indexes for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD PRIMARY KEY (`LogID`),
  ADD KEY `EmployeeID` (`EmployeeID`),
  ADD KEY `DeviceID` (`DeviceID`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`DepartmentID`),
  ADD UNIQUE KEY `DepartmentName` (`DepartmentName`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`DeviceID`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`EmployeeID`),
  ADD UNIQUE KEY `EmployeeNumber` (`EmployeeNumber`),
  ADD KEY `PositionID` (`PositionID`),
  ADD KEY `DepartmentID` (`DepartmentID`),
  ADD KEY `fk_assigned_supervisor` (`AssignedSupervisorID`);

--
-- Indexes for table `jobposition`
--
ALTER TABLE `jobposition`
  ADD PRIMARY KEY (`PositionID`),
  ADD UNIQUE KEY `PositionName` (`PositionName`);

--
-- Indexes for table `overtime`
--
ALTER TABLE `overtime`
  ADD PRIMARY KEY (`OvertimeID`),
  ADD KEY `AttendanceID` (`AttendanceID`),
  ADD KEY `idx_overtime_attendance_status` (`AttendanceID`, `Status`),
  ADD KEY `idx_overtime_date` (`DateApplied`);

--
-- Indexes for table `request`
--
ALTER TABLE `request`
  ADD PRIMARY KEY (`RequestID`),
  ADD KEY `EmployeeID` (`EmployeeID`);

--
-- Indexes for table `shift`
--
ALTER TABLE `shift`
  ADD PRIMARY KEY (`ShiftID`);

--
-- Indexes for table `shift_dayoff`
--
ALTER TABLE `shift_dayoff`
  ADD PRIMARY KEY (`DayOffID`),
  ADD KEY `fk_dayoff_schedule` (`ScheduleID`);

--
-- Indexes for table `shift_schedule`
--
ALTER TABLE `shift_schedule`
  ADD PRIMARY KEY (`ScheduleID`),
  ADD KEY `fk_schedule_employee` (`EmployeeID`),
  ADD KEY `fk_schedule_shift` (`ShiftID`);

--
-- Indexes for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD PRIMARY KEY (`EmployeeID`);

--
-- Indexes for table `useraccount`
--
ALTER TABLE `useraccount`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `area`
--
ALTER TABLE `area`
  MODIFY `AreaID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `AttendanceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `attendancestatus`
--
ALTER TABLE `attendancestatus`
  MODIFY `StatusID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  MODIFY `LogID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `DepartmentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `EmployeeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `jobposition`
--
ALTER TABLE `jobposition`
  MODIFY `PositionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `overtime`
--
ALTER TABLE `overtime`
  MODIFY `OvertimeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `request`
--
ALTER TABLE `request`
  MODIFY `RequestID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shift`
--
ALTER TABLE `shift`
  MODIFY `ShiftID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shift_dayoff`
--
ALTER TABLE `shift_dayoff`
  MODIFY `DayOffID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `shift_schedule`
--
ALTER TABLE `shift_schedule`
  MODIFY `ScheduleID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `useraccount`
--
ALTER TABLE `useraccount`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `area`
--
ALTER TABLE `area`
  ADD CONSTRAINT `fk_area_department` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`DepartmentID`);

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`),
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`StatusID`) REFERENCES `attendancestatus` (`StatusID`);

--
-- Constraints for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD CONSTRAINT `attendance_logs_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`),
  ADD CONSTRAINT `attendance_logs_ibfk_2` FOREIGN KEY (`DeviceID`) REFERENCES `devices` (`DeviceID`);

--
-- Constraints for table `employee`
--
ALTER TABLE `employee`
  ADD CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`PositionID`) REFERENCES `jobposition` (`PositionID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_ibfk_2` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`DepartmentID`),
  ADD CONSTRAINT `fk_assigned_supervisor` FOREIGN KEY (`AssignedSupervisorID`) REFERENCES `supervisors` (`EmployeeID`);

--
-- Constraints for table `overtime`
--
ALTER TABLE `overtime`
  ADD CONSTRAINT `overtime_ibfk_1` FOREIGN KEY (`AttendanceID`) REFERENCES `attendance` (`AttendanceID`);

--
-- Constraints for table `request`
--
ALTER TABLE `request`
  ADD CONSTRAINT `request_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`);

--
-- Constraints for table `shift_dayoff`
--
ALTER TABLE `shift_dayoff`
  ADD CONSTRAINT `fk_dayoff_schedule` FOREIGN KEY (`ScheduleID`) REFERENCES `shift_schedule` (`ScheduleID`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
