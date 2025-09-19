import React, { useState, useEffect } from "react";
import "./MachineTransfer.css";
import { getItemTransferDetailsBySendingOrRecievingBranch } from "../controller/ItemController";
import { usePageTitle } from "../utility/usePageTitle";

const branches = [
  "Hettipola",
  "Bakamuna1",
  "Bakamuna2",
  "Mathara",
  "Welioya",
  "Sample Room",
  "Piliyandala",
];

const MachineTransfer = () => {
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [transferData, setTransferData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NEW: status checkboxes
  const [showAccepted, setShowAccepted] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [, setPageTitles] = usePageTitle();

  useEffect(() => {
    setPageTitles("🚚🔁 Machine Transfer");
  }, [setPageTitles]);

  useEffect(() => {
    const fetchTransfers = async () => {
      setTransferData([]);
      //if (!fromBranch && !toBranch) return;

      try {
        setIsLoading(true);
        const data = await getItemTransferDetailsBySendingOrRecievingBranch({
          sending_branch: toBranch,
          prev_used_branch: fromBranch,
        });
        setTransferData(data || []);
      } catch (error) {
        console.error("Failed to fetch transfer details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransfers();
  }, [fromBranch, toBranch]);

  const filteredData = transferData.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch =
      item.Item?.serial_no?.toLowerCase().includes(searchTerm) ||
      item.Item?.item_code?.toLowerCase().includes(searchTerm) ||
      item.Item?.name?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      (!showAccepted && !showPending) ||
      (showAccepted && item.status === "Accepted") ||
      (showPending && item.status !== "Accepted");

    return matchesSearch && matchesStatus;
  });

  const handlePrint = async () => {
    try {
      window.print();
    } catch (err) {
      console.error("Print record error:", err);
      alert("Error recording print attempt");
    }
  };

  return (
    <div className="transferMachine-container">
      {/* <h2 className="transferMachine-heading">🔁 Machine Transfer History</h2> */}

      <div className="transferMachine-filters">
        <div className="transferMachine-filter-group bordered">
          <div className="transferMachine-status-group">
            <div className="transferMachine-filter-group">
              <label>Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="transferMachine-filter-group">
              <label>From Branch:</label>
              <select
                value={fromBranch}
                onChange={(e) => setFromBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
            <div className="transferMachine-filter-group">
              <label>To Branch:</label>
              <select
                value={toBranch}
                onChange={(e) => setToBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="transferMachine-filter-group search-bar">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search Serial / Code / Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="transferMachine-filter-group bordered">
          <label>Status:</label>
          <div className="transferMachine-status-group">
            <label style={{ color: "green" }}>
              <input
                type="checkbox"
                checked={showAccepted}
                onChange={() => setShowAccepted(!showAccepted)}
              />
              Accepted
            </label>
            <label style={{ color: "Red" }}>
              <input
                type="checkbox"
                checked={showPending}
                onChange={() => setShowPending(!showPending)}
              />
              Pending
            </label>
          </div>
        </div>

        <button className="po-edit-button-add" onClick={handlePrint}>
          PDF
        </button>
      </div>

      {fromBranch && toBranch && (
        <div className="transferMachine-animation">
          <span className="transferMachine-branch">{fromBranch}</span>
          <span className="transferMachine-arrow">➡️</span>

          <span className="transferMachine-branch">{toBranch}</span>
        </div>
      )}

      {isLoading ? (
        <div className="transferMachine-loading">Loading...</div>
      ) : (
        <div className="transferMachine-table-container">
          <table className="transferMachine-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Serial No</th>
                <th>Name</th>
                <th>Created Date</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Accepted Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.item_transfer_id}>
                    <td>{item.Item?.item_code || "N/A"}</td>
                    <td>{item.Item?.serial_no || "N/A"}</td>
                    <td>{item.Item?.name || "N/A"}</td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>{item.prev_used_branch || "N/A"}</td>
                    <td>{item.sending_branch || "N/A"}</td>
                    <td>{item.status || "Transferred"}</td>
                    <td>
                      {item.arrived_date
                        ? new Date(item.arrived_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No transfers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MachineTransfer;
