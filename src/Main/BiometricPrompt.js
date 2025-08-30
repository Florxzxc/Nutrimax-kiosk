import React, { useEffect, useState } from "react";
import { MdFingerprint } from "react-icons/md";

const BiometricPrompt = ({ onVerified, onCancel, message }) => {
  const [status, setStatus] = useState("Please scan your fingerprint on the biometric device...");
  const [isScanning, setIsScanning] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    let interval;
    let timeout;
    
         const startScanning = () => {
       setIsScanning(true);
       setStatus("Waiting for fingerprint scan on device...");
      
      interval = setInterval(async () => {
        if (attempts >= maxAttempts) {
          setStatus("Maximum attempts reached. Please try again later.");
          setIsScanning(false);
          setTimeout(onCancel, 3000);
          return;
        }

                 try {
           // Check for recent biometric data from ZKTeco device
           // The device sends data to /iclock/cdata, so we need to check recent attendance logs
           const res = await fetch("/api/biometric/check-recent", { 
             method: "POST",
             headers: {
               'Content-Type': 'application/json'
             },
             body: JSON.stringify({
               timestamp: new Date().toISOString()
             })
           });
           
           if (!res.ok) {
             throw new Error('Network error');
           }
           
           const data = await res.json();
           
           if (data.verified && data.employee) {
             setStatus("✓ Verification successful!");
             setIsScanning(false);
             clearInterval(interval);
             
             // Pass employee data to parent component
             setTimeout(() => {
               onVerified({
                 id: data.employee.EmployeeID,
                 idNumber: data.employee.EmployeeNumber,
                 name: data.employee.FullName,
                 department: data.employee.DepartmentName,
                 supervisor: data.employee.SupervisorName
               });
             }, 1500);
             
           } else {
             setAttempts(prev => prev + 1);
             setStatus(`Please scan your fingerprint on the device. Attempt ${attempts + 1}/${maxAttempts}`);
             
             // Brief pause before next attempt
             setTimeout(() => {
               if (attempts + 1 < maxAttempts) {
                 setStatus("Waiting for fingerprint scan...");
               }
             }, 2000);
           }
        } catch (error) {
          console.error('Biometric verification error:', error);
          setStatus("Connection error. Please try again.");
          setAttempts(prev => prev + 1);
        }
      }, 2000); // Check every 2 seconds

      // Auto-timeout after 30 seconds
      timeout = setTimeout(() => {
        clearInterval(interval);
        setIsScanning(false);
        setStatus("Timeout. Please try again.");
        setTimeout(onCancel, 2000);
      }, 30000);
    };

    startScanning();

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [onVerified, onCancel, attempts, maxAttempts]);

     const handleRetry = () => {
     setAttempts(0);
     setStatus("Please scan your fingerprint on the biometric device...");
     setIsScanning(true);
   };

  const getStatusColor = () => {
    if (status.includes("✓")) return "#28a745"; // Green for success
    if (status.includes("not recognized") || status.includes("error")) return "#dc3545"; // Red for errors
    if (status.includes("Maximum attempts")) return "#dc3545"; // Red for max attempts
    return "#007bff"; // Blue for normal states
  };

  return (
    <div className="biometric-prompt" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <MdFingerprint 
          size={120} 
          color={isScanning ? "#3ee98a" : "#ccc"} 
          className={`biometric-fingerprint ${isScanning ? 'pulse' : ''}`}
          style={{
            filter: isScanning ? 'drop-shadow(0 0 10px rgba(62, 233, 138, 0.5))' : 'none',
            transition: 'all 0.3s ease'
          }}
        />
        {isScanning && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '140px',
              height: '140px',
              border: '2px solid rgba(62, 233, 138, 0.3)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}
          />
        )}
      </div>

      <h2 className="biometric-title" style={{
        color: '#333',
        marginBottom: '10px',
        fontSize: '24px'
      }}>
        Biometric Verification
      </h2>
      
             <p className="biometric-desc" style={{
         color: '#666',
         marginBottom: '20px',
         lineHeight: '1.5'
       }}>
         {message || "Please place your finger on the biometric scanner to verify your identity."}
       </p>
      
      <div 
        className={`biometric-status${status.includes("✓") ? " verified" : ""}`}
        style={{
          color: getStatusColor(),
          fontSize: '16px',
          fontWeight: '500',
          marginBottom: '20px',
          minHeight: '24px'
        }}
      >
        {status}
      </div>

      {/* Progress indicator */}
      <div style={{
        width: '200px',
        height: '4px',
        backgroundColor: '#e0e0e0',
        borderRadius: '2px',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <div 
          style={{
            height: '100%',
            backgroundColor: isScanning ? '#3ee98a' : '#ccc',
            borderRadius: '2px',
            width: `${(attempts / maxAttempts) * 100}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {!isScanning && attempts < maxAttempts && !status.includes("✓") && (
          <button
            onClick={handleRetry}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Try Again
          </button>
        )}
        
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#666',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default BiometricPrompt;