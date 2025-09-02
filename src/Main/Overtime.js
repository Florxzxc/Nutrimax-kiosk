import React, { useState } from "react";
import { MdFingerprint, MdAccessTime, MdPerson, MdWorkOutline, MdClose, MdHelp, MdSend, MdMenu } from "react-icons/md";
import "../style/Design.css";

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
  const [showHelp, setShowHelp] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [popupData, setPopupData] = useState(null);
  const [isOvertimeLocked, setIsOvertimeLocked] = useState(false);

  const helpSteps = [
    {
      title: "Welcome to Digital Overtime",
      text: "Submit your overtime request quickly and securely through our advanced digital system.",
      icon: <MdWorkOutline size={40} />
    },
    {
      title: "Employee Details",
      text: "Enter your employee ID and provide a clear reason for your overtime request.",
      icon: <MdPerson size={40} />
    },
    {
      title: "Time Configuration",
      text: "Set your planned overtime hours. Actual times can be updated later if needed.",
      icon: <MdAccessTime size={40} />
    },
    {
      title: "Biometric Verification",
      text: "Secure your request with fingerprint authentication for instant approval processing.",
      icon: <MdFingerprint size={40} />
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitOvertimeRequest = async () => {
    try {
      const requestData = {
        employeeNumber: formData.employeeNumber,
        reason: formData.reason,
        startTime: formData.startTime,
        endTime: formData.endTime,
        actualStart: formData.actualStartTime || null,
        actualEnd: formData.actualEndTime || null,
        date: new Date().toISOString().slice(0, 10)
      };

      console.log('Submitting overtime request:', requestData);

      const response = await fetch('http://localhost:3001/api/request/overtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (result.success) {
        setPopupData({
          type: "success",
          title: "Overtime Request Submitted",
          text: `Your overtime request has been successfully submitted and is pending approval. Request ID: ${result.requestId}. Estimated hours: ${result.hours}.`,
          button: "Continue",
        });
      } else {
        setPopupData({
          type: "warning",
          title: "Request Failed",
          text: result.error || "Failed to submit overtime request. Please try again.",
          button: "Try Again",
        });
      }
    } catch (error) {
      console.error('Error submitting overtime request:', error);
      setPopupData({
        type: "error",
        title: "Connection Error",
        text: "Unable to connect to the server. Please check your connection and try again.",
        button: "Retry",
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.employeeNumber || !formData.reason || !formData.startTime || !formData.endTime) {
      setPopupData({
        type: "warning",
        title: "Incomplete Information",
        text: "Please fill in all required fields before submitting your request.",
        button: "Complete Form",
      });
      return;
    }

    setLoading(true);
    setShowFingerprint(true);

    // Simulate biometric verification
    setTimeout(async () => {
      setShowFingerprint(false);
      
      // Submit the actual request to server
      await submitOvertimeRequest();
      
      setLoading(false);
      
      // Reset form after successful submission
      if (popupData?.type === "success") {
        setFormData({
          employeeNumber: "",
          reason: "",
          startTime: "",
          endTime: "",
          actualStartTime: "",
          actualEndTime: "",
        });
      }
    }, 3000);
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

      {/* Top Navigation Bar */}
      <header className="top-header">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="brand-section">
            <div className="brand-logo">
              <MdWorkOutline size={32} />
              <div className="logo-pulse"></div>
            </div>
            <div className="brand-info">
              <h1 className="brand-name">NUTRIMAX</h1>
              <span className="brand-subtitle">Future Workforce Management</span>
            </div>
          </div>
          
          <div className="page-info">
            <div className="page-indicator"></div>
            <h2 className="page-title">Overtime Request Portal</h2>
            <div className="page-status">Active Session</div>
          </div>
          
          <div className="header-actions">
            <button className="header-btn glass-btn" onClick={() => setShowHelp(true)} title="Help">
              <MdHelp size={20} />
              <span className="btn-ripple"></span>
            </button>
            <button className="header-btn glass-btn close" onClick={onBack} title="Close">
              <MdClose size={20} />
              <span className="btn-ripple"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container">
          {/* Main Form */}
          <div className="form-section">
            <div className="form-container">
              
              {/* Employee Information */}
              <div className="form-group">
                <div className="group-header">
                  <div className="group-icon-wrapper">
                    <MdPerson className="group-icon" />
                    <div className="icon-glow"></div>
                  </div>
                  <div className="group-info">
                    <h3 className="group-title">Employee Information</h3>
                    <p className="group-subtitle">Secure identification required</p>
                  </div>
                  <div className="group-status">
                    <div className={`status-dot ${formData.employeeNumber ? 'active' : ''}`}></div>
                  </div>
                </div>
                
                <div className="form-fields">
                  <div className="field-container">
                    <div className="input-wrapper">
                      <label className="field-label">Employee ID</label>
                      <div className="input-container">
                        <input
                          type="text"
                          value={formData.employeeNumber}
                          onChange={(e) => handleInputChange("employeeNumber", e.target.value)}
                          placeholder="Enter your employee ID"
                          className="form-input"
                          required
                        />
                        <div className="input-border"></div>
                        <div className="input-focus-effect"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="field-container">
                    <div className="input-wrapper">
                      <label className="field-label">Reason for Overtime</label>
                      <div className="input-container">
                        <textarea
                          value={formData.reason}
                          onChange={(e) => handleInputChange("reason", e.target.value)}
                          placeholder="Describe the reason for overtime request..."
                          className="form-textarea"
                          rows="3"
                          required
                        />
                        <div className="input-border"></div>
                        <div className="input-focus-effect"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Schedule */}
              <div className="form-group">
                <div className="group-header">
                  <div className="group-icon-wrapper">
                    <MdAccessTime className="group-icon" />
                    <div className="icon-glow"></div>
                  </div>
                  <div className="group-info">
                    <h3 className="group-title">Planned Schedule</h3>
                    <p className="group-subtitle">Set your overtime timeframe</p>
                  </div>
                  <div className="group-status">
                    <div className={`status-dot ${(formData.startTime && formData.endTime) ? 'active' : ''}`}></div>
                  </div>
                </div>
                
                <div className="form-fields">
                  <div className="time-row">
                    <div className="field-container">
                      <div className="input-wrapper">
                        <label className="field-label">Start Time</label>
                        <div className="input-container">
                          <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => handleInputChange("startTime", e.target.value)}
                            className="form-input time-input"
                            required
                          />
                          <div className="input-border"></div>
                          <div className="input-focus-effect"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="time-connector">
                      <div className="connector-line"></div>
                      <div className="connector-dot"></div>
                    </div>
                    
                    <div className="field-container">
                      <div className="input-wrapper">
                        <label className="field-label">End Time</label>
                        <div className="input-container">
                          <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => handleInputChange("endTime", e.target.value)}
                            className="form-input time-input"
                            required
                          />
                          <div className="input-border"></div>
                          <div className="input-focus-effect"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actual Time (Optional) */}
              <div className="form-group optional-group">
                <div className="group-header">
                  <div className="group-icon-wrapper">
                    <MdAccessTime className="group-icon" />
                    <div className="icon-glow"></div>
                  </div>
                  <div className="group-info">
                    <h3 className="group-title">
                      Actual Time 
                      <span className="optional-badge">Optional</span>
                    </h3>
                    <p className="group-subtitle">Update after completion</p>
                  </div>
                  <div className="group-status">
                    <div className="status-dot optional"></div>
                  </div>
                </div>
                
                <div className="form-fields">
                  <div className="time-row">
                    <div className="field-container">
                      <div className="input-wrapper">
                        <label className="field-label">Actual Start</label>
                        <div className="input-container">
                          <input
                            type="time"
                            value={formData.actualStartTime}
                            onChange={(e) => handleInputChange("actualStartTime", e.target.value)}
                            className="form-input time-input"
                          />
                          <div className="input-border"></div>
                          <div className="input-focus-effect"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="time-connector">
                      <div className="connector-line"></div>
                      <div className="connector-dot"></div>
                    </div>
                    
                    <div className="field-container">
                      <div className="input-wrapper">
                        <label className="field-label">Actual End</label>
                        <div className="input-container">
                          <input
                            type="time"
                            value={formData.actualEndTime}
                            onChange={(e) => handleInputChange("actualEndTime", e.target.value)}
                            className="form-input time-input"
                          />
                          <div className="input-border"></div>
                          <div className="input-focus-effect"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="helper-text">
                    <span className="helper-icon">💡</span>
                    Fill this section after completing your overtime work
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="submit-section">
                {showFingerprint && (
                  <div className="biometric-scanner">
                    <div className="scanner-container">
                      <div className="scanner-ring ring-1"></div>
                      <div className="scanner-ring ring-2"></div>
                      <div className="scanner-ring ring-3"></div>
                      <div className="fingerprint-icon-container">
                        <MdFingerprint className="fingerprint-icon" />
                      </div>
                      <div className="scan-beam"></div>
                    </div>
                    <div className="scanner-status">
                      <h4>Biometric Authentication</h4>
                      <p>Place finger on scanner...</p>
                      <div className="auth-progress">
                        <div className="auth-bar"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleSubmit}
                  className={`submit-button ${loading ? 'loading' : ''} ${isOvertimeLocked ? 'disabled' : ''}`}
                  disabled={loading || isOvertimeLocked}
                >
                  <div className="btn-background"></div>
                  <div className="btn-content">
                    <MdSend className="button-icon" />
                    <span className="button-text">
                      {isOvertimeLocked 
                        ? "Request Pending Review" 
                        : loading 
                        ? "Processing Request..." 
                        : "Submit Overtime Request"
                      }
                    </span>
                  </div>
                  <div className="btn-glow"></div>
                  <div className="btn-particles">
                    <div className="particle particle-1"></div>
                    <div className="particle particle-2"></div>
                    <div className="particle particle-3"></div>
                  </div>
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
              <div className="modal-icon">
                {helpSteps[currentStep].icon}
                <div className="icon-pulse"></div>
              </div>
              <h3 className="modal-title">{helpSteps[currentStep].title}</h3>
            </div>
            <div className="modal-body">
              <p className="modal-text">{helpSteps[currentStep].text}</p>
            </div>
            <div className="modal-footer">
              <div className="modal-navigation">
                {currentStep > 0 && (
                  <button className="nav-button secondary" onClick={handleBackStep}>
                    Previous
                  </button>
                )}
                <button className="nav-button primary" onClick={handleNext}>
                  {currentStep < helpSteps.length - 1 ? "Next" : "Get Started"}
                </button>
              </div>
              <div className="progress-bar">
                {helpSteps.map((_, index) => (
                  <div 
                    key={index} 
                    className={`progress-dot ${index <= currentStep ? 'active' : ''}`}
                  />
                ))}
              </div>
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
                {popupData.type === 'success' ? '✅' : popupData.type === 'warning' ? '⚠️' : '❌'}
                <div className="icon-pulse"></div>
              </div>
              <h3 className="status-title">{popupData.title}</h3>
            </div>
            <div className="status-body">
              <p className="status-text">{popupData.text}</p>
            </div>
            <div className="status-footer">
              <button 
                className="status-button"
                onClick={() => setPopupData(null)}
              >
                {popupData.button}
                <div className="btn-glow"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


