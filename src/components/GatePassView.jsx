import React, { useState, useEffect } from "react";
import "./GatePassView.css";
import { BRANCHES } from "../utility/common";
import { usePageTitle } from "../utility/usePageTitle";
import { getAllGatePasses } from "../controller/GatePassController";

const GatePassView = () => {
  const [searchText, setSearchText] = useState("");
  const [, setPageTitle] = usePageTitle();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setPageTitle("Gate Passes");
    fetchGatePasses();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchText, selectedBranch, statusFilter]);

  const fetchGatePasses = async () => {
    try {
      const response = await getAllGatePasses();
      console.log(response);
      if (response.success && Array.isArray(response.gatepasses)) {
        const mappedData = response.gatepasses.map((gp) => ({
          gpNo: gp.gp_no,
          attBy: gp.att_by,
          date: gp.date,
          through: gp.through,
          gatepassTo: gp.Supplier?.name,
          instructedBy: gp.instructed_by,
          description: gp.description,
          vNo: gp.v_no,
          status: gp.status,
          createdBy: gp.created_by,
          branch: gp.Branch?.branch_name,
          additional1: gp.additional1,
          additional2: gp.additional2,
          supplierName: gp.Supplier?.name || "N/A",
        }));
        setOriginalData(mappedData);
        setFilteredData(mappedData);
      }
    } catch (err) {
      console.error("Failed to fetch gatepasses:", err);
    }
  };

  const handleSearch = () => {
    const results = originalData.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.gpNo.toLowerCase().includes(searchText.toLowerCase()) ||
        item.attBy.toLowerCase().includes(searchText.toLowerCase()) ||
        item.vNo.toLowerCase().includes(searchText.toLowerCase());

      const matchesBranch = !selectedBranch || item.branch === selectedBranch;

      const matchesStatus =
        statusFilter === "all" || item.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });

    setFilteredData(results);
  };

  return (
    <div className="gatepass-view-wrapper">
      <div className="gatepass-view-top-section">
        {/* Filters */}
        <div className="gatepass-view-filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="gatepass-view-filter-group">
          <label>Branch:</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {BRANCHES.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div className="gatepass-view-filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by GP No, Attention By, Vehicle No"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="gatepass-view-table-container">
        <table className="gatepass-view-table">
          <thead>
            <tr>
              <th>GP Number</th>
              <th>Attention By</th>
              <th>Date</th>
              <th>Through</th>
              <th>GatePass To</th>
              <th>Description</th>
              <th>Vehicle No</th>
              <th>Status</th>
              <th>Branch</th>
              <th>Supplier</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((gp, index) => (
                <tr key={index}>
                  <td>{gp.gpNo}</td>
                  <td>{gp.attBy}</td>
                  <td>{gp.date}</td>
                  <td>{gp.through}</td>
                  <td>{gp.gatepassTo}</td>
                  <td>{gp.description}</td>
                  <td>{gp.vNo}</td>
                  <td>{gp.status}</td>
                  <td>{gp.branch}</td>
                  <td>{gp.supplierName}</td>
                  {/* <td>
                    <button
                      onClick={() =>
                        window.open(
                          `/rentmachines/gatepass-report/${encodeURIComponent(gp.gpNo)}`,
                          "_blank"
                        )
                      }
                      className="gatepass-view-action-button"
                    >
                      View
                    </button>
                  </td> */}
                  <td>
                    <button
                      onClick={() => {
                        const safeGpNo = gp.gpNo.replace("/", "-");
                        window.open(
                          `/rentmachines/gatepass-report/${safeGpNo}`,
                          "_blank"
                        );
                      }}
                      className="gatepass-view-action-button"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>
                  No gatepasses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GatePassView;
