import React, { useState, useEffect } from "react";
import { MdClose, MdAccessTime, MdCheckCircle, MdCancel } from "react-icons/md";
import BiometricPrompt from "./BiometricPrompt";

const OvertimeClock = ({ onBack, employee }) => {
  const [employeeVerified, setEmployeeVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [overtimeStatus, setOvertimeStatus] = useState(null);
  const [showBiometric, setShowBiometric] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // If employee is passed from biometric verification, verify them
  useEffect(() => {
    if (employee?.id) {
      verifyEmployeeForOvertime();
    }
  }, [employee]);

  const verifyEmployeeForOvertime = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch("/api/biometric/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          fingerprintData: employee.fingerprintData,
          verificationType: 'overtime'
        })
      });

      const result = await response.json();

      if (result.success) {
        setEmployeeVerified(true);
        checkOvertimeStatus();
        setSubmitMessage("✓ Employee verified successfully. You can now manage your overtime.");
      } else {
        setSubmitMessage(`Verification failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setSubmitMessage("Verification error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const checkOvertimeStatus = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const response = await fetch(`/api/overtime/status?employeeId=${employee.id}&date=${today}`);
      const result = await response.json();

      if (result.success) {
        setOvertimeStatus(result.overtimeStatus);
      }
    } catch (error) {
      console.error('Error checking overtime status:', error);
    }
  };

  const handleOvertimeClock = async (action) => {
    if (!employeeVerified) {
      setSubmitMessage("Please complete biometric verification first.");
      return;
    }

    setPendingAction(action);
    setShowBiometric(true);
  };

  const handleBiometricVerified = async (employeeInfo) => {
    setShowBiometric(false);
    
    if (!pendingAction) return;

    setIsVerifying(true);
    setSubmitMessage(`Processing overtime ${pendingAction}...`);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const currentTime = new Date().toTimeString().slice(0, 8);

      const response = await fetch("/api/overtime/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          action: pendingAction,
          date: today,
          time: currentTime
        })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(`✓ Overtime ${pendingAction} recorded successfully! ${result.actualHours ? `Hours worked: ${result.actualHours}` : ''}`);
        checkOvertimeStatus(); // Refresh status
      } else {
        setSubmitMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Overtime clock error:', error);
      setSubmitMessage("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
      setPendingAction(null);
    }
  };

  const getStatusDisplay = () => {
    if (!overtimeStatus) return null;

    if (overtimeStatus.status === 'In Progress') {
      return (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <MdAccessTime style={{ fontSize: '24px', color: '#856404', marginBottom: '10px' }} />
          <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>Overtime in Progress</h3>
          <p style={{ color: '#856404', margin: '5px 0' }}>
            <strong>Started:</strong> {overtimeStatus.actualStart}
          </p>
          <p style={{ color: '#856404', margin: '5px 0' }}>
            <strong>Estimated End:</strong> {overtimeStatus.overtimeEnd}
          </p>
          <p style={{ color: '#856404', margin: '5px 0' }}>
            <strong>Reason:</strong> {overtimeStatus.reason}
          </p>
        </div>
      );
    } else if (overtimeStatus.status === 'Pending') {
      return (
        <div style={{
          background: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <MdCheckCircle style={{ fontSize: '24px', color: '#0056b3', marginBottom: '10px' }} />
          <h3 style={{ color: '#0056b3', margin: '0 0 10px 0' }}>Overtime Request Pending</h3>
          <p style={{ color: '#0056b3', margin: '5px 0' }}>
            <strong>Estimated Start:</strong> {overtimeStatus.overtimeStart}
          </p>
          <p style={{ color: '#0056b3', margin: '5px 0' }}>
            <strong>Estimated End:</strong> {overtimeStatus.overtimeEnd}
          </p>
          <p style={{ color: '#0056b3', margin: '5px 0' }}>
            <strong>Reason:</strong> {overtimeStatus.reason}
          </p>
        </div>
      );
    } else if (overtimeStatus.status === 'Completed') {
      return (
        <div style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <MdCheckCircle style={{ fontSize: '24px', color: '#155724', marginBottom: '10px' }} />
          <h3 style={{ color: '#155724', margin: '0 0 10px 0' }}>Overtime Completed</h3>
          <p style={{ color: '#155724', margin: '5px 0' }}>
            <strong>Started:</strong> {overtimeStatus.actualStart}
          </p>
          <p style={{ color: '#155724', margin: '5px 0' }}>
            <strong>Ended:</strong> {overtimeStatus.actualEnd}
          </p>
          <p style={{ color: '#155724', margin: '5px 0' }}>
            <strong>Hours Worked:</strong> {overtimeStatus.actualHours}
          </p>
        </div>
      );
    }

    return (
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <MdCancel style={{ fontSize: '24px', color: '#6c757d', marginBottom: '10px' }} />
        <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>No Overtime Today</h3>
        <p style={{ color: '#6c757d', margin: '5px 0' }}>
          You don't have any overtime requests for today.
        </p>
      </div>
    );
  };

  return (
    <div className="leave-modal-overlay">
      <div className="leave-modal">
        <div className="leave-header">
          <div className="logo-section">
            <div className="nutrimax-logo">
              <div className="logo-red">NUTRIMAX</div>
              <div className="logo-blue">KIOSK</div>
            </div>
          </div>
          <h1 className="leave-title">OVERTIME CLOCK</h1>
          <button className="leave-close-btn" onClick={onBack}>
            <MdClose />
          </button>
        </div>

        <div className="leave-form">
          {/* Biometric Verification Section */}
          {!employeeVerified && (
            <div className="verification-section" style={{
              background: '#f8f9fa',
              border: '2px dashed #dee2e6',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#495057', marginBottom: '15px' }}>
                Biometric Verification Required
              </h3>
              <p style={{ color: '#6c757d', marginBottom: '15px' }}>
                Please verify your identity using fingerprint to manage overtime.
              </p>
              <button
                onClick={verifyEmployeeForOvertime}
                disabled={isVerifying}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: isVerifying ? 'not-allowed' : 'pointer',
                  opacity: isVerifying ? 0.6 : 1
                }}
              >
                {isVerifying ? 'Verifying...' : 'Verify Fingerprint'}
              </button>
            </div>
          )}

          {/* Overtime Status Display */}
          {employeeVerified && getStatusDisplay()}

          {/* Overtime Actions */}
          {employeeVerified && overtimeStatus && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              {overtimeStatus.status === 'Pending' && (
                <button
                  onClick={() => handleOvertimeClock('in')}
                  disabled={isVerifying}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: isVerifying ? 'not-allowed' : 'pointer',
                    opacity: isVerifying ? 0.6 : 1,
                    marginRight: '10px'
                  }}
                >
                  <MdAccessTime style={{ marginRight: '8px' }} />
                  Clock In for Overtime
                </button>
              )}

              {overtimeStatus.status === 'In Progress' && (
                <button
                  onClick={() => handleOvertimeClock('out')}
                  disabled={isVerifying}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: isVerifying ? 'not-allowed' : 'pointer',
                    opacity: isVerifying ? 0.6 : 1
                  }}
                >
                  <MdCheckCircle style={{ marginRight: '8px' }} />
                  Clock Out from Overtime
                </button>
              )}
            </div>
          )}

          {/* Status Message */}
          {submitMessage && (
            <div 
              className="submit-message"
              style={{
                textAlign: 'center',
                padding: '12px',
                margin: '15px 0',
                borderRadius: '6px',
                backgroundColor: submitMessage.includes('✓') || submitMessage.includes('successfully') ? '#d4edda' : 
                               submitMessage.includes('Error') || submitMessage.includes('failed') ? '#f8d7da' : '#fff3cd',
                color: submitMessage.includes('✓') || submitMessage.includes('successfully') ? '#155724' : 
                       submitMessage.includes('Error') || submitMessage.includes('failed') ? '#721c24' : '#856404',
                border: submitMessage.includes('✓') || submitMessage.includes('successfully') ? '1px solid #c3e6cb' : 
                        submitMessage.includes('Error') || submitMessage.includes('failed') ? '1px solid #f5c6cb' : '1px solid #ffeaa7',
                fontWeight: '500'
              }}
            >
              {submitMessage}
            </div>
          )}
        </div>

        {showBiometric && (
          <BiometricPrompt
            message={`Please verify your identity using fingerprint to ${pendingAction} overtime.`}
            onVerified={handleBiometricVerified}
            onCancel={() => {
              setShowBiometric(false);
              setPendingAction(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OvertimeClock;
