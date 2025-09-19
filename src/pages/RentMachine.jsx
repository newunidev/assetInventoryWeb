// import React, { useState, useEffect } from "react";
// import "./RentMachine.css";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// import { GiForklift } from "react-icons/gi";

// const dummyRentMachines = [
//   {
//     rent_item_id: "RM001",
//     serial_no: "SN1001",
//     name: "Excavator",
//     description: "Large excavator for construction",
//     rented_by: "Company A",
//     box_no: "BX001",
//     model_no: "EX200",
//     motor_no: "MTR12345",
//     cat_id: "CAT001",
//     brand: "Caterpillar",
//     condition: "Good",
//     sup_id: "SUP100",
//     additional: "",
//   },
//   {
//     rent_item_id: "RM002",
//     serial_no: "SN1002",
//     name: "Forklift",
//     description: "Electric forklift for warehouse",
//     rented_by: "Company B",
//     box_no: "BX002",
//     model_no: "FK100",
//     motor_no: "MTR67890",
//     cat_id: "CAT002",
//     brand: "Toyota",
//     condition: "New",
//     sup_id: "SUP101",
//     additional: "",
//   },
// ];

// const RentMachine = () => {
//   const [rentMachines, setRentMachines] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [permissions, setPermissions] = useState(["PERM_RENT_MACHINE_ADD"]); // for testing

//   const [newMachine, setNewMachine] = useState({
//     rent_item_id: "",
//     serial_no: "",
//     name: "",
//     description: "",
//     rented_by: "",
//     box_no: "",
//     model_no: "",
//     motor_no: "",
//     cat_id: "",
//     brand: "",
//     condition: "",
//     sup_id: "",
//     additional: "",
//   });

//   useEffect(() => {
//     setTimeout(() => {
//       setRentMachines(dummyRentMachines);
//       setLoading(false);
//     }, 500);
//   }, []);

//   // Filter
//   const filteredMachines = rentMachines.filter((machine) => {
//     const term = searchTerm.toLowerCase();
//     return (
//       machine.rent_item_id.toLowerCase().includes(term) ||
//       machine.serial_no.toLowerCase().includes(term) ||
//       machine.name.toLowerCase().includes(term) ||
//       machine.brand.toLowerCase().includes(term) ||
//       machine.condition.toLowerCase().includes(term)
//     );
//   });

//   const handleInputChange = (e) => {
//     setNewMachine({ ...newMachine, [e.target.name]: e.target.value });
//   };

//   const handleSaveMachine = () => {
//     // Basic validation example (check required fields)
//     if (
//       !newMachine.rent_item_id ||
//       !newMachine.serial_no ||
//       !newMachine.name ||
//       !newMachine.brand ||
//       !newMachine.condition
//     ) {
//       setErrorMessage("⚠️ Please fill in all required fields.");
//       return;
//     }

//     setRentMachines((prev) => [...prev, newMachine]);

//     alert("✅ Rent Machine added successfully!");
//     setErrorMessage("");
//     setShowModal(false);

//     setNewMachine({
//       rent_item_id: "",
//       serial_no: "",
//       name: "",
//       description: "",
//       rented_by: "",
//       box_no: "",
//       model_no: "",
//       motor_no: "",
//       cat_id: "",
//       brand: "",
//       condition: "",
//       sup_id: "",
//       additional: "",
//     });
//   };

//   // PDF download
//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(18);
//     doc.text("Rent Machine Report", 14, 15);
//     doc.setFontSize(12);
//     doc.text(`Total Machines: ${filteredMachines.length}`, 14, 25);

//     doc.autoTable({
//       startY: 35,
//       head: [
//         [
//           "Rent Item ID",
//           "Serial No",
//           "Name",
//           "Brand",
//           "Condition",
//           "Rented By",
//           "Box No",
//           "Model No",
//           "Motor No",
//           "Cat ID",
//           "Sup ID",
//           "Additional",
//         ],
//       ],
//       body: filteredMachines.map((m) => [
//         m.rent_item_id,
//         m.serial_no,
//         m.name,
//         m.brand,
//         m.condition,
//         m.rented_by,
//         m.box_no,
//         m.model_no,
//         m.motor_no,
//         m.cat_id,
//         m.sup_id,
//         m.additional,
//       ]),
//       theme: "striped",
//     });

//     doc.save("RentMachine_Report.pdf");
//   };

//   // Excel download
//   const downloadExcel = () => {
//     const data = filteredMachines.map((m) => ({
//       "Rent Item ID": m.rent_item_id,
//       "Serial No": m.serial_no,
//       Name: m.name,
//       Brand: m.brand,
//       Condition: m.condition,
//       "Rented By": m.rented_by,
//       "Box No": m.box_no,
//       "Model No": m.model_no,
//       "Motor No": m.motor_no,
//       "Cat ID": m.cat_id,
//       "Sup ID": m.sup_id,
//       Additional: m.additional,
//       Description: m.description,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Rent Machines");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const blob = new Blob([excelBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });
//     saveAs(blob, "RentMachine_Report.xlsx");
//   };

//   return (
//     <div className="rentmachine-container">
//       <h2> <GiForklift size={40} color="brown" className="icon" /> Rent Machines</h2>

//       <div className="rentmachine-search-panel">
//         <input
//           type="text"
//           placeholder="Search Rent Machines..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />

