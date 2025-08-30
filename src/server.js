const express = require('express');
const getRawBody = require('raw-body');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// Parse raw body for biometric POSTs
app.use((req, res, next) => {
  if (req.method === 'POST' && req.url.startsWith('/iclock/cdata')) {
    getRawBody(req, {
      length: req.headers['content-length'],
      limit: '1mb',
      encoding: true,
    }, (err, string) => {
      if (err) return next(err);
      req.rawBody = string;
      next();
    });
  } else {
    next();
  }
});

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'slice_bread',
});

// Secondary pool: kiosk OT verification database (separate from attendance)
const kioskPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kiosk_ot',
});


// Start biometric verification
app.post('/api/kiosk-ot/verification/start', async (req, res) => {
  try {
    const { employeeNumber, type } = req.body;

    // 🔍 Lookup EmployeeID from slice_bread
    const [empRows] = await pool.query(
      `SELECT EmployeeID FROM employee WHERE EmployeeNumber = ?`,
      [employeeNumber]
    );

    if (empRows.length === 0) {
      return res.json({ success: false, error: "Employee not found" });
    }

    const empId = empRows[0].EmployeeID;

    // Insert into pending_verifications
    const [result] = await kioskPool.query(
      `INSERT INTO pending_verifications (EmployeeID, VerificationType, ExpiresAt)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE))`,
      [empId, type || "Leave"]
    );

    return res.json({
      success: true,
      pending: { PendingID: result.insertId, EmployeeID: empId }
    });
  } catch (err) {
    console.error("❌ Error starting verification:", err.message);
    return res.status(500).json({ success: false, error: "Failed to start verification" });
  }
});



// 📄 Poll Biometric Verification (Kiosk)
app.get('/api/kiosk-ot/verification/poll', async (req, res) => {
  try {
    const { pendingId } = req.query;
    if (!pendingId) {
      return res.status(400).json({ success: false, error: 'Missing pendingId' });
    }

    // 🔍 Check biometric_verifications
    const [rows] = await kioskPool.query(
      `SELECT bv.*, pv.Status AS PendingStatus
       FROM biometric_verifications bv
       LEFT JOIN pending_verifications pv ON bv.PendingID = pv.PendingID
       WHERE bv.PendingID = ? LIMIT 1`,
      [pendingId]
    );

    if (rows.length === 0) {
      return res.json({ success: false, status: 'Pending' });
    }

    const verification = rows[0];

    // 🔍 Get EmployeeNumber + Name from main DB
    const [empRows] = await pool.query(
      `SELECT EmployeeNumber, CONCAT(FirstName, ' ', LastName) AS FullName
       FROM employee WHERE EmployeeID = ?`,
      [verification.EmployeeID]
    );

    const emp = empRows.length ? empRows[0] : { EmployeeNumber: null, FullName: null };

    return res.json({
      success: true,
      verification: {
        ...verification,
        EmployeeNumber: emp.EmployeeNumber,
        FullName: emp.FullName
      }
    });
  } catch (error) {
    console.error('❌ Error polling verification:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to poll verification' });
  }
});


// Enhanced function to check if employee is scheduled to work on a specific date
async function isEmployeeScheduledToWork(employeeId, date) {
  try {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if employee has a shift schedule for this week that covers this date
    const [shiftRows] = await pool.query(`
      SELECT ss.*, sd.DayOffDate,
        s.ShiftName,
        DAYOFWEEK(?) as checkDayOfWeek,
        DAYOFWEEK(ss.StartDate) as scheduleStartDay
      FROM shift_schedule ss 
      JOIN shift s ON ss.ShiftID = s.ShiftID
      LEFT JOIN shift_dayoff sd ON ss.ScheduleID = sd.ScheduleID AND sd.DayOffDate = ?
      WHERE ss.EmployeeID = ? 
        AND ? BETWEEN ss.StartDate AND ss.EndDate
    `, [date, date, employeeId, date]);
    
    if (shiftRows.length === 0) {
      console.log(`No shift schedule found for employee ${employeeId} on ${date}`);
      return { 
        isScheduled: false, 
        reason: 'No shift schedule found',
        scheduledShift: null 
      };
    }
    
    const schedule = shiftRows[0];
    
    // Check if this date is marked as a day off
    if (schedule.DayOffDate) {
      console.log(`Employee ${employeeId} has day off on ${date}`);
      return { 
        isScheduled: false, 
        reason: 'Scheduled day off',
        scheduledShift: schedule.ShiftName 
      };
    }
    
    console.log(`Employee ${employeeId} is scheduled to work on ${date} - Shift: ${schedule.ShiftName}`);
    return { 
      isScheduled: true, 
      reason: 'Scheduled to work',
      scheduledShift: schedule.ShiftName 
    };
    
  } catch (err) {
    console.error('Error checking employee schedule:', err);
    return { 
      isScheduled: false, 
      reason: 'Database error',
      scheduledShift: null 
    };
  }
}

// Function to check if employee clocked in late
function checkIfLate(clockInTime, scheduledShiftTime, detectedShift) {
  try {
    const [clockHour, clockMin] = clockInTime.split(':').map(Number);
    const clockInMinutes = clockHour * 60 + clockMin;
    
    let scheduledMinutes;
    
    // Determine scheduled start time based on shift
    if (detectedShift.toLowerCase().includes('morning')) {
      // Check if it's Saturday (different schedule)
      const today = new Date();
      const isSaturday = today.getDay() === 6;
      
      if (isSaturday) {
        scheduledMinutes = 10 * 60; // 10:00 AM for Saturday
      } else {
        scheduledMinutes = 6 * 60; // 6:00 AM for weekdays
      }
    } else if (detectedShift.toLowerCase().includes('night')) {
      scheduledMinutes = 18 * 60; // 6:00 PM for night shift
    } else {
      return false; // Unknown shift, don't mark as late
    }
    
    // Add 10-minute grace period
    const graceMinutes = scheduledMinutes + 10;
    
    // Handle cross-midnight scenarios for night shift
    if (detectedShift.toLowerCase().includes('night') && clockInMinutes < 12 * 60) {
      // If clock in time is before noon, it might be next day morning (invalid for night shift start)
      return true;
    }
    
    return clockInMinutes > graceMinutes;
    
  } catch (error) {
    console.error('Error checking late status:', error);
    return false;
  }
}

