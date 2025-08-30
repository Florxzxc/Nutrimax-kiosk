import React, { useState } from "react";
import "../style/global.css";
import { MdFingerprint } from "react-icons/md";

export default function OvertimeRequest({ onBack }) {
  const [formData, setFormData] = useState({
    employeeNumber: "",
    reason: "",
    startTime: "",
    endTime: "",
    actualStartTime: "",
    actualEndTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [showFingerprint, setShowFingerprint] = useState(false);

  // ✅ Help popup state
  const [showHelp, setShowHelp] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ Success/Error modal state
  const [popupData, setPopupData] = useState(null);

  // ✅ Prevent duplicate submit
  const [isOvertimeLocked, setIsOvertimeLocked] = useState(false);

  // ✅ Steps for instructions
  const helpSteps = [
    {
      mascot: "/pictures/Welcome.png",
      text: "Welcome! This kiosk helps you file an overtime request easily.",
    },
    {
      mascot: "/pictures/Hi.png",
      text: "Step 1: Enter your Employee Number and reason for overtime.",
    },
    {
      mascot: "/pictures/Tip.png",
      text: "Step 2: Select your estimated or actual start and end time.",
    },
    {
      mascot: "/pictures/Begging.png",
      text: "Step 3: Scan your fingerprint to verify your request.",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.employeeNumber || !formData.reason || !formData.startTime || !formData.endTime) {
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
      const startResRaw = await fetch("http://localhost:3001/api/kiosk-ot/verification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeNumber: formData.employeeNumber, type: "Overtime" }),
      });
      const startRes = await startResRaw.json();

      if (!startRes?.success || !startRes?.pending?.PendingID) {
        setShowFingerprint(false);
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

      // ✅ Poll for max 60 seconds (1 min)
      while (Date.now() - startedAt < 60000) {
        const pollUrl = new URL("http://localhost:3001/api/kiosk-ot/verification/poll");
        pollUrl.searchParams.set("pendingId", String(pendingId));
        const pollResRaw = await fetch(pollUrl.toString());
        const pollRes = await pollResRaw.json();

        if (pollRes?.success) {
          verified = true;
          break;
        }

        const status = pollRes?.status;
        if (status === "Expired" || status === "Cancelled") break;
        await new Promise((r) => setTimeout(r, 1000));
      }

      setShowFingerprint(false);

      if (!verified) {
        setPopupData({
          mascot: "/pictures/Begging.png",
          text: "❌ Failed to save overtime request.",
          button: "Try Again",
          retry: true,
        });
        return;
      }

      const payload = {
        employeeNumber: formData.employeeNumber,
        reason: formData.reason,
        startTime: formData.startTime,
        endTime: formData.endTime,
        actualStart: formData.actualStartTime || null,
        actualEnd: formData.actualEndTime || null,
      };

      const otResRaw = await fetch("http://localhost:3001/api/request/overtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const otRes = await otResRaw.json();

      if (otRes?.success) {
        setPopupData({
          mascot: "/pictures/Happy.png",
          text: "✅ Overtime request submitted successfully!",
          button: "Got it!",
        });
        setFormData({
          employeeNumber: "",
          reason: "",
          startTime: "",
          endTime: "",
          actualStartTime: "",
          actualEndTime: "",
        });
      } else {
        // ✅ Check duplicate overtime (pending/approved)
        const isDuplicate =
          otRes?.error?.includes("already have a pending") ||
          otRes?.error?.includes("already have an approved");

        if (isDuplicate) {
          setIsOvertimeLocked(true); // 🚫 disable submit button
        }

        setPopupData({
          mascot: isDuplicate ? "/pictures/Tip.png" : "/pictures/Angry.png",
          text: isDuplicate
            ? "⚠️ You already have a pending or approved overtime. Please wait until it is finished."
            : "❌ Failed to save overtime request.",
          button: isDuplicate ? "Got it!" : "Try Again",
          retry: !isDuplicate,
        });
      }
    } catch (err) {
      console.error(err);
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
      <div className="overtime-header">
        <div className="logo-section">
          <div className="nutrimax-logo">
            <div className="logo-red">NUTRIMAX</div>
            <div className="logo-blue">KIOSK</div>
          </div>
        </div>

        <h1 className="overtime-title">OVERTIME REQUEST</h1>

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
                    setPopupData(null);
                    setTimeout(() => handleSubmit(), 300);
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

      {/* ===== FORM ===== */}
      <div className="overtime-content">
        <div className="form-grid">
          {/* Employee Info */}
          <div className="form-section">
            <h3> Employee Information</h3>
            <div className="form-row">
              <label>Employee Number:</label>
              <input
                type="text"
                value={formData.employeeNumber}
                onChange={(e) => handleInputChange("employeeNumber", e.target.value)}
                placeholder="Enter your employee number"
                required
              />
            </div>
            <div className="form-row">
              <label>Reason:</label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Reason for overtime..."
                required
                rows="4"
              />
            </div>
          </div>

          {/* Estimated Time */}
          <div className="form-section">
            <h3>Estimated Time</h3>
            <div className="form-row">
              <label>Start Time:</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>End Time:</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Actual Time */}
          <div className="form-section">
            <h3>
              ✅ Actual Time{" "}
              <span style={{ fontSize: "12px", color: "#ccc", marginLeft: "8px" }}>
                (optional)
              </span>
            </h3>
            <div className="form-row">
              <label>Actual Start:</label>
              <input
                type="time"
                value={formData.actualStartTime}
                onChange={(e) => handleInputChange("actualStartTime", e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Actual End:</label>
              <input
                type="time"
                value={formData.actualEndTime}
                onChange={(e) => handleInputChange("actualEndTime", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== ACTIONS ===== */}
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
          onClick={handleSubmit}
          className="overtime-action-btn submit"
          disabled={loading || isOvertimeLocked}
        >
          <MdFingerprint size={20} style={{ marginRight: "8px" }} />
          {isOvertimeLocked
            ? "Overtime Pending..."
            : loading
            ? "Processing..."
            : "Submit"}
        </button>
      </div>
    </div>
  );
}
