import React, { useState } from "react";
import { FaBars, FaChevronDown } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { FaUser } from "react-icons/fa"; // Font Awesome user icon
import { FaTachometerAlt, FaCogs, FaQrcode } from "react-icons/fa";
import { MdAssessment } from "react-icons/md";
import { MdDevices } from "react-icons/md";
import { GiFactory } from "react-icons/gi";
import { GiForklift } from "react-icons/gi";
import { useEffect } from "react";
import { usePageTitle } from "../utility/usePageTitle";

import "./Dashboard.css"; // Import the CSS file

const Dashboard = ({ children }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const [isRentOpen, setIsRentOpen] = useState(false);
  const [isPOOpen, setIsPOOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(true);

  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const navigate = useNavigate(); // Hook for navigation
  const [pageTitle] = usePageTitle();

  //get the local storage values
  // Retrieve user details from sessionStorage
  //  const userEmail = sessionStorage.getItem("userEmail");
  //const userBranch = sessionStorage.getItem("userBranch");

  const userEmail = localStorage.getItem("userEmail");
  const userBranch = localStorage.getItem("userBranch");
  const userName = localStorage.getItem("name");
  const designation = localStorage.getItem("designation");

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ Remove the stored token
    localStorage.clear(); // ✅ Ensure full session clearance

    console.log("Token after removal:", localStorage.getItem("token")); // Should log `null`
    console.log("Session Storage after clearing:", localStorage); // Should be empty

    setTimeout(() => {
      window.location.href = "/login"; // ✅ Force redirect to login
    }, 1000); // ✅ Delay redirect to see logs in the console
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
              <FaCogs size={22} color="white" className="icon" /> Machine
            </Link>
          </li>
          <li>
            <Link to="/scans" className="link">
              <FaQrcode size={22} color="white" className="icon" /> Scan Options
            </Link>
          </li>

          <li
            className="parentdropdown"
            onMouseEnter={() => setIsReportsOpen(true)}
            onMouseLeave={() => setIsReportsOpen(false)}
          >
            <MdAssessment size={27} color="white" className="icon" />
            Machine Reports{" "}
            <FaChevronDown className={isReportsOpen ? "rotate" : ""} />
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
                    🌎 Machine Summery
                  </Link>
                </li>
                <li>
                  <Link to="/reports/machinetransfers" className="link">
                    🔁 Transfer History
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li
            className="parentdropdown"
            onMouseEnter={() => setIsReportsOpen(true)}
            onMouseLeave={() => setIsReportsOpen(false)}
          >
            <MdDevices size={27} color="white" className="icon" />
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

          {/*Rent machine part */}

          <li
            className="parentdropdown"
            onMouseEnter={() => setIsReportsOpen(true)}
            onMouseLeave={() => setIsReportsOpen(false)}
          >
            <GiForklift size={40} color="white" className="icon" />
            Rent Machines{" "}
            <FaChevronDown className={isReportsOpen ? "rotate" : ""} />
            {isReportsOpen && (
              <ul className="sub-menu">
                <li>
                  <Link to="/rentmachines/createrentmachines" className="link">
                    🏭 New Rent Machine
                  </Link>
                </li>

                {/* Nested Dropdown Start */}
                <li
                  className="parentdropdown"
                  onMouseEnter={() => setIsPOOpen(true)}
                  onMouseLeave={() => setIsPOOpen(false)}
                >
                  <div className="nested-dropdown">
                    <GiFactory size={20} color="white" className="icon" />
                    Purchase Orders{" "}
                    <FaChevronDown className={isPOOpen ? "rotate" : ""} />
                  </div>

                  {isPOOpen && (
                    <ul className="sub-menu">
                      <li>
                        <Link to="/rentmachines/po" className="link">
                          🧾 Create PO
                        </Link>
                      </li>
                      <li>
                        <Link to="/rentmachines/poview" className="link">
                          📄 View POs
                        </Link>
                      </li>
                      <li>
                        <Link to="/purchaseorders/history" className="link">
                          📚 PO History
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                {/* Nested Dropdown End */}

                <li>
                  <Link to="/rentmachines/allocations" className="link">
                    📦 Machine Allocations
                  </Link>
                </li>
                <li>
                  <Link to="/itassets/returns" className="link">
                    🔁 Return
                  </Link>
                </li>
                <li>
                  <Link to="/rentmachines/summary" className="link">
                    📈 Rent Summary
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              to="/usermanagement"
              className="link"
              onClick={(e) => {
                const permissionIds =
                  JSON.parse(localStorage.getItem("permissions")) || [];
                  console.log("permsionin muser",permissionIds);
                
                if (!permissionIds.includes("PERM005")) {
                  e.preventDefault(); // Prevent navigation
                  alert("You do not have permission to access this page.");
                }
              }}
            >
              <FaUser size={22} color="white" className="icon" /> User Manager
            </Link>
          </li>

          {/*Rent machine part End */}

          {/* <li>
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut size={20} /> 
            </button>
          </li> */}
          {/* Logout button at bottom center */}
          <div className="logout-container">
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut size={24} />
            </button>
          </div>
        </ul>
        {/* Footer Section */}
        <div className="sidebar-footer">
          <p>© {new Date().getFullYear()} Developed by Dinindu</p>

          <p>Version 1.2.0</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Navbar */}
        {/* Navbar Section */}
        <div className="navbar">
          <h2>NU Asset Management - {pageTitle}</h2>

          <div className="user-info">
            <button className="profile-btn">
              <span style={{ fontSize: "25px" }}>👨‍💼</span>
            </button>
            <div className="user-details">
              <span className="user-Name">{userName}</span>
              <span className="user-branch">{userBranch}</span>
            </div>

            <div
              className="notification-icon"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <span className="bell">🔔</span>
              <span className="notification-count">3</span> {/* Red bubble */}
              {showNotifications && (
                <div className="notification-dropdown">
                  <ul>
                    <li>You have 3 new messages</li>
                    <li>System maintenance at 9 PM</li>
                    <li>New update available</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Load Dynamic Content */}
        {children}
      </div>
    </div>
  );
};

export default Dashboard;
