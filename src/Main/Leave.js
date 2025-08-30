import React, { useState, useEffect } from "react";
import "../style/global.css";
import { MdFingerprint } from "react-icons/md";

const Leave = ({ onBack }) => {
  const [formData, setFormData] = useState({
    idNumber: "",
    name: "",
    leaveType: "",
    fromDate1: "",
    toDate1: "",
    days1: "",
    fromDate2: "",
    toDate2: "",
    days2: "",
  });

  const [loading, setLoading] = useState(false);
  const [showFingerprint, setShowFingerprint] = useState(false);

  // ✅ Help popup state
  const [showHelp, setShowHelp] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ Success/Error modal state
  const [popupData, setPopupData] = useState(null);

  // ✅ Prevent duplicate leave
  const [isLeaveLocked, setIsLeaveLocked] = useState(false);

  // ✅ Help steps with mascot
  const helpSteps = [
    {
      mascot: "/pictures/Welcome.png",
      text: "Welcome! This kiosk helps you file a leave request easily.",
    },
    {
      mascot: "/pictures/Hi.png",
      text: "Step 1: Enter your Employee Number, Name, and select a Leave Type.",
    },
    {
      mascot: "/pictures/Tip.png",
      text: "Step 2: Fill in the inclusive dates and number of days.",
    },
    {
      mascot: "/pictures/Begging.png",
      text: "Step 3: Scan your fingerprint to verify and submit your request.",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLeaveTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      leaveType: type,
    }));
  };

  // ✅ Check leave status when employee enters ID
  useEffect(() => {
    if (!formData.idNumber) return;

    const checkLeaveStatus = async () => {
      try {
        const resRaw = await fetch(
          `http://localhost:3001/api/leave/status/${formData.idNumber}`
        );
        const res = await resRaw.json();

        if (res.locked) {
          setIsLeaveLocked(true);
          setPopupData({
            mascot: "/pictures/Tip.png",
            text: res.message,
            button: "Got it!",
          });
        } else {
          setIsLeaveLocked(false);
        }
      } catch (err) {
        console.error("❌ Error checking leave status:", err);
      }
    };

    checkLeaveStatus();
  }, [formData.idNumber]);

  const handleSubmit = async () => {
    if (!formData.idNumber || !formData.leaveType || !formData.fromDate1 || !formData.toDate1) {
      setPopupData({
        mascot: "/pictures/Angry.png",
        text: "⚠️ Please complete all required fields.",
        button: "Got it!",
      });
      return;
    }

    setLoading(true);
    setShowFingerprint(true);

    try {
      // 1️⃣ Start biometric verification
      const startResRaw = await fetch("http://localhost:3001/api/kiosk-ot/verification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeNumber: formData.idNumber, type: "Leave" }),
      });

      const startRes = await startResRaw.json();

      if (!startRes?.success || !startRes?.pending?.PendingID) {
        setShowFingerprint(false);
        setLoading(false);
        setPopupData({
          mascot: "/pictures/Begging.png",
          text: "❌ Failed to start verification.",
          button: "Try Again",
          retry: true,
        });
        return;
      }

      const pendingId = startRes.pending.PendingID;
      const startedAt = Date.now();
      let verified = false;

      // 2️⃣ Poll for max 60 seconds
      while (Date.now() - startedAt < 60000) {
        const pollUrl = new URL("http://localhost:3001/api/kiosk-ot/verification/poll");
        pollUrl.searchParams.set("pendingId", String(pendingId));
        const pollResRaw = await fetch(pollUrl.toString());
        const pollRes = await pollResRaw.json();

        if (pollRes?.success) {
          verified = true;
          break;
        }

        if (pollRes?.status === "Expired" || pollRes?.status === "Cancelled") break;
        await new Promise((r) => setTimeout(r, 1000));
      }

      setShowFingerprint(false);

      if (!verified) {
        setPopupData({
          mascot: "/pictures/Angry.png",
          text: "❌ Fingerprint verification failed or timed out.",
          button: "Try Again",
          retry: true,
        });
        setLoading(false);
        return;
      }

      // 3️⃣ Submit leave request
      const payload = {
        employeeNumber: formData.idNumber,
        leaveType: formData.leaveType,
        fromDate: formData.fromDate1,
        toDate: formData.toDate1,
        days: formData.days1 || 0,
        reason: "",
      };

      const resRaw = await fetch("http://localhost:3001/api/request/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await resRaw.json();

      if (res?.success) {
        setPopupData({
          mascot: "/pictures/Happy.png",
          text: "✅ Leave request submitted successfully!",
          button: "Got it!",
        });
        setFormData({
          idNumber: "",
          name: "",
          leaveType: "",
          fromDate1: "",
          toDate1: "",
          days1: "",
          fromDate2: "",
          toDate2: "",
          days2: "",
        });
      } else {
        // ✅ Detect duplicate leave
        const isDuplicate =
          res?.error?.includes("already have a pending") ||
          res?.error?.includes("already have an approved");

        if (isDuplicate) {
          setIsLeaveLocked(true); // 🚫 disable submit button
        }

        setPopupData({
          mascot: isDuplicate ? "/pictures/Tip.png" : "/pictures/Angry.png",
          text: isDuplicate
            ? "⚠️ You already have a pending or approved leave. Please wait until it is finished."
            : "❌ Failed to save leave request.",
          button: isDuplicate ? "Got it!" : "Try Again",
          retry: !isDuplicate,
        });
      }
    } catch (err) {
      console.error("❌ Error submitting leave:", err);
      setPopupData({
        mascot: "/pictures/Begging.png",
        text: "⚠️ Error connecting to server.",
        button: "Try Again",
        retry: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Help navigation
  const handleNext = () => {
    if (currentStep < helpSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowHelp(false);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="overtime-page">
      {/* HEADER */}
      <div className="overtime-header">
        <div className="logo-section">
          <div className="nutrimax-logo">
            <div className="logo-red">NUTRIMAX</div>
            <div className="logo-blue">KIOSK</div>
          </div>
        </div>
        <h1 className="overtime-title">LEAVE APPLICATION FORM</h1>
        <div className="overtime-actions-right">
          <button className="overtime-help-btn" onClick={() => setShowHelp(true)}>
            (?)
          </button>
          <button className="overtime-close-btn" onClick={onBack}>
            ✕
          </button>
        </div>
      </div>

      {/* ===== HELP POPUP ===== */}
      {showHelp && (
        <div className="help-overlay">
          <div className="help-popup">
            <img src={helpSteps[currentStep].mascot} alt="Mascot" className="help-mascot" />
            <div className="help-content">
              <p className="help-text">{helpSteps[currentStep].text}</p>
            </div>
            <div className="help-actions">
              {currentStep > 0 && (
                <button className="help-back" onClick={handleBackStep}>
                  ←
                </button>
              )}
              <button className="help-next" onClick={handleNext}>
                {currentStep < helpSteps.length - 1 ? "➔" : "✕"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SUCCESS/ERROR POPUP ===== */}
      {popupData && (
        <div className="help-overlay">
          <div className="help-popup">
            <img src={popupData.mascot} alt="Mascot" className="help-mascot" />
            <div className="help-content">
              <p className="help-text">{popupData.text}</p>
            </div>
            <div className="help-actions">
              <button
                className="modal-btn"
                onClick={() => {
                  if (popupData.retry) {
                    setPopupData(null); // close first
                    setTimeout(() => handleSubmit(), 300); // retry after delay
                  } else {
                    setPopupData(null);
                  }
                }}
              >
                {popupData.button || "Got it!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="overtime-content">
        <div className="form-grid">
          {/* Employee Info */}
          <div className="form-section">
            <h2>Employee Information</h2>
            <label>
              Employee Number:
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleInputChange("idNumber", e.target.value)}
                placeholder="Enter employee number"
              />
            </label>
            <label>
              Name:
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter employee name"
              />
            </label>
          </div>

          {/* Leave Type */}
          <div className="form-section">
            <h2>Leave Type</h2>
            {["vacation", "sick", "maternity", "paternity"].map((type) => (
              <label key={type} className="leave-type-label">
                <input
                  type="radio"
                  name="leaveType"
                  value={type}
                  checked={formData.leaveType === type}
                  onChange={() => handleLeaveTypeChange(type)}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)} Leave
              </label>
            ))}
          </div>

          {/* Dates Section */}
          <div className="form-section">
            <h2>Inclusive Dates</h2>
            <table className="dates-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>No. of days</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input type="date" value={formData.fromDate1} onChange={(e) => handleInputChange("fromDate1", e.target.value)} />
                  </td>
                  <td>
                    <input type="date" value={formData.toDate1} onChange={(e) => handleInputChange("toDate1", e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={formData.days1} onChange={(e) => handleInputChange("days1", e.target.value)} placeholder="Days" />
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="date" value={formData.fromDate2} onChange={(e) => handleInputChange("fromDate2", e.target.value)} />
                  </td>
                  <td>
                    <input type="date" value={formData.toDate2} onChange={(e) => handleInputChange("toDate2", e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={formData.days2} onChange={(e) => handleInputChange("days2", e.target.value)} placeholder="Days" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="overtime-actions">
          {showFingerprint && (
            <div className="fingerprint-container">
              <MdFingerprint size={60} color="#28a745" className="animate-pulse" />
              <div style={{ marginTop: "8px", fontWeight: "bold", color: "#28a745" }}>
                Scanning...
              </div>
            </div>
          )}

          <button
            className="overtime-action-btn submit"
            onClick={handleSubmit}
            disabled={loading || isLeaveLocked}
          >
            <MdFingerprint size={20} style={{ marginRight: "8px" }} />
            {isLeaveLocked
              ? "Leave Pending..."
              : loading
              ? "Submitting..."
              : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leave;
