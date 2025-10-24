import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./RentMachine.css";

import { GiForklift } from "react-icons/gi";
import { FaFilePdf } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";

//importing required controller methods
import { getCategories } from "../controller/CategoryController";
import {
  getAllSuppliers,
  createBulkRentMachines,
} from "../controller/RentMachineController";
import { getAllRentMachines } from "../controller/RentMachineController";
import { createRentMachines } from "../controller/RentMachineController";
import { getAllBranches } from "../controller/EmployeeController";
// Inside your RentMachine.jsx (or relevant component)
import { BRANCHES } from "../utility/common"; // Adjust the path if needed
import { usePageTitle } from "../utility/usePageTitle";

const RentMachine = () => {
  const userBranch = localStorage.getItem("userBranch");

  const [selectedBranch, setSelectedBranch] = useState("");
  //const [branches] = useState(BRANCHES);
  const [branches, setBranches] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [supplier, setSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  const [rentMachines, setRentMachines] = useState([]);
  const [newMachine, setNewMachine] = useState({
    serial_no: "",
    name: "",
    brand: "",
    box_no: "N/A",
    model_no: "N/A",
    motor_no: "N/A",
    condition: "",
    cat_id: "",
    sup_id: "",
    additional: "",
    description: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [, setPageTitle] = usePageTitle();

  const [showPopup, setShowPopup] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setPageTitle("🛠️🏗️ Rent Machine Manager");
  }, [setPageTitle]);
  //use effect for fecth machines

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getAllBranches();
        if (response.success) {
          setBranches(response.branches); // store API branches
        }
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      }
    };
    fetchBranches();
  }, []);
  useEffect(() => {
    const fetchRentMachines = async () => {
      try {
        const response = await getAllRentMachines();
        console.log("response", response);
        if (response.success) {
          setRentMachines(response.machines);
        } else {
          console.error("API error:", response.message);
        }
      } catch (error) {
        console.error("Failed to fetch rent machines:", error);
      }
    };

    fetchRentMachines();
  }, []);

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

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getAllSuppliers();
        setSuppliers(data.suppliers);
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  const handleInputChange = (e) => {
    setNewMachine({ ...newMachine, [e.target.name]: e.target.value });
  };

  //method to save new rent machine
  const handleSaveMachine = async () => {
    const requiredFields = [
      "serial_no",
      "name",
      "brand",
      "cat_id",
      "sup_id",
      "condition",
    ];

    const isValid = requiredFields.every((field) => newMachine[field]);
    if (!isValid) {
      alert(
        "Please fill in all required fields including category, supplier, and condition."
      );
      return;
    }

    const machineData = {
      serial_no: newMachine.serial_no, // note: 'serail_no' intentionally uses typo to match backend
      name: newMachine.name,
      description: newMachine.description,
      rented_by: null, // You can make this dynamic later
      box_no: newMachine.box_no,
      model_no: newMachine.model_no,
      motor_no: newMachine.motor_no,
      cat_id: parseInt(newMachine.cat_id),
      brand: newMachine.brand,
      condition: newMachine.condition,
      sup_id: parseInt(newMachine.sup_id),
      additional: newMachine.additional,
      machine_status: "Available To Grn",
    };

    try {
      const response = await createRentMachines(machineData);
      if (response.success) {
        alert("Rent Machine created successfully!");
        setRentMachines([...rentMachines, response.rentMachine]); // optional: update UI if backend returns new item
        setNewMachine({
          serial_no: "N/A",
          name: "",
          brand: "",
          box_no: "N/A",
          model_no: "N/A",
          motor_no: "N/A",
          condition: "",
          cat_id: "",
          sup_id: "",
          additional: "",
          description: "",
        });
      } else {
        alert("Failed to create rent machine.");
      }
    } catch (error) {
      console.error("Error creating machine:", error);
      alert("An error occurred while saving the rent machine.");
    }
  };

  const handleEdit = (index) => {
    setNewMachine(rentMachines[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updated = rentMachines.filter((_, i) => i !== index);
    setRentMachines(updated);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Rent Machines", 14, 15);
    doc.autoTable({
      startY: 10,
      head: [
        [
          "Serial No",
          "Name",
          "Brand",
          "Box",
          "Model",
          "Motor",
          "Condition",
          "Rented By",
        ],
      ],
      body: filteredMachines.map((m) => [
        m.serial_no,
        m.name,
        m.brand,
        m.box_no,
        m.model_no,
        m.motor_no,
        m.condition,
        m.rented_by,
      ]),
    });
    doc.save("RentMachines.pdf");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rentMachines);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Machines");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "RentMachines.xlsx");
  };

  //method to filter the machines
  // const filteredMachines = rentMachines
  //   .filter((machine) => {
  //     // Always include machines with rented_by "NA"

  //     if (machine.rented_by === null) return true;

  //     if (userBranch === "Head Office") {
  //       return selectedBranch ? machine.rented_by === selectedBranch : true;
  //     } else {
  //       return machine.rented_by === userBranch;
  //     }
  //   })
  //   .filter((machine) => {
  //     const q = searchQuery.toLowerCase();
  //     return (
  //       machine.serial_no?.toLowerCase().includes(q) ||
  //       machine.name?.toLowerCase().includes(q) ||
  //       machine.brand?.toLowerCase().includes(q) ||
  //       machine.box_no?.toLowerCase().includes(q) ||
  //       machine.model_no?.toLowerCase().includes(q) ||
  //       machine.motor_no?.toLowerCase().includes(q) ||
  //       machine.condition?.toLowerCase().includes(q) ||
  //       machine.Category?.cat_name?.toLowerCase().includes(q) ||
  //       machine.rented_by?.toLowerCase().includes(q) ||
  //       machine.Supplier?.name?.toLowerCase().includes(q)
  //     );
  //   });
  const filteredMachines = rentMachines
    .filter((machine) => {
      // Always include machines with rented_by "NA" (or null)
      if (!machine.rented_by || machine.rented_by === "NA") return true;

      if (userBranch === "Head Office") {
        return selectedBranch
          ? machine.rented_by === parseInt(selectedBranch)
          : true;
      } else {
        // For non-HO users, only show machines for their branch
        // Find branch_id of user's branch
        const userBranchObj = branches.find(
          (b) => b.branch_name === userBranch
        );
        return machine.rented_by === userBranchObj?.branch_id;
      }
    })
    .filter((machine) => {
      const q = searchQuery.toLowerCase();
      return (
        machine.serial_no?.toLowerCase().includes(q) ||
        machine.name?.toLowerCase().includes(q) ||
        machine.brand?.toLowerCase().includes(q) ||
        machine.box_no?.toLowerCase().includes(q) ||
        machine.model_no?.toLowerCase().includes(q) ||
        machine.motor_no?.toLowerCase().includes(q) ||
        machine.condition?.toLowerCase().includes(q) ||
        machine.Category?.cat_name?.toLowerCase().includes(q) ||
        (
          branches.find((b) => b.branch_id === machine.rented_by)
            ?.branch_name || ""
        )
          .toLowerCase()
          .includes(q) ||
        machine.Supplier?.name?.toLowerCase().includes(q)
      );
    });

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      setExcelData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkCreate = async () => {
    if (!selectedSupplier || !selectedCategory) {
      alert("Please select both Supplier and Category before uploading.");
      return;
    }
    if (excelData.length === 0) {
      alert("Please upload a valid Excel file first.");
      return;
    }

    const formattedData = {
      machines: excelData.map((m) => ({
        serial_no: m.serial_no,
        name: m.name,
        description: m.description,
        rented_by: null,
        box_no: m.box_no,
        model_no: m.model_no,
        motor_no: m.motor_no,
        cat_id: parseInt(selectedCategory),
        brand: m.brand,
        condition: m.condition,
        sup_id: parseInt(selectedSupplier),
        additional: m.additional,
        machine_status: "Available To Grn",
      })),
    };

    try {
      const response = await createBulkRentMachines(formattedData);
      if (response.success) {
        alert("Bulk Rent Machines added successfully!");
        setExcelData([]);
        setShowPopup(false);
      } else {
        alert("Failed to upload machines.");
      }
    } catch (error) {
      console.error("Bulk upload failed:", error);
      alert("Error occurred during upload.");
    }
  };

  return (
    <div className="rentmachine-container">
      {/* <h2>
        <GiForklift size={40} color="brown" className="icon" /> Rent Machine
        Manager
      </h2> */}
      <div className="rentmachine-grid">
        <div className="rentmachine-form-card">
          <form
            className="rentmachine-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveMachine();
            }}
          >
            <h3 className="form-heading">Add / Update Rent Machine</h3>

            <div className="form-row">
              <label>
                Serial No *
                <input
                  type="text"
                  name="serial_no"
                  value={newMachine.serial_no}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Name *
                <input
                  type="text"
                  name="name"
                  value={newMachine.name}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Brand*
                <input
                  type="text"
                  name="brand"
                  value={newMachine.brand}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Box No
                <input
                  type="text"
                  name="box_no"
                  value={newMachine.box_no}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Model No
                <input
                  type="text"
                  name="model_no"
                  value={newMachine.model_no}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Motor No
                <input
                  type="text"
                  name="motor_no"
                  value={newMachine.motor_no}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Condition
                <select
                  name="condition"
                  value={newMachine.condition}
                  onChange={handleInputChange}
                >
                  <option value="">Select</option>
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </label>

              <label>
                Category
                <select
                  name="cat_id"
                  value={newMachine.cat_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.cat_id} value={cat.cat_id}>
                      {cat.cat_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Supplier
                <select
                  name="sup_id"
                  value={newMachine.sup_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.supplier_id} value={sup.supplier_id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Additional
                <input
                  type="text"
                  name="additional"
                  value={newMachine.additional}
                  onChange={handleInputChange}
                />
              </label>
              <label className="full-width">
                Description
                <textarea
                  name="description"
                  value={newMachine.description}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="form-buttons">
              <button type="submit" disabled={userBranch === "Head Office"}>
                {editingIndex !== null ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>

        <div className="rentmachine-table-card">
          {/* Search + Export Buttons Row */}
          <div className="table-toolbar">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search machines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rentmachine-search"
              />

              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="branch-select"
                disabled={userBranch !== "Head Office"}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="button-container">
              <button onClick={downloadPDF} className="pdf-button">
                <FaFilePdf size={18} />
                PDF
              </button>

              <button onClick={downloadExcel} className="excel-button">
                <FaFileExcel size={18} />
                Excel
              </button>
              <button
                onClick={() => setShowPopup(true)}
                className="excel-button"
              >
                <FaFileExcel size={18} />
                BULK
              </button>
            </div>
          </div>

          {/* Table Scroll Area */}
          <div className="table-scroll-area">
            <table className="rentmachine-table">
              <thead>
                <tr>
                  <th>Rent ID</th>
                  <th>Serial No</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Box No</th>
                  <th>Model No</th>
                  <th>Motor No</th>
                  <th>Condition</th>
                  <th>Category</th>
                  <th>Rented By</th>
                  <th>Supplier</th>
                  <th>Machine Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.length > 0 ? (
                  filteredMachines.map((machine, index) => (
                    <tr key={machine.rent_item_id}>
                      <td>{machine.rent_item_id}</td>
                      <td>{machine.serial_no}</td>
                      <td>{machine.name}</td>
                      <td>{machine.brand}</td>
                      <td>{machine.box_no}</td>
                      <td>{machine.model_no}</td>
                      <td>{machine.motor_no}</td>
                      <td>{machine.condition}</td>
                      <td>{machine.Category?.cat_name || "N/A"}</td>
                      <td>{machine.Branch?.branch_name}</td>
                      <td>{machine.Supplier?.name || "N/A"}</td>
                      <td>{machine.machine_status || "N/A"}</td>
                      <td>
                        <button onClick={() => handleEdit(index)}>✏️</button>
                        <button onClick={() => handleDelete(index)}>🗑️</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" style={{ textAlign: "center" }}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="rentmachine-popup-overlay">
          <div className="rentmachine-popup-content">
            <button
              className="rentmachine-popup-close"
              onClick={() => setShowPopup(false)}
            >
              &times;
            </button>

            <h3 className="rentmachine-popup-title">
              Upload Rent Machines via Excel
            </h3>

            <div className="rentmachine-popup-form">
              <div className="rentmachine-popup-input-group">
                <label>Supplier:</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.supplier_id} value={sup.supplier_id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rentmachine-popup-input-group">
                <label>Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.cat_id} value={cat.cat_id}>
                      {cat.cat_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rentmachine-popup-input-group">
                <label>Upload Excel:</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                />
              </div>

              <div className="rentmachine-popup-buttons">
                <button
                  className="rentmachine-popup-upload-btn"
                  onClick={handleBulkCreate}
                >
                  Upload
                </button>
              </div>
            </div>

            {excelData.length > 0 && (
              <div className="rentmachine-excel-preview">
                <h4>Preview ({excelData.length} rows)</h4>
                <div className="rentmachine-excel-table-container">
                  <table className="rentmachine-excel-table">
                    <thead>
                      <tr>
                        {Object.keys(excelData[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, i) => (
                            <td key={i}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RentMachine;
