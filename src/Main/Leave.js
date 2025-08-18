import React, { useState } from "react";
import { MdClose, MdSave, MdPrint } from "react-icons/md";

const Leave = ({ onBack }) => {
  const [formData, setFormData] = useState({
    idNumber: "",
    name: "",
    leaveType: "",
    fromDate1: "",
    toDate1: "",
    days1: "",
    fromDate2: "",
    toDate2: "",
    days2: "",
    medicalFile: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLeaveTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      leaveType: type
    }));
  };



  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        medicalFile: file
      }));
    }
  };

  return (
    <div className="leave-modal-overlay">
      <div className="leave-modal">
        {/* Header */}
        <div className="leave-header">
          <div className="logo-section">
            <div className="nutrimax-logo">
              <div className="logo-red">NUTRIMAX</div>
              <div className="logo-blue">KIOSK</div>
            </div>
          </div>
          <h1 className="leave-title">LEAVE APPLICATION FORM</h1>
          <button className="leave-close-btn" onClick={onBack}>
            <MdClose />
          </button>
        </div>

        {/* Form Content */}
        <div className="leave-form">
          {/* Main Form Grid */}
          <div className="leave-main-grid">
            {/* Left Column */}
            <div className="leave-left-column">
              {/* Employee Information */}
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
              </div>

              {/* Leave Type Selection */}
              <div className="form-section">
                <h3>Leave Type Selection</h3>
                <p className="section-description">Please check the appropriate box below:</p>
                <div className="leave-type-options">
                  <div className="leave-type-group">
                    <label className="leave-type-label">
                      <input
                        type="radio"
                        name="leaveType"
                        value="vacation"
                        checked={formData.leaveType === "vacation"}
                        onChange={() => handleLeaveTypeChange("vacation")}
                      />
                      <span className="leave-type-text">Vacation Leave</span>
                    </label>
                    <div className="sub-options">
                      <label className="sub-option-label">
                        <input type="radio" name="vacationSub" value="scheduled" />
                        <span>Scheduled Leave</span>
                      </label>
                      <label className="sub-option-label">
                        <input type="radio" name="vacationSub" value="emergency" />
                        <span>Emergency Leave</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="leave-type-group">
                    <label className="leave-type-label">
                      <input
                        type="radio"
                        name="leaveType"
                        value="sick"
                        checked={formData.leaveType === "sick"}
                        onChange={() => handleLeaveTypeChange("sick")}
                      />
                      <span className="leave-type-text">Sick Leave</span>
                    </label>
                    <div className="sub-options">
                      <label className="sub-option-label">
                        <input type="radio" name="sickSub" value="withMedical" />
                        <span>With Medical Certificate</span>
                      </label>
                      <label className="sub-option-label">
                        <input type="radio" name="sickSub" value="withoutMedical" />
                        <span>Without Medical Certificate</span>
                      </label>
                    </div>
                    
                    {/* Medical Certificate Upload Section */}
                    {formData.leaveType === "sick" && (
                      <div className="medical-upload-section">
                        <h4>Medical Certificate Upload</h4>
                        <div className="file-upload-container">
                          <input
                            type="file"
                            id="medicalFile"
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="file-input"
                          />
                          <label htmlFor="medicalFile" className="file-upload-btn">
                            <span className="upload-icon">📎</span>
                            <span>Attach Medical Certificate</span>
                          </label>
                          {formData.medicalFile && (
                            <div className="file-info">
                              <span className="file-name">✓ {formData.medicalFile.name}</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, medicalFile: null }))}
                                className="remove-file-btn"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="upload-note">Accepted formats: Images, PDF, Word documents</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="leave-type-group">
                    <label className="leave-type-label">
                      <input
                        type="radio"
                        name="leaveType"
                        value="maternity"
                        checked={formData.leaveType === "maternity"}
                        onChange={() => handleLeaveTypeChange("maternity")}
                      />
                      <span className="leave-type-text">Maternity Leave</span>
                    </label>
                  </div>
                  
                  <div className="leave-type-group">
                    <label className="leave-type-label">
                      <input
                        type="radio"
                        name="leaveType"
                        value="paternity"
                        checked={formData.leaveType === "paternity"}
                        onChange={() => handleLeaveTypeChange("paternity")}
                      />
                      <span className="leave-type-text">Paternity Leave</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="leave-right-column">
              {/* Inclusive Dates Table */}
              <div className="form-section">
                <h3>Inclusive Dates</h3>
                <div className="dates-table">
                  <table>
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>No. of days</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <input
                            type="date"
                            value={formData.fromDate1}
                            onChange={(e) => handleInputChange("fromDate1", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={formData.toDate1}
                            onChange={(e) => handleInputChange("toDate1", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={formData.days1}
                            onChange={(e) => handleInputChange("days1", e.target.value)}
                            placeholder="Days"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <input
                            type="date"
                            value={formData.fromDate2}
                            onChange={(e) => handleInputChange("fromDate2", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={formData.toDate2}
                            onChange={(e) => handleInputChange("toDate2", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={formData.days2}
                            onChange={(e) => handleInputChange("days2", e.target.value)}
                            placeholder="Days"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="note">Note: Kindly indicate any day-off in between your leave</p>
                </div>
              </div>
            </div>
          </div>


        </div>
        
        {/* Action Buttons */}
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

export default Leave;
