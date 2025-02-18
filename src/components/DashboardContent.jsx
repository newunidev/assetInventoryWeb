import React from "react";
import "./DashboardContent.css";

const DashboardContent = () => {
  return (
    <div className="dashboard-container">
      {/* Left Section: Factory & Machine Count Widgets */}
      <div className="left-section">
        <div className="dashboard-widget">
          <h3>Factory A</h3>
          <p>Items: 1200</p>
        </div>
        <div className="dashboard-widget">
          <h3>Factory B</h3>
          <p>Items: 950</p>
        </div>
        <div className="dashboard-widget">
          <h3>Factory C</h3>
          <p>Items: 780</p>
        </div>
        <div className="dashboard-widget">
          <h3>Factory D</h3>
          <p>Items: 1100</p>
        </div>
        <div className="dashboard-widget">
          <h3>Factory E</h3>
          <p>Items: 1300</p>
        </div>
        <div className="dashboard-widget">
          <h3>Factory F</h3>
          <p>Items: 900</p>
        </div>
      </div>

      {/* Right Section: Statistics Graph */}
      <div className="right-section">
        <h2 className="stat-title">Idle Machine Stat.</h2>
        <div className="bar-chart">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