// Enhanced function to determine appropriate status based on schedule validation
function determineAttendanceStatus(isScheduledResult, detectedShift) {
  if (!isScheduledResult.isScheduled) {
    return {
      statusId: 4, // Invalid status
      statusReason: `Invalid: ${isScheduledResult.reason}`,
      isValid: false
    };
  }
  
  // Check if the detected shift matches the scheduled shift
  const scheduledShift = isScheduledResult.scheduledShift || '';
  const isNightShift = detectedShift.toLowerCase().includes('night');
  const scheduledIsNight = scheduledShift.toLowerCase().includes('night');
  
  if (isNightShift !== scheduledIsNight) {
    return {
      statusId: 4, // Invalid
      statusReason: `Invalid: Clocked in for ${detectedShift} but scheduled for ${scheduledShift}`,
      isValid: false
    };
  }
   // Check for late attendance (10 minutes grace period)
  const isLate = checkIfLate(clockInTime, scheduledShiftTime, detectedShift);
  
  if (isLate) {
    return {
      statusId: 3, // Late status (assuming StatusID 3 is "Late")
      statusReason: 'Late attendance',
      isValid: true
    };
  }
  
  return {
    statusId: 1, // Valid/Present status
    statusReason: 'Present - On time',
    isValid: true
  };
}

// Original function for backward compatibility
function determineAttendanceStatus(isScheduledResult, detectedShift) {
  if (!isScheduledResult.isScheduled) {
    return {
      statusId: 4, // Invalid status
      statusReason: `Invalid: ${isScheduledResult.reason}`,
      isValid: false
    };
  }
  
  // Check if the detected shift matches the scheduled shift
  const scheduledShift = isScheduledResult.scheduledShift || '';
  const isNightShift = detectedShift.toLowerCase().includes('night');
  const scheduledIsNight = scheduledShift.toLowerCase().includes('night');
  
  if (isNightShift !== scheduledIsNight) {
    return {
      statusId: 4, // Invalid
      statusReason: `Invalid: Clocked in for ${detectedShift} but scheduled for ${scheduledShift}`,
      isValid: false
    };
  }
  
  return {
    statusId: 1, // Valid attendance
    statusReason: 'Valid attendance',
    isValid: true
  };
}

// Enhanced Shift Detection Functions
function determineShiftFromTime(time) {
  const [hours] = time.split(':').map(Number);
  
  // Time-based shift detection rules
  if (hours >= 6 && hours < 18) {
    return 'Morning Shift';
  } else {
    return 'Night Shift';
  }
}

// Check if employee has a scheduled shift for that date
async function getScheduledShift(employeeId, date) {
  try {
    const [shiftRows] = await pool.query(`
      SELECT s.ShiftName 
      FROM shift_schedule ss 
      JOIN shift s ON ss.ShiftID = s.ShiftID 
      WHERE ss.EmployeeID = ? AND ? BETWEEN ss.StartDate AND ss.EndDate
    `, [employeeId, date]);
    
    if (shiftRows.length > 0) {
      const shiftName = shiftRows[0].ShiftName;
      // Convert database shift names to display format
      if (shiftName.toLowerCase().includes('morning')) {
        return 'Morning Shift';
      } else if (shiftName.toLowerCase().includes('night')) {
        return 'Night Shift';
      }
    }
    
    // Fallback to time-based detection if no scheduled shift found
    return null;
  } catch (err) {
    console.error('Error getting scheduled shift:', err);
    return null;
  }
}

// Enhanced function to check if time matches scheduled shift
function isTimeMatchingScheduledShift(scheduledShift, clockInTime) {
  const [hours] = clockInTime.split(':').map(Number);
  const isClockInMorning = hours >= 6 && hours < 18;
  const isScheduledMorning = scheduledShift && scheduledShift.toLowerCase().includes('morning');
  
  return isClockInMorning === isScheduledMorning;
}

// Function to mark employees as absent at end of shift
async function markAbsentEmployees() {
  try {
    console.log('Running absent employee check...');
    
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const currentTime = today.toTimeString().slice(0, 8);
    
    // Get all employees who should have worked today but haven't clocked in
    const [scheduledEmployees] = await pool.query(`
      SELECT DISTINCT
        ss.EmployeeID,
        e.EmployeeNumber,
        CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName,
        s.ShiftName,
        s.ShiftTime,
        ss.StartDate,
        ss.EndDate
      FROM shift_schedule ss
      JOIN employee e ON ss.EmployeeID = e.EmployeeID
      JOIN shift s ON ss.ShiftID = s.ShiftID
      LEFT JOIN shift_dayoff sd ON ss.ScheduleID = sd.ScheduleID AND sd.DayOffDate = ?
      WHERE ? BETWEEN ss.StartDate AND ss.EndDate
        AND sd.DayOffDate IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM attendance a 
          WHERE a.EmployeeID = ss.EmployeeID 
            AND a.Date = ?
        )
    `, [todayStr, todayStr, todayStr]);

    console.log(`Found ${scheduledEmployees.length} employees who should have worked today but haven't clocked in`);

    for (const emp of scheduledEmployees) {
      const isNightShift = emp.ShiftName.toLowerCase().includes('night');
      const isMorningShift = emp.ShiftName.toLowerCase().includes('morning');
      
      let shiftEndTime;
      let shouldMarkAbsent = false;
      
      if (isMorningShift) {
        // Morning shift ends at 6:00 PM (18:00)
        shiftEndTime = '18:00:00';
        shouldMarkAbsent = currentTime > shiftEndTime;
      } else if (isNightShift) {
        // Night shift ends at 6:00 AM next day
        // For night shift, we check the next day morning
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
        
        // If it's past 6:00 AM the next day, mark as absent
        if (todayStr === tomorrowStr && currentTime > '06:00:00') {
          shouldMarkAbsent = true;
        }
        // If we're still on the same day but past midnight, don't mark yet
        else if (todayStr === emp.StartDate && currentTime < '06:00:00') {
          shouldMarkAbsent = false;
        }
        // If it's the day after the shift and past 6 AM, mark absent
        else {
          shouldMarkAbsent = true;
        }
      }

      if (shouldMarkAbsent) {
        try {
          // Insert absent record
          await pool.query(`
            INSERT INTO attendance (EmployeeID, Date, ClockIn, ClockOut, StatusID, Shift, TotalHours, Remarks)
            VALUES (?, ?, NULL, NULL, 2, ?, '00:00:00', 'Marked absent - No attendance recorded')
          `, [emp.EmployeeID, todayStr, emp.ShiftName]);
          
          console.log(`Marked as absent: ${emp.EmployeeName} (${emp.EmployeeNumber}) - ${emp.ShiftName}`);
        } catch (insertErr) {
          console.error(`Error marking ${emp.EmployeeName} as absent:`, insertErr.message);
        }
      }
    }
    
    console.log('Absent employee check completed');
    
  } catch (error) {
    console.error('Error in markAbsentEmployees function:', error);
  }
}

