import React, { useState } from "react";
import { MdAccessTime, MdEventBusy, MdInfo, MdTrendingUp, MdCalendarToday } from "react-icons/md";
import { FaArrowLeft, FaClock, FaCalendarAlt } from "react-icons/fa";
import "../style/Design.css";

const Choose = ({ onBack, onOvertime, onLeave }) => {
  const [hoveredOption, setHoveredOption] = useState(null);

  const handleMouseEnter = (option) => {
    setHoveredOption(option);
  };

  const handleMouseLeave = () => {
    setHoveredOption(null);
  };

  return (
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

      {/* Header */}
      <header className="top-header">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="brand-section">
            <div className="brand-logo">
              <div className="logo-pulse"></div>
              <div className="logo-glow"></div>
              <div className="logo-reflection"></div>
            </div>
            <div className="brand-info">
              <h1 className="brand-name">NUTRIMAX</h1>
              <span className="brand-subtitle">Kiosk System</span>
            </div>
          </div>
          <div className="page-info">
            <div className="page-indicator"></div>
            <h2 className="page-title">Choose Your Service</h2>
            <div className="page-status">Ready to Assist</div>
          </div>
          <div className="header-actions">
            <button className="header-btn glass-btn close" onClick={onBack} aria-label="Back">
              <FaArrowLeft size={20} />
              <span className="btn-ripple"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          <div className="form-section">
            <div className="form-container choose-container">
              <div className="form-group">
                <div className="group-header">
                  <div className="group-icon-wrapper">
                    <MdInfo className="group-icon" />
                    <div className="icon-glow"></div>
                  </div>
                  <div className="group-info">
                    <h3 className="group-title">
                      What would you like to do today?
                      <span className="optional-badge">Choose One</span>
                    </h3>
                    <p className="group-subtitle">Select the service you need and we'll guide you through the process</p>
                  </div>
                  <div className="group-status">
                    <div className="status-dot active"></div>
                  </div>
                </div>

                <div className="form-fields">
                  <div className="field-container">
                    {/* Main Options Container */}
                    <div className="choose-options-grid">
                      
                      {/* Overtime Option */}
                      <div 
                        className="option-card-enhanced"
                        onMouseEnter={() => handleMouseEnter('overtime')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="card-bg-effect"></div>
                        <div className="card-header-section">
                          <div className="card-icon-container">
                            <div className="card-icon-bg overtime-bg">
                              <MdAccessTime className="card-main-icon" />
                            </div>
                            <div className="icon-floating-particles">
                              <div className="floating-particle p1"></div>
                              <div className="floating-particle p2"></div>
                              <div className="floating-particle p3"></div>
                            </div>
                          </div>
                          <div className="card-title-section">
                            <h4 className="card-title-text">Request Overtime</h4>
                            <p className="card-subtitle-text">Submit additional working hours</p>
                          </div>
                        </div>
                        
                        <div className="card-description-section">
                          <p className="card-description">
                            Need to work beyond your regular schedule? Submit your overtime request 
                            with detailed hours and get quick approval from your supervisor.
                          </p>
                          <div className="card-benefits">
                            <div className="benefit-item">
                              <FaClock className="benefit-icon" />
                              <span>Track Extra Hours</span>
                            </div>
                            <div className="benefit-item">
                              <MdTrendingUp className="benefit-icon" />
                              <span>Compensation Ready</span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          className="submit-button card-action-btn" 
                          onClick={onOvertime}
                        >
                          <div className="btn-background overtime-gradient"></div>
                          <div className="btn-content">
                            <MdAccessTime className="button-icon" />
                            <span className="button-text">Request Overtime</span>
                          </div>
                          <div className="btn-glow overtime-glow"></div>
                          <div className="btn-particles">
                            <div className="particle particle-1"></div>
                            <div className="particle particle-2"></div>
                            <div className="particle particle-3"></div>
                          </div>
                        </button>
                        
                        <div className={`card-hover-overlay ${hoveredOption === 'overtime' ? 'active' : ''}`}></div>
                      </div>

                      {/* Leave Option */}
                      <div 
                        className="option-card-enhanced"
                        onMouseEnter={() => handleMouseEnter('leave')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="card-bg-effect"></div>
                        <div className="card-header-section">
                          <div className="card-icon-container">
                            <div className="card-icon-bg leave-bg">
                              <MdEventBusy className="card-main-icon" />
                            </div>
                            <div className="icon-floating-particles">
                              <div className="floating-particle p1"></div>
                              <div className="floating-particle p2"></div>
                              <div className="floating-particle p3"></div>
                            </div>
                          </div>
                          <div className="card-title-section">
                            <h4 className="card-title-text">Request Leave</h4>
                            <p className="card-subtitle-text">Apply for time off</p>
                          </div>
                        </div>
                        
                        <div className="card-description-section">
                          <p className="card-description">
                            Planning a vacation or need personal time? Submit your leave request 
                            with preferred dates and let HR process your application efficiently.
                          </p>
                          <div className="card-benefits">
                            <div className="benefit-item">
                              <FaCalendarAlt className="benefit-icon" />
                              <span>Flexible Dates</span>
                            </div>
                            <div className="benefit-item">
                              <MdCalendarToday className="benefit-icon" />
                              <span>Balance Tracking</span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          className="submit-button card-action-btn" 
                          onClick={onLeave}
                        >
                          <div className="btn-background leave-gradient"></div>
                          <div className="btn-content">
                            <MdEventBusy className="button-icon" />
                            <span className="button-text">Request Leave</span>
                          </div>
                          <div className="btn-glow leave-glow"></div>
                          <div className="btn-particles">
                            <div className="particle particle-1"></div>
                            <div className="particle particle-2"></div>
                            <div className="particle particle-3"></div>
                          </div>
                        </button>
                        
                        <div className={`card-hover-overlay ${hoveredOption === 'leave' ? 'active' : ''}`}></div>
                      </div>

                    </div>

                    {/* Helper Information */}
                    <div className="helper-text enhanced-helper">
                      <div className="helper-icon-wrapper">
                        <MdInfo className="helper-icon" />
                        <div className="helper-icon-glow"></div>
                      </div>
                      <div className="helper-content">
                        <p className="helper-main-text">Need help deciding?</p>
                        <p className="helper-sub-text">
                          Both requests are processed quickly and you'll receive confirmation via email. 
                          Choose the option that best fits your current needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Section */}
          <div className="form-section" style={{ marginTop: '24px' }}>
            <div className="form-container">
              <div className="form-group">
                <div className="group-header">
                  <div className="group-icon-wrapper">
                    <MdTrendingUp className="group-icon" />
                    <div className="icon-glow"></div>
                  </div>
                  <div className="group-info">
                    <h3 className="group-title">
                      Quick Process Overview
                      <span className="optional-badge">Info</span>
                    </h3>
                    <p className="group-subtitle">Here's what happens after you make your selection</p>
                  </div>
                  <div className="group-status">
                    <div className="status-dot optional"></div>
                  </div>
                </div>

                <div className="process-timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot step-1"></div>
                    <div className="timeline-content">
                      <h4>Fill Details</h4>
                      <p>Provide necessary information for your request</p>
                    </div>
                  </div>
                  <div className="timeline-connector"></div>
                  <div className="timeline-item">
                    <div className="timeline-dot step-2"></div>
                    <div className="timeline-content">
                      <h4>Review & Submit</h4>
                      <p>Double-check your information before submission</p>
                    </div>
                  </div>
                  <div className="timeline-connector"></div>
                  <div className="timeline-item">
                    <div className="timeline-dot step-3"></div>
                    <div className="timeline-content">
                      <h4>Get Approval</h4>
                      <p>Receive confirmation and approval notification</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Choose;