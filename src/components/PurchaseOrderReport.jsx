import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { purchaseOrderByPoId } from "../controller/PurchaseOrderController";
import { categoryPurchaseOrderByPoId } from "../controller/CategoryPurchaseOrderController";
import { useParams } from "react-router-dom";
import "./PurchaseOrderReport.css";
import JsBarcode from "jsbarcode";
import { useRef } from "react";
import { numberToWords } from "../utility/common";

const PurchaseOrderReport = () => {
  const { poId } = useParams();
  const [poDetails, setPoDetails] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [error, setError] = useState(null);
  const barcodeRef = useRef(null);

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

  useEffect(() => {
    if (poId) {
      fetchReportData(poId);
    }
  }, [poId]);

  const fetchReportData = async (id) => {
    try {
      const poRes = await purchaseOrderByPoId(id);
      const catRes = await categoryPurchaseOrderByPoId(id);
      console.log("Testing", poRes);
      if (poRes.success && poRes.purchaseOrder) {
        setPoDetails(poRes.purchaseOrder);
      } else {
        throw new Error(poRes.message || "Failed to fetch purchase order.");
      }

      if (catRes.success && Array.isArray(catRes.categoryPurchaseOrders)) {
        setCategoryItems(catRes.categoryPurchaseOrders);
      } else {
        throw new Error(catRes.message || "Failed to fetch category items.");
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Unknown error occurred.");
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();

    // === COMPANY HEADER (CENTER) ===
    doc.setFontSize(18);
    doc.text("New Universe Corporate Clothing H (Pvt) Ltd", 105, 10, {
      align: "center",
    });

    // Smaller font for contact info
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
      {
        align: "center",
      }
    );

    // Title
    doc.setFontSize(10);
    doc.text("Rent Machine Purchase Order", 105, 30, {
      align: "center",
    });

    // Optional: separator line
    doc.line(10, 34, 200, 34); // Horizontal line from left (x=10) to right (x=200)

    // === BARCODE IMAGE (TOP RIGHT CORNER) ===
    const barcodeImage = getBarcodeImage();
    doc.addImage(barcodeImage, "PNG", 5, 10, 35, 20); // NEW - left corner

    // === PO DETAILS ===
    let y = 45;
    const leftX = 14;
    const rightX = 110; // Adjust for spacing
    const rowHeight = 7;
    const blockHeight = rowHeight * 7 + 6; // increased to fit extra rows

    // Draw border rectangle around PO details
    doc.setDrawColor(0); // black border
    doc.rect(leftX - 4, y - 6, 190, blockHeight); // x, y, width, height (adjust width as needed)

    // 👇 Set smaller font size
    doc.setFontSize(8);

    if (poDetails) {
      // Left column
      doc.setFont(undefined, "bold");
      doc.text("PO ID:", leftX, y);
      doc.text("Supplier:", leftX, y + rowHeight);
      doc.setFont(undefined, "normal");
      doc.text(`${poDetails.POID}`, leftX + 25, y);

      // Supplier info lines
      const supplierInfoY = y + rowHeight + 3;
      const lineSpacing = 4.5;
      doc.text(poDetails.Supplier?.name || "", leftX + 25, supplierInfoY);
      doc.text(
        poDetails.Supplier?.address || "",
        leftX + 25,
        supplierInfoY + lineSpacing
      );
      doc.text(
        poDetails.Supplier?.contact || "",
        leftX + 25,
        supplierInfoY + lineSpacing * 2
      );

      // Continue PO details
      const poDateY = supplierInfoY + lineSpacing * 2 + 4;
      doc.setFont(undefined, "bold");
      doc.text("PO Date:", leftX, poDateY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.date, leftX + 25, poDateY);

      const deliverToY = poDateY + rowHeight;
      doc.setFont(undefined, "bold");
      doc.text("Deliver To:", leftX, deliverToY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.deliver_to, leftX + 25, deliverToY);

      const instructionY = deliverToY + rowHeight;
      doc.setFont(undefined, "bold");
      doc.text("Instructions:", leftX, instructionY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.instruction, leftX + 25, instructionY);

      const SVATY = instructionY + rowHeight;
      doc.setFont(undefined, "bold");
      doc.text("Sup SVAT:", leftX, SVATY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.Supplier.svatno, leftX + 25, SVATY);

      // Right column
      let rightY = y;
      doc.setFont(undefined, "bold");
      doc.text("Invoice To:", rightX, rightY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.invoice_to, rightX + 40, rightY);

      rightY += rowHeight;
      doc.setFont(undefined, "bold");
      doc.text("Payment Method:", rightX, rightY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.payment_mode, rightX + 40, rightY);

      rightY += rowHeight;
      doc.setFont(undefined, "bold");
      doc.text("Payment Term:", rightX, rightY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.payment_term, rightX + 40, rightY);

      rightY += rowHeight;
      doc.setFont(undefined, "bold");
      doc.text("Attention:", rightX, rightY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.attention, rightX + 40, rightY);

      rightY += rowHeight;
      doc.setFont(undefined, "bold");
      doc.text("Delivery Date:", rightX, rightY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.delivery_date, rightX + 40, rightY);

      rightY += rowHeight;
      doc.setFont(undefined, "bold");
      doc.text("VAT NO:", rightX, rightY);
      doc.setFont(undefined, "normal");
      doc.text(poDetails.Supplier.vatno, rightX + 40, rightY);

      y += blockHeight + 5; // update y for next section
    }

    // === TABLE BODY ===
    const tableBody = categoryItems.map((item) => {
      const qty = Number(item.Qty) || 0;
      const cost = Number(item.PerDay_Cost) || 0;
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
        item.Category?.cat_name || "-",
        item.description || "-", // New: Description column
        item.from_date,
        item.to_date,
        days.toString(), // <-- Add days here as a string
        qty, // Moved: Quantity after From
        cost.toFixed(2),
        discount.toFixed(2),
        discountAmount.toFixed(2),
        total.toFixed(2),
      ];
    });

    // === AUTO TABLE ===
    autoTable(doc, {
      startY: y,
      head: [
        [
          "Category",
          "Description", // New column
          "From",
          "To",
          "No. of Days", // New column
          "Quantity", // Reordered
          "Cost / Day",
          "Discount (%)",
          "Discount Amount",
          "Total Price",
        ],
      ],
      body: tableBody,
      styles: {
        fontSize: 7, // <-- reduce font size here
        cellPadding: 2,
        textColor: 20, // optional: reduce cell padding
      },
      headStyles: {
        fontSize: 8, // optional: slightly larger header font

        textColor: 20,
        halign: "center",
      },
      theme: "grid",
      margin: { left: 14, right: 14 },
      didDrawPage: function (data) {
        const finalY = data.cursor.y;

        // === Recalculate Subtotal and Tax from categoryItems ===
        let calculatedSubtotal = 0;
        const taxRate = 18;
        let taxAmount = 0;

        categoryItems.forEach((item) => {
          const qty = Number(item.Qty) || 0;
          const cost = Number(item.PerDay_Cost) || 0;
          const discount = Number(item.d_percent) || 0;

          const fromDate = new Date(item.from_date);
          const toDate = new Date(item.to_date);
          const timeDiff = toDate.getTime() - fromDate.getTime();
          const numberOfDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

          const gross = qty * cost * numberOfDays;
          const discountAmount = (gross * discount) / 100;
          const total = gross - discountAmount;

          calculatedSubtotal += total;
        });

        taxAmount = (calculatedSubtotal * taxRate) / 100;

        // === SMALL SUMMARY TABLE (Right Corner) ===
        const summaryTableX = 125;
        const summaryTableY = finalY + 10;
        const summaryTableWidth = 70;
        const rowHeight = 6;

        const labelColWidth = 40;
        const valueColWidth = 30;

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");

        // Subtotal row
        doc.rect(summaryTableX, summaryTableY, labelColWidth, rowHeight);
        doc.rect(
          summaryTableX + labelColWidth,
          summaryTableY,
          valueColWidth,
          rowHeight
        );
        doc.text("Subtotal:", summaryTableX + 2, summaryTableY + 4.5);
        doc.text(
          `Rs. ${calculatedSubtotal.toFixed(2)}`,
          summaryTableX + labelColWidth + valueColWidth - 2,
          summaryTableY + 4.5,
          { align: "right" }
        );

        // Tax row (VAT or SVAT)
        let taxLabel = "";
        if (poDetails.is_vat) {
          taxLabel = `Tax VAT (${taxRate}%)`;
        } else if (poDetails.is_svat && !poDetails.is_vat) {
          taxLabel = `Tax SVAT (${taxRate}%)`;
        }

        let y = summaryTableY + rowHeight; // track vertical position

        if (taxLabel) {
          doc.rect(summaryTableX, y, labelColWidth, rowHeight);
          doc.rect(summaryTableX + labelColWidth, y, valueColWidth, rowHeight);
          doc.text(taxLabel + ":", summaryTableX + 2, y + 4.5);
          doc.text(
            `Rs. ${taxAmount.toFixed(2)}`,
            summaryTableX + labelColWidth + valueColWidth - 2,
            y + 4.5,
            { align: "right" }
          );

          y += rowHeight;
        }

        // === FOOTER INSTRUCTION PARAGRAPH ===
        const instructionText =
          "*** Please supply in accordance with the following instructions.\n" +
          "Please indicate our purchase order number in all invoices, proforma invoices, dispatch notes and all correspondence.\n" +
          "Deliver to above mentioned destination and invoices to the said party.\n" +
          "Payment will be made strictly up to the quantity and the relevant value of the purchase order. ***";

        doc.setFontSize(7);
        doc.setFont(undefined, "normal");

        const paragraphY = y + 5; // now dynamically placed below the summary table
        const paragraphX = 20;

        const wrappedText = doc.splitTextToSize(instructionText, 175);
        doc.text(wrappedText, paragraphX, paragraphY);

        // === FOOTER SIGNATURE SECTION ===
        doc.setFontSize(11);

        const sigY = y + 25;
        const pageWidth = doc.internal.pageSize.getWidth();
        const totalWidth = 180;
        const leftPadding = (pageWidth - totalWidth) / 2;
        const blockWidth = 60;

        const preparedX = leftPadding;
        const approvedX = leftPadding + blockWidth;
        const authorizedX = leftPadding + blockWidth * 2;

        doc.setFont(undefined, "normal");

        function centerText(text, x, y, width) {
          const textWidth = doc.getTextWidth(text);
          const centeredX = x + (width - textWidth) / 2;
          doc.text(text, centeredX, y);
        }

        centerText("Prepared By:", preparedX, sigY, blockWidth);
        centerText("Approved By:", approvedX, sigY, blockWidth);
        centerText("Authorized By:", authorizedX, sigY, blockWidth);

        doc.setFontSize(10);

        centerText(
          poDetails.Employee?.name || "N/A",
          preparedX,
          sigY + 10,
          blockWidth
        );
        centerText(
          "..............................",
          approvedX,
          sigY + 10,
          blockWidth
        );
        centerText(
          "..............................",
          authorizedX,
          sigY + 10,
          blockWidth
        );

        doc.setLineWidth(0.1);
        doc.line(
          preparedX + 5,
          sigY + 15,
          preparedX + blockWidth - 5,
          sigY + 15
        );
        doc.line(
          approvedX + 5,
          sigY + 15,
          approvedX + blockWidth - 5,
          sigY + 15
        );
        doc.line(
          authorizedX + 5,
          sigY + 15,
          authorizedX + blockWidth - 5,
          sigY + 15
        );
      },
    });

    // === SAVE ===
    doc.save(`PurchaseOrder-${poDetails?.POID || "Unknown"}.pdf`);
  };

  return (
    <div className="po-print-content">
      <div className="po-report-wrapper">
        <div className="po-report-container">
          <div className="po-report-header">
            <div className="po-report-header-content">
              <div className="barcode-container">
                <canvas ref={barcodeRef}></canvas>
              </div>

              <div className="company-details">
                <h2>New Universe Corporate Clothing H Pvt Ltd</h2>
                <p>21/4, Polhengoda Gardens, Colombo 05, Sri Lanka</p>
                <p>Tel: +94 702250093 &nbsp; | &nbsp; Fax: 11282336</p>
                <p>
                  Email: newunive@gmail.com &nbsp; | &nbsp; Web:
                  www.newuniverse.lk
                </p>
                <h3>PURCHASE ORDER</h3>
                <p>PO NO : {poId}</p>
              </div>
            </div>
            {/* NEW top right corner content */}
            <div className="top-right-corner">
              <button
                onClick={handleDownload}
                title="Download PDF"
                className="icon-button"
              >
                🡇
              </button>
              <button onClick={() => window.print()} className="print-button">
                🖨️
              </button>
            </div>
            <hr style={{ marginTop: "20px" }} />
          </div>

          {error && (
            <div className="error-message">
              <p style={{ color: "red" }}>⚠️ {error}</p>
            </div>
          )}

          {poDetails && (
            <>
              <div className="po-report-labels">
                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Supplier:</strong>
                    <div className="po-label-value">
                      <div>{poDetails.Supplier?.name}</div>
                      <div>{poDetails.Supplier?.address}</div>
                      <div>{poDetails.Supplier?.contact}</div>
                    </div>
                  </div>
                </div>
                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Deliver To:</strong>
                    <span className="po-label-value">
                      {poDetails.deliver_to}
                    </span>
                  </div>
                </div>
                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Supplier SVAT:</strong>

                    <span className="po-label-value">
                      {poDetails.Supplier.svatno}
                    </span>
                  </div>
                </div>

                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Invoice To:</strong>
                    <span className="po-label-value">
                      {poDetails.invoice_to}
                    </span>
                  </div>
                </div>
                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Supplier VAT:</strong>

                    <span className="po-label-value">
                      {poDetails.Supplier.vatno}
                    </span>
                  </div>
                </div>

                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Attention:</strong>
                    <span className="po-label-value">
                      {poDetails.attention}
                    </span>
                  </div>
                </div>

                <div className="po-label">
                  <div className="po-label-row">
                    <strong>PO Date:</strong>
                    <span className="po-label-value">{poDetails.date}</span>
                  </div>
                </div>

                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Delivery Date:</strong>
                    <span className="po-label-value">
                      {poDetails.delivery_date}
                    </span>
                  </div>
                </div>

                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Payment Method:</strong>
                    <span className="po-label-value">
                      {poDetails.payment_mode}
                    </span>
                  </div>
                </div>
                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Payment Term:</strong>
                    <span className="po-label-value">
                      {poDetails.payment_term}
                    </span>
                  </div>
                </div>

                <div className="po-label">
                  <div className="po-label-row">
                    <strong>Instruction:</strong>
                    <span className="po-label-value">
                      {poDetails.instruction}
                    </span>
                  </div>
                </div>

                <div className="po-label">
                  <div className="po-label-row">
                    <strong>PR No's:</strong>
                    <span className="po-label-value">{poDetails.pr_nos}</span>
                  </div>
                </div>
              </div>

              {categoryItems.length > 0 && (
                <>
                  <table className="po-report-table">
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
                    <tbody>
                      {categoryItems.map((item, index) => {
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
                          const qty = Number(item.Qty) || 0;
                          const cost = Number(item.PerDay_Cost) || 0;
                          const discount = Number(item.d_percent) || 0;

                          const fromDate = new Date(item.from_date);
                          const toDate = new Date(item.to_date);
                          const timeDiff =
                            toDate.getTime() - fromDate.getTime();
                          const numberOfDays =
                            Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

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
                              }}
                            >
                              <span>Subtotal:</span>
                              <span>Rs. {subtotal.toFixed(2)}</span>
                            </div>

                            {poDetails.is_vat && (
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

                            {poDetails.is_svat && !poDetails.is_vat && (
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
                className="po-signatures-row"
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
                      {poDetails.Employee?.name || "N/A"}
                    </div>
                    <div
                      style={{
                        borderTop: "2px dotted #000",
                        width: "200px",
                        marginTop: "5px",
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  Authorized By:
                  <div
                    style={{
                      marginTop: "40px",
                      borderTop: "2px dotted #000",
                      width: "200px",
                    }}
                  ></div>
                </div>
                <div>
                  Approved By:
                  <div
                    style={{
                      marginTop: "40px",
                      borderTop: "2px dotted #000",
                      width: "200px",
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

export default PurchaseOrderReport;
