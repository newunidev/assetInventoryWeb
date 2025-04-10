import React, { useState, useEffect } from "react";
import {
  getAllAssetAssignments,
  updateAssetAssignmentReturn,
  getAllAvailableAssetAssignments,
  checkGivenAssetHasCurrentUser,
  createAssetAssignment,
} from "../controller/AssetAssignmentController";

import { getAllAssetUsers } from "../controller/AssetUserController"; // Import API calls
import { getAllItAssets } from "../controller/ItAssetController"; // Import API calls
import "./AssetAssignment.css"; // Import styles
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Get the current date in YYYY-MM-DD format
const currentDate = new Date().toISOString().split("T")[0];

// Generate the filename with the current date
const fileName = `Asset_Assignment_Report_${currentDate}.xlsx`;

const AssetAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Main search term state
  const [popupSearchTerm, setPopupSearchTerm] = useState(""); // Separate state for popup search term
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showAssetPopup, setShowAssetPopup] = useState(false); // State to control the visibility of the popup

  const [assetUsers, setAssetUsers] = useState([]); // State to store Asset Users
  const [itAssets, setItAssets] = useState([]); // Initialize as an empty array, not null
  const [selectedAssetUser, setSelectedAssetUser] = useState(""); // State for selected Asset User
  const [selectedAsset, setSelectedAsset] = useState(null); // State for selected asset
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedAssetAssignment, setSelectedAssetAssignment] = useState("");
  const [showAssetAssignmentPopup, setShowAssetAssignmentPopup] =
    useState(false);

  const [permissions, setPermissions] = useState([]); // State to store permissions

  // Load permissions from localStorage on component mount
  useEffect(() => {
    const storedPermissions =
      JSON.parse(localStorage.getItem("permissions")) || [];
    console.log("Stored Permissions:", storedPermissions); // Log the stored permissions
    setPermissions(storedPermissions);
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await getAllAssetAssignments();
        setAssignments(data.assetAssignments || []); // Assuming API returns assetAssignments array
      } catch (error) {
        console.error("Failed to fetch asset assignments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    const fetchAssetUsers = async () => {
      try {
        const data = await getAllAssetUsers();
        setAssetUsers(data.users || []); // Assuming API returns a users array
      } catch (error) {
        console.error("Failed to fetch asset users:", error);
      }
    };
    fetchAssetUsers();
  }, []);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getAllAvailableAssetAssignments(); // Fetch IT assets from the API
        if (data && data.assets) {
          setItAssets(data.assets);
        } else {
          console.error("No assets found in response:", data);
          setItAssets([]);
        }
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        setItAssets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const closeAssetPopup = () => {
    setShowAssetPopup(false);
  };

  const closeAssetAssignPopup = () => {
    setShowAssetAssignmentPopup(false);
  };

  const handleAssetClick = async (asset) => {
    try {
      // Call the checkGivenAssetHasCurrentUser API with the asset code
      const response = await checkGivenAssetHasCurrentUser(asset.asset_id); // Assuming asset_code is asset_id

      if (response.success && !response.hasUser) {
        // If no user is assigned to this asset, show the popup
        setSelectedAsset(asset);
        setShowAssetPopup(true);
      } else {
        // If the asset already has an assigned user, display a message
        alert("This asset is already assigned to a user.");
      }
    } catch (error) {
      console.error("Error checking asset assignment:", error);
      alert("Failed to check asset assignment.");
    }
  };

  //method to handle assetAssignment

  const handleAssignAsset = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Get today's date in the format 'YYYY-MM-DD'
      const assignedDate = new Date().toISOString().split("T")[0];

      // Ensure that selectedAssetUser is not null
      if (!selectedAssetUser) {
        alert("Please select a user.");
        return;
      }

      // Call the API to create the asset assignment, passing assetId, assetUserId, and assignedDate
      const response = await createAssetAssignment(
        selectedAsset.asset_id,
        selectedAssetUser.id, // Send the user ID here
        assignedDate
      );

      if (response.success) {
        alert("Asset assigned successfully!");

        // Close the popup
        setShowAssetPopup(false);

        // Refresh the entire page
        window.location.reload();
      } else {
        alert(response.message || "Something went wrong.");
      }
    } catch (error) {
      setErrorMessage("Error assigning asset: " + error.message);
      alert("Error assigning asset.");
    } finally {
      setLoading(false);
    }
  };

  //method to handle Asset Assignment
  const handleAssetAssignmentClick = async (assetAssignment) => {
    try {
      console.log(assetAssignment.isCurrentUser);
      setSelectedAssetAssignment(assetAssignment);
      setShowAssetAssignmentPopup(true);
    } catch (error) {
      console.error("Error checking asset assignment:", error);
      alert("Failed to check asset assignment.");
    }
  };

  const handleReturnAssignedAsset = async (asset_code) => {
    try {
      setErrorMessage("");
      setLoading(true);

      // Get today's date in the format 'YYYY-MM-DD'
      const assignedDate = new Date().toISOString().split("T")[0];

      // Call the API
      const response = await updateAssetAssignmentReturn(asset_code);

      if (response.success) {
        alert("Asset returned successfully!");

        // Close the popup
        setShowAssetAssignmentPopup(false);

        // Refresh the entire page
        window.location.reload();
      } else {
        alert(response.message || "Something went wrong.");
      }
    } catch (error) {
      setErrorMessage("Error returning asset: " + error.message);
      alert("Error returning asset.");
    } finally {
      setLoading(false);
    }
  };

  // Filter assets based on serial number or asset code (using popupSearchTerm for the popup)
  const filteredAssets = itAssets.filter(
    (asset) =>
      asset.serial_no.toLowerCase().includes(popupSearchTerm.toLowerCase()) ||
      asset.asset_id.toLowerCase().includes(popupSearchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(
    (assignment) =>
      (assignment.users.epf_no?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (assignment.assets.serial_no?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (assignment.assets.brand?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (assignment.users.branch?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (assignment.users.full_name?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      )
  );

  //pdf download method
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Set document title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("New Universe IT Asset Assignment Report", 14, 15);

    // Report generation date (Move this below title & avoid repeating in didDrawPage)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date().toLocaleString();
    doc.text(`Generated on: ${dateStr}`, 14, 25); // ✅ Place it only once

    // Define the table columns
    const columns = [
      "EPF NO",
      "Branch",
      "IT Asset CODE",
      "Serial No",
      "User Name",
      "Brand",
      "Assigned Date",
      "Status",
      "Condition",
    ];

    // Define the table rows
    const rows = filteredAssignments.map((assignment) => [
      assignment.users.epf_no,
      assignment.users.branch,
      assignment.assets.asset_id,
      assignment.assets.serial_no,
      assignment.users.full_name,
      assignment.assets.brand,
      new Date(assignment.assigned_date).toLocaleDateString(),
      assignment.isCurrentUser ? "Assigned" : "Returned",
      assignment.assets.condition,
    ]);

    // Generate table
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 35, // ✅ Ensure it starts below the "Generated on" text
      theme: "grid",
      styles: {
        fontSize: 7, // Reduce text size further
        cellPadding: 1.5, // Minimize padding to save space
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 128, 185], // Blue header background
        textColor: [255, 255, 255], // White text
        fontSize: 9, // Reduce header font size
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Light gray for alternate rows

      tableWidth: "wrap", // Makes sure table fits within the page width
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        3: { cellWidth: "auto" },
        4: { cellWidth: "auto" },
        5: { cellWidth: "auto" },
        6: { cellWidth: "auto" },
        7: { cellWidth: "auto" },
      },

      margin: { left: 5, right: 5 }, // Reduce margins to allow more space
      pageBreak: "auto", // Automatically moves rows to next page if needed
    });

    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // Save PDF
    doc.save("New_Universe_IT_Asset_Report.pdf");
  };

  const downloadExcel = () => {
    if (filteredAssignments.length === 0) {
      alert("No asset assignments to export.");
      return;
    }

    // Define the data for Excel
    const data = filteredAssignments.map((assignment) => ({
      "EPF NO": assignment.users.epf_no,
      "User Name": assignment.users.full_name,
      Branch: assignment.users.branch,
      Designation: assignment.users.designation,
      "IT Asset CODE": assignment.assets.asset_id,
      "Serial No": assignment.assets.serial_no,
      Brand: assignment.assets.brand,
      "Assigned Date": new Date(assignment.assigned_date).toLocaleDateString(),
      Status: assignment.isCurrentUser ? "Assigned" : "Returned",
      "Returned Date": assignment.returned_date
        ? new Date(assignment.returned_date).toLocaleDateString()
        : "N/A",
      Condition: assignment.assets.condition,
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Get the range of data
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Apply styles to the header row
    const headerRow = Object.keys(data[0]);
    headerRow.forEach((header, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex }); // First row (0)

      if (!worksheet[cellRef]) worksheet[cellRef] = {};

      worksheet[cellRef].s = {
        font: { bold: true, sz: 14 }, // Bold and font size 14
        fill: { fgColor: { rgb: "CCCCCC" } }, // Light gray background
        alignment: { horizontal: "center" }, // Center alignment
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    });

    // Apply border to all data cells
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });

        if (!worksheet[cellRef]) worksheet[cellRef] = {};

        worksheet[cellRef].s = {
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
    }

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Assignments");

    // Convert to Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file
    saveAs(blob, fileName);
  };

  return (
    <div className="asset-assignment-container">
      <h2>Asset Assignments</h2>

      <div className="search-panel">
        <input
          type="text"
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update main search term
        />

        {permissions.includes("PERM001") && (
          <button className="assetassign-btn" onClick={openPopup}>
            Asset Assignment
          </button>
        )}

        {/* Dropdown for PDF & Excel Download */}
        <div className="assetassignmentdownloadreport-dropdown">
          <button className="assetassignmentdownloadreport-btn">
            📥 Download ▼
          </button>
          <div className="assetassignmentdownloadreport-content">
            <button onClick={downloadPDF}>📄 PDF</button>
            <button onClick={downloadExcel}>📊 Excel</button>
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <table className="assignment-table">
            <thead>
              <tr>
                <th>EPF NO</th>
                <th>User Name</th>
                <th>Branch</th>
                <th>Designation</th>
                <th>IT Asset CODE</th>
                <th>Serial No</th>

                <th>Brand</th>
                <th>Assigned Date</th>
                <th>Status</th>
                <th>Returned Date</th>
                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  // <tr key={assignment.id} onClick={
                  //   () => {if (permissions.includes("PERM002")) { // Replace "PERM001" with the required permission ID
                  //     handleAssetAssignmentClick(assignment);
                  //   } else {
                  //     alert("You do not have permission to access this asset assignment.");
                  //   }
                  // }}>
                  <tr
                    key={assignment.id}
                    onClick={() => handleAssetAssignmentClick(assignment)}
                  >
                    <td>{assignment.users.epf_no}</td>
                    <td>{assignment.users.full_name}</td>
                    <td>{assignment.users.branch}</td>
                    <td>{assignment.users.designation}</td>
                    <td>{assignment.assets.asset_id}</td>
                    <td>{assignment.assets.serial_no}</td>

                    <td>{assignment.assets.brand}</td>
                    <td>
                      {new Date(assignment.assigned_date).toLocaleDateString()}
                    </td>
                    <td>
                      {assignment.isCurrentUser ? "Assigned" : "Returned"}
                    </td>
                    <td>
                      {assignment.returned_date
                        ? new Date(
                            assignment.returned_date
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>{assignment.assets.condition}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No asset assignments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Asset Assignment Form</h3>

            <div className="dropdown">
              <label>Select Asset User</label>
              <select
                value={selectedAssetUser ? selectedAssetUser.epf_no : ""}
                onChange={(e) => {
                  // Find the user by epf_no and set the whole user object as selected
                  const user = assetUsers.find(
                    (user) => user.epf_no === e.target.value
                  );
                  setSelectedAssetUser(user); // Set the whole user object
                }}
              >
                <option value="">Select User</option>
                {assetUsers
                  .sort((a, b) => a.epf_no.localeCompare(b.epf_no)) // Sorting by EPF number in ascending order
                  .map((user) => (
                    <option key={user.epf_no} value={user.epf_no}>
                      {user.full_name} (EPF: {user.epf_no})
                    </option>
                  ))}
              </select>
            </div>

            <div className="table-container">
              {/* Search field for assets */}
              <div className="search-assets-panel">
                <input
                  type="text"
                  placeholder="Search by Asset ID or Serial No..."
                  value={popupSearchTerm} // Use popupSearchTerm for the popup search
                  onChange={(e) => setPopupSearchTerm(e.target.value)} // Update popup search term
                />
              </div>
              <table className="it-assets-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Serial No</th>
                    <th>Brand</th>
                    <th>Name</th>
                    <th>Processor</th>
                    <th>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                      <tr
                        key={asset.asset_id}
                        onClick={() => handleAssetClick(asset)}
                      >
                        <td>{asset.asset_id}</td>
                        <td>{asset.serial_no}</td>
                        <td>{asset.brand}</td>
                        <td>{asset.name}</td>
                        <td>{asset.processor}</td>
                        <td>{asset.condition}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No IT Assets found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}

      {showAssetPopup && selectedAsset && selectedAssetUser && (
        <div className="popup-overlay">
          <div className="popup-content asset-details-popup">
            <button className="close-btn" onClick={closeAssetPopup}>
              X
            </button>
            <h3 className="popup-title">Selected Asset and User Details</h3>
            <div className="popup-body">
              {/* Left Side: Asset Details */}
              <div className="asset-details-card">
                <h4>📌 Asset Details</h4>
                <p>
                  🆔 <strong>Asset ID:</strong> {selectedAsset.asset_id}
                </p>
                <p>
                  🔑 <strong>Serial No:</strong> {selectedAsset.serial_no}
                </p>
                <p>
                  🏢 <strong>Brand:</strong> {selectedAsset.brand}
                </p>
                <p>
                  💻 <strong>Name:</strong> {selectedAsset.name}
                </p>
                <p>
                  🧠 <strong>Processor:</strong> {selectedAsset.processor}
                </p>
                <p>
                  ⚙️ <strong>Condition:</strong> {selectedAsset.condition}
                </p>
                <p>
                  ⚙️ <strong>Description:</strong> {selectedAsset.description}
                </p>
              </div>

              {/* Right Side: User Details */}
              <div className="user-details-card">
                <h4>👤 User Details</h4>
                {assetUsers.map((user) =>
                  // Compare user.epf_no to selectedAssetUser.epf_no
                  user.epf_no === selectedAssetUser?.epf_no ? (
                    <div key={user.epf_no}>
                      <p>
                        🧑‍💼 <strong>User Name:</strong> {user.full_name}
                      </p>
                      <p>
                        🧑‍💼 <strong>User id:</strong> {user.id}
                      </p>
                      <p>
                        🆔 <strong>EPF No:</strong> {user.epf_no}
                      </p>
                      <p>
                        💼 <strong>Designation:</strong> {user.designation}
                      </p>

                      <p>
                        💼 <strong>Designation:</strong> {user.branch}
                      </p>
                      {/* Add more user details if needed */}
                    </div>
                  ) : null
                )}
              </div>
            </div>

            {/* Add the Assign Asset button */}
            <button
              className="assign-btn"
              onClick={handleAssignAsset}
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign Asset"}
            </button>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          </div>
        </div>
      )}

      {showAssetAssignmentPopup && selectedAssetAssignment && (
        <div className="popup-overlay">
          <div className="popup-content asset-details-popup">
            <button className="close-btn" onClick={closeAssetAssignPopup}>
              X
            </button>
            <h3 className="popup-title">Selected Asset Assignment</h3>
            <div className="popup-body">
              {/* Left Side: Asset Details */}
              <div className="asset-details-card">
                <h4>📌 Asset Assignement Details</h4>
                <p>
                  🔢 <strong>Asset ID:</strong>{" "}
                  {selectedAssetAssignment.assets.asset_id}
                </p>
                <p>
                  🔍 <strong>Serial No:</strong>{" "}
                  {selectedAssetAssignment.assets.serial_no}
                </p>
                <p>
                  🏷️ <strong>Brand:</strong>{" "}
                  {selectedAssetAssignment.assets.brand}
                </p>
                <p>
                  ⚙️ <strong>Processor:</strong>{" "}
                  {selectedAssetAssignment.assets.processor}
                </p>
                <p>
                  💾 <strong>Storage:</strong>{" "}
                  {selectedAssetAssignment.assets.storage}
                </p>
                <p>
                  🔗 <strong>RAM:</strong> {selectedAssetAssignment.assets.ram}
                </p>
                <p>
                  🏷️<strong>Description:</strong>{" "}
                  {selectedAssetAssignment.assets.description}
                </p>
              </div>

              {/* Right Side: User Details */}
              {/* Right Side: User Details */}
              <div className="user-details-card">
                <h4>👤 User Details</h4>
                <div>
                  <p>
                    🧑‍💼 <strong>EPF No:</strong>{" "}
                    {selectedAssetAssignment.users.epf_no}
                  </p>
                  <p>
                    🧑‍💼 <strong>User Name:</strong>{" "}
                    {selectedAssetAssignment.users.full_name}
                  </p>
                  <p>
                    🧑‍💼 <strong>Designation:</strong>{" "}
                    {selectedAssetAssignment.users.designation}
                  </p>
                  <p>
                    🧑‍💼 <strong>Branch:</strong>{" "}
                    {selectedAssetAssignment.users.branch}
                  </p>

                  {/* Add more user details if needed */}
                </div>
              </div>
            </div>

            {/* Add the Assign Asset button */}
            {/* <button 
                className="" 
                onClick={() => handleReturnAssignedAsset(selectedAssetAssignment.assets.asset_id)} // This ensures it only runs when clicked
                disabled={loading}
            > 
                {loading ? 'Returning...' : 'Return Asset'}
            </button> */}
            <button
              className=""
              onClick={() => {
                if (permissions.includes("PERM002")) {
                  // Replace "PERM002" with the required permission ID
                  handleReturnAssignedAsset(
                    selectedAssetAssignment.assets.asset_id
                  );
                } else {
                  alert("You do not have permission to return this asset.");
                }
              }}
              disabled={loading}
            >
              {loading ? "Returning..." : "Return Asset"}
            </button>

            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetAssignment;
