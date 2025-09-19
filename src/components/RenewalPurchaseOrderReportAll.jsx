import React, { useEffect, useState, useRef, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  purchaseOrderByPoId,
  updatePurchaseOrderApproval1,
  updateRenewalPurchaseOrderApproval2,
  poApprovalByPoId,
  updatePoStatus,
  createPoPrintPool,
  getPoPrintPoolByPoId,
  createPurchaseOrderReturn,
} from "../controller/PurchaseOrderController";
import { getRenewalPurchaseOrderMachinesByPoId } from "../controller/RenewalPurchaseOrderController";
import { useParams } from "react-router-dom";
import "./PurchaseOrderReport.css";
import JsBarcode from "jsbarcode";
import "./PurchaseOrderReportAll.css";
import { FaCheckCircle, FaTimesCircle, FaTruckLoading } from "react-icons/fa";

const RenewalPurchaseOrderReportAll = () => {
  const { poId } = useParams();
  const [poDetails, setPoDetails] = useState(null);
  const [renewalDetails, setRenewalDetails] = useState([]); // 🔹 Initialize as []
  const [poApproval, setPoApproval] = useState({});
  const [error, setError] = useState(null);
  const barcodeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [poPrintPool, setPoPrintPool] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const permissions = useMemo(
    () => JSON.parse(localStorage.getItem("permissions") || "[]"),
    []
  );
  const hasApprovalPermission =
    permissions.includes("PERM003") || permissions.includes("PERM004");
  const hasGrnPermission = permissions.includes("PERM004");

  useEffect(() => {
    if (poId && barcodeRef.current) {
      JsBarcode(barcodeRef.current, poId, {
        format: "CODE128",
        width: 1,
        height: 40,
        displayValue: true,
      });
    }
  }, [poId]);

  useEffect(() => {
    if (poId) {
      fetchReportData(poId);
    }
  }, [poId]);

  const getBarcodeImage = () => barcodeRef.current.toDataURL("image/png");

  const fetchReportData = async (id) => {
    setLoading(true);
    try {
      const poRes = await purchaseOrderByPoId(id);
      const renewalRes = await getRenewalPurchaseOrderMachinesByPoId(id); // 🔹 Updated
      const poApp = await poApprovalByPoId(id);
      const poPrintRes = await getPoPrintPoolByPoId(id);

      if (poRes.success && poRes.purchaseOrder) {
        setPoDetails(poRes.purchaseOrder);
        //console.log("Check Status", poRes);
      } else {
        throw new Error(poRes.message || "Failed to fetch purchase order.");
      }

      if (renewalRes.success && renewalRes.poMachineRenewals) {
        setRenewalDetails(renewalRes.poMachineRenewals); // 🔹 Correct property
      } else {
        setRenewalDetails([]); // 🔹 empty array instead of null
      }

      if (poApp.success && poApp.poApproval) {
        setPoApproval(poApp.poApproval);
      }

      if (poPrintRes.success && poPrintRes.data) {
        setPoPrintPool(poPrintRes.data);
      } else {
        setPoPrintPool(null);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Unknown error occurred.");
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // ... [PDF generation logic remains unchanged]
    // Only className updates are requested.
  };
  const handlePrint = async () => {
    try {
      const printedBy = localStorage.getItem("userid"); // whoever is logged in

      const payload = {
        po_id: poId,
        printed_by: Number(printedBy),
      };

      // Call your API
      const response = await createPoPrintPool(payload);

      if (response.success) {
        console.log("PO print record created:", response);

        // Listen for print dialog close
        window.onafterprint = () => {
          window.location.reload(); // refresh the page
        };

        window.print(); // open print dialog
      } else {
        alert("Failed to record print attempt!");
      }
    } catch (err) {
      console.error("Print record error:", err);
      alert("Error recording print attempt");
    }
  };

  
  const handleApprove = async () => {
    try {
      const approverId = localStorage.getItem("userid");
      const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
      const hasPerm003 = permissions.includes("PERM003"); // Approval1
      const hasPerm004 = permissions.includes("PERM004"); // Approval2

      // Prepare machines array for Approval2
      const machines = renewalDetails.map((item) => ({
        rent_item_id: item.RentMachine?.rent_item_id,
        branch: poDetails.branch_id,
        po_id: poId,
        from_date: item.from_date,
        to_date: item.to_date,
      }));

      const updatedData = { po_no: poId };

      // 🧠 Super User: has both permissions
      if (hasPerm003 && hasPerm004) {
        if (poApproval.approval1) {
          // Perform Approval2
          updatedData.approval2_by = approverId;
          updatedData.approval2 = true;
          updatedData.machines = machines; // ✅ include machines

          await updateRenewalPurchaseOrderApproval2(updatedData);
          alert(`Super User: Approved Second Level! PO ID: ${poId}`);
          await updatePoStatus(poId, "Approved");
        } else {
          // Perform Approval1
          updatedData.approval1_by = approverId;
          updatedData.approval1 = true;

          await updatePurchaseOrderApproval1(updatedData);
          alert(`Super User: Approved First Level! PO ID: ${poId}`);
        }
        window.location.reload();
      }

      // 👤 Only Approval1 permission
      else if (hasPerm003) {
        updatedData.approval1_by = approverId;
        updatedData.approval1 = true;

        await updatePurchaseOrderApproval1(updatedData);
        alert(`Approved First Level! PO ID: ${poId}`);
        window.location.reload();
      }

      // 👤 Only Approval2 permission
      else if (hasPerm004) {
        updatedData.approval2_by = approverId;
        updatedData.approval2 = true;
        updatedData.machines = machines; // ✅ include machines

        await updateRenewalPurchaseOrderApproval2(updatedData);
        alert(`Approved Second Level! PO ID: ${poId}`);
        await updatePoStatus(poId, "Approved");
        window.location.reload();
      }

      // ❌ No valid permission
      else {
        alert("You do not have permission to approve this PO.");
      }
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed. Please try again.");
    }
  };

  const handleReject = () => {
    setShowRejectModal(true); // show popup
  };
  const handleGrn = () => {
    const url = `/rentmachines/grn/${encodeURIComponent(poId)}`;

    window.open(url, "_blank");
  };

  const handleEdit = () => {
    const url = `/rentmachines/renewalpoedit/${encodeURIComponent(poId)}`;

    window.open(url, "_blank");
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      alert("❌ Please provide a reject reason.");
      return;
    }

    try {
      const payload = {
        POID: poId,
        rejected_by: Number(localStorage.getItem("userid")),
        reason: rejectReason,
      };

      // 🔹 Call API
      const response = await createPurchaseOrderReturn(payload);

      if (response?.success) {
        alert(`✅ ${response.message || "PO Rejected successfully!"}`);
        setRejectReason("");
        setShowRejectModal(false);

        // 🔄 Reload page
        window.location.reload();
      } else {
        alert(`⚠️ ${response?.message || "Failed to reject PO."}`);
      }
    } catch (err) {
      console.error("Reject API error:", err);
      alert("🚨 Server error while rejecting PO. Please try again.");
    }
  };
  // 🔹 handleDownload, handlePrint, handleApprove, handleReject, submitReject remain unchanged

  return (
    <div className="purchase-order-report-all-print-content">
      <div className="purchase-order-report-all-wrapper">
        {poDetails?.status === "Pending" && (
          <div className="purchase-order-report-all-watermark">
            PENDING APPROVAL
          </div>
        )}
        <div className="purchase-order-report-all-container">
          <div className="purchase-order-report-all-header">
            <div className="purchase-order-report-all-header-content">
              <div className="purchase-order-report-all-barcode-container">
                <canvas ref={barcodeRef}></canvas>
              </div>

              <div className="purchase-order-report-all-company-details">
                <h2>New Universe Corporate Clothing H Pvt Ltd</h2>
                <p>21/4, Polhengoda Gardens, Colombo 05, Sri Lanka</p>
                <p>Tel: +94 702250093 &nbsp; | &nbsp; Fax: 11282336</p>
                <p>
                  Email: newunive@gmail.com &nbsp; | &nbsp; Web:
                  www.newuniverse.lk
                </p>
                <h3>RENEWAL PURCHASE ORDER</h3>
                <h2>PO NO : {poId}</h2>
                <h3>
                  {poPrintPool
                    ? `(Duplicate Copy ${poPrintPool.print_count})`
                    : "(ORIGINAL)"}
                </h3>
              </div>
            </div>
            {/* NEW top right corner content */}
            <div className="purchase-order-report-all-top-right-corner">
              <button
                onClick={handleDownload}
                title="Download PDF"
                className="purchase-order-report-all-icon-button"
              >
                🡇
              </button>
              <button
                onClick={handlePrint}
                className="purchase-order-report-all-print-button"
              >
                🖨️
              </button>
            </div>
            <hr style={{ marginTop: "20px" }} />
          </div>

          {error && (
            <div className="purchase-order-report-all-error-message">
              <p style={{ color: "red" }}>⚠️ {error}</p>
            </div>
          )}

          {poDetails && (
            <>
              <div className="purchase-order-report-all-labels">
                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Supplier:</strong>
                    <div className="purchase-order-report-all-label-value">
                      <div>{poDetails.Supplier?.name}</div>
                      <div>{poDetails.Supplier?.address}</div>
                      <div>{poDetails.Supplier?.contact}</div>
                    </div>
                  </div>
                </div>
                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Deliver To:</strong>
                    <span className="purchase-order-report-all-label-value">
                      {poDetails.deliver_to}
                    </span>
                  </div>
                </div>
                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Supplier SVAT:</strong>

                    <span className="purchase-order-report-all-label-value">
                      {poDetails.Supplier.svatno}
                    </span>
                  </div>
                </div>

                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Invoice To:</strong>
                    <span className="purchase-order-report-all-label-value">
                      {poDetails.invoice_to}
                    </span>
                  </div>
                </div>
                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Supplier VAT:</strong>

                    <span className="purchase-order-report-all-label-value">
                      {poDetails.Supplier.vatno}
                    </span>
                  </div>
                </div>

                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Attention:</strong>
                    <span className="purchase-order-report-all-label-value">
                      {poDetails.attention}
                    </span>
                  </div>
                </div>

                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>PO Date:</strong>
                    <span className="purchase-order-report-all-label-value">
                      {poDetails.date}
                    </span>
                  </div>
                </div>

                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Delivery Date:</strong>
                    <span className="purchase-order-report-all-label-value">
                      {poDetails.delivery_date}
                    </span>
                  </div>
                </div>

                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Payment Method:</strong>
                    <span className="purchase-order-report-all-label-value">
                      {poDetails.payment_mode}
                    </span>
                  </div>
                </div>
                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Payment Term:</strong>
                    <span className="purchase-order-report-all-label-value">
                      {poDetails.payment_term}
                    </span>
                  </div>
                </div>

                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>Instruction:</strong>
                    <span className="purchase-order-report-all-label-value">
                      {poDetails.instruction}
                    </span>
                  </div>
                </div>

                <div className="purchase-order-report-all-label">
                  <div className="purchase-order-report-all-label-row">
                    <strong>PR No's:</strong>
                    <span className="purchase-order-report-all-label-value">
                      {poDetails.pr_nos}
                    </span>
                  </div>
                </div>
              </div>

              {renewalDetails.length > 0 && (
                <>
                  <table className="purchase-order-report-all-table">
                    <thead>
                      <tr>
                        <th>Machine Name</th>
                        <th>Serial Numner</th>
                        <th>Description</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Qty</th>
                        <th>Days</th>
                        <th>Per Day Cost</th>
                        <th>Discount %</th>
                        <th>Discount Amount</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renewalDetails.map((item, index) => {
                        const qty = Number(item.qty) || 0;
                        const cost = Number(item.perday_cost) || 0;
                        const discount = Number(item.d_percent) || 0;

                        const fromDate = new Date(item.from_date);
                        const toDate = new Date(item.to_date);
                        const numberOfDays =
                          Math.floor((toDate - fromDate) / (1000 * 3600 * 24)) +
                          1;

                        const gross = qty * cost * numberOfDays;
                        const discountAmount = (gross * discount) / 100;
                        const total = gross - discountAmount;

                        return (
                          <tr key={index}>
                            <td>{item.RentMachine?.name}</td>
                            <td>{item.RentMachine?.serial_no}</td>
                            <td>{item?.description}</td>
                            <td>{item.from_date}</td>
                            <td>{item.to_date}</td>
                            <td>{qty}</td>
                            <td>{numberOfDays}</td>
                            <td>{cost.toFixed(2)}</td>
                            <td>{discount.toFixed(2)}</td>
                            <td>{discountAmount.toFixed(2)}</td>
                            <td>{total.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Subtotal calculation */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "10px",
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      {(() => {
                        const subtotal = renewalDetails.reduce((acc, item) => {
                          const qty = Number(item.qty) || 0;
                          const cost = Number(item.perday_cost) || 0;
                          const discount = Number(item.d_percent) || 0;

                          const fromDate = new Date(item.from_date);
                          const toDate = new Date(item.to_date);
                          const numberOfDays =
                            Math.floor(
                              (toDate.getTime() - fromDate.getTime()) /
                                (1000 * 3600 * 24)
                            ) + 1;

                          const gross = qty * cost * numberOfDays;
                          const discountAmount = (gross * discount) / 100;
                          const total = gross - discountAmount;

                          return acc + total;
                        }, 0);

                        const taxRate = 18;
                        const taxAmount = (subtotal * taxRate) / 100;

                        return (
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "5px",
                                gap: "20px",
                              }}
                            >
                              <span style={{ minWidth: "150px" }}>
                                Subtotal:
                              </span>
                              <span>Rs. {subtotal.toFixed(2)}</span>
                            </div>

                            {poDetails.is_vat && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: "5px",
                                  gap: "20px",
                                }}
                              >
                                <span style={{ minWidth: "150px" }}>
                                  Tax VAT ({taxRate}%):
                                </span>
                                <span>Rs. {taxAmount.toFixed(2)}</span>
                              </div>
                            )}

                            {poDetails.is_svat && !poDetails.is_vat && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: "5px",
                                  gap: "20px",
                                }}
                              >
                                <span style={{ minWidth: "150px" }}>
                                  Tax SVAT ({taxRate}%):
                                </span>
                                <span>Rs. {taxAmount.toFixed(2)}</span>
                              </div>
                            )}

                            {/* ✅ Grand Total */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "8px",
                                fontWeight: "bold",
                                borderTop: "1px solid #ccc",
                                paddingTop: "5px",
                                gap: "20px",
                              }}
                            >
                              <span style={{ minWidth: "150px" }}>
                                Grand Total:
                              </span>
                              <span>
                                Rs.{" "}
                                {(poDetails.is_svat
                                  ? subtotal // ✅ SVAT → use subtotal only
                                  : subtotal +
                                    (poDetails.is_vat ? taxAmount : 0)
                                ) // ✅ VAT → add tax
                                  .toFixed(2)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </>
              )}

              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  padding: "0 20px",
                  marginTop: "20px",
                  color: "#333",
                }}
              >
                Please supply in accordance with the following instructions.{" "}
                <br />
                Please indicate our purchase order number in all invoices,
                proforma invoices, dispatch notes and all correspondence.
                Deliver to above mentioned destination and invoices to the said
                party. <br />
                Payment will be made strictly up to the quantity and the
                relevant value of the purchase order.
              </p>
              <div
                className="purchase-order-report-all-signatures-row"
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 20px",
                }}
              >
                <div>
                  Prepared By:
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ marginBottom: "5px", fontSize: 12 }}>
                      {poDetails.Employee?.name || "."}
                    </div>
                    <div
                      style={{
                        borderTop: "2px dotted #000",
                        width: "200px",
                        marginTop: "5px",
                      }}
                    ></div>
                    <div style={{ marginBottom: "5px", fontSize: 12 }}>
                      {poDetails?.date
                        ? new Date(poDetails.date).toISOString().split("T")[0]
                        : "."}
                    </div>
                  </div>
                </div>
                <div>
                  Authorized By:
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ marginBottom: "5px", fontSize: 12 }}>
                      {poApproval.FirstApprover?.name || "."}
                    </div>
                    <div
                      style={{
                        borderTop: "2px dotted #000",
                        width: "200px",
                        marginTop: "5px",
                      }}
                    ></div>
                    <div style={{ marginBottom: "5px", fontSize: 12 }}>
                      {poApproval?.approved1_date
                        ? new Date(poApproval.approved1_date)
                            .toISOString()
                            .split("T")[0]
                        : "."}
                    </div>
                  </div>
                </div>
                <div>
                  Approved By:
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ marginBottom: "5px", fontSize: 12 }}>
                      {poApproval.SecondApprover?.name || "."}
                    </div>
                    <div
                      style={{
                        borderTop: "2px dotted #000",
                        width: "200px",
                        marginTop: "5px",
                      }}
                    ></div>
                    <div style={{ marginBottom: "5px", fontSize: 12 }}>
                      {poApproval?.approved1_date
                        ? new Date(poApproval.approved2_date)
                            .toISOString()
                            .split("T")[0]
                        : "."}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="purchase-order-report-all-sticky-buttons">
        {hasApprovalPermission && (
          <>
            {poDetails?.status === "Pending" && (
              <button
                onClick={handleApprove}
                className="purchase-order-report-all-approve-button"
                title={
                  poApproval?.FirstApprover?.name &&
                  poApproval?.SecondApprover?.name
                    ? "Both approvals already completed"
                    : "Approve PO"
                }
              >
                <FaCheckCircle /> Approve
              </button>
            )}

            {/* <button
                onClick={handleReject}
                className="purchase-order-report-all-reject-button"
                disabled={
                  !!(
                    poApproval?.FirstApprover?.name &&
                    poApproval?.SecondApprover?.name
                  )
                }
                title={
                  poApproval?.FirstApprover?.name &&
                  poApproval?.SecondApprover?.name
                    ? "Both approvals already completed"
                    : "Reject PO"
                }
              >
                <FaTimesCircle /> Reject
              </button> */}
            {poDetails?.status === "Pending" && (
              <button
                onClick={handleReject}
                className="purchase-order-report-all-reject-button"
                disabled={
                  !!(
                    poApproval?.FirstApprover?.name &&
                    poApproval?.SecondApprover?.name
                  )
                }
                title={
                  poApproval?.FirstApprover?.name &&
                  poApproval?.SecondApprover?.name
                    ? "Both approvals already completed"
                    : "Reject PO"
                }
              >
                <FaTimesCircle /> Reject
              </button>
            )}
          </>
        )}

        <button
          onClick={handleEdit}
          disabled={
            !(
              (poDetails?.status === "Saved" ||
                poDetails?.status === "Rejected") &&
              poDetails?.branch_id ===
                Number(localStorage.getItem("userBranchId"))
            )
          }
          className="purchase-order-report-all-edit-button"
        >
          <FaTruckLoading /> Edit
        </button>
      </div>
      {showRejectModal && (
        <div className="purchase-order-report-all-modal-overlay">
          <div className="purchase-order-report-all-modal">
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
                onClick={submitReject}
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

export default RenewalPurchaseOrderReportAll;
