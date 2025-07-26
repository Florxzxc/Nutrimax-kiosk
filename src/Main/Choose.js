import React from "react";
import { MdAccessTime, MdEventBusy } from "react-icons/md";

const Choose = ({ onBack, onOvertime, onLeave }) => (
  <div className="choose-container">
    <button className="choose-back" onClick={onBack} aria-label="Back">
      &#8592;
    </button>
    <h2 className="choose-title">PLEASE CHOOSE:</h2>
    <div className="choose-options">
      <div className="choose-option" onClick={onOvertime}>
        <div className="choose-icon-frame">
          <MdAccessTime className="choose-icon" />
        </div>
        <div className="choose-label">Overtime</div>
      </div>
      <div className="choose-option" onClick={onLeave}>
        <div className="choose-icon-frame">
          <MdEventBusy className="choose-icon" />
        </div>
        <div className="choose-label">Leave</div>
      </div>
    </div>
  </div>
);

export default Choose;