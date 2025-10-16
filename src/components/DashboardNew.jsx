import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCogs, // Total Machines
  FaLaptop, // IT Assets
  FaUsers, // Active Users
  FaIndustry, // Factories
  FaChartPie, // IT Asset Allocation (for the panel title)
  FaTimes, // Modal close icon
  FaExternalLinkAlt,
  FaWarehouse, // "See More" button icon
  FaPrint,
  FaDesktop,
  FaAccusoft,
  FaGrimace,
} from "react-icons/fa";
import {
  getTotalItemsCount,
  getTotalItemsbyBranch,
} from "../controller/ItemController";
import { getITAssetCountByCategory } from "../controller/ItAssetController";
import { usePageTitle } from "../utility/usePageTitle";
import { getAllLatestMachineLifeActiveAndExpired } from "../controller/RentMachineLifeController";

import "./dashboardnew.css"; // Ensure this path is correct
import CountUpNumber from "../utility/countNumber";

// Compact Card Component for the top row
const CompactDashboardCard = ({ icon: Icon, title, value, className }) => (
  <div className={`dashboardnew-compact-dashboard-card ${className}`}>
    <Icon className="dashboardnew-compact-card-icon" />
    <div className="dashboardnew-compact-card-info">
      <span className="dashboardnew-compact-card-value">{value}</span>
      <p className="dashboardnew-compact-card-title">{title}</p>
    </div>
  </div>
);

const handleCateogryCardClick = (branch, category) => {
  //console.log("Hello clicked", branch);
  //const url = `/machine-details?branch=${encodeURIComponent(branch)}`;
  const url = `/machine-details?branch=${encodeURIComponent(
    branch
  )}&category=${encodeURIComponent(category)}`;
  window.open(url, "_blank"); // Opens the URL in a new tab
};

