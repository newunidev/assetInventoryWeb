import React, { useEffect, useState, useRef, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  purchaseOrderByPoId,
  updatePurchaseOrderApproval1,
  updatePurchaseOrderApproval2,
  poApprovalByPoId,
  updatePoStatus,
  createPoPrintPool,
  getPoPrintPoolByPoId,
  createPurchaseOrderReturn,
  createPurchaseOrderRevision,
  getLatestPoRevisionByPoId,
} from "../controller/PurchaseOrderController";
import { categoryPurchaseOrderByPoId } from "../controller/CategoryPurchaseOrderController";
import { useParams } from "react-router-dom";
import "./PurchaseOrderReport.css";
import JsBarcode from "jsbarcode";
import "./PurchaseOrderReportAll.css";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaTruckLoading,
  FaRedo,
} from "react-icons/fa";
import { getGrnExits } from "../controller/GrnController";
import { getAllRentMachineEarlyReturnByPoId } from "../controller/RentMachineEarlyReturnController";

const PurchaseOrderReportAll = () => {
  const { poNo } = useParams();
  const poId = poNo.replace("-", "/"); // convert back to original PO number
  const [poDetails, setPoDetails] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [poApproval, setPoApproval] = useState({});
  const [error, setError] = useState(null);
  const barcodeRef = useRef(null);
  const [loading, setLoading] = useState(true); // Add this line
  const [poPrintPool, setPoPrintPool] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [grnExists, setGrnExists] = useState(null); // null = loading, true/false = response

  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");

  const permissions = useMemo(
    () => JSON.parse(localStorage.getItem("permissions") || "[]"),
    []
  );
  const hasApprovalPermission =
    permissions.includes("PERM003") || permissions.includes("PERM004");

  console.log("Approve permission check :", hasApprovalPermission);

  const hasGrnPermission = permissions.includes("PERM004");

  const [revisionNotification, setRevisionNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  //const for the early return
  const [earlyReturns, setEarlyReturns] = useState([]);
  const [earlyReturnQtyMap, setEarlyReturnQtyMap] = useState({});

  useEffect(() => {
    const fetchEarlyReturns = async () => {
      if (!poId) return;

      try {
        const res = await getAllRentMachineEarlyReturnByPoId(poId);

        if (res.success && Array.isArray(res.data)) {
          setEarlyReturns(res.data);

          // build qty map
          const qtyMap = {};
          res.data.forEach((item) => {
            const id = item.cpo_id;
            if (!qtyMap[id]) qtyMap[id] = 0;
            qtyMap[id] += 1; // count each returned rent item
          });

          setEarlyReturnQtyMap(qtyMap); // store map here ✅
        } else {
          setEarlyReturns([]);
          setEarlyReturnQtyMap({});
        }
      } catch (err) {
        console.error("Error fetching early returns:", err);
        setEarlyReturns([]);
        setEarlyReturnQtyMap({});
      }
    };

    fetchEarlyReturns();
  }, [poId]);

  useEffect(() => {
    // Show popup on initial page load
    setShowNotification(true);
  }, []);

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

  const getBarcodeImage = () => {
    return barcodeRef.current.toDataURL("image/png");
  };

  const fetchReportData = async (id) => {
    setLoading(true); // Show loading
    try {
      const poRes = await purchaseOrderByPoId(id);
      const catRes = await categoryPurchaseOrderByPoId(id);
      const poApp = await poApprovalByPoId(id);
      const poPrintRes = await getPoPrintPoolByPoId(id);

      console.log("Cat Response", catRes);

      if (poRes.success && poRes.purchaseOrder) {
        setPoDetails(poRes.purchaseOrder);
        console.log(
          "PO Details ",
          poRes.purchaseOrder.branch_id,
          "And ",
          localStorage.getItem("userBranchId")
        ); // log here
        console.log(
          "PO Details maatching:",
          poRes.purchaseOrder.branch_id === localStorage.getItem("userBranchId")
        ); // log here
        setLoading(false); // Hide loading
      } else {
        throw new Error(poRes.message || "Failed to fetch purchase order.");
        setLoading(false); // Hide loading
      }

      if (catRes.success && Array.isArray(catRes.categoryPurchaseOrders)) {
        setCategoryItems(catRes.categoryPurchaseOrders);
        setLoading(false); // Hide loading
      } else {
        throw new Error(catRes.message || "Failed to fetch category items.");
        setLoading(false); // Hide loading
      }

      if (poApp.success && poApp.poApproval) {
        setPoApproval(poApp.poApproval);

        setLoading(false); // Hide loading
      } else {
        throw new Error(catRes.message || "Failed to fetch poapprovals.");
        setLoading(false); // Hide loading
      }

      if (poPrintRes.success && poPrintRes.data) {
        setPoPrintPool(poPrintRes.data);
      } else {
        setPoPrintPool(null); // no record found
        //setError(poPrintRes.message || "Failed to fetch PO print data.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Unknown error occurred.");
      setLoading(false); // Hide loading
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

      const updatedData = {
        po_no: poId,
      };

      // 🧠 Super User: has both permissions
      if (hasPerm003 && hasPerm004) {
        // If approval1 already done, do approval2
        if (poApproval.approval1) {
          updatedData.approval2_by = approverId;
          updatedData.approval2 = true;

          const response = await updatePurchaseOrderApproval2(updatedData);
          alert(`Super User: Approved Second Level! PO ID: ${poId}`);
          await updatePoStatus(poId, "Approved");
        } else {
          updatedData.approval1_by = approverId;
          updatedData.approval1 = true;

          const response = await updatePurchaseOrderApproval1(updatedData);
          alert(`Super User: Approved First Level! PO ID: ${poId}`);
        }
        window.location.reload();
      }

      // 👤 Only Approval1 permission
      else if (hasPerm003) {
        updatedData.approval1_by = approverId;
        updatedData.approval1 = true;

        const response = await updatePurchaseOrderApproval1(updatedData);
        alert(`Approved First Level! PO ID: ${poId}`);
        window.location.reload();
      }

      // 👤 Only Approval2 permission
      else if (hasPerm004) {
        updatedData.approval2_by = approverId;
        updatedData.approval2 = true;

        const response = await updatePurchaseOrderApproval2(updatedData);
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
    //const url = `/rentmachines/grn/${encodeURIComponent(poId)}`;
    const safePoId = poId.replace("/", "-");
    const url = `/rentmachines/grn/${safePoId}`;

    window.open(url, "_blank");
  };

  const handleEdit = () => {
    //const url = `/rentmachines/poedit/${encodeURIComponent(poId)}`;
    const safePoId = poId.replace("/", "-");
    const url = `/rentmachines/poedit/${safePoId}`;

    window.open(url, "_blank");
  };

  const handleRevice = async (reason) => {
    const revisionData = {
      po_id: poId,
      requested_by: Number(localStorage.getItem("userid")), // current logged user
      date: new Date().toISOString().split("T")[0], // current date YYYY-MM-DD
      reason: reason,
    };

    try {
      const result = await createPurchaseOrderRevision(revisionData);
      alert("Purchase Order Revision Created Successfully!");
      // ✅ Reload the page after success
      window.location.reload();
    } catch (error) {
      alert("Failed to create Purchase Order Revision!");
    }
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

  const fetchGrnStatus = async () => {
    try {
      const res = await getGrnExits(poId);
      setGrnExists(res.exists);
    } catch (error) {
      console.error("Error fetching GRN existence:", error);
      setGrnExists(false); // fallback
    }
  };

  useEffect(() => {
    if (poId) {
      fetchGrnStatus();
    }
  }, [poId]);

  useEffect(() => {
    const fetchLatestRevision = async () => {
      try {
        const res = await getLatestPoRevisionByPoId(poId);
        if (res.success && res.data) {
          setRevisionNotification({
            employee: res.data.Employee?.name,
            reason: res.data.reason,
          });
          setShowNotification(true);

          // Auto-collapse after 10 seconds
          setTimeout(() => {
            setCollapsed(true);
          }, 10000);
        }
      } catch (err) {
        console.error("Failed to fetch latest PO revision:", err);
      }
    };

    if (poId) fetchLatestRevision();
  }, [poId]);

  return (
    <div className="purchase-order-report-all-print-content">
      <div className="purchase-order-report-all-wrapper">
        <div className="purchase-order-report-all-watermark">
          {poDetails?.status === "Pending"
            ? "PENDING APPROVAL"
            : poDetails?.status === "Approved"
            ? "APPROVED PO"
            : ""}
        </div>
        <div className="purchase-order-report-all-container">
          <div className="purchase-order-report-all-header">
            <div className="purchase-order-report-all-header-content">
              <div className="purchase-order-report-all-barcode-container">
                <canvas ref={barcodeRef}></canvas>
              </div>

              <div className="purchase-order-report-all-company-details">
                <h2>
                  New Universe Corporate Clothing{" "}
                  {["Welioya", "Piliyandala", "Mathara"].includes(
                    poDetails?.branch
                  )
                    ? "SL"
                    : "H"}{" "}
                  Pvt Ltd
                </h2>
                <p>21/4, Polhengoda Gardens, Colombo 05, Sri Lanka</p>
                <p>Tel: +94 702250093 &nbsp; | &nbsp; Fax: 11282336</p>
                <p>
                  Email: newuniverse@gmail.com &nbsp; | &nbsp; Web:
                  www.newuniverse.lk
                </p>
                <h3>PURCHASE ORDER</h3>
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

              {categoryItems.length > 0 && (
                <>
                  <table className="purchase-order-report-all-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Description</th>

                        <th>From</th>
                        <th>To</th>
                        <th>Quantity</th>
                        <th>No.Of Days</th>
                        <th>Cost / Day</th>
                        <th>Discount (%)</th>
                        <th>Discount Amount</th>
                        <th>Total Price</th>
                      </tr>
                    </thead>
                    {/* <tbody>
                      {categoryItems.map((item, index) => {
                        console.log(
                          "Category Early return →",
                          "cpo_id:",
                          item.cpo_id,
                          "qty:",
                          earlyReturnQtyMap[item.cpo_id] || 0
                        );
                        const qty = Number(item.Qty) || 0;
                        const cost = Number(item.PerDay_Cost) || 0;
                        const discount = Number(item.d_percent) || 0;

                        // Parse dates and calculate number of days (inclusive)
                        const fromDate = new Date(item.from_date);
                        const toDate = new Date(item.to_date);
                        const timeDiff = toDate.getTime() - fromDate.getTime();
                        const numberOfDays =
                          Math.floor(timeDiff / (1000 * 3600 * 24)) + 1; // +1 for inclusive range

                        const gross = qty * cost * numberOfDays;
                        const discountAmount = (gross * discount) / 100;
                        const total = gross - discountAmount;

                        return (
                          <tr key={index}>
                            <td>{item.Category?.cat_name}</td>
                            <td>{item.description}</td>

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
                    </tbody> */}
                    <tbody>
                      {categoryItems.map((item, index) => {
                        const originalQty = Number(item.Qty) || 0;
                        const earlyReturnQty =
                          earlyReturnQtyMap[item.cpo_id] || 0;
                        const adjustedQty = Math.max(
                          originalQty - earlyReturnQty,
                          0
                        ); // don't go below 0

                        const cost = Number(item.PerDay_Cost) || 0;
                        const discount = Number(item.d_percent) || 0;

                        const fromDate = new Date(item.from_date);
                        const toDate = new Date(item.to_date);
                        const timeDiff = toDate.getTime() - fromDate.getTime();
                        const numberOfDays =
                          Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

                        const gross = adjustedQty * cost * numberOfDays;
                        const discountAmount = (gross * discount) / 100;
                        const total = gross - discountAmount;

                        return (
                          <tr key={index}>
                            <td>{item.Category?.cat_name}</td>
                            <td>{item.description}</td>
                            <td>{item.from_date}</td>
                            <td>{item.to_date}</td>
                            <td>{adjustedQty}</td>
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
                        const subtotal = categoryItems.reduce((acc, item) => {
                          const originalQty = Number(item.Qty) || 0;
                          const earlyReturnQty =
                            earlyReturnQtyMap[item.cpo_id] || 0;
                          const adjustedQty = Math.max(
                            originalQty - earlyReturnQty,
                            0
                          ); // don't go below 00;
                          const cost = Number(item.PerDay_Cost) || 0;
                          const discount = Number(item.d_percent) || 0;

                          const fromDate = new Date(item.from_date);
                          const toDate = new Date(item.to_date);
                          const timeDiff =
                            toDate.getTime() - fromDate.getTime();
                          const numberOfDays =
                            Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

                          const gross = adjustedQty * cost * numberOfDays;
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
                                gap: "20px", // ✅ adds gap between label and value
                              }}
                            >
                              <span style={{ minWidth: "150px" }}>
                                Subtotal:
                              </span>
                              <span>Rs. {subtotal.toFixed(2)}</span>
                            </div>

                            {earlyReturns.length === 0 && (
                              <>
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
                                    {(
                                      subtotal +
                                      (poDetails.is_vat || poDetails.is_svat
                                        ? taxAmount
                                        : 0)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </>
              )}

              {earlyReturns.length > 0 && (
                <>
                  <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>
                    Early Returns
                  </h3>
                  <table className="purchase-order-report-all-table">
                    <thead>
                      <tr>
                        <th>Serial No</th>
                        <th>Rent Machine</th>
                        <th>Description</th>
                        <th>From</th>
                        <th>To</th>
                        <th>No Of Days Calculation</th>
                        <th>Cost / Day</th>
                        <th>Discount (%)</th>
                        <th>Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earlyReturns.map((item, index) => {
                        const fromDate = new Date(item.from_date);
                        const toDate = new Date(item.to_date);
                        const timeDiff = toDate.getTime() - fromDate.getTime();
                        let numberOfDays =
                          Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

                        const costPerDay = Number(item.per_day_cost) || 0;
                        const discount = Number(item.d_rate) || 0; // discount percent
                        let gross = 0;

                        // Check if supplier has monthly payment
                        if (poDetails.Supplier?.is_monthly_payment) {
                          if (numberOfDays < 15) {
                            gross = costPerDay * 15;
                            numberOfDays = 15; // display as 15 days
                          } else {
                            gross = costPerDay * 30;
                            numberOfDays = 30; // display as 30 days
                          }
                        } else {
                          gross = costPerDay * numberOfDays;
                        }

                        const discountAmount = (gross * discount) / 100;
                        const total = gross - discountAmount;

                        return (
                          <tr key={index}>
                            <td>{item.RentMachine?.serial_no}</td>
                            <td>{item.RentMachine?.name}</td>
                            <td>{item.RentMachine?.description}</td>
                            <td>{item.from_date}</td>
                            <td>{item.to_date}</td>
                            <td>{numberOfDays}</td>
                            <td>{costPerDay.toFixed(2)}</td>
                            <td>{discount.toFixed(2)}</td>
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
                        // ---- CATEGORY ITEMS SUBTOTAL ----
                        const subtotalCategory = categoryItems.reduce(
                          (acc, item) => {
                            const originalQty = Number(item.Qty) || 0;
                            const earlyReturnQty =
                              earlyReturnQtyMap[item.cpo_id] || 0;
                            const adjustedQty = Math.max(
                              originalQty - earlyReturnQty,
                              0
                            );

                            const cost = Number(item.PerDay_Cost) || 0;
                            const discount = Number(item.d_percent) || 0;

                            const fromDate = new Date(item.from_date);
                            const toDate = new Date(item.to_date);
                            const days =
                              Math.floor(
                                (toDate - fromDate) / (1000 * 3600 * 24)
                              ) + 1;

                            const gross = adjustedQty * cost * days;
                            const discountAmount = (gross * discount) / 100;
                            const total = gross - discountAmount;

                            return acc + total;
                          },
                          0
                        );

                        // ---- EARLY RETURN SUBTOTAL ----
                        const subtotalEarlyReturn = earlyReturns.reduce(
                          (acc, item) => {
                            const fromDate = new Date(item.from_date);
                            const toDate = new Date(item.to_date);
                            let numberOfDays =
                              Math.floor(
                                (toDate - fromDate) / (1000 * 3600 * 24)
                              ) + 1;

                            const cost = Number(item.per_day_cost) || 0;
                            const discount = Number(item.d_rate) || 0;

                            let gross = 0;

                            if (poDetails.Supplier?.is_monthly_payment) {
                              if (numberOfDays < 15) {
                                gross = cost * 15;
                                numberOfDays = 15;
                              } else {
                                gross = cost * 30;
                                numberOfDays = 30;
                              }
                            } else {
                              gross = cost * numberOfDays;
                            }

                            const discountAmount = (gross * discount) / 100;
                            const total = gross - discountAmount;

                            return acc + total;
                          },
                          0
                        );

                        // ---- FINAL TOTALS ----
                        const combinedTotal =
                          subtotalCategory + subtotalEarlyReturn;

                        const taxRate = 18;
                        const taxAmount =
                          poDetails.is_vat || poDetails.is_svat
                            ? (combinedTotal * taxRate) / 100
                            : 0;

                        const grandTotal = combinedTotal + taxAmount;

                        return (
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "5px",
                                gap: "20px", // ✅ adds gap between label and value
                              }}
                            >
                              <span style={{ minWidth: "150px" }}>
                                Subtotal:
                              </span>
                              {/* <span>Rs. {subtotal.toFixed(2)}</span> */}
                              <span>Rs. {subtotalEarlyReturn.toFixed(2)}</span>
                            </div>

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
                              <div className="po-total-line">
                                <strong>Combined Total:</strong>
                                <span>Rs. {combinedTotal.toFixed(2)}</span>
                              </div>

                              {poDetails.is_vat && (
                                <div className="po-total-line">
                                  <strong>VAT ({taxRate}%):</strong>
                                  <span>Rs. {taxAmount.toFixed(2)}</span>
                                </div>
                              )}

                              {poDetails.is_svat && !poDetails.is_vat && (
                                <div className="po-total-line">
                                  <strong>SVAT ({taxRate}%):</strong>
                                  <span>Rs. {taxAmount.toFixed(2)}</span>
                                </div>
                              )}

                              <div className="po-total-line grand-total">
                                <strong>GRAND TOTAL:</strong>
                                <span>Rs. {grandTotal.toFixed(2)}</span>
                              </div>
                              {/* <span style={{ minWidth: "150px" }}>
                                Grand Total:
                              </span>
                              <span>
                                Rs.{" "}
                                {(
                                  subtotal +
                                  (poDetails.is_vat || poDetails.is_svat
                                    ? taxAmount
                                    : 0)
                                ).toFixed(2)}
                              </span> */}
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
        {/* {hasApprovalPermission && (
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
        )} */}
        {hasApprovalPermission && poDetails?.status === "Pending" && (
          <>
            <button
              onClick={handleApprove}
              className="purchase-order-report-all-approve-button"
              disabled={
                // Disable if Approval1 is already done AND user only has PERM003
                (permissions.includes("PERM003") &&
                  !permissions.includes("PERM004") &&
                  poApproval?.FirstApprover?.name) ||
                // Or disable if both approvals already done
                (poApproval?.FirstApprover?.name &&
                  poApproval?.SecondApprover?.name)
              }
              title={
                poApproval?.FirstApprover?.name &&
                poApproval?.SecondApprover?.name
                  ? "Both approvals already completed"
                  : poApproval?.FirstApprover?.name
                  ? "Approval 1 already done"
                  : "Approve PO"
              }
            >
              <FaCheckCircle /> Approve
            </button>

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
          </>
        )}

        {/* GRN button is always visible and appears after Reject */}
        <button
          onClick={handleGrn}
          disabled={
            !(
              poApproval?.FirstApprover?.name &&
              poApproval?.SecondApprover?.name &&
              poDetails?.branch_id ===
                Number(localStorage.getItem("userBranchId"))
            )
          }
          className="purchase-order-report-all-grn-button"
        >
          <FaTruckLoading /> GRN
        </button>

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

        {/* <button
          onClick={handleRevice}
          disabled={
            !(
              poDetails?.status === "Approved" &&
              poDetails?.branch_id ===
                Number(localStorage.getItem("userBranchId")) &&
              grnExists === false
            )
          }
          className="purchase-order-report-all-revice-button"
        >
          <FaRedo /> REVICE
        </button> */}
        <button
          onClick={() => setShowRevisionDialog(true)} // open popup
          disabled={
            !(
              poDetails?.status === "Approved" &&
              poDetails?.branch_id ===
                Number(localStorage.getItem("userBranchId")) &&
              grnExists === false
            )
          }
          className="purchase-order-report-all-revice-button"
        >
          <FaRedo /> REVICE
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

      {/* righ side popup message notification */}
      {showNotification &&
        revisionNotification &&
        (poDetails?.status === "Pending" || poDetails?.status === "Saved") && (
          <div className={`po-notification ${collapsed ? "collapsed" : ""}`}>
            <div className="po-notification-header">
              <strong>Hi 👋</strong>
              <button
                className="po-notification-toggle"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? "Show" : "Hide"}
              </button>
              <button
                className="po-notification-close"
                onClick={() => setShowNotification(false)}
              >
                ✕
              </button>
            </div>
            {!collapsed && (
              <div className="po-notification-body">
                🔄This PO has been revised by{" "}
                <strong>{revisionNotification?.employee}</strong>.<br />
                <strong>💬 Reason:</strong> {revisionNotification?.reason}
              </div>
            )}
          </div>
        )}

      {/*revice reason dialog box */}
      {showRevisionDialog && (
        <div className="revice-popup-overlay">
          <div className="revice-popup">
            <h3>Provide Revision Reason</h3>
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Enter reason for revision..."
              className="revice-popup-textarea"
            ></textarea>

            <div className="revice-popup-buttons">
              <button
                className="revice-popup-submit"
                onClick={() => {
                  handleRevice(revisionReason); // pass reason
                  setShowRevisionDialog(false); // close popup
                  setRevisionReason(""); // reset
                }}
              >
                Submit
              </button>
              <button
                className="revice-popup-cancel"
                onClick={() => setShowRevisionDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderReportAll;
