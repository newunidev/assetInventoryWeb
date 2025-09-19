import React, { useState, useEffect } from "react";
import "./RentMachineTransfer.css";
import { getAllRentMachines } from "../controller/RentMachineController";
import { getAllBranches } from "../controller/EmployeeController";
import { usePageTitle } from "../utility/usePageTitle";
import {
  createRentMachineTransfer,
  getAllRentMachineTransfers,
  updateRentMachineTransferStatus,
} from "../controller/RentMachineTransferController";
import { getAllRentMachineLifeActive } from "../controller/RentMachineLifeController";

const RentMachineTransfer = () => {
  usePageTitle("Rent Machine Transfer");

  const [branches, setBranches] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null); // single machine for modal
  const [transferredMachines, setTransferredMachines] = useState([]);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Add a new useEffect to fetch transferred machines
  useEffect(() => {
    fetchTransferredMachines();
  }, []);

  // Fetch transferred machines from API
  const fetchTransferredMachines = async () => {
    try {
      const res = await getAllRentMachineTransfers(); // API call
      if (res.success) {
        const userBranchId = Number(localStorage.getItem("userBranchId"));

        // Map and filter transfers based on user's branch
        const formattedTransfers = res.transfers
          .filter(
            (t) =>
              t.FromBranch?.branch_id === userBranchId ||
              t.ToBranch?.branch_id === userBranchId
          )
          .map((t) => ({
            rent_item_id: t.RentMachine?.rent_item_id,
            serial_no: t.RentMachine?.serial_no,
            name: t.RentMachine?.name,
            fromBranch: t.FromBranch?.branch_name,
            toBranch: t.ToBranch?.branch_name,
            status: t.Status || "Transferred",
          }));

        setTransferredMachines(formattedTransfers);
      }
    } catch (err) {
      console.error("Error fetching transferred machines:", err);
    }
  };

  // Fetch branches
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await getAllBranches();
      if (res.success) {
        const filteredBranches = res.branches.filter(
          (b) => b.branch_name.toLowerCase() !== "head office"
        );
        setBranches(filteredBranches);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  // Fetch rent machines
  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await getAllRentMachineLifeActive();
      if (res.success) {
        // ✅ Get employee branch ID
        const employeeBranchId = Number(localStorage.getItem("userBranchId"));

        // ✅ Filter only machines belonging to logged-in user's branch AND status Available To Allocation
        const branchMachines = res.data.filter(
          (m) =>
            m.branch === employeeBranchId &&
            m.RentMachine?.machine_status === "Available To Allocation"
        );

        // ✅ Format machine objects
        const formattedMachines = branchMachines.map((m) => ({
          rent_item_id: m.RentMachine?.rent_item_id,
          supplier: m.RentMachine?.Supplier?.name,
          serial_no: m.RentMachine?.serial_no,
          name: m.RentMachine?.name,
          description: m.RentMachine?.description,
          machine_status: m.RentMachine?.machine_status,
          branch_id: m.Branch?.branch_id,
          branch_name: m.Branch?.branch_name,
          category_id: m.RentMachine?.cat_id,
          brand: m.RentMachine?.brand,
          condition: m.RentMachine?.condition,
          po_id: m.po_id,
          grn_id: m.grn_id,
          from_date: m.from_date,
          to_date: m.to_date,
        }));

        setMachines(formattedMachines || []);
      }
    } catch (err) {
      console.error("Error fetching rent machines", err);
    }
  };

  // Open modal for selected machine
  const handleSelect = (machine) => {
    setSelectedMachine(machine);
    const employeeBranchId = Number(localStorage.getItem("userBranchId"));
    setFromBranch(employeeBranchId);
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedMachine(null);
    setFromBranch("");
    setToBranch("");
    setModalOpen(false);
  };

  // Transfer machine
  const handleTransfer = async () => {
    if (!fromBranch || !toBranch) {
      alert("Please select both From and To branches");
      return;
    }

    console.log("selected Machine", selectedMachine);

    try {
      // Prepare API payload
      const payload = {
        Rent_m_id: selectedMachine.rent_item_id, // or serial_no/id as required
        From: Number(fromBranch),
        To: Number(toBranch),
        Created_by: Number(localStorage.getItem("userBranchId")), // logged-in user id
      };
      console.log("payload", payload);

      // Call API
      const res = await createRentMachineTransfer(payload);

      if (res.success) {
        // Update local state for UI
        const transferred = {
          ...selectedMachine,
          fromBranch: branches.find((b) => b.branch_id === fromBranch)
            ?.branch_name,
          toBranch: branches.find((b) => b.branch_id === toBranch)?.branch_name,
          status: "Transferred",
        };
        setTransferredMachines([...transferredMachines, transferred]);
        handleCloseModal();
        alert("Machine transferred successfully!");
      } else {
        alert("Failed to transfer machine. Please try again.");
      }
    } catch (error) {
      console.error("Error during transfer:", error);
      alert("Error occurred while transferring machine.");
    }
  };

  const handleAcceptTransfer = async (transfer) => {
    const userBranch = localStorage.getItem("userBranch");
    const userId = localStorage.getItem("userBranchId"); // assuming you store userId in localStorage

    // ✅ Check if already accepted
    if (transfer.status === "Accepted") {
      alert("This machine transfer has already been accepted.");
      return;
    }
    // Check if the user's branch matches the 'toBranch' of the transfer
    if (transfer.toBranch !== userBranch) {
      alert(
        "You cannot accept this machine because it is not assigned to your branch."
      );
      return;
    }

    const confirmAccept = window.confirm(
      `Do you want to accept the machine "${transfer.name}" (Serial: ${transfer.serial_no})?`
    );

    if (!confirmAccept) return;

    try {
      // ✅ Call API
      await updateRentMachineTransferStatus(
        transfer.rent_item_id, // rent machine id
        "Accepted", // status
        userId // accepted by user
      );

      alert("Machine accepted successfully!");

      // Update state locally
      setTransferredMachines((prev) =>
        prev.map((t) =>
          t.rent_item_id === transfer.rent_item_id
            ? { ...t, status: "Accepted", accepted_by: userId }
            : t
        )
      );
    } catch (error) {
      console.error("Error accepting transfer:", error);
      alert("Failed to accept machine. Try again.");
    }
  };

  return (
    <div className="rent-machine-transfer-container">
      <div className="rent-machine-transfer-grid">
        {/* Left side */}
        <div className="rent-machine-transfer-left-card">
          <div className="rent-machine-transfer-toolbar">
            <input
              type="text"
              placeholder="Search machines..."
              value={searchLeft}
              onChange={(e) => setSearchLeft(e.target.value)}
              className="rent-machine-transfer-search"
            />
          </div>
          <div className="rent-machine-transfer-table-wrapper">
            <table className="rent-machine-transfer-table">
              <thead>
                <tr>
                  <th>PO No</th>
                  <th>ID</th>
                  <th>Serial No</th>
                  <th>Name</th>
                  <th>Machine_Status</th>
                  <th>Supplier</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {machines
                  .filter(
                    (m) =>
                      m.name.toLowerCase().includes(searchLeft.toLowerCase()) ||
                      m.serial_no
                        .toLowerCase()
                        .includes(searchLeft.toLowerCase())
                  )
                  .map((m) => (
                    <tr key={m.rent_item_id}>
                      <td>{m.po_id}</td>
                      <td>{m.rent_item_id}</td>
                      <td>{m.serial_no}</td>
                      <td>{m.name}</td>
                      <td>{m.machine_status}</td>
                      <td>{m.supplier}</td>
                      <td>
                        <button onClick={() => handleSelect(m)}>➕</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side */}
        <div className="rent-machine-transfer-right-card">
          <div className="rent-machine-transfer-toolbar">
            <input
              type="text"
              placeholder="Search transferred..."
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
              className="rent-machine-transfer-search"
            />
          </div>

          <div className="rent-machine-transfer-table-wrapper">
            <table className="rent-machine-transfer-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Serial No</th>
                  <th>Name</th>
                  <th>From Branch</th>
                  <th>To Branch</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transferredMachines
                  .filter((m) =>
                    m.name.toLowerCase().includes(searchRight.toLowerCase())
                  )
                  .map((m, index) => (
                    <tr
                      key={index}
                      onClick={() => handleAcceptTransfer(m)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{m.rent_item_id}</td>
                      <td>{m.serial_no}</td>
                      <td>{m.name}</td>
                      <td>{m.fromBranch}</td>
                      <td>{m.toBranch}</td>
                      <td>{m.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Transfer Machine</h3>
            <p>
              <strong>{selectedMachine.name}</strong> (Serial:{" "}
              {selectedMachine.serial_no})
            </p>

            {/* From Branch
            <label className="modal-label">
              From Branch <span className="arrow">⬇</span>
            </label>
            <select
              className="modal-select"
              value={fromBranch}
              onChange={(e) => setFromBranch(e.target.value)}
            >
              <option value="">Select From Branch</option>
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </option>
              ))}
            </select> */}

            {/* To Branch */}
            <label className="modal-label">To Branch</label>
            <select
              className="modal-select"
              value={toBranch}
              onChange={(e) => setToBranch(e.target.value)}
            >
              <option value="">Select To Branch</option>
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </option>
              ))}
            </select>

            <div className="modal-buttons">
              <button onClick={handleTransfer}>Transfer</button>
              <button onClick={handleCloseModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentMachineTransfer;
