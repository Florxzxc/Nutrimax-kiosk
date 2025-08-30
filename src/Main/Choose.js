import React from "react";
import { MdAccessTime, MdEventBusy } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa"; // better back arrow
import "../style/global.css";

const Choose = ({ onBack, onOvertime, onLeave }) => {
  return (
    <div className="choose-wrapper">
      {/* Back Button */}
      <button className="choose-back" onClick={onBack} aria-label="Back">
        <FaArrowLeft />
      </button>

      {/* Header with mascot */}
      <div className="choose-header">
        <img src="/pictures/Welcome.png" alt="Mascot" className="choose-mascot" />
        <h2 className="choose-title">Please Choose</h2>
      </div>

      {/* Options */}
      <div className="choose-options">
        <div className="choose-card overtime" onClick={onOvertime}>
          <MdAccessTime className="choose-icon" />
          <h3 className="choose-label">Overtime</h3>
        </div>

        <div className="choose-card leave" onClick={onLeave}>
          <MdEventBusy className="choose-icon" />
          <h3 className="choose-label">Leave</h3>
        </div>
      </div>
    </div>
  );
};

export default Choose;
