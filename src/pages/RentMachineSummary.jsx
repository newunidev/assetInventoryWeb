import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import "./RentMachineSummary.css";
import { usePageTitle } from "../utility/usePageTitle";
import {
  getAllLatestMachineLifeActiveAndExpired,
  getRentMachineLifeRecordByItemId,
} from "../controller/RentMachineLifeController";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const RentMachineSummary = () => {
  const [rentMachines, setRentMachines] = useState([]);
  const [, setPageTitle] = usePageTitle();
  const [selectedBranch, setSelectedBranch] = useState(""); // ✅ branch filter
  const [searchTerm, setSearchTerm] = useState(""); // ✅ search filter

  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [machineHistory, setMachineHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // ✅ Define stable colors for known branches
  const branchColors = {
    Bakamuna1: "#4caf50", // green
    Bakamuna2: "#2196f3", // blue
    Piliyandala: "#ff9800", // orange
    Hettipola: "#9c27b0", // purple
    Welioya: "#f44336", // red
    Mathara: "#00bcd4", // cyan
    "Sample Room": "#795548", // brown
  };

  // ✅ fallback for unknown branches
  function getBranchColor(branch) {
    return branchColors[branch] || "#607d8b"; // default grey-blue
  }
  // ✅ Local function inside component
  const fetchMachines = async () => {
    const res = await getAllLatestMachineLifeActiveAndExpired();
    console.log("Response New", res);
    if (res.success && res.data) {
      const mapped = res.data.map((item) => ({
        id: item.rent_item_id,
        name: item.RentMachine?.name || "Unknown",
        branch: item.Branch?.branch_name || "N/A",
        status: item.isExpired ? "Expired" : "Active",
        from_date: item.from_date,
        to_date: item.to_date,
        machine_status: item.RentMachine?.machine_status,
      }));
      setRentMachines(mapped);
    }
  };

  const handleRowClick = async (rent_item_id) => {
    try {
      const res = await getRentMachineLifeRecordByItemId(rent_item_id);
      if (res.success && res.data) {
        setMachineHistory(res.data);
        setShowHistoryModal(true);
        setSelectedMachineId(rent_item_id);
      } else {
        alert(res.message || "No history found");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching machine history");
    }
  };

  useEffect(() => {
    setPageTitle("🏗️📈 Rent Machine Summary");
    fetchMachines(); // ✅ call local function
  }, []);

  // ✅ Counts
  const counts = rentMachines.reduce(
    (acc, machine) => {
      acc[machine.status] = (acc[machine.status] || 0) + 1;
      return acc;
    },
    { Active: 0, Expired: 0 }
  );

  // ✅ Branch list
  const branches = [...new Set(rentMachines.map((m) => m.branch))];

  // Mock timeline (replace later with API if available)
  const months = ["May", "June", "July"];
  const branchMachineTimeline = {
    Bakamuna1: [2, 3, 1],
  };

  // ✅ Chart Data
  const barData = {
    labels: ["Active", "Expired"],
    datasets: [
      {
        label: "Machine Count",
        data: [counts.Active, counts.Expired],
        backgroundColor: ["#4caf50", "#ff4c4c"],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Machine Status Overview",
        font: { size: 18 },
      },
    },
  };

  const lineData = {
    labels: months,
    datasets: branches.map((branch) => ({
      label: branch,
      data: branchMachineTimeline[branch] || [0, 0, 0],
      borderColor: getBranchColor(branch), // ✅ stable color
      backgroundColor: "transparent",
      tension: 0.3,
      fill: false,
      pointRadius: 5,
    })),
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Machines Count Per Branch (Last 3 Months)",
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
      },
    },
  };

  function getRandomColor() {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  }

  return (
    <div className="rentmachinesummery-wrapper">
      <div className="rentmachinesummery-container">
        {/* Left Table */}
        <div className="rentmachinesummery-left">
          {/* ✅ Header Row */}
          <div className="rentmachinesummery-header">
            <h3>Rent Machines</h3>

            <div className="rentmachinesummery-controls">
              {/* Branch Dropdown */}
              <select
                className="rentmachinesummery-branch-dropdown"
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>

              {/* Search Box */}
              <input
                type="text"
                placeholder="🔍 Search..."
                className="rentmachinesummery-search"
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Print Button */}
              <button
                className="rentmachinesummery-print-btn"
                onClick={() => window.print()}
              >
                🖨️ Print
              </button>
            </div>
          </div>

          {/* ✅ Table */}
          <div className="rentmachinesummery-table-container">
            <table className="rentmachinesummery-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Machine Status</th>
                </tr>
              </thead>
              <tbody>
                {rentMachines
                  .filter(
                    (machine) =>
                      (!selectedBranch || machine.branch === selectedBranch) &&
                      (!searchTerm ||
                        machine.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        machine.id
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()))
                  )
                  .map((machine) => (
                    <tr
                      key={machine.id}
                      className={
                        machine.status === "Expired" ? "expired-row" : ""
                      }
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(machine.id)}
                    >
                      <td>{machine.id}</td>
                      <td>{machine.name}</td>
                      <td>{machine.branch}</td>
                      <td>{machine.from_date}</td>
                      <td>{machine.to_date}</td>
                      <td>{machine.status}</td>
                      <td>{machine.machine_status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section */}
        <div className="rentmachinesummery-right">
          {/* Alerts */}
          <div className="rentmachinesummery-alerts">
            <div className="alert-box alert-expired">
              ⚠️ {counts.Expired} Machines Expired
            </div>
            <div className="alert-box alert-active">
              ✅ {counts.Active} Machines Active
            </div>
            <div className="alert-box alert-branches">
              🏭 {branches.length} Branches
            </div>
          </div>

          {/* Charts */}
          <div className="rentmachinesummery-bottom-charts">
            <div className="rentmachinesummery-chart-row">
              <div className="chart-small-container">
                <Bar data={barData} options={barOptions} />
              </div>
              <div className="chart-small-container">
                <Pie
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: {
                        display: true,
                        text: "Machine Status Distribution (Pie)",
                        font: { size: 18 },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="chart-container">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>
      {showHistoryModal && (
        <div className="rent-summery-modal-backdrop rent-summery-show-modal">
          <div className="rent-summery-modal-content-wrapper">
            <div className="rent-summery-modal-header">
              <h3 className="rent-summery-modal-title">
                Machine Life History - {selectedMachineId || "-"}
              </h3>
              <button
                className="rent-summery-modal-close-button"
                onClick={() => setShowHistoryModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="rent-summery-modal-body">
              <table className="rent-summery-modal-table">
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>Description</th>
                    <th>PO TYPE</th>
                    <th>PerDay Cost</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Supplier</th>
                    <th>Additional Info</th>
                    <th>Action</th> {/* Added Action column header */}
                  </tr>
                </thead>
                <tbody>
                  {machineHistory.map((record) => {
                    const perDayCost = record.CategoryPurchaseOrder
                      ? record.CategoryPurchaseOrder.PerDay_Cost
                      : record.renewal?.perday_cost || 0;

                    const description = record.CategoryPurchaseOrder
                      ? record.CategoryPurchaseOrder.description
                      : record.renewal?.description || "-";

                    const poType = record.PurchaseOrder?.is_renew_po
                      ? "Renew PO"
                      : "Normal PO";

                    const transferInfo = record.RentMachine_Transfer
                      ? `Transferred from ${record.RentMachine_Transfer.FromBranch?.branch_name} to ${record.RentMachine_Transfer.ToBranch?.branch_name}`
                      : null;

                    const returnInfo = record.RentMachine_Return
                      ? `Returned on ${record.RentMachine_Return.return_date}`
                      : null;

                    const additionalInfo =
                      transferInfo ||
                      returnInfo ||
                      record.GRN?.additional ||
                      "-";

                    const poNumber = record.po_id || record.PurchaseOrder?.POID;
                    const isRenew = record.PurchaseOrder?.is_renew_po;

                    return (
                      <tr key={record.id}>
                        <td>{poNumber}</td>
                        <td>{description}</td>
                        <td>{poType}</td>
                        <td>{perDayCost}</td>
                        <td>{record.from_date}</td>
                        <td>{record.to_date}</td>
                        <td>{record.RentMachine?.Supplier?.name}</td>
                        <td>{additionalInfo}</td>
                        <td>
                          <button
                            onClick={() => {
                              const url = isRenew
                                ? `/rentmachines/renewalporeportsall/${encodeURIComponent(
                                    poNumber
                                  )}`
                                : `/rentmachines/poreportsall/${encodeURIComponent(
                                    poNumber
                                  )}`;
                              window.open(url, "_blank"); // Opens in new tab
                            }}
                            className="purchase-order-view-action-button"
                          >
                            View PO
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentMachineSummary;
