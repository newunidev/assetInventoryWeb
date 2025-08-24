import React, { useState, useEffect } from "react";
import { getAllItAssets, createItAsset } from "../controller/ItAssetController";
import { getItAssetCategories } from "../controller/CategoryController";
import "./ItAssetDetails.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { usePageTitle } from "../utility/usePageTitle";

const availableBrands = [
  "HP",
  "Dell",
  "Lenovo",
  "Asus",
  "Apple",
  "Acer",
  "MSI",
  "Samsung",
  "Other",
]; // Available brands

const ItAssetDetails = () => {
  const [itAssets, setItAssets] = useState([]);
  const [itCategories, setItCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false); // Controls modal visibility
  const [newAsset, setNewAsset] = useState({
    serial_no: "",
    brand: "",
    name: "",
    processor: "",
    os: "",
    storage: "",
    ram: "",
    virus_guard: "",
    condition: "",
    supplier: "",
    description: "",
    itCategoryId: "",
  });

  const [permissions, setPermissions] = useState([]); // State to store permissions

  const selectedCategory =
    itCategories.find((c) => c.cat_id === selectedCategoryId)?.cat_name || "";
  // Load permissions from localStorage on component mount

  const [, setPageTitles] = usePageTitle();

  useEffect(() => {
    setPageTitles("🖥️💻 IT Machine Details");
  }, [setPageTitles]);

  useEffect(() => {
    const storedPermissions =
      JSON.parse(localStorage.getItem("permissions")) || [];
    console.log("Stored Permissions:", storedPermissions); // Log the stored permissions
    setPermissions(storedPermissions);
  }, []);

  useEffect(() => {
    const fetchItAssets = async () => {
      try {
        const data = await getAllItAssets();
        setItAssets(data.assets || []);
      } catch (error) {
        console.error("Failed to fetch Assets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItAssets();
  }, []);

  useEffect(() => {
    const fetchItAssetCategories = async () => {
      try {
        const data = await getItAssetCategories();
        setItCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to fetch IT Categories:", error);
      }
    };
    fetchItAssetCategories();
  }, []);

  const filteredItAssets = itAssets.filter((asset) => {
    const matchesSearch =
      (asset.serial_no?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (asset.asset_id?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (asset.processor?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (asset.brand?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategoryId
      ? asset.itCategoryId === Number(selectedCategoryId)
      : true;

    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e) => {
    setNewAsset({ ...newAsset, [e.target.name]: e.target.value });
  };

  // const handleSaveAsset = async () => {
  //   try {
  //       console.log("Saving Asset:", newAsset);

  //       // Call API to create the asset
  //       const response = await createItAsset(newAsset);

  //       // ✅ Set success message
  //       alert("IT Asset created successfully!");

  //       // Close modal after successful creation
  //       setShowModal(false);
  //   } catch (error) {
  //       console.error('Error saving asset:', error);

  //       // ❌ Set error message
  //       alert("Failed to create IT Asset. Please try again.");
  //   }
  // };

  const [message, setMessage] = useState(""); // ✅ Success/Error Message
  const [error, setError] = useState(""); // ✅ Error Message State

  const handleSaveAsset = async () => {
    // ✅ Check if any field is empty
    if (
      !newAsset.serial_no ||
      !newAsset.brand ||
      !newAsset.name ||
      !newAsset.processor ||
      !newAsset.os ||
      !newAsset.storage ||
      !newAsset.ram ||
      !newAsset.virus_guard ||
      !newAsset.condition ||
      !newAsset.supplier ||
      !newAsset.description ||
      !newAsset.itCategoryId
    ) {
      setErrorMessage("⚠️ Please fill in all required fields before saving.");
      return;
    }

    try {
      //console.log("Saving Asset:", newAsset);

      // ✅ Call API to create IT Asset
      const response = await createItAsset(newAsset);

      // ✅ Set success message
      alert("✅ IT Asset created successfully!");
      setErrorMessage(""); // Clear any previous error message

      // Close modal after successful creation
      setShowModal(false);
    } catch (error) {
      console.error("Error saving asset:", error);

      // ❌ Set error message
      setErrorMessage("❌ Failed to create IT Asset. Please try again.");
    }
  };

  // Method to Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("IT Asset Report", 14, 15);
    doc.setFontSize(12);
    doc.text(`Category: ${selectedCategoryId || "All"}`, 14, 25);
    doc.text(`Total Assets: ${filteredItAssets.length}`, 14, 32);

    doc.autoTable({
      startY: 40,
      head: [["Asset ID", "Serial No", "Brand", "Name", "Processor"]],
      body: filteredItAssets.map((asset) => [
        asset.asset_id,
        asset.serial_no,
        asset.brand,
        asset.name,
        asset.processor,
      ]),
      theme: "striped",
    });

    doc.save("IT_Asset_Report.pdf");
  };

  const downloadExcel = () => {
    // Define the data for Excel
    const data = filteredItAssets.map((asset) => ({
      "Asset ID": asset.asset_id,
      "Serial No": asset.serial_no,
      Brand: asset.brand,
      Name: asset.name,
      Processor: asset.processor,
      "Hard Drive": asset.storage,
      RAM: asset.ram,
      OS: asset.os,
      "Virus Guard": asset.virus_guard,
      Condition: asset.condition,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "IT Assets");

    // Convert to Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "IT_Asset_Report.xlsx");
  };

  const handleDownload = (selectedOption) => {
    if (selectedOption === "pdf") {
      downloadPDF();
    } else if (selectedOption === "excel") {
      downloadExcel();
    }
  };

  return (
    <div className="transferMachine-container">
      {/* <h2>IT Asset Details</h2> */}

      <div className="itassetreport-search-panel">
        {/* Left Side: Search Input & Category Dropdown */}
        <div className="itassetreport-search-left">
          <input
            type="text"
            placeholder="Search Assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
          >
            <option value="0">Select Category</option>
            {itCategories.map((c) => (
              <option key={c.cat_id} value={c.cat_id}>
                {c.cat_name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Side: Download Dropdown & Add Asset Button */}
        <div className="itassetreport-search-right">
          <div className="itassetreportpdfexceldownload-container">
            <div className="itassetreportpdfexceldownload-dropdown">
              <button className="itassetreportpdfexceldownload-btn">
                📥 Download ▼
              </button>
              <div className="itassetreportpdfexceldownload-content">
                <button onClick={downloadPDF}>📄 PDF Download</button>
                <button onClick={downloadExcel}>📊 Excel Download</button>
              </div>
            </div>
          </div>

          {permissions.includes("PERM001") && (
            <button
              className="itassetreport-addasset-btn"
              onClick={() => setShowModal(true)}
            >
              ➕ Add Asset
            </button>
          )}
        </div>
      </div>

      {/* <div className="table-container">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Asset Id</th>
                <th>Serial No</th>
                <th>Brand</th>
                <th>Name</th>
                <th>Processor</th>
                <th>Hard</th>
                <th>Ram</th>
                <th>OS</th>
                <th>Virus Guard</th>
                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {filteredItAssets.length > 0 ? (
                filteredItAssets.map((asset) => (
                  <tr key={asset.asset_id}>
                    <td>{asset.asset_id}</td>
                    <td>{asset.serial_no}</td>
                    <td>{asset.brand}</td>
                    <td>{asset.name}</td>
                    <td>{asset.processor}</td>
                    <td>{asset.storage}</td>
                    <td>{asset.ram}</td>
                    <td>{asset.os}</td>
                    <td>{asset.virus_guard}</td>
                    <td>{asset.condition}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center" }}>
                    No IT assets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div> */}
      <div className="itassettable-container">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Asset Id</th>
                <th>Serial No</th>
                <th>Brand</th>
                <th>Name</th>
                <th>Description</th>
                

                {/* Show all columns when no category is selected */}
                {selectedCategory === "" && (
                  <>
                    <th>Processor</th>
                    <th>Hard</th>
                    <th>Ram</th>
                    <th>OS</th>
                    <th>Virus Guard</th>
                  </>
                )}

                {/* Show full set for Laptops and Desktops */}
                {["Laptop", "Desktop"].includes(selectedCategory) && (
                  <>
                    <th>Processor</th>
                    <th>Hard</th>
                    <th>Ram</th>
                    <th>OS</th>
                    <th>Virus Guard</th>
                  </>
                )}

                {/* Show only Hard for External Hard */}
                {selectedCategory === "External Hard" && <th>Hard</th>}

                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {filteredItAssets.length > 0 ? (
                filteredItAssets.map((asset) => (
                  <tr key={asset.asset_id}>
                    <td>{asset.asset_id}</td>
                    <td>{asset.serial_no}</td>
                    <td>{asset.brand}</td>
                    <td>{asset.name}</td>
                    <td>{asset.description}</td>

                    {/* Show all columns when no category is selected */}
                    {selectedCategory === "" && (
                      <>
                        <td>{asset.processor}</td>
                        <td>{asset.storage}</td>
                        <td>{asset.ram}</td>
                        <td>{asset.os}</td>
                        <td>{asset.virus_guard}</td>
                      </>
                    )}

                    {/* Show full set for Laptops and Desktops */}
                    {["Laptop", "Desktop"].includes(selectedCategory) && (
                      <>
                        <td>{asset.processor}</td>
                        <td>{asset.storage}</td>
                        <td>{asset.ram}</td>
                        <td>{asset.os}</td>
                        <td>{asset.virus_guard}</td>
                      </>
                    )}

                    {/* Show only Hard for External Hard */}
                    {selectedCategory === "External Hard" && (
                      <td>{asset.storage}</td>
                    )}

                    <td>{asset.condition}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center" }}>
                    No IT assets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal for Adding Asset */}
      {/* Modal for Adding Asset */}
      {showModal && (
        <div className="addassetpopup-overlay">
          <div className="addassetpopup-modal">
            <h2 className="addassetpopup-title">Add New Asset</h2>

            {/* ✅ Show Error Message */}
            {errorMessage && (
              <p className="addassetpopup-error-message">{errorMessage}</p>
            )}

            <div className="addassetpopup-form">
              {/* Category Dropdown */}
              <div className="addassetpopup-field">
                <label>Category:</label>
                <select
                  name="itCategoryId"
                  value={newAsset.itCategoryId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {itCategories.map((c) => (
                    <option key={c.cat_id} value={c.cat_id}>
                      {c.cat_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serial Number */}
              <div className="addassetpopup-field">
                <label>Serial Number:</label>
                <input
                  type="text"
                  name="serial_no"
                  value={newAsset.serial_no}
                  onChange={handleInputChange}
                />
              </div>

              {/* Brand Dropdown */}
              <div className="addassetpopup-field">
                <label>Brand:</label>
                <select
                  name="brand"
                  value={newAsset.brand}
                  onChange={handleInputChange}
                >
                  <option value="">Select Brand</option>
                  {availableBrands.map((brand, index) => (
                    <option key={index} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="addassetpopup-field">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newAsset.name}
                  onChange={handleInputChange}
                />
              </div>

              {/* ✅ Processor Dropdown */}
              <div className="addassetpopup-field">
                <label>Processor:</label>
                <select
                  name="processor"
                  value={newAsset.processor}
                  onChange={handleInputChange}
                >
                  <option value="">Select Processor</option>
                  <option value="OTHER">Other</option>
                  <option value="N/A">N/A</option>
                  <optgroup label="Windows Processors">
                    <option value="Dual Core">Dual Core</option>
                    <option value="Core 2 Duo">Core 2 Duo </option>
                    <option value="CELERON">CELORON</option>
                    <option value="Pentium Silver">Pentium Silver</option>
                    <option value="Athalon Silver">Athalon Silver</option>
                    <optgroup label="Windows Server Processors"></optgroup>
                    <option value="Intel Xeon E-2300">Intel Xeon E-2300</option>
                    <option value="Intel Xeon Silver 4310">
                      Intel Xeon Silver 4310
                    </option>
                    <option value="Intel Xeon Silver 4210">
                      Intel Xeon Silver 4210
                    </option>

                    <option value="Intel i3">Intel i3</option>
                    <option value="Intel i5">Intel i5</option>
                    <option value="Intel i7">Intel i7</option>
                    <option value="Intel i9">Intel i9</option>

                    <option value="AMD Ryzen 3">AMD Ryzen 3</option>
                    <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                    <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                    <option value="AMD Ryzen 9">AMD Ryzen 9</option>
                  </optgroup>
                  <optgroup label="Mac Processors">
                    <option value="Apple M1">Apple M1</option>
                    <option value="Apple M2">Apple M2</option>
                    <option value="Apple M3">Apple M3</option>
                    <option value="Apple M1 Pro">Apple M1 Pro</option>
                    <option value="Apple M2 Pro">Apple M2 Pro</option>
                    <option value="Apple M3 Pro">Apple M3 Pro</option>
                    <option value="Apple M1 Max">Apple M1 Max</option>
                    <option value="Apple M2 Max">Apple M2 Max</option>
                    <option value="Apple M3 Max">Apple M3 Max</option>
                  </optgroup>
                </select>
              </div>

              {/* ✅ OS Dropdown */}
              <div className="addassetpopup-field">
                <label>OS:</label>
                <select
                  name="os"
                  value={newAsset.os}
                  onChange={handleInputChange}
                >
                  <option value="">Select OS</option>
                  <option value="OTHER">Other</option>
                  <option value="N/A">N/A</option>
                  <optgroup label="Windows Versions">
                    <option value="Windows XP">Windows XP</option>
                    <option value="Windows 7">Windows 7</option>
                    <option value="Windows 8">Windows 8</option>
                    <option value="Windows 10">Windows 10</option>
                    <option value="Windows 11">Windows 11</option>
                    <option value="Windows 16">Windows 16</option>
                  </optgroup>
                  <optgroup label="Mac OS Versions">
                    <option value="macOS Mojave">macOS Mojave</option>
                    <option value="macOS Catalina">macOS Catalina</option>
                    <option value="macOS Big Sur">macOS Big Sur</option>
                    <option value="macOS Monterey">macOS Monterey</option>
                    <option value="macOS Ventura">macOS Ventura</option>
                    <option value="macOS Sonoma">macOS Sonoma</option>
                  </optgroup>
                  <optgroup label="Linux Distros">
                    <option value="Ubuntu">Ubuntu</option>
                    <option value="Debian">Debian</option>
                    <option value="Fedora">Fedora</option>
                    <option value="Arch Linux">Arch Linux</option>
                    <option value="Manjaro">Manjaro</option>
                    <option value="Kali Linux">Kali Linux</option>
                  </optgroup>
                </select>
              </div>

              {/* Storage */}
              <div className="addassetpopup-field">
                <label>Storage:</label>
                <input
                  type="text"
                  name="storage"
                  value={newAsset.storage}
                  onChange={handleInputChange}
                />
              </div>

              {/* RAM */}
              <div className="addassetpopup-field">
                <label>RAM:</label>
                <input
                  type="text"
                  name="ram"
                  value={newAsset.ram}
                  onChange={handleInputChange}
                />
              </div>

              {/* Virus Guard */}
              <div className="addassetpopup-field">
                <label>Virus Guard:</label>
                <input
                  type="text"
                  name="virus_guard"
                  value={newAsset.virus_guard}
                  onChange={handleInputChange}
                />
              </div>

              {/* ✅ Condition Dropdown */}
              <div className="addassetpopup-field">
                <label>Condition:</label>
                <select
                  name="condition"
                  value={newAsset.condition}
                  onChange={handleInputChange}
                >
                  <option value="">Select Condition</option>
                  <option value="Brand New">Brand New</option>
                  <option value="Used">Used</option>
                </select>
              </div>

              {/* Supplier */}
              <div className="addassetpopup-field">
                <label>Supplier:</label>
                <input
                  type="text"
                  name="supplier"
                  value={newAsset.supplier}
                  onChange={handleInputChange}
                />
              </div>

              {/* Description */}
              <div className="addassetpopup-field addassetpopup-textarea">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={newAsset.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="addassetpopup-actions">
              <button
                className="addassetpopup-save-btn"
                onClick={handleSaveAsset}
              >
                Save
              </button>
              <button
                className="addassetpopup-cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItAssetDetails;