const DashboardNew = () => {
  const [factoryData, setFactoryData] = useState([]);
  const [itAssetCountDetails, setItAssetCountDetails] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [selectedMachineCount, setSelectedMachineCount] = useState(0); // Added for modal
  const [categoryData, setCategoryData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rentMachines, setRentMachines] = useState([]);
  const navigate = useNavigate();

  const [, setPageTitles] = usePageTitle();

  useEffect(() => {
    setPageTitles("✨ Dashboard");
  }, [setPageTitles]);

  // ✅ Local function inside component
  const fetchMachines = async () => {
    const res = await getAllLatestMachineLifeActiveAndExpired();
    console.log("Response New", res);
    if (res.success && res.data) {
      const mapped = res.data.map((item) => ({
        id: item.rent_item_id,
        name: item.RentMachine?.name || "Unknown",
        branch: item.Branch?.branch_name || "N/A",
        status: item.isExpired ? "Expired" : "Active",
        from_date: item.from_date,
        to_date: item.to_date,
        machine_status: item.RentMachine?.machine_status,
      }));
      setRentMachines(mapped);
    }
  };
  // Fetch all dashboard data concurrently
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [factoryRes, itAssetRes] = await Promise.all([
          getTotalItemsCount(),
          getITAssetCountByCategory(),
        ]);

        if (factoryRes.success) {
          setFactoryData(
            factoryRes.totalItemsByBranch.map((branch) => ({
              name: branch.branch,
              count: branch.total_items,
            }))
          );
        } else {
          setError("Failed to load factory data.");
        }

        // CORRECTED PART: Using itAssetRes.data
        if (itAssetRes.success && Array.isArray(itAssetRes.data)) {
          setItAssetCountDetails(
            itAssetRes.data.map((item) => ({
              id: item.itCategoryId,
              name: item.ITCategory.cat_name,
              count: item.asset_count,
            }))
          );
        } else {
          setError(
            (prev) => (prev ? prev + " " : "") + "Failed to load IT asset data."
          );
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("An unexpected error occurred while fetching dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllDashboardData();
    fetchMachines();
  }, []); // Empty dependency array means this runs once on mount

  // Calculate total values using useMemo for efficiency
  const totalMachines = useMemo(
    () => factoryData.reduce((total, f) => total + f.count, 0),
    [factoryData]
  );
  const totalItAssets = useMemo(
    () => itAssetCountDetails.reduce((t, a) => t + a.count, 0),
    [itAssetCountDetails]
  );
  const totalFactories = useMemo(() => factoryData.length, [factoryData]);

  // Handle factory table click to show modal
  const handleFactoryClick = async (factoryName, machineCount) => {
    setLoading(true); // Set loading for modal data
    setError(null);
    try {
      const response = await getTotalItemsbyBranch(factoryName);
      if (response.success) {
        setCategoryData(response.totalItemsByCategory);
        setSelectedFactory(factoryName);

        setSelectedMachineCount(machineCount); // Set the machine count for modal
        setShowModal(true);
      } else {
        setError("Failed to load category data for the selected factory.");
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
      setError("An unexpected error occurred while fetching category data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="dashboardnew-dashboard-loading">
        <div className="dashboardnew-spinner"></div>
        <p>Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="dashboardnew-dashboard-error">Error: {error}</div>;
  }

  // ✅ Counts
  const counts = rentMachines.reduce(
    (acc, machine) => {
      acc[machine.status] = (acc[machine.status] || 0) + 1;
      return acc;
    },
    { Active: 0, Expired: 0 }
  );

  return (
    <div className="dashboardnew-container">
      {/* Top Summary Cards (Compact) */}
      <div className="dashboardnew-summary-cards-compact-grid">
        <CompactDashboardCard
          icon={FaCogs}
          title="Total Machines"
          value={<CountUpNumber value={totalMachines || 0} />}
          className="dashboardnew-card-machines"
        />
        <CompactDashboardCard
          icon={FaLaptop}
          title="IT Assets"
          value={<CountUpNumber value={totalItAssets || 0} />}
          className="dashboardnew-card-assets"
        />
        <CompactDashboardCard
          icon={FaIndustry}
          title="Factories"
          value={totalFactories}
          className="dashboardnew-card-factories"
        />
        <CompactDashboardCard
          icon={FaWarehouse}
          title="Fixed Assets"
          value={<CountUpNumber value={190} />}
          className="dashboardnew-card-fixedassets"
        />
        <CompactDashboardCard
          icon={FaUsers}
          title="Active Users"
          value={<CountUpNumber value={150} />}
          className="dashboardnew-card-users"
        />{" "}
        {/* Assuming static for now */}
      </div>

      {/* Main Content Area */}
      <div className="dashboardnew-main-content-area">
        {/* Left Panel: Factory List */}
        <div className="dashboardnew-dashboard-panel dashboardnew-factory-list-panel">
          <h2 className="dashboardnew-panel-title">📜 Machines by Factory</h2>
          <div className="dashboardnew-table-responsive">
            <table className="dashboardnew-dashboard-table dashboardnew-factory-table">
              <thead>
                <tr>
                  <th>Factory</th>
                  <th>Machines</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {factoryData.length > 0 ? (
                  factoryData.map((factory, idx) => (
                    <tr key={idx}>
                      <td>{factory.name}</td>
                      <td>
                        <span className="dashboardnew-count-badge">
                          {factory.count}
                        </span>
                      </td>
                      <td>
                        <div className="dashboardnew-quick-links">
                          {/* See More */}
                          <div
                            className="dashboardnew-quick-link-button"
                            onClick={() => handleFactoryClick(factory.name)}
                            title="See More"
                          >
                            <div className="dashboardnew-quick-link-circle semore">
                              <span className="dashboardnew-quick-link-icon">
                                🔎
                              </span>
                            </div>
                            <span className="dashboardnew-quick-link-label">
                              See More
                            </span>
                          </div>

                          {/* Machine History */}
                          <div
                            className="dashboardnew-quick-link-button"
                            onClick={() =>
                              window.open(
                                "/reports/machinetrackingreport",
                                "_blank"
                              )
                            }
                            title="Machine History"
                          >
                            <div className="dashboardnew-quick-link-circle history">
                              <span className="dashboardnew-quick-link-icon">
                                📜
                              </span>
                            </div>
                            <span className="dashboardnew-quick-link-label">
                              History
                            </span>
                          </div>

                          {/* Rent Machines */}
                          <div
                            className="dashboardnew-quick-link-button"
                            onClick={() =>
                              window.open("/rentmachines/summary", "_blank")
                            }
                            title="Rent Machines"
                          >
                            <div className="dashboardnew-quick-link-circle rent">
                              <span className="dashboardnew-quick-link-icon">
                                🏭
                              </span>
                            </div>
                            <span className="dashboardnew-quick-link-label">
                              Rent
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="dashboardnew-no-data">
                      No factory data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: IT Asset Allocation */}
        <div className="dashboardnew-dashboard-panel dashboardnew-it-asset-panel">
          <h2 className="dashboardnew-panel-title">
            <div className="dashboardnew-panel-header">
              <FaPrint className="dashboardnew-panel-icon" />
              <FaLaptop className="dashboardnew-panel-icon" />
              <FaDesktop className="dashboardnew-panel-icon" />
              IT Asset Allocation
            </div>
          </h2>
          {/* <ul className="dashboardnew-asset-list">
            {itAssetCountDetails.length > 0 ? (
              itAssetCountDetails.map((asset) => (
                <li key={asset.id} className="dashboardnew-asset-item">
                  <span className="dashboardnew-asset-name">{asset.name}</span>
                  <span className="dashboardnew-asset-count">
                    <strong>{asset.count}</strong>
                  </span>
                </li>
              ))
            ) : (
              <p className="dashboardnew-no-data">
                No IT asset data available.
              </p>
            )}
          </ul> */}
          <ul className="dashboardnew-asset-list">
            {itAssetCountDetails.length > 0 ? (
              itAssetCountDetails.map((asset) => (
                <li
                  key={asset.id}
                  className="dashboardnew-asset-item"
                  onClick={() => navigate(`/itassetindetailview`)} // navigate to detail view
                  style={{
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0f4ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span className="dashboardnew-asset-name">{asset.name}</span>
                  <span className="dashboardnew-asset-count">
                    <strong>{asset.count}</strong>
                  </span>
                </li>
              ))
            ) : (
              <p
                className="dashboardnew-no-data"
                onClick={() => navigate("/itassetindetailview")}
                style={{
                  cursor: "pointer",
                  color: "#1d3557",
                  textDecoration: "underline",
                }}
              >
                No IT asset data available. Click here to add assets.
              </p>
            )}
          </ul>
        </div>
        <div className="dashboardnew-dashboard-panel dashboardnew-it-asset-panel">
          <h2 className="dashboardnew-panel-title">
            <div className="dashboardnew-panel-header">
              <FaAccusoft className="dashboardnew-panel-icon" />
              Rent Machines
            </div>
          </h2>
          <div className="rentmachinesummery-alerts">
            <div className="alert-box alert-expired">
              ⚠️{counts.Expired} Machines Expired
            </div>
            <div className="alert-box alert-active">
              ✅ {counts.Active} Machines Active
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Category Details (Updated with correct classes and machine count) */}
      {showModal && (
        <div
          className="dashboardnew-modal-backdrop dashboardnew-show-modal"
          onClick={() => setShowModal(false)}
        >
          <div
            className="dashboardnew-modal-content-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dashboardnew-modal-header">
              <h2 className="dashboardnew-modal-title">
                {selectedFactory} Machines
              </h2>
              <button
                className="dashboardnew-modal-close-button"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
            <div className="dashboardnew-modal-body">
              <p className="dashboardnew-modal-subtitle">
                Total Machines: {selectedMachineCount}
              </p>{" "}
              {/* Displaying machine count */}
              <h3 className="dashboardnew-modal-subtitle">
                Category-wise Machine Count:
              </h3>
              <div className="dashboardnew-category-grid">
                {categoryData.length > 0 ? (
                  categoryData.map((cat) => (
                    <div
                      key={cat.Category.cat_id}
                      className="dashboardnew-category-detail-card"
                      onClick={() =>
                        handleCateogryCardClick(selectedFactory, cat.cat_id)
                      }
                    >
                      <h4 className="dashboardnew-category-detail-name">
                        {cat.Category.cat_name}
                      </h4>
                      <p className="dashboardnew-category-detail-count">
                        Total: {cat.total_items}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="dashboardnew-no-data">
                    No category data available for this factory.
                  </p>
                )}
              </div>
            </div>
            <div className="dashboardnew-modal-footer">
              <button
                className="dashboardnew-action-button dashboardnew-close-button"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardNew;
