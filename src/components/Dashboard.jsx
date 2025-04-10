import React, { useState } from "react";
import { FaBars, FaChevronDown } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { FaTachometerAlt, FaCogs, FaQrcode } from "react-icons/fa";
import { MdAssessment } from "react-icons/md";
import { MdDevices } from "react-icons/md";

import "./Dashboard.css"; // Import the CSS file

const Dashboard = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const navigate = useNavigate(); // Hook for navigation

  //get the local storage values
  // Retrieve user details from sessionStorage
  //  const userEmail = sessionStorage.getItem("userEmail");
  //const userBranch = sessionStorage.getItem("userBranch");

  const userEmail = localStorage.getItem("userEmail");
  const userBranch = localStorage.getItem("userBranch");
  const userName = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ Remove the stored token
    localStorage.clear(); // ✅ Ensure full session clearance

    console.log("Token after removal:", localStorage.getItem("token")); // Should log `null`
    console.log("Session Storage after clearing:", localStorage); // Should be empty

    setTimeout(() => {
      window.location.href = "/login"; // ✅ Force redirect to login
    }, 2000); // ✅ Delay redirect to see logs in the console
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {/* <button onClick={() => setIsOpen(!isOpen)} className="menu-btn">
          <FaBars />
        </button> */}
        <ul>
          <li>
            <Link to="/dashboardcontent" className="link">
              <FaTachometerAlt className="icon" /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/machine" className="link">
              <FaCogs className="icon" /> Machine
            </Link>
          </li>
          <li>
            <Link to="/scans" className="link">
              <FaQrcode className="icon" /> Scan Options
            </Link>
          </li>

          <li
            className="itassets"
            onMouseEnter={() => setIsReportsOpen(true)}
            onMouseLeave={() => setIsReportsOpen(false)}
          >
            <MdDevices size={27} color="#32CD32" className="icon" />
            IT Assets{" "}
            <FaChevronDown className={isReportsOpen ? "rotate" : ""} />
            {isReportsOpen && (
              <ul className="sub-menu">
                <li>
                  <Link to="/itassets/itassets" className="link">
                    📋 IT Asset Reports
                  </Link>
                </li>
                <li>
                  <Link to="/itassets/assetassignment" className="link">
                    📌 Asset Assigning
                  </Link>
                </li>
                <li>
                  <Link to="/itassets/assetuser" className="link">
                    📊 Asset User Manager
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li
            className="reports"
            onMouseEnter={() => setIsReportsOpen(true)}
            onMouseLeave={() => setIsReportsOpen(false)}
          >
            <MdAssessment size={27} color="yellow" className="icon" />
            Reports <FaChevronDown className={isReportsOpen ? "rotate" : ""} />
            {isReportsOpen && (
              <ul className="sub-menu">
                <li>
                  <Link to="/reports/inventoryreport" className="link">
                    📊 Inventory Reports
                  </Link>
                </li>
                <li>
                  <Link to="/reports/inventorycountreport" className="link">
                    📋 Count Scan Report
                  </Link>
                </li>
                <li>
                  <Link to="/reports/idle" className="link">
                    📌 Idle Report
                  </Link>
                </li>
                <li>
                  <Link to="/reports/machinetrackingreport" className="link">
                    🌎 Machine Full Report
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut size={20} /> {/* Adjust size as needed */}
            </button>
          </li>
        </ul>
        {/* Footer Section */}
        <div className="sidebar-footer">
          <p>© {new Date().getFullYear()} Developed by Dinindu Perera</p>
          <p>Version 1.2.0</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Navbar */}
        {/* Navbar Section */}
        <div className="navbar">
          <h1>NU Asset Management</h1>
          
          <div className="user-info">
            <div className="user-details">
              
              <span className="user-Name">{userName}</span>

              <span className="user-branch">{userBranch}</span>
            </div>
            <button className="profile-btn">🧑‍💼 Profile</button>
          </div>
        </div>

        {/* Load Dynamic Content */}
        {children}
      </div>
    </div>
  );
};

export default Dashboard;
