import React from "react";

const Overtime = ({ onBack }) => (
  <div className="overtime-container">
    <button className="choose-back" onClick={onBack} aria-label="Back">
      &#8592;
    </button>
    <h2 className="overtime-title">OVERTIME FORM</h2>
    <form className="overtime-form">
      <div className="overtime-row">
        <label>ID No.</label>
        <input type="text" />
      </div>
      <div className="overtime-row">
        <label>Name:</label>
        <input type="text" />
      </div>
      <div className="overtime-section-title">ESTIMATE</div>
      <div className="overtime-row overtime-row-inline">
        <label>From:</label>
        <input type="time" />
        <label>To:</label>
        <input type="time" />
      </div>
      <div className="overtime-section-title">ACTUAL</div>
      <div className="overtime-row overtime-row-inline">
        <label>From:</label>
        <input type="time" />
        <label>To:</label>
        <input type="time" />
      </div>
      <button className="overtime-submit" type="submit">Submit</button>
    </form>
  </div>
);

export default Overtime;