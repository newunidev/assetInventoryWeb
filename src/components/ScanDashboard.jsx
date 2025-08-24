import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBarcode,
  FaCogs,
  FaPauseCircle,
  FaCheckCircle,
} from "react-icons/fa";
import "./ScanDashboard.css";
import { CommonStore } from "../utility/common";
import { useEffect } from "react";
import { usePageTitle } from "../utility/usePageTitle";

const ScanDashboard = () => {
  const navigate = useNavigate();
  const [, setPageTitle] = usePageTitle();

  const scanOptions = [
    {
      title: "Inventory Scan",
      icon: <FaBarcode size={20} />,
      route: "/inventory-scan",
      color: "blue",
    },
    {
      title: "Custom Scan",
      icon: <FaCogs size={20} />,
      route: "/custom-scan",
      color: "green",
    },
    {
      title: "Idle Scan",
      icon: <FaPauseCircle size={20} />,
      route: "/idle-scan",
      color: "yellow",
    },
    {
      title: "Normal Scan",
      icon: <FaCheckCircle size={20} />,
      route: "/normal-scan",
      color: "red",
    },
  ];

  useEffect(() => {
    setPageTitle("Scan Options");
  }, [setPageTitle]);

  return (
    <div className="scan-dashboard">
      <h2 className="dashboard-title">Scan Dashboard</h2>
      <div className="button-grid">
        {scanOptions.map((option, index) => (
          <button
            key={index}
            className={`scan-button ${option.color}`}
            onClick={() => navigate(option.route)}
          >
            {option.icon}
            {option.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScanDashboard;