// Create the missing determineAttendanceStatusWithLate function
function determineAttendanceStatusWithLate(isScheduledResult, detectedShift, clockInTime, scheduledShiftTime) {
  if (!isScheduledResult.isScheduled) {
    return {
      statusId: 4, // Invalid status
      statusReason: `Invalid: ${isScheduledResult.reason}`,
      isValid: false
    };
  }
  
  // Check if the detected shift matches the scheduled shift
  const scheduledShift = isScheduledResult.scheduledShift || '';
  const isNightShift = detectedShift.toLowerCase().includes('night');
  const scheduledIsNight = scheduledShift.toLowerCase().includes('night');
  
  if (isNightShift !== scheduledIsNight) {
    return {
      statusId: 4, // Invalid
      statusReason: `Invalid: Clocked in for ${detectedShift} but scheduled for ${scheduledShift}`,
      isValid: false
    };
  }
  
  // Check for late attendance (10 minutes grace period)
  const isLate = checkIfLate(clockInTime, scheduledShiftTime, detectedShift);
  
  if (isLate) {
    return {
      statusId: 3, // Late status
      statusReason: 'Late attendance',
      isValid: true
    };
  }
  
  return {
    statusId: 1, // Valid/Present status
    statusReason: 'Present - On time',
    isValid: true
  };
}

// Also need to fix the checkIfLate function to handle the date properly
function checkIfLate(clockInTime, scheduledShiftTime, detectedShift) {
  try {
    const [clockHour, clockMin] = clockInTime.split(':').map(Number);
    const clockInMinutes = clockHour * 60 + clockMin;
    
    let scheduledMinutes;
    
    // Determine scheduled start time based on shift
    if (detectedShift.toLowerCase().includes('morning')) {
      // Check if it's Saturday (different schedule)
      const today = new Date();
      const isSaturday = today.getDay() === 6;
      
      if (isSaturday) {
        scheduledMinutes = 10 * 60; // 10:00 AM for Saturday
      } else {
        scheduledMinutes = 6 * 60; // 6:00 AM for weekdays
      }
    } else if (detectedShift.toLowerCase().includes('night')) {
      scheduledMinutes = 18 * 60; // 6:00 PM for night shift
    } else {
      return false; // Unknown shift, don't mark as late
    }
    
    // Add 10-minute grace period
    const graceMinutes = scheduledMinutes + 10;
    
    // Handle cross-midnight scenarios for night shift
    if (detectedShift.toLowerCase().includes('night') && clockInMinutes < 12 * 60) {
      // If clock in time is before noon, it might be next day morning (invalid for night shift start)
      return true;
    }
    
    return clockInMinutes > graceMinutes;
    
  } catch (error) {
    console.error('Error checking late status:', error);
    return false;
  }
}

// Remove the duplicate determineAttendanceStatus function and keep only this enhanced version
function determineAttendanceStatus(isScheduledResult, detectedShift) {
  if (!isScheduledResult.isScheduled) {
    return {
      statusId: 4, // Invalid status
      statusReason: `Invalid: ${isScheduledResult.reason}`,
      isValid: false
    };
  }
  
  // Check if the detected shift matches the scheduled shift
  const scheduledShift = isScheduledResult.scheduledShift || '';
  const isNightShift = detectedShift.toLowerCase().includes('night');
  const scheduledIsNight = scheduledShift.toLowerCase().includes('night');
  
  if (isNightShift !== scheduledIsNight) {
    return {
      statusId: 4, // Invalid
      statusReason: `Invalid: Clocked in for ${detectedShift} but scheduled for ${scheduledShift}`,
      isValid: false
    };
  }
  
  return {
    statusId: 1, // Valid attendance
    statusReason: 'Valid attendance',
    isValid: true
  };
}

// Enhanced Biometric Data Handler with Late Detection
app.post('/iclock/cdata', async (req, res) => {
  const raw = (req.rawBody || '').trim();
  console.log('/iclock/cdata received:', raw);

  if (raw.startsWith('OPLOG')) return res.send('OK');

  const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length >= 3) {
      const [pin, date, time] = parts;
      const employeeId = parseInt(pin);

      try {
        // Divert scan to kiosk_ot verification if a pending window exists
        try {
          const [pend] = await kioskPool.query(
            `SELECT PendingID, VerificationType FROM pending_verifications
             WHERE EmployeeID = ? AND Status = 'Pending' AND (ExpiresAt IS NULL OR ExpiresAt >= NOW())
             ORDER BY PendingID DESC LIMIT 1`,
            [employeeId]
          );
          if (pend.length > 0) {
            const pending = pend[0];
            await kioskPool.query(
              `INSERT INTO biometric_verifications (EmployeeID, VerificationType, DeviceID, SourceDate, SourceTime, PendingID)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [employeeId, pending.VerificationType || 'Overtime', null, date, time, pending.PendingID]
            );
            await kioskPool.query('UPDATE pending_verifications SET Status = "Completed" WHERE PendingID = ?', [pending.PendingID]);
            console.log(`Diverted scan to kiosk_ot verification for employee ${employeeId}`);
            continue; // Do not touch attendance for this scan
          }
        } catch (divErr) {
          console.error('kiosk_ot diversion error:', divErr.message);
        }

        // First check if employee is scheduled to work on this date
        const scheduleCheck = await isEmployeeScheduledToWork(employeeId, date);
        
        // Get scheduled shift or determine from time
        let detectedShift = await getScheduledShift(employeeId, date);
        if (!detectedShift) {
          detectedShift = determineShiftFromTime(time);
        }

        // Check if already clocked in without clocking out
        const [existing] = await pool.query(`
          SELECT AttendanceID, ClockIn, StatusID FROM attendance 
          WHERE EmployeeID = ? AND Date = ? AND ClockOut IS NULL
          ORDER BY AttendanceID DESC LIMIT 1
        `, [employeeId, date]);

        if (existing.length === 0) {
          // No record → Clock In with validation and late check
          const statusResult = determineAttendanceStatusWithLate(
            scheduleCheck, 
            detectedShift, 
            time, 
            scheduleCheck.scheduledShift
          );

          await pool.query(`
            INSERT INTO attendance (EmployeeID, Date, ClockIn, StatusID, Shift, Remarks)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              employeeId, 
              date, 
              time, 
              statusResult.statusId, 
              detectedShift,
              statusResult.isValid ? (statusResult.statusId === 3 ? 'Late arrival' : null) : statusResult.statusReason
            ]
          );
          
          console.log(`ClockIn recorded: ${employeeId} at ${date} ${time}`);
          console.log(`   Shift: ${detectedShift} | Status: ${statusResult.statusReason}`);
          
          // Log invalid attendance for monitoring
          if (!statusResult.isValid) {
            console.warn(`INVALID ATTENDANCE: Employee ${employeeId} - ${statusResult.statusReason}`);
          }
          
        } else {
          // Already clocked in → this is ClockOut
          const clockIn = existing[0].ClockIn;
          const clockOut = time;
          const currentStatusId = existing[0].StatusID;

          // Compute total hours with cross-midnight support
          const [h1, m1, s1] = clockIn.split(':').map(Number);
          const [h2, m2, s2] = clockOut.split(':').map(Number);
          const inSecs = h1 * 3600 + m1 * 60 + s1;
          let outSecs = h2 * 3600 + m2 * 60 + s2;
          
          // Handle cross-midnight scenarios
          if (outSecs < inSecs) {
            outSecs += 24 * 3600; // Add 24 hours for next day
          }
          
          const diff = Math.max(outSecs - inSecs, 0);
          const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
          const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
          const secs = String(diff % 60).padStart(2, '0');
          const totalHours = `${hrs}:${mins}:${secs}`;

          // Update with clock out, but preserve invalid status if it was already invalid
          const finalStatusId = currentStatusId === 4 ? 4 : (currentStatusId === 3 ? 3 : 1);
          let finalRemarks = null;
          
          if (currentStatusId === 4) {
            finalRemarks = `Invalid attendance - clocked out at ${clockOut}`;
          } else if (currentStatusId === 3) {
            finalRemarks = `Late arrival - clocked out at ${clockOut}`;
          }

          await pool.query(`
            UPDATE attendance 
            SET ClockOut = ?, TotalHours = ?, StatusID = ?, Remarks = ?
            WHERE AttendanceID = ?`,
            [clockOut, totalHours, finalStatusId, finalRemarks, existing[0].AttendanceID]
          );
          
          console.log(`ClockOut updated: ${employeeId} at ${clockOut} | Total: ${totalHours}`);
          if (finalStatusId === 4) {
            console.warn(`Clock out for INVALID attendance: Employee ${employeeId}`);
          } else if (finalStatusId === 3) {
            console.log(`Clock out for LATE attendance: Employee ${employeeId}`);
          }
        }
      } catch (err) {
        console.error('Attendance handling error:', err.message);
      }
    }
  }

  res.send('OK');
});

