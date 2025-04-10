import React, { useState, useEffect } from "react";
import "./DashboardContent.css";
import {
  getTotalItemsbyBranch,
  getTotalItemsCount,
} from "../controller/ItemController";
import { getITAssetCountByCategory } from "../controller/ItAssetController";
import { getMachines } from "../utility/api";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

import MachineDetailDisplay from "../pages/MachineDetailsDisplay";

const DashboardContent = () => {
  const [factoryData, setFactoryData] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [selectedMachineCount, setSelectedMachineCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [machines, setMachines] = useState([]); // ✅ Added missing state
  const [searchQuery, setSearchQuery] = useState("");

  const [itAssetCountDetails, setItAssetCountDetails] = useState([]);

  const navigate = useNavigate(); // Initialize useNavigate
  
  const handleCateogryCardClick = (branch,category) => {
    console.log("Hello clicked", branch);
    //const url = `/machine-details?branch=${encodeURIComponent(branch)}`;
    const url = `/machine-details?branch=${encodeURIComponent(branch)}&category=${encodeURIComponent(category)}`;
    window.open(url, "_blank"); // Opens the URL in a new tab
  };

  // Fetch Machines from API
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const data = await getMachines();
        if (Array.isArray(data)) {
          setMachines(data);
        } else if (data.items && Array.isArray(data.items)) {
          setMachines(data.items);
        } else {
          console.error("Unexpected API response format:", data);
        }
      } catch (error) {
        console.error("Failed to fetch machines:", error);
      }
    };

    fetchMachines();
  }, []);

  // Fetch factory data from API
  useEffect(() => {
    const fetchFactoryData = async () => {
      try {
        const response = await getTotalItemsCount();
        if (response.success) {
          setFactoryData(
            response.totalItemsByBranch.map((branch) => ({
              name: branch.branch,
              count: branch.total_items,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching factory data:", error);
      }
    };

    fetchFactoryData();
  }, []);

  // Filter Machines based on Search Query
  const filteredMachines = searchQuery
    ? machines.filter(
        (machine) =>
          (machine.item_code &&
            machine.item_code
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (machine.serial_no &&
            machine.serial_no.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Handle Factory Card Click
  const handleCardClick = async (factory) => {
    setSelectedFactory(factory.name);
    setSelectedMachineCount(factory.count);
    setShowModal(true);

    try {
      const response = await getTotalItemsbyBranch(factory.name);
      setCategoryData(response.success ? response.totalItemsByCategory : []);
    } catch (error) {
      console.error("Error fetching category data:", error);
      setCategoryData([]);
    }
  };

  //method to handle it assets
  useEffect(() => {
    const fetchItAssetCount = async () => {
      try {
        const response = await getITAssetCountByCategory();

        if (response.success && Array.isArray(response.data)) {
          // Transform API response into a format suitable for rendering
          const formattedData = response.data.map((item) => ({
            id: item.itCategoryId,
            name: item.ITCategory.cat_name,
            count: item.asset_count,
          }));

          setItAssetCountDetails(formattedData);
        } else {
          console.error("Unexpected API response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch IT assets:", error);
      }
    };

    fetchItAssetCount();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Left Section: Factory & Machine Count Widgets */}

      <div className="left-section">
        <h2 className="section-title">🧵🪡🏭 Operation Asset Details</h2>
        {/* First Row: Factory Grid */}
        <div className="factory-grid">
          {factoryData.map((factory, index) => (
            <div key={index} className="dashboard-widget">
              <h3>FACTORY: {factory.name}</h3>
              <p>TOTAL MACHINES: {factory.count}</p>

              {/* "See More" Button */}
              <button
                className="see-more-btn"
                onClick={() => handleCardClick(factory)}
              >
                See More
              </button>
            </div>
          ))}
        </div>

        {/* Second Row: IT Asset Details */}
        {/* IT Asset Details */}
        <div className="it-asset-row">
          <h2 className="section-title">💻 IT Asset Details</h2>

          <div className="it-asset-summary">
            {itAssetCountDetails.map((asset) => (
              <div key={asset.id} className="it-asset-card">
                <h4>💻 {asset.name}</h4>
                <p>
                  <strong>Total:</strong> {asset.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section: Search & Machine List */}
      <div className="right-section">
        <h2 className="stat-title">
          🔍 Efficiently Track and Verify Your Machines
        </h2>

        {/* Search Bar */}
        <input
          type="text"
          className="search-bar"
          placeholder="Search item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Machine List */}
        <div className="machine-list">
          {filteredMachines.length > 0 ? (
            filteredMachines.map((machine, index) => (
              <div key={index} className="machine-card">
                <h4>{machine.name}</h4>
                <div className="machine-details">
                  {/* Left Column */}
                  <div className="machine-column">
                    <p>
                      ✅ <strong>Item Code:</strong> {machine.item_code}
                    </p>
                    <p>
                      🏢 <strong>Branch:</strong> {machine.branch}
                    </p>
                    <p>
                      🛠️ <strong>Model:</strong> {machine.model_no}
                    </p>
                    <p>
                      🔢 <strong>Serial No:</strong> {machine.serial_no}
                    </p>
                    <p>
                      📦 <strong>Box No:</strong> {machine.box_no}
                    </p>
                  </div>

                  <div className="machine-column">
                    <p>
                      ⚙️ <strong>Motor No:</strong> {machine.motor_no}
                    </p>
                    <p>
                      🏷️ <strong>Brand:</strong> {machine.brand}
                    </p>
                    <p>
                      🚛 <strong>Supplier:</strong> {machine.supplier}
                    </p>
                    <p>
                      📋 <strong>Condition:</strong> {machine.condition}
                    </p>
                    <p>
                      📁 <strong>Category:</strong>{" "}
                      {machine.Category?.cat_name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Full Width Details */}
                <p>
                  📝 <strong>Description:</strong> {machine.description}
                </p>
              </div>
            ))
          ) : (
            <p className="no-data">No machines found.</p>
          )}
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{selectedFactory}</h2>
            <p className="modal-subtitle">
              Machine Count: {selectedMachineCount}
            </p>

            <h3 className="category-title">Category-wise Item Count:</h3>
            {categoryData.length > 0 ? (
              <div className="category-grid">
                {categoryData.map((category) => (
                  <div
                    key={category.cat_id}
                    className="category-card"
                    onClick={() => handleCateogryCardClick(selectedFactory,category.cat_id)}
                  >
                    <h4 className="category-name">
                      {category.Category.cat_name}
                    </h4>
                    <p className="category-count">
                      Total Items: {category.total_items}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No data available</p>
            )}

            <button className="close-btn" onClick={() => setShowModal(false)}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
