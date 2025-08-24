import React, { useEffect, useState } from "react";
import "./RentMachineRenewal.css";

import { BRANCHES } from "../utility/common";
import { usePageTitle } from "../utility/usePageTitle";
import {
  getAllRentMachines,
  createRentTimeAllocation,
} from "../controller/RentMachineController";

const RentMachineRenewal = () => {
  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

  const userBranch = localStorage.getItem("userBranch");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches] = useState(BRANCHES);
  const [searchQuery, setSearchQuery] = useState("");
  const [rentMachines, setRentMachines] = useState([]);
  const [machineHistory, setMachineHistory] = useState([]);


  // New states for new inputs
  const [rentItemId, setRentItemId] = useState("");
  const [poNo, setPoNo] = useState("");

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState("");
  const [, setPageTitle] = usePageTitle();

  useEffect(() => {
    setPageTitle("📅 Rental Time Scheduler");
  }, [setPageTitle]);

  useEffect(() => {
    const fetchMachines = async () => {
      const response = await getAllRentMachines();
      if (response.success) {
        console.log("response" + response);
        setRentMachines(response.machines);
      }
    };
    fetchMachines();
  }, []);

  // useEffect(()=>{
    
  // },[]);

  const filteredMachines = rentMachines
    .filter((machine) => {
      if (userBranch === "Head Office") {
        return selectedBranch ? machine.rented_by === selectedBranch : true;
      } else {
        return machine.rented_by === userBranch;
      }
    })
    .filter((machine) => {
      const q = searchQuery.toLowerCase();
      return (
        machine.serial_no?.toLowerCase().includes(q) ||
        machine.name?.toLowerCase().includes(q) ||
        machine.rent_item_id?.toLowerCase().includes(q)
      );
    });

  const todayDate = new Date().toISOString().split("T")[0];

  // Handle table row click to set RentItem ID
  const handleRowClick = (rent_item_id) => {
    setRentItemId(rent_item_id);
  };

  const handleAllocate = async () => {
    if (!rentItemId || !fromDate || !toDate || !poNo) {
      alert("Please fill in all required fields.");
      return;
    }

    const allocationData = {
      rent_item_id: rentItemId,
      from_date: fromDate,
      to_date: toDate,
      returned: false,
      renewed: false,
      return_id: null,
      renew_id: null,
      po_no: poNo,
    };

    try {
      const result = await createRentTimeAllocation(allocationData);
      alert("Machine renewed successfully!");
      // Optionally: Clear form fields or refresh history
    } catch (error) {
      alert("Failed to renew machine. Please try again.");
    }
  };
  return (
    <div className="rentmachinerenewal-wrapper">
      {/* Left section: Inputs and date pickers */}
      <div className="rentmachinerenewal-left">
        <div className="rentmachinerenewal-form-card">
          <h3>Add/Renew Machine Period</h3>

          {/* New input row for RentItem ID and PO No */}
          <div className="rentmachinerenewal-input-row">
            <label className="rentmachinerenewal-label">
              RentItem ID:
              <input
                type="text"
                value={rentItemId}
                onChange={(e) => setRentItemId(e.target.value)}
                className="rentmachinerenewal-input"
                readOnly
                placeholder="Select a machine from the list"
              />
            </label>

            <label className="rentmachinerenewal-label">
              PO_No:
              <input
                type="text"
                value={poNo}
                onChange={(e) => setPoNo(e.target.value)}
                className="rentmachinerenewal-input"
                placeholder="Enter PO No"
              />
            </label>
          </div>

          {/* Date pickers */}
          {/* Date pickers with Allocate button */}
          <div className="rentmachinerenewal-daterow-with-button">
            <div className="rentmachinerenewal-daterow">
              <label className="rentmachinerenewal-label">
                From Date:
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rentmachinerenewal-input"
                  min={todayDate}
                  required
                />
              </label>

              <label className="rentmachinerenewal-label">
                To Date:
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rentmachinerenewal-input"
                  min={fromDate || todayDate}
                  required
                />
              </label>
            </div>

            <button
              className="rentmachinerenewal-allocate-button"
              onClick={handleAllocate}
            >
              Allocate
            </button>
          </div>

          {/* Removed View History Button */}

          <div className="rentmachinerenewal-table-scroll">
            <h4>Rent Machine Period Allocation History</h4>
            <table className="rentmachinerenewal-table">
              <thead>
                <tr>
                  <th>Serial No</th>
                  <th>Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {machineHistory.length > 0 ? (
                  machineHistory.map((m, idx) => (
                    <tr key={idx}>
                      <td>{m.serial_no}</td>
                      <td>{m.name}</td>
                      <td>{m.start_date}</td>
                      <td>{m.end_date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No history found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right section: Live machine list */}
      <div className="rentmachinerenewal-table-container">
        <div className="rentmachinerenewal-toolbar-content">
          <div className="rentmachinerenewal-search-row">
            <input
              type="text"
              placeholder="Search machines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rentmachinerenewal-input"
            />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rentmachinerenewal-input"
              disabled={userBranch !== "Head Office"}
            >
              <option value="">Select Branch</option>
              {branches.map((branch, index) => (
                <option key={index} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div className="rentmachinerenewal-button-col">
            {/* <span style={{ fontSize: "32px" }}>🧐</span> */}
            {/* <label className="rentmachinerenewal-label">
              🧐Isn't your Item Listed here?
            </label> */}
            <button
              className="rentmachinerenewal-new-button"
              onClick={() => {
                console.log("New Machine Clicked");
              }}
            >
              + New Machine
            </button>
          </div>
        </div>

        <div className="rentmachinerenewal-table-scroll">
          <table className="rentmachinerenewal-table">
            <thead>
              <tr>
                <th>Rent ID</th>
                <th>Serial No</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Condition</th>
                <th>Category</th>
                <th>Rented By</th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((machine) => (
                <tr
                  key={machine.rent_item_id}
                  onClick={() => handleRowClick(machine.rent_item_id)}
                  style={{ cursor: "pointer" }}
                  title="Click to select this machine"
                >
                  <td>{machine.rent_item_id}</td>
                  <td>{machine.serial_no}</td>
                  <td>{machine.name}</td>
                  <td>{machine.brand}</td>
                  <td>{machine.condition}</td>
                  <td>{machine.Category?.cat_name || "N/A"}</td>
                  <td>{machine.rented_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RentMachineRenewal;