//         <div className="rentmachine-download-add">
//           <div className="rentmachine-download-dropdown">
//             <button className="download-btn">📥 Download ▼</button>
//             <div className="download-content">
//               <button onClick={downloadPDF}>📄 PDF Download</button>
//               <button onClick={downloadExcel}>📊 Excel Download</button>
//             </div>
//           </div>

//           {permissions.includes("PERM_RENT_MACHINE_ADD") && (
//             <button className="add-btn" onClick={() => setShowModal(true)}>
//               ➕ Add Rent Machine
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="rentmachine-table-container">
//         {loading ? (
//           <p style={{ textAlign: "center" }}>Loading...</p>
//         ) : (
//           <table className="rentmachine-table">
//             <thead>
//               <tr>
//                 <th>Rent Item ID</th>
//                 <th>Serial No</th>
//                 <th>Name</th>
//                 <th>Brand</th>
//                 <th>Condition</th>
//                 <th>Rented By</th>
//                 <th>Box No</th>
//                 <th>Model No</th>
//                 <th>Motor No</th>
//                 <th>Cat ID</th>
//                 <th>Sup ID</th>
//                 <th>Additional</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredMachines.length > 0 ? (
//                 filteredMachines.map((machine) => (
//                   <tr key={machine.rent_item_id}>
//                     <td>{machine.rent_item_id}</td>
//                     <td>{machine.serial_no}</td>
//                     <td>{machine.name}</td>
//                     <td>{machine.brand}</td>
//                     <td>{machine.condition}</td>
//                     <td>{machine.rented_by}</td>
//                     <td>{machine.box_no}</td>
//                     <td>{machine.model_no}</td>
//                     <td>{machine.motor_no}</td>
//                     <td>{machine.cat_id}</td>
//                     <td>{machine.sup_id}</td>
//                     <td>{machine.additional}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="12" style={{ textAlign: "center" }}>
//                     No rent machines found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {showModal && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <h2>Add New Rent Machine</h2>

//             {errorMessage && <p className="error-message">{errorMessage}</p>}

//             <form
//               className="modal-form"
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleSaveMachine();
//               }}
//             >
//               {/* Row 1 */}
//               <div className="form-row">
//                 <label>
//                   Serial No: <span className="required">*</span>
//                   <input
//                     type="text"
//                     name="serial_no"
//                     value={newMachine.serial_no}
//                     onChange={handleInputChange}
//                   />
//                 </label>

//                 <label>
//                   Name: <span className="required">*</span>
//                   <input
//                     type="text"
//                     name="name"
//                     value={newMachine.name}
//                     onChange={handleInputChange}
//                   />
//                 </label>
//                 <label>
//                   Brand: <span className="required">*</span>
//                   <input
//                     type="text"
//                     name="brand"
//                     value={newMachine.brand}
//                     onChange={handleInputChange}
//                   />
//                 </label>
//               </div>

//               {/* Row 2 */}
//               <div className="form-row">
//                 <label>
//                   Box No:
//                   <input
//                     type="text"
//                     name="box_no"
//                     value={newMachine.box_no}
//                     onChange={handleInputChange}
//                   />
//                 </label>

//                 <label>
//                   Model No:
//                   <input
//                     type="text"
//                     name="model_no"
//                     value={newMachine.model_no}
//                     onChange={handleInputChange}
//                   />
//                 </label>

//                 <label>
//                   Motor No:
//                   <input
//                     type="text"
//                     name="motor_no"
//                     value={newMachine.motor_no}
//                     onChange={handleInputChange}
//                   />
//                 </label>
//               </div>

//               {/*Row No 3 */}

//               <div className="form-row condition-row">
//                 <label>
//                   Condition: <span className="required">*</span>
//                   <select
//                     name="condition"
//                     value={newMachine.condition}
//                     onChange={handleInputChange}
//                   >
//                     <option value="">Select Condition</option>
//                     <option value="New">New</option>
//                     <option value="Good">Good</option>
//                     <option value="Fair">Fair</option>
//                     <option value="Poor">Poor</option>
//                   </select>
//                 </label>
//               </div>

//               {/* Row 4 */}
//               <div className="form-row">
//                 <label>
//                   Cat ID: <span className="required">*</span>
//                   <input
//                     type="text"
//                     name="cat_id"
//                     value={newMachine.cat_id}
//                     onChange={handleInputChange}
//                   />
//                 </label>

//                 <label>
//                   Sup ID: <span className="required">*</span>
//                   <input
//                     type="text"
//                     name="sup_id"
//                     value={newMachine.sup_id}
//                     onChange={handleInputChange}
//                   />
//                 </label>

//                 <label>
//                   Additional:
//                   <input
//                     type="text"
//                     name="additional"
//                     value={newMachine.additional}
//                     onChange={handleInputChange}
//                   />
//                 </label>
//               </div>

//               {/* Row 5: Description full width */}
//               <div className="form-row full-width">
//                 <label>
//                   Description:
//                   <textarea
//                     name="description"
//                     value={newMachine.description}
//                     onChange={handleInputChange}
//                   />
//                 </label>
//               </div>

//               {/* Buttons full width */}
//               <div className="modal-buttons">
//                 <button type="submit">Save</button>
//                 <button type="button" onClick={() => setShowModal(false)}>
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RentMachine;

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
import { getAllSuppliers } from "../controller/RentMachineController";
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
        console.log("response",response);
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
    </div>
  );
};

export default RentMachine;
