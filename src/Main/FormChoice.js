import React from 'react';

const iconStyle = {
  width: 48,
  height: 48,
  marginBottom: 12,
};

const buttonStyle = {
  flex: 1,
  minWidth: 0,
  minHeight: 180,
  margin: '0 16px',
  background: 'linear-gradient(135deg, #1a237e 60%, #d32f2f 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 22,
  fontWeight: 700,
  boxShadow: '0 4px 16px rgba(26,35,126,0.12)',
  cursor: 'pointer',
  transition: 'transform 0.1s',
};

const FormChoice = () => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 24 }}>
      <button style={buttonStyle}>
        {/* Overtime Icon (Clock) */}
        <svg style={iconStyle} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" stroke="#fff" strokeWidth="4" fill="#1976d2" />
          <rect x="22" y="14" width="4" height="12" rx="2" fill="#fff" />
          <rect x="24" y="24" width="10" height="4" rx="2" fill="#fff" />
        </svg>
        Overtime
      </button>
      <button style={buttonStyle}>
        {/* Leave Request Icon (Calendar) */}
        <svg style={iconStyle} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="12" width="32" height="28" rx="6" fill="#d32f2f" stroke="#fff" strokeWidth="4" />
          <rect x="14" y="20" width="8" height="8" rx="2" fill="#fff" />
          <rect x="26" y="20" width="8" height="8" rx="2" fill="#fff" />
        </svg>
        Leave Request
      </button>
    </div>
  );
};

export default FormChoice; 