import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import "./RentMachineSummary.css";
import { usePageTitle } from "../utility/usePageTitle";

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
  ArcElement, // 👈 required for Pie/Doughnut charts
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement, // ✅ add this
  Title,
  Tooltip,
  Legend
);

const RentMachineSummary = () => {
  const rentMachines = [
    { id: "RENT001", name: "Machine A", branch: "Branch 1", status: "Active" },
    { id: "RENT002", name: "Machine B", branch: "Branch 2", status: "Expired" },
    { id: "RENT003", name: "Machine C", branch: "Branch 1", status: "Active" },
    { id: "RENT004", name: "Machine C", branch: "Branch 1", status: "Active" },
    { id: "RENT005", name: "Machine A", branch: "Branch 1", status: "Active" },
    { id: "RENT006", name: "Machine B", branch: "Branch 2", status: "Expired" },
    { id: "RENT007", name: "Machine C", branch: "Branch 1", status: "Active" },
    { id: "RENT008", name: "Machine C", branch: "Branch 1", status: "Active" },
    { id: "RENT009", name: "Machine A", branch: "Branch 1", status: "Active" },
    {
      id: "RENT0010",
      name: "Machine B",
      branch: "Branch 2",
      status: "Expired",
    },
    { id: "RENT0011", name: "Machine C", branch: "Branch 1", status: "Active" },
    { id: "RENT0012", name: "Machine C", branch: "Branch 3", status: "Active" },
    { id: "RENT0014", name: "Machine A", branch: "Branch 1", status: "Active" },
    {
      id: "RENT0015",
      name: "Machine B",
      branch: "Branch 2",
      status: "Expired",
    },
    { id: "RENT0016", name: "Machine C", branch: "Branch 1", status: "Active" },
  ];

  const counts = rentMachines.reduce(
    (acc, machine) => {
      acc[machine.status] = (acc[machine.status] || 0) + 1;
      return acc;
    },
    { Active: 0, Expired: 0 }
  );

  const branches = [...new Set(rentMachines.map((m) => m.branch))];
  const months = ["May", "June", "July"];
  const branchMachineTimeline = {
    "Branch 1": [2, 3, 2],
    "Branch 2": [1, 1, 2],
    "Branch 3": [5, 0, 6],
  };

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
    datasets: branches.map((branch, i) => ({
      label: branch,
      data: branchMachineTimeline[branch],
      borderColor: getRandomColor(), // random color per branch
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
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  function getRandomColor() {
    // Generate a random hex color string
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  }

  const [, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("🏗️📈 Rent Machine Summary");
  }, [setPageTitle]);

  return (
    <div className="rentmachinesummery-wrapper">
      <div className="rentmachinesummery-container">
        {/* Left Table */}
        <div className="rentmachinesummery-left">
          <h3>Rent Machines</h3>
          <div className="rentmachinesummery-table-container">
            <table className="rentmachinesummery-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rentMachines.map((machine) => (
                  <tr
                    key={machine.id}
                    className={
                      machine.status === "Expired" ? "expired-row" : ""
                    }
                  >
                    <td>{machine.id}</td>
                    <td>{machine.name}</td>
                    <td>{machine.branch}</td>
                    <td>{machine.status}</td>
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
    </div>
  );
};

export default RentMachineSummary;
