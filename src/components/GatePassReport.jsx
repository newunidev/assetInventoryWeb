import React, { useEffect, useState, useRef, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JsBarcode from "jsbarcode";
import { useParams, useNavigate } from "react-router-dom";

import {
  getAllGatePassRentMachinesAndGatePass,
  updateGatePassApprovalFullUpdate,
} from "../controller/GatePassController";
import "./GatePassReport.css";
import { FaCheckCircle, FaTimesCircle, FaTruckLoading } from "react-icons/fa";

const GatePassReport = () => {
  const { gpNo } = useParams();
  const [gatePassDetails, setGatePassDetails] = useState(null);
  const [error, setError] = useState(null);
  const barcodeRef = useRef(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const navigate = useNavigate();

  const [machinelifupdatedetails, setMachineLifeUpdateDetails] = useState({
    gp_no: gpNo,
    created_by: localStorage.getItem("userid"),
    machines: [],
  });

  const permissions = useMemo(
    () => JSON.parse(localStorage.getItem("permissions") || "[]"),
    []
  );
  const hasApprovalPermission =
    permissions.includes("PERM006") || permissions.includes("PERM007");

  useEffect(() => {
    if (gpNo) fetchGatePassReport(gpNo);
  }, [gpNo]);

  useEffect(() => {
    if (gpNo && barcodeRef.current) {
      JsBarcode(barcodeRef.current, gpNo, {
        format: "CODE128",
        width: 1,
        height: 40,
        displayValue: true,
      });
    }
  }, [gpNo]);

  const getBarcodeImage = () => barcodeRef.current?.toDataURL("image/png");

  // const fetchGatePassReport = async (gp_no) => {
  //   try {
  //     const res = await getAllGatePassRentMachinesAndGatePass(gp_no);

  //     if (res.success && res.data) {
  //       setGatePassDetails(res.data);
  //     } else {
  //       throw new Error(res.message || "Failed to fetch GatePass details.");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching GatePass report:", err);
  //     setError(err.message || "Unknown error occurred.");
  //   }
  // };
  const fetchGatePassReport = async (gp_no) => {
    try {
      const res = await getAllGatePassRentMachinesAndGatePass(gp_no);
      if (res.success && res.data) {
        setGatePassDetails(res.data);

        // Now populate machines
        const machines =
          res.data.GatePassRentMachines?.map((item) => ({
            rent_item_id: item.RentMachine?.rent_item_id,
            branch: res.data.Branch?.branch_id,
          })) || [];

        setMachineLifeUpdateDetails((prev) => ({
          ...prev,
          machines,
        }));
      } else {
        throw new Error(res.message || "Failed to fetch GatePass details.");
      }
    } catch (err) {
      console.error("Error fetching GatePass report:", err);
      setError(err.message || "Unknown error occurred.");
    }
  };

  const handleApprove = async () => {
    if (!gatePassDetails) return;

    try {
      const approverId = localStorage.getItem("userid");
      const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
      const hasPerm006 = permissions.includes("PERM006"); // Authorization
      const hasPerm007 = permissions.includes("PERM007"); // Confirmation

      if (!hasPerm006 && !hasPerm007) {
        alert("You do not have permission to approve this GatePass.");
        return;
      }

      let typeToCall = null;
      const approval = gatePassDetails.approvals?.[0]; // get the first approval object

      // Both permissions
      if (hasPerm006 && hasPerm007) {
        if (approval?.auth_status === "Pending") {
          typeToCall = "auth";
        } else if (approval?.auth_status === "Approved") {
          typeToCall = "confirm";
        } else {
          alert("Cannot determine approval type.");
          return;
        }
      }
      // Only auth permission
      else if (hasPerm006) {
        typeToCall = "auth";
      }
      // Only confirm permission
      else if (hasPerm007) {
        typeToCall = "confirm";
      }
      console.log("Machien data check", machinelifupdatedetails);
      console.log("Other dataq", gatePassDetails.gp_no);
      const response = await updateGatePassApprovalFullUpdate(
        gatePassDetails.gp_no,
        typeToCall,
        approverId,
        machinelifupdatedetails
      );

      console.log("GatePass approval full update response:", response);
      alert(`GatePass ${typeToCall} successfully!`);
      fetchGatePassReport(gpNo);
    } catch (error) {
      console.error("Error approving GatePass:", error);
      alert("Failed to approve GatePass!");
    }
  };

  const handleDownload = () => {
    if (!gatePassDetails) return;

    const doc = new jsPDF();

    // === COMPANY HEADER ===
    doc.setFontSize(18);
    doc.text("New Universe Corporate Clothing H (Pvt) Ltd", 105, 10, {
      align: "center",
    });
    doc.setFontSize(6);
    doc.text("21/4 Polhengoda Gardens, Colombo 05 Sri Lanka", 105, 15, {
      align: "center",
    });
    doc.text("Tel: +94 11 123 4567 | Fax: +94 112823636", 105, 20, {
      align: "center",
    });
    doc.text(
      "Email: newuniverse@gmail.com | Web: www.newuniverselk.com",
      105,
      25,
      { align: "center" }
    );

    // Title
    doc.setFontSize(10);
    doc.text("Gate Pass Report", 105, 30, { align: "center" });
    doc.line(10, 34, 200, 34);

    // Barcode top-left
    const barcodeImage = getBarcodeImage();
    if (barcodeImage) doc.addImage(barcodeImage, "PNG", 5, 10, 35, 20);

    // === GatePass Details Table ===
    let y = 45;
    const leftX = 14;
    const rightX = 110;
    const rowHeight = 7;
    const blockHeight = rowHeight * 7 + 6;

    doc.setDrawColor(0);
    doc.rect(leftX - 4, y - 6, 190, blockHeight);

    doc.setFontSize(8);
    if (gatePassDetails) {
      // Left Column
      doc.setFont(undefined, "bold");
      doc.text("GatePass No:", leftX, y);
      doc.text("Attention By:", leftX, y + rowHeight);
      doc.text("Through:", leftX, y + rowHeight * 2);
      doc.text("GatePass To:", leftX, y + rowHeight * 3);
      doc.text("Instructed By:", leftX, y + rowHeight * 4);
      doc.text("Vehicle No:", leftX, y + rowHeight * 5);
      doc.text("Description:", leftX, y + rowHeight * 6);

      doc.setFont(undefined, "normal");
      doc.text(gatePassDetails.gp_no, leftX + 35, y);
      doc.text(gatePassDetails.att_by, leftX + 35, y + rowHeight);
      doc.text(gatePassDetails.through, leftX + 35, y + rowHeight * 2);
      doc.text(
        gatePassDetails.gatepass_to?.toString() || "N/A",
        leftX + 35,
        y + rowHeight * 3
      );
      doc.text(gatePassDetails.instructed_by, leftX + 35, y + rowHeight * 4);
      doc.text(gatePassDetails.v_no, leftX + 35, y + rowHeight * 5);
      doc.text(
        gatePassDetails.description || "N/A",
        leftX + 35,
        y + rowHeight * 6
      );

      // Right Column
      let rightY = y;
      doc.setFont(undefined, "bold");
      doc.text("Status:", rightX, rightY);
      doc.text("Created By:", rightX, rightY + rowHeight);
      doc.text("Additional 1:", rightX, rightY + rowHeight * 2);
      doc.text("Additional 2:", rightX, rightY + rowHeight * 3);
      doc.text("Branch ID:", rightX, rightY + rowHeight * 4);
      doc.text("Date:", rightX, rightY + rowHeight * 5);

      doc.setFont(undefined, "normal");
      doc.text(gatePassDetails.status, rightX + 40, rightY);
      doc.text(
        gatePassDetails.created_by?.toString(),
        rightX + 40,
        rightY + rowHeight
      );
      doc.text(
        gatePassDetails.additional1 || "-",
        rightX + 40,
        rightY + rowHeight * 2
      );
      doc.text(
        gatePassDetails.additional2 || "-",
        rightX + 40,
        rightY + rowHeight * 3
      );
      doc.text(
        gatePassDetails.branch_id?.toString() || "-",
        rightX + 40,
        rightY + rowHeight * 4
      );
      doc.text(gatePassDetails.date, rightX + 40, rightY + rowHeight * 5);

      y += blockHeight + 5;
    }

    // === Table for GatePassRentMachines ===
    const tableBody =
      gatePassDetails?.GatePassRentMachines?.map((item) => [
        item.RentMachine?.rent_item_id || "-",
        item.RentMachine?.serial_no || "-",
        item.RentMachine?.name || "-",
        item.RentMachine?.description || "-",
        item.RentMachineLife?.from_date || "-",
        item.RentMachineLife?.to_date || "-",
        item.remarks || "-",
      ]) || [];

    autoTable(doc, {
      startY: y,
      head: [
        [
          "Rent Item ID",
          "Serial No",
          "Name",
          "Description",
          "From",
          "To",
          "Remarks",
        ],
      ],
      body: tableBody,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fontSize: 8, halign: "center", fillColor: [200, 200, 200] },
      theme: "grid",
      margin: { left: 14, right: 14 },
    });

    doc.save(`GatePass-${gatePassDetails?.gp_no || "Unknown"}.pdf`);
  };

  return (
    <div className="gp-print-content">
      <div className="gp-report-wrapper">
        <div className="gp-report-container">
          <div className="gp-report-header">
            {/* <div className="barcode-container">
              <canvas ref={barcodeRef}></canvas>
            </div> */}
            <div className="company-details">
              <h2>New Universe Corporate Clothing H Pvt Ltd</h2>
              <p>21/4 Polhengoda Gardens, Colombo 05, Sri Lanka</p>
              <p>Tel: +94 702250093 &nbsp; | &nbsp; Fax: 11282336</p>
              <p>
                Email: newunive@gmail.com &nbsp; | &nbsp; Web:
                www.newuniverse.lk
              </p>
              <h2>GATE PASS</h2>
              <p>No: {gpNo}</p>
            </div>
            <div className="top-right-corner">
              <button
                onClick={handleDownload}
                className="icon-button"
                title="Download PDF"
              >
                🡇
              </button>
              <button onClick={() => window.print()} className="print-button">
                🖨️
              </button>
            </div>
          </div>
          {/* Divider line */}
          <hr className="gp-divider" />
          {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

          {gatePassDetails && (
            <div className="gp-report-labels">
              <div className="gp-label">
                <strong>GatePass No:</strong> {gatePassDetails.gp_no}
              </div>
              <div className="gp-label">
                <strong>Attention By:</strong> {gatePassDetails.att_by}
              </div>
              <div className="gp-label">
                <strong>Through:</strong> {gatePassDetails.through}
              </div>
              <div className="gp-label">
                <strong>GatePass To:</strong>{" "}
                {gatePassDetails.Supplier?.name || "-"}
              </div>
              <div className="gp-label">
                <strong>Instructed By:</strong> {gatePassDetails.instructed_by}
              </div>
              <div className="gp-label">
                <strong>Vehicle No:</strong> {gatePassDetails.v_no}
              </div>
              <div className="gp-label">
                <strong>Description:</strong>{" "}
                {gatePassDetails.description || "-"}
              </div>
              <div className="gp-label">
                <strong>Status:</strong> {gatePassDetails.status}
              </div>
              <div className="gp-label">
                <strong>Created By:</strong> {gatePassDetails?.creator?.name}
              </div>
              <div className="gp-label">
                <strong>Branch ID:</strong>{" "}
                {gatePassDetails.Branch?.branch_name}
              </div>
              <div className="gp-label">
                <strong>Date:</strong> {gatePassDetails.date}
              </div>
            </div>
          )}

          {gatePassDetails &&
            gatePassDetails.GatePassRentMachines.length > 0 && (
              <table className="gp-report-table">
                <thead>
                  <tr>
                    <th>Rent Item ID</th>
                    <th>Serial No</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {gatePassDetails.GatePassRentMachines.map((item, index) => (
                    <tr key={index}>
                      <td>{item.RentMachine?.rent_item_id}</td>
                      <td>{item.RentMachine?.serial_no}</td>
                      <td>{item.RentMachine?.name}</td>
                      <td>{item.RentMachine?.description}</td>
                      <td>{item.RentMachineLife?.from_date}</td>
                      <td>{item.RentMachineLife?.to_date}</td>
                      <td>{item.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          {gatePassDetails && (
            <div
              style={{
                fontSize: "13px",
                lineHeight: "1.6",
                padding: "0 20px",
                marginTop: "20px",
                color: "#c4c1c1ff",
              }}
            >
              <p>
                * Please handle the items listed in this Gate Pass carefully.{" "}
                <br />
                * Ensure that all equipment is returned in the same condition as
                received. <br />
                * Any discrepancies or damages must be reported immediately to
                the issuing branch. <br />* The items must be used only for the
                intended purpose and by authorized personnel.
              </p>
            </div>
          )}
          {gatePassDetails && (
            <div
              className="gp-signatures"
              style={{
                marginTop: "40px",
                display: "flex",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              {/* Prepared By */}
              <div className="gp-signature-box">
                <div>Prepared By:</div>
                <div style={{ marginTop: "10px" }}>
                  <div style={{ marginBottom: "5px", fontSize: 12 }}>
                    {gatePassDetails?.creator?.name || "N/A"}
                  </div>
                  <div
                    style={{
                      borderTop: "2px dotted #000",
                      width: "200px",
                      marginTop: "5px",
                    }}
                  ></div>
                  <div style={{ fontSize: 10, marginTop: "2px" }}>
                    {new Date(
                      gatePassDetails?.createdAt
                    ).toLocaleDateString() || "-"}
                  </div>
                </div>
              </div>

              {/* Authorized By */}
              <div className="gp-signature-box">
                <div>Authorized By:</div>
                <div style={{ marginTop: "10px" }}>
                  <div style={{ marginBottom: "5px", fontSize: 12 }}>
                    {gatePassDetails?.approvals?.[0]?.authorizedBy?.name || "-"}
                  </div>
                  <div
                    style={{
                      borderTop: "2px dotted #000",
                      width: "200px",
                      marginTop: "5px",
                    }}
                  ></div>
                  <div style={{ fontSize: 10, marginTop: "2px" }}>
                    {gatePassDetails?.approvals?.[0]?.auth_date
                      ? new Date(
                          gatePassDetails.approvals[0].auth_date
                        ).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Approved / Confirmed By */}
              <div className="gp-signature-box">
                <div>Approved By:</div>
                <div style={{ marginTop: "10px" }}>
                  <div style={{ marginBottom: "5px", fontSize: 12 }}>
                    {gatePassDetails?.approvals?.[0]?.confirmedBy?.name || "-"}
                  </div>
                  <div
                    style={{
                      borderTop: "2px dotted #000",
                      width: "200px",
                      marginTop: "5px",
                    }}
                  ></div>
                  <div style={{ fontSize: 10, marginTop: "2px" }}>
                    {gatePassDetails?.approvals?.[0]?.confirm_date
                      ? new Date(
                          gatePassDetails.approvals[0].confirm_date
                        ).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="gp-report-all-sticky-buttons">
        {hasApprovalPermission && (
          <>
            {gatePassDetails?.status === "Pending" && (
              <button
                onClick={handleApprove}
                className="gp-report-all-approve-button"
                // title={
                //   poApproval?.FirstApprover?.name &&
                //   poApproval?.SecondApprover?.name
                //     ? "Both approvals already completed"
                //     : "Approve PO"
                // }
              >
                <FaCheckCircle /> Approve
              </button>
            )}

            {gatePassDetails?.status === "Pending" && (
              <button
                onClick={""}
                className="gp-report-all-reject-button"
                // disabled={
                //   !!(
                //     poApproval?.FirstApprover?.name &&
                //     poApproval?.SecondApprover?.name
                //   )
                // }
                // title={
                //   poApproval?.FirstApprover?.name &&
                //   poApproval?.SecondApprover?.name
                //     ? "Both approvals already completed"
                //     : "Reject PO"
                // }
              >
                <FaTimesCircle /> Reject
              </button>
            )}
          </>
        )}
        {/* ✅ Edit → only creator + pending */}
        {gatePassDetails?.status === "Saved" &&
          gatePassDetails?.created_by?.toString() ===
            localStorage.getItem("userid") && (
            <button
              onClick={() =>
               navigate(`/rentmachines/gatepass-edit/${encodeURIComponent(gpNo)}`)
              }
              className="gp-report-all-edit-button"
            >
              ✏️ Edit
            </button>
          )}
      </div>
      {showRejectModal && (
        <div className="gp-report-all-modal-overlay">
          <div className="gp-report-all-modal">
            <h3>Reject Purchase Order</h3>
            <textarea
              rows={4}
              placeholder="Type reject reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{ marginRight: "10px" }}
              >
                Cancel
              </button>
              <button
                onClick={"submitReject"}
                style={{ backgroundColor: "red", color: "#fff" }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatePassReport;
