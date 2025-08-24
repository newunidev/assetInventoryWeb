import React, { useState, useEffect } from "react";
import "./RentMachineAllocation.css";
import { getAllRentMachines } from "../controller/RentMachineController";
import { usePageTitle } from "../utility/usePageTitle";
import { createRentMachineAllocation } from "../controller/RentMachineAllocationController";
import { getAllRentMachineAllocations } from "../controller/RentMachineAllocationController";

const RentMachineAllocation = () => {
  const userBranch = localStorage.getItem("userBranch");
  const isHeadOffice = userBranch === "Head Office";
  const todayDate = new Date().toISOString().split("T")[0];
  const [rentMachines, setRentMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [, setPageTitle] = usePageTitle();
  const [allocations, setAllocations] = useState([]);

  //for allocation table serarhc bar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'

  useEffect(() => {
    setPageTitle("🏗️🗂️ Rent Machine Allocation");
  }, [setPageTitle]);

  const [formData, setFormData] = useState({
    rent_item_id: "",
    style_no: "",
    po_no: "",
    from_date: "",
    to_date: "",
    additional: "",
    description: "",
  });

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await getAllRentMachines();
        if (response.success) {
          let machines = response.machines;

          // Apply branch-based filter
          if (userBranch === "Head Office") {
            machines = []; // No need to display
          } else {
            machines = machines.filter(
              (machine) => machine.rented_by === userBranch
            );
          }

          setRentMachines(machines);
          setFilteredMachines(machines);
        } else {
          console.error("Error fetching machines:", response.message);
        }
      } catch (err) {
        console.error("API error:", err);
      }
    };

    fetchMachines();
  }, []);

  //METHOD FOR get all alloctaions
  const fetchAllocations = async () => {
    try {
      const response = await getAllRentMachineAllocations();
      if (response.success) {
        const allAllocations = response.allocations;

        const filteredAllocations =
          userBranch === "Head Office"
            ? allAllocations
            : allAllocations.filter(
                (alloc) =>
                  alloc.RentMachine &&
                  alloc.RentMachine.rented_by === userBranch
              );

        setAllocations(filteredAllocations);
      } else {
        console.error("Error fetching allocations:", response.message);
      }
    } catch (err) {
      console.error("Allocation API error:", err);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const handleSelectMachine = (machine) => {
    setFormData((prev) => ({ ...prev, rent_item_id: machine.rent_item_id }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //method to save new rent machine
  const handleSave = async () => {
    const requiredFields = [
      "style_no",
      "po_no",
      "from_date",
      "to_date",
      "rent_item_id",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      alert(
        "Please fill in all required fields including Rent Machine selection."
      );
      return;
    }

    const allocationData = {
      rent_item_id: formData.rent_item_id,
      style_no: formData.style_no,
      from_date: formData.from_date,
      to_date: formData.to_date,
      status: "Active", // Assuming it's always "Active" when saving
      po_no: formData.po_no,
      additional: formData.additional,
    };

    try {
      const result = await createRentMachineAllocation(allocationData);
      if (result.success) {
        alert("Allocation saved successfully ✅");
        await fetchAllocations();

        // Reset form if needed
        // setFormData({
        //   rent_item_id: "",
        //   style_no: "",
        //   po_no: "",
        //   from_date: "",
        //   to_date: "",
        //   additional: "",

        // });
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("API Error: " + (error.response?.data?.message || error.message));
    }
  };
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = rentMachines.filter(
      (m) =>
        m.rent_item_id?.toLowerCase().includes(query) ||
        m.serial_no?.toLowerCase().includes(query) ||
        m.name?.toLowerCase().includes(query) ||
        m.brand?.toLowerCase().includes(query)
    );
    setFilteredMachines(filtered);
  };

  //method to filter allocation detials
  const filteredAllocations = allocations.filter((alloc) => {
    const searchMatch =
      alloc.rent_item_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alloc.style_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alloc.po_no.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && alloc.status === "Active") ||
      (statusFilter === "inactive" && alloc.status !== "Active");

    return searchMatch && statusMatch;
  });

  return (
    <div className="rentmachineallocation-container">
      <div className="rentmachineallocation-left">
        <div className="rentmachineallocation-form-card">
          <h3 className="rentmachineallocation-form-heading">
            Create Allocation
          </h3>

          {isHeadOffice ? (
            <div className="rentmachineallocation-warning-banner">
              🚫 You don't have permission to create allocations from Head
              Office.
            </div>
          ) : (
            <form
              className="rentmachineallocation-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="rentmachineallocation-row">
                <label>
                  Rent Item ID
                  <input
                    name="rent_item_id"
                    value={formData.rent_item_id}
                    readOnly
                  />
                </label>
                <label>
                  * Style No
                  <input
                    name="style_no"
                    value={formData.style_no}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  * PO No
                  <input
                    name="po_no"
                    value={formData.po_no}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="rentmachineallocation-row">
                <label>
                  * From Date
                  <input
                    name="from_date"
                    type="date"
                    min={todayDate}
                    value={formData.from_date}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  * To Date
                  <input
                    name="to_date"
                    type="date"
                    min={formData.from_date || todayDate}
                    value={formData.to_date}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Additional
                  <input
                    name="additional"
                    value={formData.additional}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="rentmachineallocation-row">
                <label className="full-width">
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <button type="submit">Save</button>
            </form>
          )}
        </div>

        <div className="rentmachineallocation-machinetable-card">
          <div className="rentmachineallocation-header">
            <h4>Select Rent Machine</h4>
            <input
              type="text"
              className="rentmachineallocation-search-input"
              placeholder="Search by Rent ID, Name, Brand..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <table className="rentmachineallocation-machinetable">
            <thead>
              <tr>
                <th>Rent ID</th>
                <th>Serial NO</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.length > 0 ? (
                filteredMachines.map((machine) => (
                  <tr
                    key={machine.rent_item_id}
                    onClick={() => handleSelectMachine(machine)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{machine.rent_item_id}</td>
                    <td>{machine.serial_no}</td>
                    <td>{machine.Category?.cat_name || "N/A"}</td>
                    {/* Safely check Category */}
                    <td>{machine.brand}</td>
                    <td>{machine.Supplier?.name || "N/A"}</td>
                    {/* Safely check Category */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{ textAlign: "center", padding: "12px" }}
                  >
                    No Rent Machines Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rentmachineallocation-right">
        <div className="rentmachineallocation-allocationsearch-panel">
          <input
            type="text"
            placeholder="Search by Rent ID, Style No, PO No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rentmachineallocation-allocationsearch-input"
          />

          <div className="rentmachineallocation-radio-group">
            <label>
              <input
                type="radio"
                name="status"
                value="all"
                checked={statusFilter === "all"}
                onChange={() => setStatusFilter("all")}
              />
              All
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="active"
                checked={statusFilter === "active"}
                onChange={() => setStatusFilter("active")}
              />
              Active
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={statusFilter === "inactive"}
                onChange={() => setStatusFilter("inactive")}
              />
              Inactive
            </label>
          </div>
        </div>

        <div className="rentmachineallocation-allocationtable-wrapper">
          <div className="rentmachineallocation-allocationtable-container">
            <table className="rentmachineallocation-allocationtable">
              <thead>
                <tr>
                  <th>Rent Machine ID</th>
                  <th>Style No</th>
                  <th>PO No</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Additional</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.length > 0 ? (
                  filteredAllocations.map((alloc) => (
                    <tr key={alloc.rd_id}>
                      <td>{alloc.rent_item_id}</td>
                      <td>{alloc.style_no}</td>
                      <td>{alloc.po_no}</td>
                      <td>{alloc.from_date}</td>
                      <td>{alloc.to_date}</td>
                      <td>{alloc.additional}</td>
                      <td>{alloc.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "12px" }}
                    >
                      No Allocations Found
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

export default RentMachineAllocation;
