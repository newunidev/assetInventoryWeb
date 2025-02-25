import React, { useState, useEffect } from "react";
import "./DashboardContent.css";
import { getTotalItemsbyBranch, getTotalItemsCount } from "../controller/ItemController";

const DashboardContent = () => {
  const [factoryData, setFactoryData] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [selectedMachineCount, setSelectedMachineCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch factory data from API
  useEffect(() => {
    const fetchFactoryData = async () => {
      try {
        const response = await getTotalItemsCount();
        if (response.success) {
          setFactoryData(response.totalItemsByBranch.map(branch => ({
            name: branch.branch,
            count: branch.total_items,
          })));
        }
      } catch (error) {
        console.error("Error fetching factory data:", error);
      }
    };

    fetchFactoryData();
  }, []);

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

  return (
    <div className="dashboard-container">
      {/* Left Section: Factory & Machine Count Widgets */}
      <div className="left-section">
        {factoryData.map((factory, index) => (
          <div
            key={index}
            className="dashboard-widget"
            onClick={() => handleCardClick(factory)}
          >
            <h3>{factory.name}</h3>
            <p>Items: {factory.count}</p>
          </div>
        ))}
      </div>

      {/* Right Section: Statistics Graph */}
      <div className="right-section">
        <h2 className="stat-title">Idle Machine Stat.</h2>
        <div className="bar-chart">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bar"></div>
          ))}
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{selectedFactory}</h2>
            <p className="modal-subtitle">Machine Count: {selectedMachineCount}</p>

            <h3 className="category-title">Category-wise Item Count:</h3>
            {categoryData.length > 0 ? (
              <div className="category-grid">
                {categoryData.map((category) => (
                  <div key={category.cat_id} className="category-card">
                    <h4 className="category-name">{category.Category.cat_name}</h4>
                    <p className="category-count">Total Items: {category.total_items}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No data available</p>
            )}

            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
