import React, { useState } from "react";
import { MdClose, MdSave, MdPrint } from "react-icons/md";

const Overtime = ({ onBack }) => {
  const [formData, setFormData] = useState({
    idNumber: "",
    name: "",
    date: "",
    estimateFrom: "",
    estimateTo: "",
    actualFrom: "",
    actualTo: "",
    remarks: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          <h1 className="leave-title">OVERTIME FORM</h1>
          <button className="leave-close-btn" onClick={onBack}>
            <MdClose />
          </button>
        </div>

        <div className="leave-form">
          <div className="leave-main-grid">
            <div className="leave-left-column">
              <div className="form-section">
                <h3>Employee Information</h3>
                <div className="form-row">
                  <label>ID Number:</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange("idNumber", e.target.value)}
                    placeholder="Enter employee ID number"
                  />
                </div>
                <div className="form-row">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter employee name"
                  />
                </div>
                <div className="form-row">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Estimate</h3>
                <div className="form-row">
                  <label>From:</label>
                  <input
                    type="time"
                    value={formData.estimateFrom}
                    onChange={(e) => handleInputChange("estimateFrom", e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>To:</label>
                  <input
                    type="time"
                    value={formData.estimateTo}
                    onChange={(e) => handleInputChange("estimateTo", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="leave-right-column">
              <div className="form-section">
                <h3>Actual</h3>
                <div className="form-row">
                  <label>From:</label>
                  <input
                    type="time"
                    value={formData.actualFrom}
                    onChange={(e) => handleInputChange("actualFrom", e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>To:</label>
                  <input
                    type="time"
                    value={formData.actualTo}
                    onChange={(e) => handleInputChange("actualTo", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Remarks</h3>
                <div className="form-row">
                  <label>Reason:</label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="leave-actions">
          <button className="leave-action-btn">
            <MdSave />
            <span>Save</span>
          </button>
          <button className="leave-action-btn">
            <MdPrint />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overtime;