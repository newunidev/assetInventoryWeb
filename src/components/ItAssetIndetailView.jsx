import React, { useEffect, useState } from "react";
import "./ItAssetIndetailView.css";
import { getAllAssetAssignments } from "../controller/AssetAssignmentController";

const ItAssetIndetailView = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null); // for modal

  const fetchAssets = async () => {
    try {
      const response = await getAllAssetAssignments();
      if (response.success && Array.isArray(response.assetAssignments)) {
        setAssets(response.assetAssignments);
      } else {
        console.error("Failed to fetch assets", response);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Group assets to show current and previous users
  const groupAssets = (assetAssignments) => {
    const grouped = {};
    assetAssignments.forEach((assignment) => {
      const assetId = assignment.it_asset_id;
      if (!grouped[assetId]) {
        grouped[assetId] = {
          asset: assignment.assets,
          users: [],
        };
      }
      grouped[assetId].users.push({
        ...assignment.users,
        isCurrent: assignment.isCurrentUser,
      });
    });

    return Object.values(grouped).map((item) => {
      const currentUserObj = item.users.find((u) => u.isCurrent);
      const previousUsers = item.users.filter((u) => !u.isCurrent);

      return {
        asset: item.asset,
        currentUser: currentUserObj || null,
        previousUsers,
      };
    });
  };

  const displayAssets = groupAssets(assets);

  return (
    <div className="itassetindetailview-container">
      <h2 className="itassetindetailview-title">IT Asset Details</h2>
      <div
        className="itassetindetailview-table-wrapper"
        
      >
        <table className="itassetindetailview-table">
          <thead>
            <tr>
              <th>Asset Code</th>
              <th>Serial Number</th>
              <th>Branch</th>
              <th>Current User</th>
              <th>Previous Users</th>
            </tr>
          </thead>
          <tbody>
            {displayAssets.length > 0 ? (
              displayAssets.map((assetData, index) => (
                <tr
                  key={index}
                  onClick={() => setSelectedAsset(assetData)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{assetData.asset.asset_id}</td>
                  <td>{assetData.asset.serial_no}</td>
                  <td>{assetData.currentUser ? assetData.currentUser.branch: "Not Assigned"}</td>
                  <td className="itassetindetailview-current-user">
                    {assetData.currentUser ? assetData.currentUser.full_name : "Not Assigned"}
                  </td>
                  <td className="itassetindetailview-previous-user">
                    {assetData.previousUsers.length > 0
                      ? assetData.previousUsers.map(u => u.full_name).join(", ")
                      : "None"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                  Loading or No Assets Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- Modal ---------------- */}
      {selectedAsset && (
        <div className="itassetindetailview-modal-backdrop" onClick={() => setSelectedAsset(null)}>
          <div className="itassetindetailview-modal" onClick={e => e.stopPropagation()}>
            <h3>Asset Details</h3>
            <div className="modal-section">
              <h4>Asset Info</h4>
              <p><strong>Asset Code:</strong> {selectedAsset.asset.asset_id}</p>
              <p><strong>Serial No:</strong> {selectedAsset.asset.serial_no}</p>
              <p><strong>Brand:</strong> {selectedAsset.asset.brand}</p>
              <p><strong>Name:</strong> {selectedAsset.asset.name}</p>
              <p><strong>Processor:</strong> {selectedAsset.asset.processor}</p>
              <p><strong>RAM:</strong> {selectedAsset.asset.ram}</p>
              <p><strong>Storage:</strong> {selectedAsset.asset.storage}</p>
              <p><strong>OS:</strong> {selectedAsset.asset.os}</p>
              <p><strong>Condition:</strong> {selectedAsset.asset.condition}</p>
            </div>
            <div className="modal-section">
              <h4>Current User</h4>
              {selectedAsset.currentUser ? (
                <>
                  <p><strong>EPF No:</strong> {selectedAsset.currentUser.epf_no}</p>
                  <p><strong>Name:</strong> {selectedAsset.currentUser.full_name}</p>
                  <p><strong>Branch:</strong> {selectedAsset.currentUser.branch}</p>
                  <p><strong>Designation:</strong> {selectedAsset.currentUser.designation}</p>
                </>
              ) : (
                <p>Not Assigned</p>
              )}
            </div>
            <div className="modal-section">
              <h4>Previous Users</h4>
              {selectedAsset.previousUsers.length > 0 ? (
                selectedAsset.previousUsers.map((u, idx) => (
                  <div key={idx} style={{ marginBottom: "10px" }}>
                    <p><strong>EPF No:</strong> {u.epf_no}</p>
                    <p><strong>Name:</strong> {u.full_name}</p>
                    <p><strong>Branch:</strong> {u.branch}</p>
                    <p><strong>Designation:</strong> {u.designation}</p>
                    <hr />
                  </div>
                ))
              ) : (
                <p>None</p>
              )}
            </div>
            <button
              className="itassetindetailview-modal-close"
              onClick={() => setSelectedAsset(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItAssetIndetailView;