// Alternative endpoint for testing enhanced shift detection
app.post('/iclock/cdata-enhanced', async (req, res) => {
  const raw = (req.rawBody || '').trim();
  console.log('/iclock/cdata-enhanced received:', raw);

  if (raw.startsWith('OPLOG')) return res.send('OK');

  const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length >= 3) {
      const [pin, date, time] = parts;
      const employeeId = parseInt(pin);

      try {
        // First check if employee is scheduled to work on this date
        const scheduleCheck = await isEmployeeScheduledToWork(employeeId, date);
        
        // Get scheduled shift or determine from time
        let detectedShift = await getScheduledShift(employeeId, date);
        if (!detectedShift) {
          detectedShift = determineShiftFromTime(time);
        }

        // Determine attendance status based on schedule validation
        const statusResult = determineAttendanceStatus(scheduleCheck, detectedShift);

        // Check if already clocked in without clocking out
        const [existing] = await pool.query(`
          SELECT AttendanceID, ClockIn, StatusID FROM attendance 
          WHERE EmployeeID = ? AND Date = ? AND ClockOut IS NULL
          ORDER BY AttendanceID DESC LIMIT 1
        `, [employeeId, date]);

        if (existing.length === 0) {
          // No record → Clock In with validation
          await pool.query(`
            INSERT INTO attendance (EmployeeID, Date, ClockIn, StatusID, Shift, Remarks)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [employeeId, date, time, statusResult.statusId, detectedShift, statusResult.isValid ? null : statusResult.statusReason]
          );
          console.log(`ClockIn recorded: ${employeeId} at ${date} ${time} - Shift: ${detectedShift}`);
        } else {
          // Already clocked in → this is ClockOut
          const clockIn = existing[0].ClockIn;
          const clockOut = time;

          // Compute total hours with cross-midnight support
          const [h1, m1, s1] = clockIn.split(':').map(Number);
          const [h2, m2, s2] = clockOut.split(':').map(Number);
          const inSecs = h1 * 3600 + m1 * 60 + s1;
          let outSecs = h2 * 3600 + m2 * 60 + s2;
          
          // Handle cross-midnight scenarios for night shifts
          if (outSecs < inSecs) {
            outSecs += 24 * 3600; // Add 24 hours for next day
          }
          
          const diff = Math.max(outSecs - inSecs, 0);
          const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
          const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
          const secs = String(diff % 60).padStart(2, '0');
          const totalHours = `${hrs}:${mins}:${secs}`;

          await pool.query(`
            UPDATE attendance 
            SET ClockOut = ?, TotalHours = ?
            WHERE AttendanceID = ?`,
            [clockOut, totalHours, existing[0].AttendanceID]
          );
          console.log(`ClockOut updated: ${employeeId} at ${clockOut} | Total: ${totalHours}`);
        }
      } catch (err) {
        console.error('Attendance handling error:', err.message);
      }
    }
  }

  res.send('OK');
});

app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.EmployeeID,
        e.EmployeeNumber AS id,
        CONCAT(e.LastName, ', ', e.FirstName, ' ', IFNULL(e.MiddleName, '')) AS name,
        e.Gender AS gender,
        j.PositionName AS position,
        d.DepartmentName AS department,
        e.ContactNumber AS contact,
        e.Email AS email,
        e.BiometricStatus AS biometric,
        e.Status AS status,
        e.Finger1,
        e.Finger2
      FROM employee e
      JOIN department d ON e.DepartmentID = d.DepartmentID
      JOIN jobposition j ON e.PositionID = j.PositionID
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching employees:', err.message);
    res.status(500).json({ error: 'Failed to retrieve employees' });
  }
});



// 📄 Add New Employee
app.post('/api/employees', async (req, res) => {
  const emp = req.body;
  console.log('📝 Adding employee:', emp); // Debug log
  
  try {
    // Use BiometricStatus directly since BiometricEnrollmentComplete doesn't exist in database
    const biometricStatus = emp.BiometricStatus || 'Not Enrolled';
    
    // Handle override mode - use default values for missing fields
    const firstName = emp.FirstName || 'Unknown';
    const middleName = emp.MiddleName || '';
    const lastName = emp.LastName || 'Employee';
    const gender = emp.Gender || 'Not Specified';
    const positionID = emp.PositionID || 1; // Default to first position
    const departmentID = emp.DepartmentID || 1; // Default to first department
    const contactNumber = emp.ContactNumber || 'Not Provided';
    const email = emp.Email || '--';
    
    // 1. Insert employee WITHOUT EmployeeNumber
    const [result] = await pool.query(`
      INSERT INTO employee 
      (FirstName, MiddleName, LastName, Suffix, Gender, PositionID, DepartmentID, ContactNumber, Email, BiometricStatus, Status, AssignedSupervisorID, Finger1, Finger2)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      firstName,
      middleName,
      lastName,
      emp.Suffix || '',
      gender,
      positionID,
      departmentID,
      contactNumber,
      email,
      biometricStatus,
      emp.Status || 'Active',
      emp.AssignedSupervisorID || null,
      emp.Finger1 ? 1 : 0,  // Convert boolean to int
      emp.Finger2 ? 1 : 0   // Convert boolean to int
    ]);
    const newId = result.insertId;
    console.log('✅ Employee inserted with ID:', newId); // Debug log

    // 2. Generate EmployeeNumber (e.g., '20221' + leftpad(newId, 4, '0'))
    const employeeNumber = '20221' + String(newId).padStart(4, '0');

    // 3. Update the row with EmployeeNumber
    await pool.query(
      `UPDATE employee SET EmployeeNumber = ? WHERE EmployeeID = ?`,
      [employeeNumber, newId]
    );
    console.log('✅ EmployeeNumber updated:', employeeNumber); // Debug log

    res.status(201).json({ success: true, EmployeeID: newId, EmployeeNumber: employeeNumber });
  } catch (err) {
    console.error('❌ Error inserting employee:', err.message);
    console.error('❌ Full error details:', err); // More detailed error logging
    res.status(500).json({ error: 'Failed to add employee', details: err.message });
  }
});

