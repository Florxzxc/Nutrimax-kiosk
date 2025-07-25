import React, { useState } from 'react';
import FormChoice from './Main/FormChoice';

const backgroundUrl = 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrGUzlSgQ-s1ef11-NZSTtaKdLVW6QfB4tPo_8P1g9tmvgvDdWyRq5UnzZc5kkgB_jEC46R1YrLZF8cGc0WYseSc6NLOBRXXjrLIog-ZtNaulkR4c3K5ehrCzHAp72Ty5T3Rhnn=s680-w680-h510-rw';

// Add global styles for box-sizing and body background
const globalStyle = `
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`;

const App = () => {
  const [showChoice, setShowChoice] = useState(false);

  return (
    <>
      <style>{globalStyle}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: `url(${backgroundUrl}) center center/cover no-repeat fixed`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Segoe UI, Arial, sans-serif',
          zIndex: 0,
        }}
      >
        {/* Overlay for better readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, rgba(26,35,126,0.7) 60%, rgba(211,47,47,0.6) 100%)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            width: 420,
            minHeight: 540,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 36,
            border: '4px solid #1a237e',
            boxShadow: '0 8px 32px rgba(26,35,126,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            padding: '40px 32px 32px 32px',
          }}
        >
          {showChoice ? (
            <FormChoice />
          ) : (
            <>
              <div style={{ width: '100%', marginBottom: 32 }}>
                <h1
                  style={{
                    color: '#1a237e',
                    fontWeight: 800,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontSize: 30,
                    letterSpacing: 1.5,
                    margin: 0,
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}
                >
                  Welcome to
                  <br />
                  <span style={{ color: '#d32f2f', fontWeight: 900 }}>Nutrimax</span>
                  <br />
                  Workforce Kiosk
                </h1>
                <p
                  style={{
                    color: '#333',
                    textAlign: 'center',
                    fontSize: 18,
                    margin: 0,
                    marginTop: 10,
                    marginBottom: 0,
                    fontWeight: 500,
                    letterSpacing: 0.2,
                  }}
                >
                  Please tap the button below to begin
                </p>
              </div>
              <button
                style={{
                  width: '90%',
                  padding: '20px 0',
                  background: 'linear-gradient(90deg, #1a237e 60%, #1976d2 100%)',
                  color: '#fff',
                  fontSize: 26,
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 16,
                  marginBottom: 0,
                  position: 'relative',
                  boxShadow: '0 4px 16px rgba(211,47,47,0.15)',
                  borderBottom: '6px solid #d32f2f',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.1s',
                  outline: 'none',
                }}
                onClick={() => setShowChoice(true)}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ letterSpacing: 1 }}>Enter</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default App;
