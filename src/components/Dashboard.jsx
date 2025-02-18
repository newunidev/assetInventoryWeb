import React, { useState } from "react";
import { FaBars, FaChevronDown } from "react-icons/fa";
import { Link ,useNavigate} from "react-router-dom";

import "./Dashboard.css"; // Import the CSS file

const Dashboard = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const [isReportsOpen, setIsReportsOpen] = useState(false);



  const navigate = useNavigate(); // Hook for navigation

  //get the local storage values
  // Retrieve user details from sessionStorage
  const userEmail = sessionStorage.getItem("userEmail");
  const userBranch = sessionStorage.getItem("userBranch");

  const handleLogout = () => {
    navigate("/login"); // Redirects directly to login
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <button onClick={() => setIsOpen(!isOpen)} className="menu-btn">
          <FaBars />
        </button>
        <ul>
          <li>
            <Link to="/dashboardcontent" className="link">Dashboard</Link>
          </li>
          <li>
            <Link to="/machine" className="link">Machine</Link>
          </li>
          <li>
            <Link to="/scans" className="link">Scan Options</Link>
          </li>
          <li className="reports" onClick={() => setIsReportsOpen(!isReportsOpen)}>
            Reports <FaChevronDown className={isReportsOpen ? "rotate" : ""} />
            {isReportsOpen && (
              <ul className="sub-menu">
                <li>
                  <Link to="/reports/inventoryreport" className="link">Inventory Reports</Link>
                </li>
                <li>
                  <Link to="/reports/inventorycountreport" className="link">Count Scan Report</Link>
                </li>
                <li>
                  <Link to="/reports/idle" className="link">Idle Report</Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button onClick={handleLogout} className="logout-btn">Log Out</button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Navbar */}
       {/* Navbar Section */}
          <div className="navbar">
            <h1>NU Asset Management</h1>
            <div className="user-info">
              <div className="user-details">
                <span className="user-email">{userEmail}</span>
                <span className="user-branch">{userBranch}</span>
              </div>
              <button className="profile-btn">Profile</button>
            </div>
          </div>

        {/* Load Dynamic Content */}
        {children}
      </div>
    </div>
  );
};

export default Dashboard;
