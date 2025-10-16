import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { purchaseOrderByPoId } from "../controller/PurchaseOrderController";
import { getRenewalPurchaseOrderMachinesByPoId } from "../controller/RenewalPurchaseOrderController";
import { useParams } from "react-router-dom";
import JsBarcode from "jsbarcode";
import "./RenewalPurchaseOrderReport.css";

const RenewalPurchaseOrderReport = () => {
  const { poNo } = useParams();
  const poId = poNo.replace("-", "/"); // converts '2025M-00001' → '2025M/00001'
  const [poDetails, setPoDetails] = useState(null);
  const [renewalItems, setRenewalItems] = useState([]);
  const [error, setError] = useState(null);
  const barcodeRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate barcode
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

  const getBarcodeImage = () => {
    return barcodeRef.current.toDataURL("image/png");
  };

  // Fetch data
  useEffect(() => {
    if (poId) {
      fetchReportData(poId);
    }
  }, [poId]);

  const fetchReportData = async (id) => {
    try {
      const poRes = await purchaseOrderByPoId(id);
      const renewalRes = await getRenewalPurchaseOrderMachinesByPoId(id);

      if (poRes.success && poRes.purchaseOrder) {
        setPoDetails(poRes.purchaseOrder);
      } else {
        throw new Error(poRes.message || "Failed to fetch purchase order.");
      }

      if (renewalRes.success && Array.isArray(renewalRes.poMachineRenewals)) {
        setRenewalItems(renewalRes.poMachineRenewals);
      } else {
        throw new Error(
          renewalRes.message || "Failed to fetch renewal machine details."
        );
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Unknown error occurred.");
    }
  };

  // PDF download
  const handleDownload = () => {
    const doc = new jsPDF();

    // === HEADER ===
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
      "Email: newuniverse@gmail.com  | Web: www.newuniverselk.com",
      105,
      25,
      { align: "center" }
    );

    doc.setFontSize(10);
    doc.text("Renewal Purchase Order", 105, 30, { align: "center" });
    doc.line(10, 34, 200, 34);

    const barcodeImage = getBarcodeImage();
    doc.addImage(barcodeImage, "PNG", 5, 10, 35, 20);

    let y = 45;

    if (poDetails) {
      doc.setFontSize(8);
      doc.setFont(undefined, "bold");
      doc.text("PO ID:", 14, y);
      doc.setFont(undefined, "normal");
      doc.text(`${poDetails.POID}`, 39, y);
      y += 50;
    }

    // === TABLE BODY ===
    const tableBody = renewalItems.map((item) => {
      const qty = Number(item.qty) || 0;
      const cost = Number(item.perday_cost) || 0;
      const discount = Number(item.d_percent) || 0;

      const fromDate = new Date(item.from_date);
      const toDate = new Date(item.to_date);
      const days =
        Math.floor(
          (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      const gross = qty * cost * days;
      const discountAmount = (gross * discount) / 100;
      const total = gross - discountAmount;

      return [
        item.RentMachine?.name || "-",
        item.RentMachine?.serial_no || "-",
        item.RentMachine?.brand || "-",
        item.from_date,
        item.to_date,
        days.toString(),
        qty,
        cost.toFixed(2),
        discount.toFixed(2),
        discountAmount.toFixed(2),
        total.toFixed(2),
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [
        [
          "Machine",
          "Serial No",
          "Brand",
          "From",
          "To",
          "No. of Days",
          "Qty",
          "Cost/Day",
          "Discount (%)",
          "Discount Amount",
          "Total Price",
        ],
      ],
      body: tableBody,
      styles: { fontSize: 7, cellPadding: 2, textColor: 20 },
      headStyles: { fontSize: 8, textColor: 20, halign: "center" },
      theme: "grid",
      margin: { left: 14, right: 14 },
    });

    // === SUBTOTAL & TAX ===
    const subtotal = renewalItems.reduce((acc, item) => {
      const qty = Number(item.qty) || 0;
      const cost = Number(item.perday_cost) || 0;
      const discount = Number(item.d_percent) || 0;

      const fromDate = new Date(item.from_date);
      const toDate = new Date(item.to_date);
      const days =
        Math.floor(
          (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      const gross = qty * cost * days;
      const discountAmount = (gross * discount) / 100;
      const total = gross - discountAmount;

      return acc + total;
    }, 0);

    const taxRate = 18;
    const taxAmount = (subtotal * taxRate) / 100;

    let taxLabel = "";
    if (poDetails?.is_vat) taxLabel = `Tax VAT (${taxRate}%)`;
    else if (poDetails?.is_svat) taxLabel = `Tax SVAT (${taxRate}%)`;

    y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 150, y);
    if (taxLabel)
      doc.text(`${taxLabel}: Rs. ${taxAmount.toFixed(2)}`, 150, y + 6);

    doc.save(`RenewalPurchaseOrder-${poDetails?.POID || "Unknown"}.pdf`);
  };

  return (
    <div className="porenewal-report-print-content">
      <div className="porenewal-report-wrapper">
        <div className="porenewal-report-container">
          {/* Header */}
          <div className="porenewal-report-header">
            <div className="porenewal-report-header-content">
              <div className="porenewal-report-barcode-container">
                <canvas ref={barcodeRef}></canvas>
              </div>
              <div className="porenewal-report-company-details">
                <h2>New Universe Corporate Clothing H Pvt Ltd</h2>
                <p>21/4, Polhengoda Gardens, Colombo 05, Sri Lanka</p>
                <p>Tel: +94 702250093 &nbsp; | &nbsp; Fax: 11282336</p>
                <p>
                  Email: newunive@gmail.com &nbsp; | &nbsp; Web:
                  www.newuniverse.lk
                </p>
                <h3>RENEWAL PURCHASE ORDER</h3>
                <p>PO NO : {poId}</p>
              </div>
            </div>
            <div className="porenewal-report-top-right-corner">
              <button
                onClick={handleDownload}
                title="Download PDF"
                className="porenewal-report-icon-button"
              >
                🡇
              </button>
              <button
                onClick={() => window.print()}
                className="porenewal-report-print-button"
              >
                🖨️
              </button>
            </div>
            <hr style={{ marginTop: "20px" }} />
          </div>

          {/* Error */}
          {error && (
            <div className="porenewal-report-error-message">
              <p style={{ color: "red" }}>⚠️ {error}</p>
            </div>
          )}

          {/* PO Details */}
          {poDetails && (
            <>
              <div className="porenewal-report-labels">
                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Supplier:</strong>
                    <div className="porenewal-report-label-value">
                      <div>{poDetails.Supplier?.name}</div>
                      <div>{poDetails.Supplier?.address}</div>
                      <div>{poDetails.Supplier?.contact}</div>
                    </div>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Deliver To:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.deliver_to}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Supplier SVAT:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.Supplier?.svatno}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Invoice To:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.invoice_to}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Supplier VAT:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.Supplier?.vatno}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Attention:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.attention}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>PO Date:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.date}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Delivery Date:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.delivery_date}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Payment Method:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.payment_mode}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Payment Term:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.payment_term}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>Instruction:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.instruction}
                    </span>
                  </div>
                </div>

                <div className="porenewal-report-label">
                  <div className="porenewal-report-label-row">
                    <strong>PR No's:</strong>
                    <span className="porenewal-report-label-value">
                      {poDetails.pr_nos}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Renewal Items Table + Subtotal + Instructions + Signatures */}
          {renewalItems.length > 0 && (
            <>
              <table className="porenewal-report-table">
                <thead>
                  <tr>
                    <th>Machine</th>
                    <th>Serial No</th>
                    <th>Description</th>
                    <th>Brand</th>
                    <th>From</th>
                    <th>To</th>
                    <th>No.Of Days</th>
                    <th>Qty</th>
                    <th>Cost/Day</th>
                    <th>Discount (%)</th>
                    <th>Discount Amount</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {renewalItems.map((item, index) => {
                    const qty = Number(item.qty) || 0;
                    const cost = Number(item.perday_cost) || 0;
                    const discount = Number(item.d_percent) || 0;

                    const fromDate = new Date(item.from_date);
                    const toDate = new Date(item.to_date);
                    const days =
                      Math.floor(
                        (toDate.getTime() - fromDate.getTime()) /
                          (1000 * 3600 * 24)
                      ) + 1;

                    const gross = qty * cost * days;
                    const discountAmount = (gross * discount) / 100;
                    const total = gross - discountAmount;

                    return (
                      <tr key={index}>
                        <td>{item.RentMachine?.name}</td>
                        <td>{item.RentMachine?.serial_no}</td>
                        <td>{item?.description}</td>
                        <td>{item.RentMachine?.brand}</td>
                        <td>{item.from_date}</td>
                        <td>{item.to_date}</td>
                        <td>{days}</td>
                        <td>{qty}</td>
                        <td>{cost.toFixed(2)}</td>
                        <td>{discount.toFixed(2)}</td>
                        <td>{discountAmount.toFixed(2)}</td>
                        <td>{total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Subtotal & Tax */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "10px",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {(() => {
                    const subtotal = renewalItems.reduce((acc, item) => {
                      const qty = Number(item.qty) || 0;
                      const cost = Number(item.perday_cost) || 0;
                      const discount = Number(item.d_percent) || 0;

                      const fromDate = new Date(item.from_date);
                      const toDate = new Date(item.to_date);
                      const days =
                        Math.floor(
                          (toDate.getTime() - fromDate.getTime()) /
                            (1000 * 3600 * 24)
                        ) + 1;

                      const gross = qty * cost * days;
                      const discountAmount = (gross * discount) / 100;
                      const total = gross - discountAmount;

                      return acc + total;
                    }, 0);

                    const taxRate = 18;
                    const taxAmount = (subtotal * taxRate) / 100;

                    return (
                      <>
                        {/* ✅ Subtotal */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "5px",
                          }}
                        >
                          <span>Subtotal:</span>
                          <span>Rs. {subtotal.toFixed(2)}</span>
                        </div>

                        {/* ✅ VAT */}
                        {poDetails?.is_vat && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "5px",
                            }}
                          >
                            <span>Tax VAT ({taxRate}%):</span>
                            <span>Rs. {taxAmount.toFixed(2)}</span>
                          </div>
                        )}

                        {/* ✅ SVAT (only if VAT is not applied) */}
                        {poDetails?.is_svat && !poDetails?.is_vat && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "5px",
                            }}
                          >
                            <span>Tax SVAT ({taxRate}%):</span>
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
                          }}
                        >
                          <span>Grand Total:</span>
                          <span>
                            Rs.{" "}
                            {(
                              subtotal +
                              (poDetails?.is_vat || poDetails?.is_svat
                                ? taxAmount
                                : 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Instructions */}
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

              {/* Signatures */}
              <div
                className="porenewal-signatures"
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 20px",
                }}
              >
                {/* Prepared By */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span>Prepared By:</span>
                  <div style={{ marginTop: "5px", fontSize: 12 }}>
                    {poDetails?.Employee?.name || "N/A"}
                  </div>
                  <div
                    style={{
                      borderTop: "2px dotted #000",
                      width: "200px",
                      marginTop: "10px",
                    }}
                  ></div>
                </div>

                {/* Authorized By */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span>Authorized By:</span>
                  <div
                    style={{
                      borderTop: "2px dotted #000",
                      width: "200px",
                      marginTop: "15px", // same vertical spacing as Prepared By line
                    }}
                  ></div>
                </div>

                {/* Approved By */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span>Approved By:</span>
                  <div
                    style={{
                      borderTop: "2px dotted #000",
                      width: "200px",
                      marginTop: "15px", // same spacing
                    }}
                  ></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenewalPurchaseOrderReport;
