import React, { useEffect, useState } from "react";
import { getMachines } from "../utility/api";
import { FaSearch } from "react-icons/fa";
import "./MachineTrackingReport.css";
import { getCategories } from "../controller/CategoryController";
import { getAllItemCountLastScannedLocation } from "../controller/ItemController";

import jsPDF from "jspdf";
import "jspdf-autotable";
import { usePageTitle } from "../utility/usePageTitle";
import { FaFilePdf } from "react-icons/fa";

const branches = [
  "All",
  "Hettipola",
  "Bakamuna1",
  "Bakamuna2",
  "Mathara",
  "Welioya",
  "Sample Room",
  "Piliyandala",
];
const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'
const MachineTrackingReport = () => {
  const [machines, setMachines] = useState([]);
  const [lastScannedItems, setLastScannedItems] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [, setPageTitles] = usePageTitle();

  useEffect(() => {
    setPageTitles("📍🧭 Machine Tracking Summery");
  }, [setPageTitles]);
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
      (selectedBranch === "All" || machine.branch === selectedBranch) &&
      (category === "" || machine.cat_id === Number(category)) &&
      (searchQuery === "" ||
        machine.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.serial_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.Category.cat_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  // Function to get last scanned branch
  const getLastScannedBranch = (itemCode, machineBranch) => {
    const scannedItem = lastScannedItems.find(
      (item) => item.item_id === itemCode
    );
    return scannedItem ? scannedItem.current_branch : "No Scan Found";
  };

  //function to get last scan date
  const getLastScannedDate = (itemCode, machineBranch) => {
    const scannedItem = lastScannedItems.find(
      (item) => item.item_id === itemCode
    );
    return scannedItem ? scannedItem.last_scan_date : "No Scan Found";
  };

  // const downloadPDF = () => {
  //   const doc = new jsPDF();

  //   // Header
  //   doc.setFontSize(16);
  //   doc.text("Machine Tracking Report", 14, 15);

  //   doc.setFontSize(10);
  //   doc.text(`Branch: ${selectedBranch || "All"}`, 14, 25);
  //   doc.text(`Category: ${category || "All Categories"}`, 14, 32);
  //   doc.text(`Search Query: ${searchQuery || "None"}`, 14, 39);
  //   doc.text(`Result Date: ${today || "None"}`, 14, 39);

  //   const tableBody = filteredMachines.map((machine) => {
  //     const lastScanned = getLastScannedBranch(
  //       machine.item_code,
  //       machine.branch
  //     );
  //     return {
  //       data: [
  //         machine.item_code || "N/A",
  //         machine.serial_no || "N/A",
  //         machine.name || "N/A",
  //         machine.description || "N/A",
  //         machine.branch || "N/A",
  //         lastScanned,
  //         machine.model_no || "N/A",
  //         machine.box_no || "N/A",
  //       ],
  //       isNoScan: lastScanned === "No Scan Found",
  //     };
  //   });

  //   // AutoTable
  //   doc.autoTable({
  //     startY: 45,
  //     head: [
  //       [
  //         "Item Code",
  //         "Serial No",
  //         "Name",
  //         "Description",
  //         "Branch",
  //         "Last Scanned Branch",
  //         "Model No",
  //         "Box No",
  //       ],
  //     ],
  //     body: tableBody.map((row) => row.data),
  //     theme: "grid",
  //     styles: {
  //       fontSize: 7,
  //       cellPadding: 2,
  //     },
  //     headStyles: {
  //       fillColor: [41, 128, 185],
  //       textColor: 255,
  //       fontStyle: "bold",
  //     },
  //     columnStyles: {
  //       // Let content define the width, use auto
  //       0: { cellWidth: "wrap" },
  //       1: { cellWidth: "wrap" },
  //       2: { cellWidth: "wrap" },
  //       3: { cellWidth: "wrap" },
  //       4: { cellWidth: "wrap" },
  //       5: { cellWidth: "wrap" },
  //       6: { cellWidth: "wrap" },
  //       7: { cellWidth: "wrap" },
  //     },
  //     willDrawCell: function (data) {
  //       const rowIndex = data.row.index;
  //       const colIndex = data.column.index;
  //       const rowData = tableBody[rowIndex];

  //       // Highlight entire row if "No Scan Found"
  //       if (rowData && rowData.isNoScan) {
  //         data.cell.styles.fillColor = [255, 0, 0]; // Red background
  //         data.cell.styles.textColor = 255; // White text
  //       }
  //     },
  //   });

  //   doc.save("Machine_Tracking_Report.pdf");
  // };
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Define initial starting Y for the table
    let initialTableStartY;

    // --- Header for the First Page Only (Drawn outside autoTable) ---
    const companyName = "New Universe Corporate Clothing Pvt Ltd";
    doc.setTextColor(0, 51, 102); // Dark blue RGB
    doc.setFontSize(14);
    doc.text(companyName, doc.internal.pageSize.width / 2, 15, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0); // Reset to black

    const reportTitle = "Machine Tracking Report";
    doc.setFontSize(16);
    doc.text(reportTitle, doc.internal.pageSize.width / 2, 25, {
      align: "center",
    });

    let currentYHeader = 35; // Y position for filter details on page 1
    doc.setFontSize(10);

    doc.text(`Branch: ${selectedBranch || "All"}`, 14, currentYHeader);
    currentYHeader += 7;

    const selectedCategoryName =
      categories.find((c) => String(c.cat_id) === category)?.cat_name ||
      "All Categories";
    doc.text(`Category: ${selectedCategoryName}`, 14, currentYHeader);
    currentYHeader += 7;

    doc.text(`Search Query: ${searchQuery || "None"}`, 14, currentYHeader);
    currentYHeader += 7;

    const today = new Date(); // Use actual current date for the report
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Report Date: ${formattedDate}`, 14, currentYHeader);
    currentYHeader += 10; // Add space before table starts

    initialTableStartY = currentYHeader;

    const tableBody = filteredMachines.map((machine) => {
      const lastScanned = getLastScannedBranch(
        machine.item_code,
        machine.branch
      );
      const LastScanDate = getLastScannedDate(
        // Ensure getLastScannedDate is defined and returns a string
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
          LastScanDate,
          machine.model_no || "N/A",
          machine.box_no || "N/A",
        ],
        isNoScan: lastScanned === "No Scan Found",
      };
    });

    // AutoTable
    doc.autoTable({
      startY: initialTableStartY,
      head: [
        [
          "Item Code",
          "Serial No",
          "Name",
          "Description",
          "Branch",
          "Last Scanned Branch",
          "Last Scanned Date",
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
      tableWidth: "fit",
      margin: {
        left: 10,
        right: 10,
      },
      tablePageAlign: "center",
      willDrawCell: function (data) {
        const rowIndex = data.row.index;
        const rowData = tableBody[rowIndex];
        if (rowData && rowData.isNoScan) {
          data.cell.styles.fillColor = [255, 0, 0];
          data.cell.styles.textColor = 255;
        }
      },
      didDrawPage: function (data) {
        // This hook runs for EVERY page.
        // Add "Page X of Y" numbering at the bottom right

        const pageNumber = data.pageNumber; // Current page number (1-indexed)
        // Total pages can only be determined accurately AFTER autoTable has finished drawing
        // A common workaround is to update the total pages in a final loop or by adding a callback
        // For now, we'll use a placeholder or assume it's calculated later.

        // To get total pages, you'll need a different strategy.
        // AutoTable's `didDrawPage` doesn't inherently know the *total* number of pages at the time it's drawing.
        // A common technique is to draw a placeholder, then loop back and fill it, or use `doc.internal.getNumberOfPages()`
        // after the table is fully drawn.
        // However, for simplicity and common usage, `doc.internal.getNumberOfPages()` *after* `autoTable` has finished
        // will give you the correct total pages.

        const totalPages = doc.internal.getNumberOfPages(); // This will give the correct total after generation

        doc.setFontSize(8); // Smaller font for page numbers
        doc.setTextColor(100); // Gray color for page numbers

        const pageText = `Page ${pageNumber} of ${totalPages}`;
        const x = doc.internal.pageSize.width - 10; // 10 units from the right edge
        const y = doc.internal.pageSize.height - 10; // 10 units from the bottom edge

        doc.text(pageText, x, y, { align: "right" }); // Align text to the right
      },
    });

    doc.save("Machine_Tracking_Report.pdf");
  };
  return (
    <div className="machintrackingreport-container">
      {/* <h2 className="machintrackingreport-heading">
        📊 Machine Tracking Report
      </h2> */}

      {/* Filters */}
      <div className="machintrackingreport-search-panel">
        {/* Branch Filter */}
        <div className="machintrackingreport-field-container">
          <label htmlFor="branchSelect">Select Branch:</label>
          <select
            id="branchSelect"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="All">All</option>
            {branches.map((branch, index) => (
              <option key={index} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="machintrackingreport-field-container">
          <label htmlFor="categoryselect">Select Category:</label>
          <select
            id="categoryselect"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c, index) => (
              <option key={index} value={c.cat_id}>
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
        {/* <button
          className="machintrackingreport-download-btn"
          onClick={downloadPDF}
        >
          Download PDF
        </button> */}
        <button onClick={downloadPDF} className="pdf-button">
          <FaFilePdf size={18} />
          PDF
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
              <th>Last Scanned Date</th>
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
                  {/* <td>{getLastScannedBranch(machine.item_code, machine.branch)}</td> */}
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
                  <td>
                    {getLastScannedDate(machine.item_code, machine.branch)}
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

export default MachineTrackingReport;
