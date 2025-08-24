import React, { useEffect, useState } from "react";
import { getMachines } from "../utility/api";
import { FaSearch } from "react-icons/fa";
import "./MachineDetailsDisplay.css";
import { getCategories } from "../controller/CategoryController";
import { getAllItemCountLastScannedLocation } from "../controller/ItemController";
import { useLocation } from "react-router-dom";

import jsPDF from "jspdf";
import "jspdf-autotable";

const MachineDetailDisplay = () => {
  // Receive branch as a prop
  const [machines, setMachines] = useState([]);
  const [lastScannedItems, setLastScannedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  //url send branch catching part
  const location = useLocation();
  const [branchFromURL, setBranchFromURL] = useState("");
  const [categoryFromURL, setCategoryFromURL] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search); // Parse the query string
    const branch = params.get("branch");
    const category_id = params.get("category");
    console.log(category_id);
    setBranchFromURL(branch);
    setCategoryFromURL(category_id); // Set the branch state from the URL
  }, [location]);

  useEffect(() => {
    if (categoryFromURL) {
      setCategory(categoryFromURL);
    }
  }, [categoryFromURL]);

  //url sending end

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch machines
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

  // Fetch last scanned items
  useEffect(() => {
    const fetchLastScannedItems = async () => {
      try {
        const response = await getAllItemCountLastScannedLocation();
        if (response.success && Array.isArray(response.data)) {
          setLastScannedItems(response.data);
        } else {
          console.error("Unexpected API response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch last scanned items:", error);
      }
    };
    fetchLastScannedItems();
  }, []);

  // Filter machines based on search & branch
  const filteredMachines = machines.filter(
    (machine) =>
      (branchFromURL === "All" || machine.branch === branchFromURL) &&
      (category === "" || machine.cat_id === Number(category)) &&
      (searchQuery === "" ||
        machine.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.serial_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.Category.cat_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  // Log filtered machines to see the data
  console.log("Filtered Machines:", filteredMachines);
  console.log("branchFromParent:", branchFromURL);

  // Function to get last scanned branch
  const getLastScannedBranch = (itemCode, machineBranch) => {
    const scannedItem = lastScannedItems.find(
      (item) => item.item_id === itemCode
    );
    return scannedItem ? scannedItem.current_branch : "No Scan Found";
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text("Machine Tracking Report", 14, 15);

    doc.setFontSize(10);
    doc.text(`Branch: ${branchFromURL || "All"}`, 14, 25);
    doc.text(`Category: ${category || "All Categories"}`, 14, 32);
    doc.text(`Search Query: ${searchQuery || "None"}`, 14, 39);

    const tableBody = filteredMachines.map((machine) => {
      const lastScanned = getLastScannedBranch(
        machine.item_code,
        machine.branch
      );
      return {
        data: [
          machine.item_code || "N/A",
          machine.serial_no || "N/A",
          machine.name || "N/A",
          machine.description || "N/A",
          machine.branch || "N/A",
          lastScanned,
          machine.model_no || "N/A",
          machine.box_no || "N/A",
        ],
        isNoScan: lastScanned === "No Scan Found",
      };
    });

    // AutoTable
    doc.autoTable({
      startY: 45,
      head: [
        [
          "Item Code",
          "Serial No",
          "Name",
          "Description",
          "Branch",
          "Last Scanned Branch",
          "Model No",
          "Box No",
        ],
      ],
      body: tableBody.map((row) => row.data),
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        // Let content define the width, use auto
        0: { cellWidth: "wrap" },
        1: { cellWidth: "wrap" },
        2: { cellWidth: "wrap" },
        3: { cellWidth: "wrap" },
        4: { cellWidth: "wrap" },
        5: { cellWidth: "wrap" },
        6: { cellWidth: "wrap" },
        7: { cellWidth: "wrap" },
      },
      willDrawCell: function (data) {
        const rowIndex = data.row.index;
        const colIndex = data.column.index;
        const rowData = tableBody[rowIndex];

        // Highlight entire row if "No Scan Found"
        if (rowData && rowData.isNoScan) {
          data.cell.styles.fillColor = [255, 0, 0]; // Red background
          data.cell.styles.textColor = 255; // White text
        }
      },
    });

    doc.save("Machine_Tracking_Report.pdf");
  };

  return (
    <div className="machintrackingreport-container">
      <h2 className="machintrackingreport-heading">
        📊 Machine Tracking Report
      </h2>

      {/* Filters */}
      <div className="machintrackingreport-search-panel">
        {/* Category Filter */}
        <div className="machintrackingreport-field-container">
          <label htmlFor="categoryselect">Select Category:</label>
          <select
            id="categoryselect"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.cat_id} value={c.cat_id}>
                {c.cat_name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="machintrackingreport-field-container">
          <label htmlFor="searchInput">Search Item Code:</label>
          <div className="machintrackingreport-search-box">
            <input
              type="text"
              id="searchInput"
              placeholder="Enter Item Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="machintrackingreport-search-btn">
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Download PDF Button */}
        <button
          className="machintrackingreport-download-btn"
          onClick={downloadPDF}
        >
          Download PDF
        </button>
      </div>

      {/* Machine Table */}
      <div className="machintrackingreport-table-container">
        <table className="machintrackingreport-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Serial No</th>
              <th>Name</th>
              <th>Description</th>
              <th>Branch</th>
              <th>Last Scanned Branch</th>
              <th>Model No</th>
              <th>Box No</th>
            </tr>
          </thead>
          <tbody>
            {filteredMachines.length > 0 ? (
              filteredMachines.map((machine) => (
                <tr
                  key={machine.item_code}
                  className={
                    machine.description?.toLowerCase() === "repairing"
                      ? "machintrackingreport-repairing"
                      : ""
                  }
                >
                  <td>{machine.item_code || "N/A"}</td>
                  <td>{machine.serial_no || "N/A"}</td>
                  <td>{machine.name || "N/A"}</td>
                  <td>{machine.description || "N/A"}</td>
                  <td>{machine.branch || "N/A"}</td>
                  {/* <td>
                    {getLastScannedBranch(machine.item_code, machine.branch)}
                  </td> */}
                  <td
                    className={
                      getLastScannedBranch(
                        machine.item_code,
                        machine.branch
                      ) === "No Scan Found"
                        ? "no-scan-found"
                        : ""
                    }
                  >
                    {getLastScannedBranch(machine.item_code, machine.branch)}
                  </td>
                  <td>{machine.model_no || "N/A"}</td>
                  <td>{machine.box_no || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No machines found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MachineDetailDisplay;