// 📄 Update Employee
app.put('/api/employees/:id', async (req, res) => {
  const employeeId = req.params.id;
  const emp = req.body;
  console.log('📝 Updating employee:', employeeId, emp); // Debug log
  
  try {
    // Map position/department names to IDs
    let positionID = null;
    let departmentID = null;
    
    if (emp.position) {
      const [posResult] = await pool.query('SELECT PositionID FROM jobposition WHERE PositionName = ?', [emp.position]);
      positionID = posResult.length > 0 ? posResult[0].PositionID : null;
    }
    
    if (emp.department) {
      const [deptResult] = await pool.query('SELECT DepartmentID FROM department WHERE DepartmentName = ?', [emp.department]);
      departmentID = deptResult.length > 0 ? deptResult[0].DepartmentID : null;
    }
    
    // Determine BiometricStatus based on biometric enrollment complete checkbox or manual override
    let biometricStatus;
    if (emp.biometricStatus) {
      // Manual override - use the selected biometric status
      biometricStatus = emp.biometricStatus;
    } else {
      // Use biometric enrollment complete checkbox
      biometricStatus = emp.BiometricStatus || 'Not Enrolled';
    }
    
    // Update employee data
    const [result] = await pool.query(`
      UPDATE employee 
      SET FirstName = ?, MiddleName = ?, LastName = ?, Gender = ?, 
          PositionID = ?, DepartmentID = ?, ContactNumber = ?, Email = ?, 
          BiometricStatus = ?, Status = ?, Finger1 = ?, Finger2 = ?
      WHERE EmployeeID = ?
    `, [
      emp.firstName || emp.FirstName || '',
      emp.middleName || emp.MiddleName || '',
      emp.lastName || emp.LastName || '',
      emp.gender,
      positionID,
      departmentID,
      emp.contact,
      emp.email,
      biometricStatus,
      emp.status,
      emp.Finger1 ? 1 : 0,  // Convert boolean to int
      emp.Finger2 ? 1 : 0,  // Convert boolean to int
      employeeId
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    console.log('✅ Employee updated successfully'); // Debug log
    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (err) {
    console.error('❌ Error updating employee:', err.message);
    console.error('❌ Full error details:', err); // More detailed error logging
    res.status(500).json({ error: 'Failed to update employee', details: err.message });
  }
});


app.get("/api/attendance", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.AttendanceID,
        a.EmployeeID,
        e.EmployeeNumber AS IDNo,
        CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName,
        a.Date,
        CONCAT(s.FirstName, ' ', s.LastName) AS Supervisor,
        d.DepartmentName AS Department,
        DATE_FORMAT(a.ClockIn, '%r') AS TimeIn,
        DATE_FORMAT(a.ClockOut, '%r') AS TimeOut,
        TIME_FORMAT(a.TotalHours, '%H:%i:%s') AS Hours,
        st.StatusName AS Status,
        a.Shift
      FROM attendance a
      JOIN employee e ON a.EmployeeID = e.EmployeeID
      LEFT JOIN employee s ON e.AssignedSupervisorID = s.EmployeeID
      LEFT JOIN department d ON e.DepartmentID = d.DepartmentID
      LEFT JOIN attendancestatus st ON a.StatusID = st.StatusID
      ORDER BY a.Date DESC, a.ClockIn DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching attendance:", err.message);
    res.status(500).json({ error: "Failed to retrieve attendance" });
  }
});



// 📄 Get Requests
app.get('/api/request', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM request ORDER BY DateApplied DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching requests:', err.message);
    res.status(500).json({ error: 'Failed to retrieve requests' });
  }
});

// 📄 Get Overtime Requests (joined details for HR)
app.get('/api/request/overtime', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.RequestID,
        r.EmployeeID,
        r.EmployeeName,
        r.Supervisor,
        r.Department,
        r.Status,
        r.DateApplied,
        o.OvertimeID,
        o.OvertimeStart,
        o.OvertimeEnd,
        o.OvertimeHours,
        o.OvertimeReason,
        o.Status AS OTStatus,
        o.DateApplied AS OTDateApplied,
        o.ActualStart,
        o.ActualEnd,
        o.ActualHours,
        o.AttendanceID
      FROM request r
      LEFT JOIN overtime o ON o.RequestID = r.RequestID
      WHERE r.RequestType = 'Overtime'
      ORDER BY r.DateApplied DESC, r.RequestID DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching overtime requests:', err.message);
    res.status(500).json({ error: 'Failed to retrieve overtime requests' });
  }
});

