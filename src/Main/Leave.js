import React, { useState, useEffect } from "react";
import { MdFingerprint, MdPerson, MdWorkOutline, MdAccessTime, MdClose, MdHelp, MdSend } from "react-icons/md";
import "../style/Design.css";

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
  const [showHelp, setShowHelp] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [popupData, setPopupData] = useState(null);
  const [isLeaveLocked, setIsLeaveLocked] = useState(false);

  const helpSteps = [
    { title: "Welcome to Leave Application", text: "File your leave request quickly and securely using the kiosk.", icon: <MdWorkOutline size={40} /> },
    { title: "Employee Details", text: "Enter your Employee Number, Name, and select a Leave Type.", icon: <MdPerson size={40} /> },
    { title: "Leave Dates", text: "Fill in the inclusive dates and the number of days for your leave.", icon: <MdAccessTime size={40} /> },
    { title: "Biometric Verification", text: "Secure your leave request with fingerprint authentication.", icon: <MdFingerprint size={40} /> },
  ];

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleLeaveTypeChange = (type) => setFormData((prev) => ({ ...prev, leaveType: type }));

  useEffect(() => {
    if (!formData.idNumber) return;
    const checkLeaveStatus = async () => {
      try {
        const resRaw = await fetch(`http://localhost:3001/api/leave/status/${formData.idNumber}`);
        const res = await resRaw.json();
        if (res.locked) {
          setIsLeaveLocked(true);
          setPopupData({ type: "warning", title: "Leave Locked", text: res.message, button: "Got it!" });
        } else {
          setIsLeaveLocked(false);
        }
      } catch (err) {
        console.error("Error checking leave status:", err);
      }
    };
    checkLeaveStatus();
  }, [formData.idNumber]);

  const handleSubmit = async () => {
    if (!formData.idNumber || !formData.leaveType || !formData.fromDate1 || !formData.toDate1) {
      setPopupData({ type: "warning", title: "Incomplete Information", text: "Please complete all required fields.", button: "Got it!" });
      return;
    }

    setLoading(true);
    setShowFingerprint(true);

    try {
      const startResRaw = await fetch("http://localhost:3001/api/kiosk-ot/verification/start", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employeeNumber: formData.idNumber, type: "Leave" }),
      });
      const startRes = await startResRaw.json();
      if (!startRes?.success || !startRes?.pending?.PendingID) {
        setShowFingerprint(false);
        setLoading(false);
        setPopupData({ type: "error", title: "Verification Failed", text: "Could not start fingerprint verification.", button: "Try Again" });
        return;
      }

      const pendingId = startRes.pending.PendingID;
      const startedAt = Date.now();
      let verified = false;
      while (Date.now() - startedAt < 60000) {
        const pollUrl = new URL("http://localhost:3001/api/kiosk-ot/verification/poll");
        pollUrl.searchParams.set("pendingId", String(pendingId));
        const pollResRaw = await fetch(pollUrl.toString());
        const pollRes = await pollResRaw.json();
        if (pollRes?.success) { verified = true; break; }
        if (pollRes?.status === "Expired" || pollRes?.status === "Cancelled") break;
        await new Promise((r) => setTimeout(r, 1000));
      }

      setShowFingerprint(false);
      if (!verified) {
        setPopupData({ type: "error", title: "Verification Timeout", text: "Fingerprint verification failed or timed out.", button: "Try Again" });
        setLoading(false);
        return;
      }

      const payload = { employeeNumber: formData.idNumber, leaveType: formData.leaveType, fromDate: formData.fromDate1, toDate: formData.toDate1, days: formData.days1 || 0, reason: "" };
      const resRaw = await fetch("http://localhost:3001/api/request/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const res = await resRaw.json();

      if (res?.success) {
        setPopupData({ type: "success", title: "Leave Submitted", text: "Your leave request was submitted successfully!", button: "Got it!" });
        setFormData({ idNumber: "", name: "", leaveType: "", fromDate1: "", toDate1: "", days1: "", fromDate2: "", toDate2: "", days2: "" });
      } else {
        const isDuplicate = res?.error?.includes("already have a pending") || res?.error?.includes("already have an approved");
        if (isDuplicate) setIsLeaveLocked(true);
        setPopupData({ type: isDuplicate ? "warning" : "error", title: isDuplicate ? "Duplicate Request" : "Submission Failed", text: isDuplicate ? "You already have a pending or approved leave." : "Failed to save leave request.", button: isDuplicate ? "Got it!" : "Try Again" });
      }
    } catch (err) {
      console.error("Error submitting leave:", err);
      setPopupData({ type: "error", title: "Server Error", text: "Error connecting to server.", button: "Try Again" });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setCurrentStep((prev) => (prev < helpSteps.length - 1 ? prev + 1 : (setShowHelp(false), prev)));
  const handleBackStep = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Header */}
      <header className="top-header">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="brand-section">
            <div className="brand-logo"><MdWorkOutline size={28} /><div className="logo-pulse"></div></div>
            <div className="brand-info"><h1 className="brand-name">NUTRIMAX</h1><span className="brand-subtitle">Kiosk System</span></div>
          </div>
          <div className="page-info"><div className="page-indicator"></div><h2 className="page-title">Leave Application</h2><div className="page-status">Active Session</div></div>
          <div className="header-actions">
            <button className="header-btn glass-btn" onClick={() => setShowHelp(true)}><MdHelp size={20} /><span className="btn-ripple"></span></button>
            <button className="header-btn glass-btn close" onClick={onBack}><MdClose size={20} /><span className="btn-ripple"></span></button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <div className="content-container">
          <div className="form-section">
            <div className="form-container">
              {/* Employee Info */}
              <div className="form-group">
                <div className="group-header">
                  <div className="group-icon-wrapper"><MdPerson className="group-icon" /><div className="icon-glow"></div></div>
                  <div className="group-info"><h3 className="group-title">Employee Information</h3><p className="group-subtitle">Secure identification required</p></div>
                  <div className="group-status"><div className={`status-dot ${formData.idNumber ? 'active' : ''}`}></div></div>
                </div>
                <div className="form-fields">
                  <div className="field-row">
                    <div className="input-field"><label className="field-label">Employee Number</label>
                      <input type="text" value={formData.idNumber} onChange={(e) => handleInputChange("idNumber", e.target.value)} placeholder="Enter employee number" className="form-input" />
                    </div>
                    <div className="input-field"><label className="field-label">Name</label>
                      <input type="text" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Enter employee name" className="form-input" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Type */}
              <div className="form-group">
                <div className="group-header">
                  <div className="group-icon-wrapper"><MdWorkOutline className="group-icon" /><div className="icon-glow"></div></div>
                  <div className="group-info"><h3 className="group-title">Leave Type</h3><p className="group-subtitle">Choose type of leave</p></div>
                </div>
                <div className="form-fields leave-type-options">
                  {['vacation','sick','maternity','paternity'].map((type) => (
                    <label key={type} className="option-label">
                      <input type="radio" name="leaveType" value={type} checked={formData.leaveType === type} onChange={() => handleLeaveTypeChange(type)} />
                      {type.charAt(0).toUpperCase() + type.slice(1)} Leave
                    </label>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="form-group">
                <div className="group-header">
                  <div className="group-icon-wrapper"><MdAccessTime className="group-icon" /><div className="icon-glow"></div></div>
                  <div className="group-info"><h3 className="group-title">Inclusive Dates</h3><p className="group-subtitle">Specify your leave period</p></div>
                </div>
                <div className="form-fields">
                  <div className="time-row">
                    <div className="input-field"><label className="field-label">From</label>
                      <input type="date" value={formData.fromDate1} onChange={(e) => handleInputChange("fromDate1", e.target.value)} className="form-input" />
                    </div>
                    <div className="time-connector"><div className="connector-line"></div><div className="connector-dot"></div></div>
                    <div className="input-field"><label className="field-label">To</label>
                      <input type="date" value={formData.toDate1} onChange={(e) => handleInputChange("toDate1", e.target.value)} className="form-input" />
                    </div>
                    <div className="input-field"><label className="field-label">Days</label>
                      <input type="number" value={formData.days1} onChange={(e) => handleInputChange("days1", e.target.value)} placeholder="0" className="form-input" />
                    </div>
                  </div>
                  <div className="time-row">
                    <div className="input-field"><label className="field-label">From</label>
                      <input type="date" value={formData.fromDate2} onChange={(e) => handleInputChange("fromDate2", e.target.value)} className="form-input" />
                    </div>
                    <div className="time-connector"><div className="connector-line"></div><div className="connector-dot"></div></div>
                    <div className="input-field"><label className="field-label">To</label>
                      <input type="date" value={formData.toDate2} onChange={(e) => handleInputChange("toDate2", e.target.value)} className="form-input" />
                    </div>
                    <div className="input-field"><label className="field-label">Days</label>
                      <input type="number" value={formData.days2} onChange={(e) => handleInputChange("days2", e.target.value)} placeholder="0" className="form-input" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="submit-section">
                {showFingerprint && (
                  <div className="biometric-scanner">
                    <div className="scanner-container">
                      <div className="scanner-ring ring-1"></div>
                      <div className="scanner-ring ring-2"></div>
                      <div className="scanner-ring ring-3"></div>
                      <div className="fingerprint-icon-container"><MdFingerprint className="fingerprint-icon" /></div>
                      <div className="scan-beam"></div>
                    </div>
                    <div className="scanner-status">
                      <h4>Biometric Authentication</h4>
                      <p>Place finger on scanner...</p>
                      <div className="auth-progress"><div className="auth-bar"></div></div>
                    </div>
                  </div>
                )}
                <button onClick={handleSubmit} className={`submit-button ${loading ? 'loading' : ''} ${isLeaveLocked ? 'disabled' : ''}`} disabled={loading || isLeaveLocked}>
                  <div className="btn-background"></div>
                  <div className="btn-content"><MdSend className="button-icon" /><span className="button-text">{isLeaveLocked ? "Leave Pending..." : loading ? "Submitting..." : "Submit Leave Request"}</span></div>
                  <div className="btn-glow"></div>
                  <div className="btn-particles"><div className="particle particle-1"></div><div className="particle particle-2"></div><div className="particle particle-3"></div></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay">
          <div className="modal-container modern-modal">
            <div className="modal-bg-effect"></div>
            <div className="modal-header">
              <div className="modal-icon">{helpSteps[currentStep].icon}<div className="icon-pulse"></div></div>
              <h3 className="modal-title">{helpSteps[currentStep].title}</h3>
            </div>
            <div className="modal-body"><p className="modal-text">{helpSteps[currentStep].text}</p></div>
            <div className="modal-footer">
              <div className="modal-navigation">{currentStep > 0 && (<button className="nav-button secondary" onClick={handleBackStep}>Previous</button>)}<button className="nav-button primary" onClick={handleNext}>{currentStep < helpSteps.length - 1 ? "Next" : "Get Started"}</button></div>
              <div className="progress-bar">{helpSteps.map((_, idx) => (<div key={idx} className={`progress-dot ${idx <= currentStep ? 'active' : ''}`} />))}</div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {popupData && (
        <div className="modal-overlay">
          <div className={`status-modal modern-modal ${popupData.type}`}>
            <div className="modal-bg-effect"></div>
            <div className="status-header">
              <div className="status-icon">
                {popupData.type === 'success' ? '✅' : popupData.type === 'warning' ? '⚠️' : '❌'}</div><h3 className="status-title">{popupData.title}</h3></div>
            <div className="status-body"><p className="status-text">{popupData.text}</p></div>
            <div className="status-footer"><button className="status-button" onClick={() => setPopupData(null)}>{popupData.button}</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
