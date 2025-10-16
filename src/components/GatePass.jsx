import React, { useState, useEffect } from "react";
import "./GatePass.css"; // create similar to RenewalPurchaseOrderEdit.css
import { getAllSuppliers } from "../controller/RentMachineController";
import { getAllRentMachineLifeExpired } from "../controller/RentMachineLifeController";
import { usePageTitle } from "../utility/usePageTitle";
import { useNavigate } from "react-router-dom";
import {
  createGatePass,
  createGatePassWithApproval,
  bulkGatePassRentMachinesUpdateCreate,
  deleteGatePass,
} from "../controller/GatePassController";

const Gatepass = () => {
  const navigate = useNavigate();
  const [, setPageTitle] = usePageTitle();
  const [suppliers, setSuppliers] = useState([]);
  const [allRentMachines, setAllRentMachines] = useState([]); // store all
  const [rentMachines, setRentMachines] = useState([]); // filtered
  const [rows, setRows] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    attention: "",
    through: "",
    gatepass_to: "",
    instructed_by: "",
    description: "",
    vehicle_no: "",
  });

  useEffect(() => {
    setPageTitle("Gatepass");
    loadSuppliers();
    loadMachines();
  }, []);

  const loadSuppliers = async () => {
    try {
      const res = await getAllSuppliers();
      if (res.success) setSuppliers(res.suppliers);
    } catch (err) {
      console.error("❌ Failed to load suppliers:", err);
    }
  };

  // const loadMachines = async () => {
  //   try {
  //     const res = await getAllRentMachineLifeExpired();
  //     console.log(res);
  //     if (res.success && Array.isArray(res.data)) {
  //       const machines = res.data.map((item) => ({
  //         id: item.RentMachine.rent_item_id,
  //         serial_no: item.RentMachine.serial_no,
  //         name: item.RentMachine.name,
  //         sup_id: item.RentMachine.sup_id, // ✅ supplier id
  //         rawData: item,
  //       }));
  //       setAllRentMachines(machines);
  //       setRentMachines(machines); // initially all
  //     }
  //   } catch (err) {
  //     console.error("❌ Failed to load machines:", err);
  //   }
  // };

  const loadMachines = async () => {
    try {
      const res = await getAllRentMachineLifeExpired();
      if (res.success && Array.isArray(res.data)) {
        const userBranchId = parseInt(localStorage.getItem("userBranchId")); // or wherever you store it
        console.log(userBranchId);
        const machines = res.data
          .filter((item) => item.Branch?.branch_id === userBranchId) // filter by branch
          .map((item) => ({
            id: item.RentMachine.rent_item_id,
            serial_no: item.RentMachine.serial_no,
            name: item.RentMachine.name,
            sup_id: item.RentMachine.sup_id, // ✅ supplier id
            rawData: item,
          }));

        setAllRentMachines(machines);
        setRentMachines(machines); // initially all filtered
      }
    } catch (err) {
      console.error("❌ Failed to load machines:", err);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "gatepass_to") {
      if (value === "") {
        // no supplier selected → reset
        setRentMachines(allRentMachines);
      } else {
        // filter by supplier id
        setRentMachines(allRentMachines.filter((m) => m.sup_id == value));
      }
    }
  };

  const handleAddMachine = (machine) => {
    console.log(machine);
    if (rows.some((r) => r.id === machine.id)) return;
    setRows((prev) => [...prev, machine]);
    setShowPopup(false);
  };

  const handleRemoveMachine = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = () => {
    // 👉 Here you can connect to backend later
    const payload = {
      ...formData,
      machines: rows.map((r) => r.rawData),
    };
    console.log("🚀 Submitting Gatepass:", payload);
    alert("✅ Gatepass submitted! Check console for payload.");
  };

  const handleSendToApprovalGatePass = async () => {
    const userId = localStorage.getItem("userid");
    const userBranch = localStorage.getItem("userBranch");
    const userBranchId = localStorage.getItem("userBranchId");

    setIsSubmitting(true);

    let gp_no = null; // <-- define outside try so it’s accessible in catch

    try {
      // ✅ Validate required fields
      if (
        !formData.attention ||
        !formData.through ||
        !formData.gatepass_to ||
        !formData.instructed_by ||
        !formData.vehicle_no
      ) {
        alert("Please fill all required fields.");
        setIsSubmitting(false);
        return;
      }

      if (rows.length === 0) {
        alert("Please add at least one machine.");
        setIsSubmitting(false);
        return;
      }

      // ✅ Step 1: Create GatePass
      const gatePassPayload = {
        att_by: formData.attention,
        date: new Date().toISOString().split("T")[0], // today’s date
        through: formData.through,
        gatepass_to: formData.gatepass_to,
        instructed_by: formData.instructed_by,
        description: formData.description,
        v_no: formData.vehicle_no,
        status: "Pending",
        created_by: userId,
        additional1: "Urgent",
        additional2: "Handle with care",
        is_transfer_gp: false,
        branch_id: userBranchId,
      };

      console.log("📦 Creating GatePass:", gatePassPayload);
      const gpResponse = await createGatePassWithApproval(gatePassPayload);

      gp_no = gpResponse.gatepass?.gp_no; // <-- assign here
      if (!gp_no) throw new Error("gp_no not returned from server.");
      console.log("✅ Created GatePass:", gp_no);

      // ✅ Step 2: Bulk create GatePass Rent Machines
      const bulkMachinesPayload = rows.map((m) => ({
        gp_no, // <-- use correct variable
        rent_item_id: m.id,
        rent_machine_life_id: m.rawData.id, // check backend field
        remarks: "Machine added to Gatepass",
      }));

      console.log("📦 Bulk Machines Payload:", bulkMachinesPayload);
      await bulkGatePassRentMachinesUpdateCreate(bulkMachinesPayload);

      alert("✅ GatePass created successfully!");
      // navigate(`/gatepass/reports/${encodeURIComponent(gp_no)}`);
      //navigate(`/rentmachines/gatepass-report/${encodeURIComponent(gp_no)}`);
      const safeGpNo = gp_no.replace("/", "-");
      navigate(`/rentmachines/gatepass-report/${safeGpNo}`);
    } catch (error) {
      console.error("❌ Error creating GatePass:", error);

      // ✅ Only attempt to delete if gp_no exists
      if (gp_no) {
        try {
          await deleteGatePass(gp_no);
          console.log(
            "🗑️ Deleted created GatePass due to failure in bulk creation."
          );
        } catch (delError) {
          console.error(
            "❌ Failed to delete GatePass after bulk failure:",
            delError
          );
        }
      }

      alert("Failed to create GatePass. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveGatePass = async () => {
    const userId = localStorage.getItem("userid");
    const userBranch = localStorage.getItem("userBranch");
    const userBranchId = localStorage.getItem("userBranchId");

    setIsSubmitting(true);

    let gp_no = null; // <-- define outside try so it’s accessible in catch

    try {
      // ✅ Validate required fields
      if (
        !formData.attention ||
        !formData.through ||
        !formData.gatepass_to ||
        !formData.instructed_by ||
        !formData.vehicle_no
      ) {
        alert("Please fill all required fields.");
        setIsSubmitting(false);
        return;
      }

      if (rows.length === 0) {
        alert("Please add at least one machine.");
        setIsSubmitting(false);
        return;
      }

      // ✅ Step 1: Create GatePass
      const gatePassPayload = {
        att_by: formData.attention,
        date: new Date().toISOString().split("T")[0], // today’s date
        through: formData.through,
        gatepass_to: formData.gatepass_to,
        instructed_by: formData.instructed_by,
        description: formData.description,
        v_no: formData.vehicle_no,
        status: "Saved",
        created_by: userId,
        additional1: "Urgent",
        additional2: "Handle with care",
        is_transfer_gp: false,
        branch_id: userBranchId,
      };

      console.log("📦 Creating GatePass:", gatePassPayload);
      const gpResponse = await createGatePassWithApproval(gatePassPayload);

      gp_no = gpResponse.gatepass?.gp_no; // <-- assign here
      if (!gp_no) throw new Error("gp_no not returned from server.");
      console.log("✅ Created GatePass:", gp_no);

      // ✅ Step 2: Bulk create GatePass Rent Machines
      const bulkMachinesPayload = rows.map((m) => ({
        gp_no, // <-- use correct variable
        rent_item_id: m.id,
        rent_machine_life_id: m.rawData.id, // check backend field
        remarks: "Machine added to Gatepass",
      }));

      console.log("📦 Bulk Machines Payload:", bulkMachinesPayload);
      await bulkGatePassRentMachinesUpdateCreate(bulkMachinesPayload);

      alert("✅ GatePass created successfully!");
      // navigate(`/gatepass/reports/${encodeURIComponent(gp_no)}`);
      const safeGpNo = gp_no.replace("/", "-");
      navigate(`/rentmachines/gatepass-report/${safeGpNo}`);
    } catch (error) {
      console.error("❌ Error creating GatePass:", error);

      // ✅ Only attempt to delete if gp_no exists
      if (gp_no) {
        try {
          await deleteGatePass(gp_no);
          console.log(
            "🗑️ Deleted created GatePass due to failure in bulk creation."
          );
        } catch (delError) {
          console.error(
            "❌ Failed to delete GatePass after bulk failure:",
            delError
          );
        }
      }

      alert("Failed to create GatePass. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gatepass-wrapper">
      {/* ---------- Top Form ---------- */}
      <form className="gatepass-form-grid" onSubmit={(e) => e.preventDefault()}>
        <div className="gatepass-field-group">
          <label>Attention</label>
          <input
            type="text"
            value={formData.attention}
            onChange={(e) => handleFormChange("attention", e.target.value)}
          />
        </div>

        <div className="gatepass-field-group">
          <label>Through</label>
          <input
            type="text"
            value={formData.through}
            onChange={(e) => handleFormChange("through", e.target.value)}
          />
        </div>

        <div className="gatepass-field-group">
          <label>Gatepass To</label>
          <select
            value={formData.gatepass_to}
            onChange={(e) => handleFormChange("gatepass_to", e.target.value)}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.supplier_id} value={s.supplier_id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="gatepass-field-group">
          <label>Instructed By</label>
          <input
            type="text"
            value={formData.instructed_by}
            onChange={(e) => handleFormChange("instructed_by", e.target.value)}
          />
        </div>

        <div className="gatepass-field-group">
          <label>Description</label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
          />
        </div>

        <div className="gatepass-field-group">
          <label>Vehicle No</label>
          <input
            type="text"
            value={formData.vehicle_no}
            onChange={(e) => handleFormChange("vehicle_no", e.target.value)}
          />
        </div>
      </form>

      {/* ---------- Table Section ---------- */}
      <div className="gatepass-form-card">
        <div className="gatepass-header-row">
          <button
            className="gatepass-button-add"
            onClick={() => setShowPopup(true)}
          >
            ➕ Add Machine
          </button>

          <div className="gatepass-header-right">
            <button
              className="gatepass-button-submit"
              onClick={handleSendToApprovalGatePass}
            >
              🚀 Send To Approval
            </button>
            <button
              className="gatepass-button-save"
              onClick={handleSaveGatePass}
              style={{ marginLeft: "10px" }}
            >
              ✅ Save
            </button>
          </div>
        </div>

        <div className="gatepass-table-container">
          <table className="gatepass-table">
            <thead>
              <tr>
                <th>Rent ID</th>
                <th>Machine</th>
                <th>Serial No</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", color: "#666" }}
                  >
                    No machines added
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.serial_no}</td>
                    <td>
                      <button
                        className="gatepass-btn-delete"
                        onClick={() => handleRemoveMachine(row.id)}
                      >
                        ❌ Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Popup ---------- */}
      {showPopup && (
        <div className="gatepass-popup-overlay">
          <div className="gatepass-popup">
            <h3>Select Rent Machine</h3>

            <input
              type="text"
              placeholder="Search by name or serial no"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gatepass-input-search"
              disabled={!formData.gatepass_to} // disable search until supplier selected
            />

            <table className="gatepass-table">
              <thead>
                <tr>
                  <th>Rent ID</th>
                  <th>Machine</th>
                  <th>Serial No</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {!formData.gatepass_to ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", color: "#888" }}
                    >
                      ⚠️ Please select a supplier first
                    </td>
                  </tr>
                ) : (
                  rentMachines
                    .filter(
                      (rm) => rm.sup_id === parseInt(formData.gatepass_to) // ✅ only machines from selected supplier
                    )
                    .filter(
                      (rm) =>
                        rm.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        rm.serial_no
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        rm.id.toString().includes(searchTerm)
                    )
                    .map((rm) => (
                      <tr key={rm.id}>
                        <td>{rm.id}</td>
                        <td>{rm.name}</td>
                        <td>{rm.serial_no}</td>
                        <td>
                          <button
                            onClick={() => handleAddMachine(rm)}
                            className="gatepass-button-select"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>

            <button
              onClick={() => setShowPopup(false)}
              className="gatepass-button-close"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* ✅ Add it right here */}
      {isSubmitting && (
        <div className="po-loading-overlay">
          <div className="po-loading-spinner">
            <span className="loader-icon">
              <img
                src="/nu.png"
                alt="User Profile"
                className="user-profile-img"
              />
            </span>
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gatepass;
