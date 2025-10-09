import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./GatePass.css";
import { getAllSuppliers } from "../controller/RentMachineController";
import { getAllRentMachineLifeExpired } from "../controller/RentMachineLifeController";

import {
  getAllGatePassRentMachinesAndGatePass,
  updateGatePass,
  bulkGatePassRentMachinesUpdateCreate,
  deleteGatePassRentMachine,
  updateGatePassStatus,
} from "../controller/GatePassController";
import { usePageTitle } from "../utility/usePageTitle";

const GatePassEdit = () => {
  const { gpNo } = useParams();
  const navigate = useNavigate();
  const [, setPageTitle] = usePageTitle();

  const [suppliers, setSuppliers] = useState([]);
  const [allRentMachines, setAllRentMachines] = useState([]);
  const [rentMachines, setRentMachines] = useState([]);
  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState({
    attention: "",
    through: "",
    gatepass_to: "",
    instructed_by: "",
    description: "",
    vehicle_no: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load page data
  useEffect(() => {
    setPageTitle("Edit GatePass");
    loadSuppliers();
    loadMachines();
    loadGatePassDetails();
  }, []);

  const loadSuppliers = async () => {
    const res = await getAllSuppliers();
    if (res.success) setSuppliers(res.suppliers);
  };

  const loadMachines = async () => {
    const res = await getAllRentMachineLifeExpired();
    if (res.success && Array.isArray(res.data)) {
      const userBranchId = parseInt(localStorage.getItem("userBranchId"));
      const machines = res.data
        .filter((item) => item.Branch?.branch_id === userBranchId)
        .map((item) => ({
          id: item.RentMachine.rent_item_id,
          serial_no: item.RentMachine.serial_no,
          name: item.RentMachine.name,
          sup_id: item.RentMachine.sup_id,
          rawData: item,
        }));
      setAllRentMachines(machines);
      setRentMachines(machines);
    }
  };

  const loadGatePassDetails = async () => {
    try {
      const res = await getAllGatePassRentMachinesAndGatePass(gpNo);
      if (!res.success) return;

      const gp = res.data;

      // Set form data
      setFormData({
        attention: gp.att_by || "",
        through: gp.through || "",
        gatepass_to: gp.gatepass_to?.toString() || "",
        instructed_by: gp.instructed_by || "",
        description: gp.description || "",
        vehicle_no: gp.v_no || "",
      });

      // Set machines
      if (gp.GatePassRentMachines && Array.isArray(gp.GatePassRentMachines)) {
        console.log("Machine for table data", gp.GatePassRentMachines);
        const machineRows = gp.GatePassRentMachines.map((item) => ({
          pk_id: item.id,
          id: item.RentMachine?.rent_item_id,
          serial_no: item.RentMachine?.serial_no,
          name: item.RentMachine?.name,
          sup_id: item.RentMachine?.sup_id,
          rawData: item,
        }));
        setRows(machineRows);
      }

      // Ensure supplier exists in list
      if (gp.Supplier) {
        setSuppliers((prev) => {
          if (!prev.some((s) => s.supplier_id === gp.Supplier.supplier_id)) {
            return [...prev, gp.Supplier];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("❌ Failed to load GatePass details:", err);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "gatepass_to") {
      if (value === "") {
        setRentMachines(allRentMachines);
      } else {
        setRentMachines(allRentMachines.filter((m) => m.sup_id == value));
      }
    }
  };

  const handleAddMachine = (machine) => {
    if (rows.some((r) => r.id === machine.id)) return;
    setRows((prev) => [...prev, machine]);
    setShowPopup(false);
  };

  const handleRemoveMachine = async (id, isExisting) => {
    console.log("Clicked Remove:", id, "Existing:", isExisting);

    if (isExisting) {
      try {
        await deleteGatePassRentMachine(id);
      } catch (error) {
        console.error("Delete failed:", error);
        return; // stop removing from UI if backend failed
      }
    }

    // remove from UI
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateGatePass = async () => {
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem("userid");

      // 1️⃣ Update GatePass header
      const payload = {
        att_by: formData.attention,
        through: formData.through,
        gatepass_to: formData.gatepass_to,
        instructed_by: formData.instructed_by,
        description: formData.description,
        v_no: formData.vehicle_no,
        updated_by: userId,
      };
      await updateGatePass(gpNo, payload);

      // 2️⃣ Bulk insert only NEW machines (skip existing)
      const newMachines = rows.filter((m) => !m.pk_id); // if pk_id exists => existing
      if (newMachines.length > 0) {
        const bulkPayload = newMachines.map((m) => ({
          gp_no: gpNo,
          rent_item_id: m.id,
          rent_machine_life_id: m.rawData.id,
          remarks: "Machine added on update",
        }));
        await bulkGatePassRentMachinesUpdateCreate(bulkPayload);
      }

      alert("✅ GatePass updated !");
      navigate(`/rentmachines/gatepass-report/${encodeURIComponent(gpNo)}`);
    } catch (err) {
      console.error("❌ Error updating GatePass:", err);
      alert("Failed to update GatePass.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGatePassWithApproval = async () => {
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem("userid");

      // 1️⃣ Update GatePass header
      const payload = {
        att_by: formData.attention,
        through: formData.through,
        gatepass_to: formData.gatepass_to,
        instructed_by: formData.instructed_by,
        description: formData.description,
        v_no: formData.vehicle_no,
        updated_by: userId,
      };
      await updateGatePass(gpNo, payload);

      // 2️⃣ Bulk insert only NEW machines (skip existing)
      const newMachines = rows.filter((m) => !m.pk_id); // if pk_id exists => existing
      if (newMachines.length > 0) {
        const bulkPayload = newMachines.map((m) => ({
          gp_no: gpNo,
          rent_item_id: m.id,
          rent_machine_life_id: m.rawData.id,
          remarks: "Machine added on update",
        }));
        await bulkGatePassRentMachinesUpdateCreate(bulkPayload);
      }

      // 3️⃣ Update GatePass status (example: "Approved")
      await updateGatePassStatus(gpNo, "Pending");

      alert("✅ GatePass updated and Send to Approval!");
      navigate(`/rentmachines/gatepass-report/${encodeURIComponent(gpNo)}`);
    } catch (err) {
      console.error("❌ Error updating GatePass:", err);
      alert("Failed to update GatePass.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gatepass-wrapper">
      <h2>Edit GatePass - {gpNo}</h2>

      {/* ---------- Form ---------- */}
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

      {/* ---------- Machines Table ---------- */}
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
              className="gatepass-button-save"
              onClick={handleUpdateGatePass}
            >
              💾 Update GatePass
            </button>

            <button
              className="gatepass-button-submit"
              onClick={handleUpdateGatePassWithApproval}
            >
              ✅ Send To Approval
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
                    No machines
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
                        onClick={() =>
                          handleRemoveMachine(row.pk_id, !!row.rawData.id)
                        }
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
              disabled={!formData.gatepass_to}
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
                {rentMachines
                  .filter((rm) => rm.sup_id === parseInt(formData.gatepass_to))
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
                  ))}
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

      {isSubmitting && (
        <div className="po-loading-overlay">
          <div className="po-loading-spinner">
            <p>Updating...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatePassEdit;
