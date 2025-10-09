import React, { useState, useEffect } from "react";
import "./PurchaseOrderView.css";
import { BRANCHES } from "../utility/common";
import { usePageTitle } from "../utility/usePageTitle";
import { getAllPoApprovals } from "../controller/PurchaseOrderController";
import { useNavigate } from "react-router-dom";

const PurchaseOrderView = () => {
  const [searchText, setSearchText] = useState("");
  const [, setPageTitle] = usePageTitle();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [approvalFilter, setApprovalFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle("Rent Machine All Purchase Orders");
  }, [setPageTitle]);
  useEffect(() => {
    fetchPoApprovals();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchText, selectedBranch, approvalFilter]); // added approvalFilter here

  const fetchPoApprovals = async () => {
    try {
      const response = await getAllPoApprovals();
      if (response.success && response.approvals) {
        const approvals = response.approvals;

        const mappedData = approvals.map((approval) => {
          const po = approval.PurchaseOrder;
          console.log("Po Approval data", po);
          return {
            poNumber: po?.POID || "N/A",
            poId: po?.POID || "",
            branch: po?.branch || "N/A",
            description: po?.instruction || "N/A",
            createdByName: po?.Employee?.name || "N/A",
            supplierName: po?.Supplier?.name || "N/A",
            status: po?.status || "N/A",
            approval1: approval.approval1,
            approval2: approval.approval2,
            is_renew_po: po?.is_renew_po,
          };
        });

        setOriginalData(mappedData);
        setFilteredData(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch PO approvals:", error);
    }
  };

  const handleSearch = () => {
    const results = originalData.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.poNumber.toLowerCase().includes(searchText.toLowerCase());

      const matchesBranch = !selectedBranch || item.branch === selectedBranch;

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "approved" && item.approval1 && item.approval2) ||
        (approvalFilter === "approval1" && item.approval1) ||
        (approvalFilter === "approval2" && item.approval2);

      return matchesSearch && matchesBranch && matchesApproval;
    });

    setFilteredData(results);
  };

  return (
    <div className="purchase-order-view-wrapper">
      {/* Top Filter Section */}
      <div className="purchase-order-view-top-section">
        {/* Left - Radio Filter */}
        <div className="purchase-order-view-radio-wrapper">
          <legend>Filter by Approval Status</legend>
          <div className="purchase-order-view-radio-group">
            <label>
              <input
                type="radio"
                value="all"
                checked={approvalFilter === "all"}
                onChange={(e) => setApprovalFilter(e.target.value)}
              />
              All
            </label>
            <label>
              <input
                type="radio"
                value="approved"
                checked={approvalFilter === "approved"}
                onChange={(e) => setApprovalFilter(e.target.value)}
              />
              Approved
            </label>
            <label>
              <input
                type="radio"
                value="approval1"
                checked={approvalFilter === "approval1"}
                onChange={(e) => setApprovalFilter(e.target.value)}
              />
              1st Approval
            </label>
            <label>
              <input
                type="radio"
                value="approval2"
                checked={approvalFilter === "approval2"}
                onChange={(e) => setApprovalFilter(e.target.value)}
              />
              2nd Approval
            </label>
          </div>
        </div>

        <div className="purchase-order-view-quick-links">
          <div
            className="quick-link-button"
            onClick={() => window.open("/reports/idle", "_blank")}
            title="Idle Rent Machines"
          >
            <div className="quick-link-circle">
              <span className="quick-link-icon">🛠️</span>
            </div>
            <span className="quick-link-label">Idle</span>
          </div>
          <div
            className="quick-link-button"
            onClick={() => window.open("/rentmachines/summary", "_blank")}
            title="Expired Machines"
          >
            <div className="quick-link-circle">
              <span className="quick-link-icon">⏰</span>
            </div>
            <span className="quick-link-label">Expired</span>
          </div>
          
          <div
            className="quick-link-button"
            onClick={() => handleQuickFilter("new")}
            title="New Requests"
          >
            <div className="quick-link-circle">
              <span className="quick-link-icon">🆕</span>
            </div>
            <span className="quick-link-label">New</span>
          </div>
          <div
            className="quick-link-button"
            onClick={() => handleQuickFilter("approved")}
            title="Approved Orders"
          >
            <div className="quick-link-circle">
              <span className="quick-link-icon">✅</span>
            </div>
            <span className="quick-link-label">Approved</span>
          </div>
        </div>

        {/* Right - Search & Branch */}
        <div className="purchase-order-view-form-right">
          <div className="purchase-order-view-field-group">
            <label className="purchase-order-view-label">Search</label>
            <input
              type="text"
              className="purchase-order-view-input"
              placeholder="Search by description..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="purchase-order-view-field-group">
            <label className="purchase-order-view-label">Branch</label>
            <select
              className="purchase-order-view-select"
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
        </div>
      </div>

      {/* Table Section */}
      <div className="purchase-order-view-form-card">
        <div className="purchase-order-view-table-container">
          <table className="purchase-order-view-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Branch</th>
                <th>Description</th>
                <th>Created By</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Approval 1</th>
                <th>Approval 2</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className={
                      item.approval1 && item.approval2
                        ? "purchase-order-view-row-approved"
                        : ""
                    }
                  >
                    <td>{item.poNumber}</td>
                    <td>{item.branch}</td>
                    <td>{item.description}</td>
                    <td>{item.createdByName}</td>
                    <td>{item.supplierName}</td>
                    <td>{item.status}</td>
                    <td>{item.approval1 ? "Approved" : "Pending"}</td>
                    <td>{item.approval2 ? "Approved" : "Pending"}</td>
                    <td>
                      <button
                        onClick={() => {
                          console.log("Is po renewal chaeck", item.is_renew_po);
                          const url = item.is_renew_po
                            ? `/rentmachines/renewalporeportsall/${encodeURIComponent(
                                item.poNumber
                              )}`
                            : `/rentmachines/poreportsall/${encodeURIComponent(
                                item.poNumber
                              )}`;
                          window.open(url, "_blank"); // Opens in a new tab/window
                        }}
                        className="purchase-order-view-action-button"
                      >
                        View PO
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderView;
