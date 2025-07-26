import React from "react";
import "../style/global.css";

const WelcomePage = ({ onEnter }) => (
  <div
    className="welcome-container"
    style={{
      backgroundImage: "url('/pictures/GardeniaBG.webp')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      minWidth: "100vw",
    }}
  >
    <div className="welcome-overlay">
      <h1 className="welcome-title">
        WELCOME TO NUTRIMAX<br />WORKFORCE KIOSK
      </h1>
      <button className="welcome-btn" onClick={onEnter}>
        Enter
      </button>
    </div>
  </div>
);

export default WelcomePage;