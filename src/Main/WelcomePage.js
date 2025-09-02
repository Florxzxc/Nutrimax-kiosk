import React from "react";
import "../style/Design.css";

const WelcomePage = ({ onEnter }) => (
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

    {/* Welcome Card */}
    <main className="main-content">
      <div className="content-container">
        <div className="form-section" style={{ textAlign: "center" }}>
          <div className="form-container">
            <div className="form-group">
              
              {/* Mascot (floating animation) */}
              <div className="welcome-mascot">
                <img src="/pictures/Happy.png" alt="Mascot" />
              </div>

              {/* Animated Title */}
              <h1 className="welcome-title-animated">
                Welcome to NUTRIMAX
              </h1>
              <p className="welcome-subtitle">
                Workforce Kiosk System
              </p>

              {/* Eye-Catching Button */}
              <button className="welcome-btn-animated" onClick={onEnter}>
                Enter Kiosk
              </button>

              {/* Tagline */}
              <p className="group-subtitle" style={{ marginTop: "28px", color: "rgba(255,255,255,0.8)" }}>
                Your gateway to efficiency and seamless workforce management 🍞
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default WelcomePage;