// 📄 Create Overtime Request (used by kiosk UI after biometric verification)
app.post('/api/request/overtime', async (req, res) => {
  try {
    const { employeeNumber, reason, startTime, endTime, actualStart, actualEnd, date } = req.body;

    // Validate required fields
    if (!employeeNumber || !reason || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Use provided date or today
    const today = date || new Date().toISOString().slice(0, 10);

    // Fetch employee info by employeeNumber
    const [empRows] = await pool.query(`
      SELECT e.EmployeeID,
             e.EmployeeNumber,
             CONCAT(e.FirstName, ' ', e.LastName) AS FullName,
             d.DepartmentName,
             CONCAT(s.FirstName, ' ', s.LastName) AS SupervisorName
      FROM employee e
      LEFT JOIN department d ON e.DepartmentID = d.DepartmentID
      LEFT JOIN employee s ON e.AssignedSupervisorID = s.EmployeeID
      WHERE e.EmployeeNumber = ?
    `, [employeeNumber]);

    if (empRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const emp = empRows[0];

    // 🚫 Prevent duplicate OTs if Pending or Approved
    const [existingOt] = await pool.query(`
      SELECT * FROM overtime o
      JOIN request r ON r.RequestID = o.RequestID
      WHERE r.EmployeeID = ?
        AND r.RequestType = 'Overtime'
        AND r.Status IN ('Pending','Approved')
        AND o.OvertimeEnd >= NOW()
      ORDER BY o.OvertimeID DESC
      LIMIT 1
    `, [emp.EmployeeID]);

    if (existingOt.length > 0) {
      return res.json({
        success: false,
        error: "⚠️ You already have a pending or approved overtime request. Please wait until it's finished."
      });
    }

    // Insert request row
    const [reqResult] = await pool.query(`
      INSERT INTO request (
        EmployeeID, EmployeeName, Supervisor, Department, RequestType, Status, DateApplied, DateApproved
      ) VALUES (?, ?, ?, ?, 'Overtime', 'Pending', ?, NULL)
    `, [
      emp.EmployeeID,
      emp.FullName || 'N/A',
      emp.SupervisorName || 'N/A',
      emp.DepartmentName || 'N/A',
      today
    ]);

    const requestId = reqResult.insertId;

    // Try to link to today's attendance
    let attendanceId = null;
    try {
      const [attRows] = await pool.query(`
        SELECT AttendanceID 
        FROM attendance 
        WHERE EmployeeID = ? AND Date = ? 
        ORDER BY AttendanceID DESC LIMIT 1
      `, [emp.EmployeeID, today]);
      if (attRows.length > 0) attendanceId = attRows[0].AttendanceID;
    } catch (_) {}

    // ✅ Decide whether to use actual time or estimated
    let finalStart = startTime;
    let finalEnd = endTime;
    let hours = 0;
    let usedActual = false;

    if (actualStart && actualEnd) {
      finalStart = actualStart;
      finalEnd = actualEnd;
      usedActual = true;
    }

    // Compute hours
    const start = new Date(`2000-01-01T${finalStart}`);
    const end = new Date(`2000-01-01T${finalEnd}`);
    hours = (end - start) / (1000 * 60 * 60);
    if (hours < 0) hours += 24;

    // Insert into overtime
    await pool.query(`
      INSERT INTO overtime (
        AttendanceID, OvertimeStart, OvertimeEnd, ActualStart, ActualEnd, OvertimeHours, OvertimeReason, RequestID, Status, DateApplied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
    `, [
      attendanceId,
      finalStart,   // ✅ will be actual if provided
      finalEnd,     // ✅ will be actual if provided
      actualStart || null,
      actualEnd || null,
      Number(hours.toFixed(2)), // ✅ computed from actual if provided
      reason,
      requestId,
      today
    ]);

    return res.json({
      success: true,
      requestId,
      hours: Number(hours.toFixed(2)),
      usedActual
    });

  } catch (error) {
    console.error('❌ Error creating overtime request:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to create overtime request' });
  }
});

// 📄 Create Leave Request (used by kiosk UI after biometric verification)
app.post('/api/request/leave', async (req, res) => {
  try {
    const { employeeNumber, leaveType, reason, fromDate, toDate, days } = req.body;

    if (!employeeNumber || !leaveType || !fromDate || !toDate) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // ✅ Define today's date
    const today = new Date().toISOString().split('T')[0]; // e.g. "2025-08-29"

    // Look up employeeID from employeeNumber
    const [empRows] = await pool.query(
      `SELECT e.EmployeeID,
              e.EmployeeNumber,
              CONCAT(e.FirstName, ' ', e.LastName) AS FullName,
              d.DepartmentName,
              CONCAT(s.FirstName, ' ', s.LastName) AS SupervisorName
       FROM employee e
       LEFT JOIN department d ON e.DepartmentID = d.DepartmentID
       LEFT JOIN employee s ON e.AssignedSupervisorID = s.EmployeeID
       WHERE e.EmployeeNumber = ?`,
      [employeeNumber]
    );

    if (empRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const emp = empRows[0];

    // 🚫 Check for existing pending/approved leave (overlapping today or future)
    const [existing] = await pool.query(
      `SELECT l.LeaveID, l.StartDate, l.EndDate, r.Status
       FROM \`leave\` l
       INNER JOIN request r ON l.RequestID = r.RequestID
       WHERE r.EmployeeID = ?
       AND r.Status IN ('Pending', 'Approved')
       AND l.EndDate >= ? 
       LIMIT 1`,
      [emp.EmployeeID, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: '⚠️ You already have a pending or approved leave request.',
      });
    }

    // Insert into request table
    const [reqResult] = await pool.query(`
      INSERT INTO request (
        EmployeeID, EmployeeName, Supervisor, Department, RequestType, Status, DateApplied, DateApproved
      ) VALUES (?, ?, ?, ?, 'Leave', 'Pending', ?, NULL)
    `, [
      emp.EmployeeID,
      emp.FullName || 'N/A',
      emp.SupervisorName || 'N/A',
      emp.DepartmentName || 'N/A',
      today
    ]);

    const requestId = reqResult.insertId;

    // Insert into leave table
    await pool.query(`
      INSERT INTO \`leave\` (
        RequestID, LeaveType, StartDate, EndDate, Reason
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      requestId,
      leaveType,
      fromDate,
      toDate,
      reason || null
    ]);

    return res.json({ success: true, requestId });
  } catch (error) {
    console.error('❌ Error creating leave request:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to create leave request' });
  }
});


// 📄 Get all positions
app.get('/api/positions', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT PositionID, PositionName FROM jobposition`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching positions:', err.message);
    res.status(500).json({ error: 'Failed to retrieve positions' });
  }
});

// 📄 Get all departments
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT DepartmentID, DepartmentName FROM department`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching departments:', err.message);
    res.status(500).json({ error: 'Failed to retrieve departments' });
  }
});

// 📄 Get all supervisors
app.get('/api/supervisors', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.EmployeeID, CONCAT(e.LastName, ', ', e.FirstName, ' ', IFNULL(e.MiddleName, '')) AS name
      FROM employee e
      INNER JOIN supervisors s ON e.EmployeeID = s.EmployeeID
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching supervisors:', err.message);
    res.status(500).json({ error: 'Failed to retrieve supervisors' });
  }
});

// ✅ Get shift definitions (e.g., Morning/Night) from DB
app.get('/api/shift-definitions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT ShiftID, ShiftName, ShiftTime FROM shift');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching shift definitions:', err.message);
    res.status(500).json({ error: 'Failed to retrieve shift definitions' });
  }
});

// ✅ Simple employees list for dropdowns
app.get('/api/employees/simple', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        EmployeeID,
        CONCAT(LastName, ', ', FirstName, ' ', IFNULL(MiddleName, '')) AS name
      FROM employee
      ORDER BY LastName, FirstName
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching simple employees:', err.message);
    res.status(500).json({ error: 'Failed to retrieve employees' });
  }
});

// ✅ Areas list
app.get('/api/areas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT AreaID, AreaName FROM area ORDER BY AreaName
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching areas:', err.message);
    res.status(500).json({ error: 'Failed to retrieve areas' });
  }
});

// ✅ Get shifts for a specific week based on shift_schedule
// ✅ CORRECTED: Create shifts for a week (writes to shift_schedule and shift_dayoff with area support)
app.post('/api/shifts', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { shifts } = req.body;
    if (!Array.isArray(shifts) || shifts.length === 0) {
      return res.status(400).json({ error: 'Invalid payload: shifts array required' });
    }

    await conn.beginTransaction();

    for (const s of shifts) {
      // Derive week start/end from provided week key (yyyy-MM-dd)
      const startDate = s.week; // week is already the Saturday start in UI
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const endDate = end.toISOString().slice(0, 10);

      // Map shift string to ShiftID
      let shiftId = 1;
      const [shiftRows] = await conn.query('SELECT ShiftID, ShiftName FROM shift');
      const isNight = (s.shift || '').toLowerCase().includes('night');
      const found = shiftRows.find(r => r.ShiftName.toLowerCase().includes(isNight ? 'night' : 'morning'));
      if (found) shiftId = found.ShiftID;

      // ✅ FIX: Insert schedule with area and team leader information
      const [ins] = await conn.query(
        `INSERT INTO shift_schedule (EmployeeID, ShiftID, StartDate, EndDate, AreaAssigned, TeamLeader) VALUES (?, ?, ?, ?, ?, ?)`,
        [s.employeeId, shiftId, startDate, endDate, s.area || null, s.teamLeader || null]
      );

      // Optional day off
      if (s.dayOff) {
        await conn.query(
          `INSERT INTO shift_dayoff (ScheduleID, DayOffDate) VALUES (?, ?)`,
          [ins.insertId, s.dayOff]
        );
      }
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    console.error('⚠ Error creating shifts:', err.message);
    res.status(500).json({ error: 'Failed to create shifts' });
  } finally {
    conn.release();
  }
});

// ✅ CORRECTED: Get shifts for a specific week with proper area mapping
app.get('/api/shifts', async (req, res) => {
  try {
    const { week } = req.query;
    let query = `
      SELECT 
        ss.ScheduleID,
        ss.EmployeeID,
        e.EmployeeNumber,
        CONCAT(e.LastName, ', ', e.FirstName, ' ', IFNULL(e.MiddleName, '')) AS name,
        s.ShiftName,
        s.ShiftTime,
        ss.StartDate AS WeekStart,
        ss.EndDate AS WeekEnd,
        ss.AreaAssigned AS area,
        ss.TeamLeader,
        (
          SELECT MIN(DayOffDate) 
          FROM shift_dayoff sd 
          WHERE sd.ScheduleID = ss.ScheduleID
        ) AS DayOff
      FROM shift_schedule ss
      JOIN employee e ON ss.EmployeeID = e.EmployeeID
      JOIN shift s ON ss.ShiftID = s.ShiftID
    `;
    const params = [];
    if (week) {
      query += ' WHERE ss.StartDate = ?';
      params.push(week);
    }

    const [rows] = await pool.query(query, params);

    const result = rows.map(r => ({
      scheduleId: r.ScheduleID,
      employeeId: r.EmployeeID,
      employeeNumber: r.EmployeeNumber,
      name: r.name,
      area: r.area || 'Unassigned', // ✅ FIX: Use actual area from database
      shift: r.ShiftName && r.ShiftName.toLowerCase().includes('night') ? 'Night' : 'Morning',
      weekStart: r.WeekStart,
      weekEnd: r.WeekEnd,
      dayOff: r.DayOff,
      teamLeader: r.TeamLeader || null // ✅ FIX: Use actual team leader from database
    }));

    res.json(result);
  } catch (err) {
    console.error('⚠ Error fetching shifts:', err.message);
    res.status(500).json({ error: 'Failed to retrieve shifts' });
  }
});

// 📄 Check if employee is a supervisor
app.get('/api/supervisors/check/:employeeId', async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const [rows] = await pool.query(`
      SELECT COUNT(*) as count FROM supervisors WHERE EmployeeID = ?
    `, [employeeId]);
    
    const isSupervisor = rows[0].count > 0;
    res.json({ isSupervisor });
  } catch (err) {
    console.error('❌ Error checking supervisor status:', err.message);
    res.status(500).json({ error: 'Failed to check supervisor status' });
  }
});

// 📄 Promote employee to supervisor
app.post('/api/supervisors/promote', async (req, res) => {
  try {
    const { employeeId } = req.body;
    console.log('📝 Promoting employee to supervisor:', employeeId);
    
    // Check if employee exists
    const [employeeCheck] = await pool.query(`
      SELECT EmployeeID FROM employee WHERE EmployeeID = ?
    `, [employeeId]);
    
    if (employeeCheck.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check if already a supervisor
    const [supervisorCheck] = await pool.query(`
      SELECT EmployeeID FROM supervisors WHERE EmployeeID = ?
    `, [employeeId]);
    
    if (supervisorCheck.length > 0) {
      return res.status(400).json({ error: 'Employee is already a supervisor' });
    }
    
    // Add to supervisors table
    await pool.query(`
      INSERT INTO supervisors (EmployeeID) VALUES (?)
    `, [employeeId]);
    
    console.log('✅ Employee promoted to supervisor successfully');
    res.json({ success: true, message: 'Employee promoted to supervisor successfully' });
  } catch (err) {
    console.error('❌ Error promoting employee to supervisor:', err.message);
    res.status(500).json({ error: 'Failed to promote employee to supervisor' });
  }
});

// Test endpoint for Excel upload
app.get('/api/test-excel', (req, res) => {
  console.log('📝 Test endpoint called');
  res.json({ success: true, message: 'Test endpoint working' });
});

// 📄 Upload and process Excel file
app.post('/api/employees/upload-excel', upload.single('excelFile'), async (req, res) => {
  try {
    console.log('📝 Excel upload endpoint called');
    console.log('📝 Request file:', req.file);
    
    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📝 Processing Excel file:', req.file.originalname);
    console.log('📝 File path:', req.file.path);

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    console.log('📝 Workbook sheets:', workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('📝 Raw data rows:', data.length);
    console.log('📝 First few rows:', data.slice(0, 3));
    
    if (data.length < 2) {
      console.error('❌ Insufficient data rows');
      return res.status(400).json({ error: 'Excel file must have at least a header row and one data row' });
    }

    // Get headers (first row)
    const headers = data[0].map(header => header ? header.toString().toLowerCase().replace(/\s+/g, '') : '');
    console.log('📝 Headers found:', headers);
    
    // Process data rows
    const employees = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows
      
      const employee = {
        FirstName: row[headers.indexOf('firstname')] || row[headers.indexOf('first name')] || '',
        LastName: row[headers.indexOf('lastname')] || row[headers.indexOf('last name')] || '',
        MiddleName: row[headers.indexOf('middlename')] || row[headers.indexOf('middle name')] || '',
        Suffix: row[headers.indexOf('suffix')] || '',
        Department: row[headers.indexOf('department')] || '',
        Position: row[headers.indexOf('position')] || '',
        ContactNumber: row[headers.indexOf('contactnumber')] || row[headers.indexOf('contact number')] || row[headers.indexOf('contact')] || '',
        Email: row[headers.indexOf('email')] || '',
        Gender: row[headers.indexOf('gender')] || 'Not Specified',
        Status: 'Active',
        BiometricStatus: 'Not Enrolled', // Default for Excel uploads
        AssignedSupervisorID: null, // Will be set during database insertion
        Finger1: 0,  // Use integer instead of boolean
        Finger2: 0   // Use integer instead of boolean
      };
      
      console.log(`📝 Processed employee ${i}:`, employee);
      employees.push(employee);
    }

    console.log(`✅ Processed ${employees.length} employees from Excel file`);
    console.log('📝 Sending response to frontend...');
    console.log('📝 Response data:', { success: true, employees: employees.length, count: employees.length });
    res.json({ success: true, employees, count: employees.length });
    console.log('✅ Response sent successfully');
  } catch (err) {
    console.error('❌ Error processing Excel file:', err.message);
    console.error('❌ Full error:', err);
    res.status(500).json({ error: 'Failed to process Excel file: ' + err.message });
  }
});

// 📄 Add multiple employees to database
app.post('/api/employees/add-multiple', async (req, res) => {
  try {
    const { employees } = req.body;
    console.log(`📝 Adding ${employees.length} employees to database`);
    console.log('📝 First employee sample:', employees[0]);

    if (!employees || !Array.isArray(employees)) {
      return res.status(400).json({ error: 'Invalid employees data' });
    }

    let addedCount = 0;
    const errors = [];

    for (const emp of employees) {
      try {
        console.log(`📝 Processing employee: ${emp.FirstName} ${emp.LastName}`);
        
        // Get department ID - handle both numeric IDs and text names
        let departmentID = 1; // Default
        if (emp.Department) {
          // Check if it's a number (ID) or text (name)
          if (!isNaN(emp.Department)) {
            // It's a numeric ID
            departmentID = parseInt(emp.Department);
            console.log(`📝 Department ID "${emp.Department}" used directly`);
          } else {
            // It's a text name, map to ID
            const [deptResult] = await pool.query('SELECT DepartmentID FROM department WHERE DepartmentName = ?', [emp.Department]);
            departmentID = deptResult.length > 0 ? deptResult[0].DepartmentID : 1;
            console.log(`📝 Department "${emp.Department}" mapped to ID: ${departmentID}`);
          }
        }

        // Get position ID - handle both numeric IDs and text names
        let positionID = 1; // Default
        if (emp.Position) {
          // Check if it's a number (ID) or text (name)
          if (!isNaN(emp.Position)) {
            // It's a numeric ID
            positionID = parseInt(emp.Position);
            console.log(`📝 Position ID "${emp.Position}" used directly`);
          } else {
            // It's a text name, map to ID
            const [posResult] = await pool.query('SELECT PositionID FROM jobposition WHERE PositionName = ?', [emp.Position]);
            positionID = posResult.length > 0 ? posResult[0].PositionID : 1;
            console.log(`📝 Position "${emp.Position}" mapped to ID: ${positionID}`);
          }
        }

        console.log(`📝 Inserting employee with values:`, {
          FirstName: emp.FirstName || 'Unknown',
          LastName: emp.LastName || 'Employee',
          DepartmentID: departmentID,
          PositionID: positionID,
          Finger1: emp.Finger1 ? 1 : 0,
          Finger2: emp.Finger2 ? 1 : 0
        });

        // Insert employee
        console.log(`📝 Inserting employee with values:`, {
          FirstName: emp.FirstName || 'Unknown',
          LastName: emp.LastName || 'Employee',
          DepartmentID: departmentID,
          PositionID: positionID,
          Gender: emp.Gender || 'Not Specified',
          ContactNumber: emp.ContactNumber || 'Not Provided',
          Email: emp.Email || '--',
          BiometricStatus: emp.BiometricStatus || 'Not Enrolled',
          Status: emp.Status || 'Active',
          Finger1: emp.Finger1 ? 1 : 0,
          Finger2: emp.Finger2 ? 1 : 0
        });

        const [result] = await pool.query(`
          INSERT INTO employee 
          (FirstName, MiddleName, LastName, Suffix, Gender, PositionID, DepartmentID, ContactNumber, Email, BiometricStatus, Status, AssignedSupervisorID, Finger1, Finger2)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          emp.FirstName || 'Unknown',
          emp.MiddleName || '',
          emp.LastName || 'Employee',
          emp.Suffix || '',
          emp.Gender || 'Not Specified',
          positionID,
          departmentID,
          emp.ContactNumber || 'Not Provided',
          emp.Email || '--',
          emp.BiometricStatus || 'Not Enrolled',
          emp.Status || 'Active',
          emp.AssignedSupervisorID || null,
          emp.Finger1 ? 1 : 0,  // Convert boolean to int
          emp.Finger2 ? 1 : 0   // Convert boolean to int
        ]);

        const newId = result.insertId;
        const employeeNumber = '20221' + String(newId).padStart(4, '0');
        
        // Update with employee number
        await pool.query(
          `UPDATE employee SET EmployeeNumber = ? WHERE EmployeeID = ?`,
          [employeeNumber, newId]
        );

        addedCount++;
        console.log(`✅ Added employee: ${emp.FirstName} ${emp.LastName} (ID: ${newId}, Number: ${employeeNumber})`);
      } catch (err) {
        console.error(`❌ Error adding employee ${emp.FirstName} ${emp.LastName}:`, err.message);
        console.error(`❌ Full error details:`, err);
        errors.push(`${emp.FirstName} ${emp.LastName}: ${err.message}`);
      }
    }

    console.log(`✅ Successfully added ${addedCount} employees`);
    const response = { 
      success: true, 
      addedCount, 
      totalCount: employees.length,
      errors: errors.length > 0 ? errors : undefined
    };
    console.log('📝 Sending response:', response);
    res.json(response);
    console.log('✅ Response sent successfully');
  } catch (err) {
    console.error('❌ Error adding multiple employees:', err.message);
    res.status(500).json({ error: 'Failed to add employees: ' + err.message });
  }
});


app.listen(port, () => {
  console.log(`✅ API server running at http://localhost:${port}`);
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ success: true, message: 'Database connection successful', data: rows });
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Debug endpoints to check database content
app.get('/api/debug/positions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobposition');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching positions:', err.message);
    res.status(500).json({ error: 'Failed to retrieve positions', details: err.message });
  }
});

app.get('/api/debug/departments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM department');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching departments:', err.message);
    res.status(500).json({ error: 'Failed to retrieve departments', details: err.message });
  }
});


// Biometric verification for overtime requests (no attendance override)
app.post('/api/verify/overtime', async (req, res) => {
  try {
    const { employeeId, deviceId } = req.body;
    
    // Insert only into biometric_verifications
    const [result] = await pool.query(`
      INSERT INTO biometric_verifications (EmployeeID, VerificationType, DeviceID)
      VALUES (?, 'Overtime', ?)
    `, [employeeId, deviceId || null]);

    res.json({
      success: true,
      verificationId: result.insertId,
      message: 'Overtime biometric verification recorded'
    });
  } catch (err) {
    console.error('❌ Overtime verification error:', err.message);
    res.status(500).json({ error: 'Failed to record overtime verification' });
  }
});
