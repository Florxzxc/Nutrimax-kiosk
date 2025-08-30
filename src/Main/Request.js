import React, { useState, useEffect } from "react";
import {
  FaThLarge,
  FaUsers,
  FaCalendarCheck,
  FaFileAlt,
  FaListAlt,
  FaCog,
  FaBars,
  FaChevronDown,
  FaSignOutAlt,
  FaClock,
  FaExchangeAlt,
  FaEye,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import { MdDarkMode } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

// Sidebar menu items
const menuItems = [
  { icon: <FaThLarge />, label: "Dashboard", path: "/dashboard" },
  { icon: <FaUsers />, label: "Employee", path: "/employeetable" },
  { icon: <FaCalendarCheck />, label: "Attendance", path: "/attendance" },
  { icon: <FaClock />, label: "Timekeeping", path: "/timekeeping" },
  { icon: <FaExchangeAlt />, label: "Shifts", path: "/shifts" },
  { icon: <FaFileAlt />, label: "Requests", path: "/requests" },
  { icon: <FaListAlt />, label: "Logs", path: "/logs" },
  { icon: <FaCog />, label: "Settings", path: "/settings" },
];

const Sidebar = ({
  collapsed,
  setCollapsed,
  showMenu,
  setShowMenu,
  darkMode,
  setDarkMode,
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest(".dashboard-email")) setShowMenu(false);
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu, setShowMenu]);

  const handleLogout = () => {
    setShowMenu(false);
    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  return (
    <>
      {/* Topbar */}
      <div className="dashboard-topbar">
        <span
          className="dashboard-email"
          tabIndex={0}
          onClick={() => setShowMenu((v) => !v)}
          onBlur={() => setTimeout(() => setShowMenu(false), 150)}
        >
          admin@example.com <FaChevronDown />
          {showMenu && (
            <div className="topbar-menu">
              <div
                className="topbar-menu-item"
                onClick={() => {
                  setDarkMode((d) => !d);
                  setShowMenu(false);
                }}
              >
                <MdDarkMode style={{ color: "#232323" }} />
                {darkMode ? "Light Mode" : "Dark Mode"}
              </div>
              
              <div className="topbar-menu-item" onClick={handleLogout}>
                <FaSignOutAlt style={{ color: "#232323" }} />
                Log out
              </div>
            </div>
          )}
        </span>
      </div>
      {/* Sidebar toggle button (when collapsed) */}
      {collapsed && (
        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
      )}
      {/* Sidebar */}
      <div className={`sidebar-container${collapsed ? " collapsed" : ""}`}>
        <div className="sidebar-topbar">
          <img
            src="/pictures/logo.png"
            alt="NUTRIMAX"
            className="sidebar-logo"
          />
          <button
            className="sidebar-close"
            onClick={() => setCollapsed(true)}
            aria-label="Close sidebar"
          >
            &times;
          </button>
        </div>
        <div className="sidebar-menu">
          {menuItems
            .filter(item => item.label !== "Logs" && item.label !== "Settings")
            .map((item) => (
              <div
                className={`sidebar-item${location.pathname === item.path ? " active" : ""}`}
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                style={{ cursor: item.path ? "pointer" : "default" }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </div>
            ))}
        </div>
        <div className="sidebar-bottom">
          {menuItems
            .filter(item => item.label === "Logs" || item.label === "Settings")
            .map(item => (
              <div
                className={`sidebar-item${location.pathname === item.path ? " active" : ""}`}
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                style={{ cursor: item.path ? "pointer" : "default" }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

const RequestDetails = ({ request, onClose, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState(request.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (newStatus === request.status) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/requests/${request.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        onStatusUpdate(request.id, newStatus);
        onClose();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        maxWidth: '500px', 
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Request Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Employee:</strong> {request.emp}</p>
          <p><strong>ID Number:</strong> {request.idNumber}</p>
          <p><strong>Department:</strong> {request.department}</p>
          <p><strong>Supervisor:</strong> {request.supervisor}</p>
          <p><strong>Request Type:</strong> {request.type}</p>
          <p><strong>Date Applied:</strong> {request.date}</p>
          <p><strong>Current Status:</strong> {request.status}</p>
          {request.dateApproved && <p><strong>Date Approved:</strong> {request.dateApproved}</p>}
          
          {/* Show overtime-specific details if available */}
          {request.type === 'Overtime' && (
            <>
              <hr style={{ margin: '15px 0' }} />
              <h4>Overtime Details:</h4>
              {request.overtimeDate && <p><strong>Overtime Date:</strong> {request.overtimeDate}</p>}
              {request.estimateFrom && <p><strong>Estimated Time:</strong> {request.estimateFrom} - {request.estimateTo}</p>}
              {request.actualFrom && <p><strong>Actual Time:</strong> {request.actualFrom} - {request.actualTo}</p>}
              {request.remarks && <p><strong>Remarks:</strong> {request.remarks}</p>}
            </>
          )}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Update Status:</strong>
          </label>
          <select 
            value={newStatus} 
            onChange={(e) => setNewStatus(e.target.value)}
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              width: '100%'
            }}
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleStatusUpdate}
            disabled={isUpdating}
            style={{ 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px',
              background: '#007bff',
              color: 'white',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.6 : 1
            }}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Requests = ({ darkMode, setDarkMode, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Search/filter state
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [type, setType] = useState("All Request");
  const [status, setStatus] = useState("All Status");
  const [showCount, setShowCount] = useState(15);
  const [page, setPage] = useState(1);

  // Data state
  const [requestsData, setRequestsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch requests from API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requests');
      const data = await response.json();
      setRequestsData(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Use fallback data if API fails
      setRequestsData([
        {
          id: 1,
          date: "2025/01/01",
          last: "DOE",
          emp: "John Doe",
          supervisor: "Jane Smith",
          department: "HR",
          type: "Leave",
          status: "Pending",
          dateApproved: "",
          idNumber: "EMP001"
        },
        {
          id: 2,
          date: "2025/01/02",
          last: "SMITH",
          emp: "Anna Smith",
          supervisor: "Jane Smith",
          department: "IT",
          type: "Overtime",
          status: "Approved",
          dateApproved: "2025/01/03",
          idNumber: "EMP002"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Set up auto-refresh to check for new requests from kiosk
    const interval = setInterval(fetchRequests, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (requestId, newStatus) => {
    setRequestsData(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: newStatus, 
              dateApproved: newStatus === 'Approved' ? new Date().toISOString().split('T')[0].replace(/-/g, '/') : req.dateApproved 
            }
          : req
      )
    );
  };

  // Department options for filter
  const departmentOptions = [
    "All Departments",
    ...Array.from(new Set(requestsData.map((r) => r.department).filter(Boolean))),
  ];
  // Request type options for filter
  const typeOptions = [
    "All Request",
    ...Array.from(new Set(requestsData.map((r) => r.type).filter(Boolean))),
  ];
  // Status options for filter
  const statusOptions = [
    "All Status",
    ...Array.from(new Set(requestsData.map((r) => r.status).filter(Boolean))),
  ];

  // Filtering logic
  const filteredRequests = requestsData.filter(
    (req) =>
      (req.emp?.toLowerCase().includes(search.toLowerCase()) ||
        req.last?.toLowerCase().includes(search.toLowerCase()) ||
        req.idNumber?.toLowerCase().includes(search.toLowerCase())) &&
      (department === "All Departments" || req.department === department) &&
      (type === "All Request" || req.type === type) &&
      (status === "All Status" || req.status === status)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / showCount);
  const paginatedRequests = filteredRequests.slice(
    (page - 1) * showCount,
    page * showCount
  );

  // Reset to first page when filters or showCount change
  useEffect(() => {
    setPage(1);
  }, [search, department, type, status, showCount]);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { backgroundColor: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'Rejected':
        return { backgroundColor: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'Pending':
        return { backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      default:
        return { backgroundColor: '#f8f9fa', color: '#6c757d', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
    }
  };

  return (
    <div>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={onLogout}
      />
      <div className={collapsed ? "main-content collapsed" : "main-content"}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="dashboard-title">Requests</h2>
          <button 
            onClick={fetchRequests}
            style={{ 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px',
              background: '#007bff',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title="Refresh to check for new requests"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading requests...
          </div>
        ) : (
          <div>
            <div className="employee-table-filters">
              <input
                className="employee-search"
                type="text"
                placeholder="Search employee or ID number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="employee-filter"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departmentOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                className="employee-filter"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {typeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                className="employee-filter"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="employee-table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Date Applied</th>
                    <th>Employee</th>
                    <th>ID Number</th>
                    <th>Supervisor</th>
                    <th>Department</th>
                    <th>Type of Request</th>
                    <th>Status</th>
                    <th>Date Approved</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", color: "black", padding: "20px" }}>
                        {loading ? "Loading..." : "No requests found."}
                      </td>
                    </tr>
                  ) : (
                    paginatedRequests.map((req) => (
                      <tr key={req.id}>
                        <td>{req.date}</td>
                        <td>{req.emp}</td>
                        <td>{req.idNumber || 'N/A'}</td>
                        <td>{req.supervisor}</td>
                        <td>{req.department}</td>
                        <td>
                          <span style={{
                            backgroundColor: req.type === 'Overtime' ? '#e3f2fd' : '#f3e5f5',
                            color: req.type === 'Overtime' ? '#1565c0' : '#7b1fa2',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {req.type}
                          </span>
                        </td>
                        <td>
                          <span style={getStatusBadgeStyle(req.status)}>
                            {req.status}
                          </span>
                        </td>
                        <td>{req.dateApproved || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={() => setSelectedRequest(req)}
                              style={{
                                padding: '6px 10px',
                                border: 'none',
                                borderRadius: '4px',
                                background: '#007bff',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="View Details"
                            >
                              <FaEye size={12} />
                              View
                            </button>
                            {req.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(req.id, 'Approved')}
                                  style={{
                                    padding: '6px 10px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: '#28a745',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Approve"
                                >
                                  <FaCheck size={12} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(req.id, 'Rejected')}
                                  style={{
                                    padding: '6px 10px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: '#dc3545',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Reject"
                                >
                                  <FaTimes size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="employee-table-footer">
              <div>
                Show{" "}
                <select
                  className="employee-show-select"
                  value={showCount}
                  onChange={(e) => setShowCount(Number(e.target.value))}
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="employee-pagination">
                <button
                  className="employee-pagination-btn"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="employee-pagination-btn"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages || paginatedRequests.length === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedRequest && (
          <RequestDetails 
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Requests;