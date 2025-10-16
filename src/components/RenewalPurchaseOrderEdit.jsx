import React, { useEffect, useState } from "react";
import "./RenewalPurchaseOrderEdit.css";
import { useParams, useNavigate } from "react-router-dom";

import {
  purchaseOrderByPoId,
  updateEntirePurchaseOrderbyPoId,
} from "../controller/PurchaseOrderController";
import { getCategories } from "../controller/CategoryController";
import { getAllSuppliers } from "../controller/RentMachineController";
import { usePageTitle } from "../utility/usePageTitle";

import {
  getRenewalPurchaseOrderMachinesByPoId,
  deleteRenewalPurchaseOrderMachine,
  bulkRenewalPurchaseOrderUpdateCreate,
} from "../controller/RenewalPurchaseOrderController";

import { getAllRentMachineLifeExpired } from "../controller/RentMachineLifeController";

const initialRow = {
  category: "",
  description: "",
  machines: 0,
  costPerDay: 0,
  discount: 0,
  fromDate: "",
  toDate: "",
  total: 0,
};

const RenewalPurchaseOrderEdit = () => {
  const { poNo } = useParams();
  const poId = poNo.replace("-", "/");
  const navigate = useNavigate();
  const [, setPageTitle] = usePageTitle();
  const [rows, setRows] = useState([{ ...initialRow }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [taxOption, setTaxOption] = useState("");
  const [categoryItems, setCategoryItems] = useState([]);
  const [rentMachines, setRentMachines] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const invoiceOptions = [
    "New Universe Corporate Head Office Borella",
    "New Universe Bakamuna01 Factory",
    "New Universe Bakamuna02 Factory",
    "New Universe Hettipola Factory",
    "New Universe Piliyandala Factory",
    "New Universe Mathara Factory",
    "New Universe Welioya Factory",
    "New Universe Kaduwela Stores",
  ];

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    if (poId) {
      fetchData(poId);
    }
  }, [poId]);
  useEffect(() => {
    setPageTitle("Renewal Rent Machine PO EDIT");
  }, [setPageTitle]);

  const fetchRentMachines = async () => {
    // ✅ Get current supplier and user branch
    const selectedSupplierId = Number(purchaseOrder?.supplier);
    const userBranchId = Number(localStorage.getItem("userBranchId"));
    try {
      const res = await getAllRentMachineLifeExpired();
      if (res.success && Array.isArray(res.data)) {
        // return res.data.map((item) => ({
        //   id: item.RentMachine.rent_item_id,
        //   serial_no: item.RentMachine.serial_no,
        //   name: item.RentMachine.name,
        //   perDayCost: item.RentMachine.rent_cost_per_day || 0, // optional
        //   rawData: item, // store full data if needed
        // }));
        return res.data
          .filter(
            (item) =>
              item.RentMachine &&
              item.RentMachine.sup_id === selectedSupplierId && // filter by supplier
              item.Branch &&
              item.Branch.branch_id === userBranchId // filter by branch
          )
          .map((item) => ({
            id: item.RentMachine.rent_item_id,
            serial_no: item.RentMachine.serial_no,
            name: item.RentMachine.name,
            perDayCost: item.RentMachine.rent_cost_per_day || 0,
            rawData: item,
          }));
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch expired machines:", err);
      return [];
    }
  };

  // useEffect(() => {
  //   const loadMachines = async () => {
  //     const machines = await fetchRentMachines(); // call the separate function here
  //     setRentMachines(machines);
  //   };

  //   loadMachines();
  // }, []);
  useEffect(() => {
    if (!purchaseOrder?.supplier) return;

    const loadMachines = async () => {
      const machines = await fetchRentMachines();
      setRentMachines(machines);
    };

    loadMachines();
  }, [purchaseOrder?.supplier]);

  const fetchData = async () => {
    try {
      const [supplierData, categoryData, poData, renewalRes] =
        await Promise.all([
          getAllSuppliers(),
          getCategories(),
          purchaseOrderByPoId(poId),
          getRenewalPurchaseOrderMachinesByPoId(poId),
        ]);

      setSuppliers(supplierData.suppliers);
      setCategories(categoryData.categories);

      // ✅ Set PO details
      if (poData && poData.purchaseOrder) {
        const po = poData.purchaseOrder;

        setPurchaseOrder({
          supplier: po.supplier_id || "",
          deliverTo: po.deliver_to || "",
          attention: po.attention || "",
          poDate: po.date || "",
          deliveryDate: po.delivery_date || "",
          paymentMethod: po.payment_mode || "",
          paymentTerm: po.payment_term || "",
          instruction: po.instruction || "",
          invoiceTo: po.invoice_to || "",
          prNos: po.pr_nos || "",
        });

        if (po.is_svat) setTaxOption("SVAT");
        else if (po.is_vat) setTaxOption("VAT");
      }

      // ✅ Map RenewalPurchaseOrderMachines into table rows
      if (renewalRes.success && Array.isArray(renewalRes.poMachineRenewals)) {
        const mappedRows = renewalRes.poMachineRenewals.map((item) => {
          const days =
            item.from_date && item.to_date
              ? Math.max(
                  1,
                  Math.ceil(
                    (new Date(item.to_date) - new Date(item.from_date)) /
                      (1000 * 60 * 60 * 24)
                  ) + 1
                )
              : 1;

          const total =
            (item.qty || 0) *
            (item.perday_cost || 0) *
            days *
            (1 - (item.d_percent || 0) / 100);

          return {
            mr_id: item.mr_id, // ✅ keep reference for delete
            category: item.RentMachine?.cat_id || "",
            description: item.description || "",
            machines: item.qty || 0,
            costPerDay: item.perday_cost || 0,
            discount: item.d_percent || 0,
            fromDate: item.from_date || "",
            toDate: item.to_date || "",
            total,
            rent_item_id: item.rent_item_id, // keep machine reference
            serialNo: item.RentMachine?.serial_no || "",
            machineName: item.RentMachine?.name || "",
          };
        });

        setRows(mappedRows); // ✅ this fills your table
      } else {
        throw new Error(renewalRes.message || "Failed to fetch renewal items.");
      }
    } catch (err) {
      console.error("❌ Failed to fetch PO data:", err);
    }
  };

  // ---------------- Form Handlers ----------------
  const handlePOChange = (field, value) => {
    setPurchaseOrder((prev) => ({ ...prev, [field]: value }));

    /*this part is for update the suppliers vat option only*/
    if (field === "supplier") {
      const selectedSupplier = suppliers.find(
        (s) => s.supplier_id === Number(value)
      );

      if (selectedSupplier) {
        // Update tax option dynamically based on supplier
        if (selectedSupplier.svatno) {
          setTaxOption("SVAT");
        } else if (selectedSupplier.vatno) {
          setTaxOption("VAT");
        } else {
          setTaxOption(""); // no tax option
        }

        // Optionally, clear any existing 'toDate' values in rows
        setRows((prevRows) =>
          prevRows.map((row) => ({
            ...row,
            toDate: "",
          }))
        );
      } else {
        setTaxOption("");
      }
    }
  };

  // ---------------- Table Handlers ----------------
  const addRow = () => {
    setShowPopup(true);
  };
  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (
      ["machines", "costPerDay", "discount", "fromDate", "toDate"].includes(
        field
      )
    ) {
      const from = new Date(updatedRows[index].fromDate);
      const to = new Date(updatedRows[index].toDate);

      const days =
        isNaN(from) || isNaN(to) || from > to
          ? 0
          : Math.max((to - from) / (1000 * 3600 * 24) + 1, 0);

      const rawCost =
        updatedRows[index].machines * updatedRows[index].costPerDay * days;
      const discountAmount =
        (Number(updatedRows[index].discount) / 100) * rawCost;
      updatedRows[index].total = rawCost - discountAmount;
    }

    setRows(updatedRows);
  };

  const totalSum = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);

  // ---------------- Submit Handler ----------------
  const handleSubmit = async () => {
    if (!purchaseOrder) return;

    setIsSubmitting(true);
    try {
      const payloadPO = {
        ...purchaseOrder,
        poId,
        is_vat: taxOption === "VAT",
        is_svat: taxOption === "SVAT",
        supplier_id: purchaseOrder.supplier,
        status: "Pending",
      };

      const poUpdateRes = await updateEntirePurchaseOrderbyPoId(
        poId,
        payloadPO
      );

      if (!poUpdateRes.success) {
        alert("⚠️ Failed to update Purchase Order: " + poUpdateRes.message);
        setIsSubmitting(false);
        return;
      }

      const bulkPayload = rows.map((row) => ({
        ...(row.mr_id ? { mr_id: row.mr_id } : {}), // only include mr_id if it's an update
        po_id: poId, // matches your Postman payload
        rent_item_id: row.rent_item_id, // instead of cat_id
        from_date: row.fromDate,
        to_date: row.toDate,
        qty: row.machines,
        perday_cost: row.costPerDay,
        d_percent: row.discount,
        description: row.description,
      }));

      if (bulkPayload.length > 0) {
        const res = await bulkRenewalPurchaseOrderUpdateCreate(bulkPayload);

        if (res.success) {
          alert("✅ Purchase Order and Renewal Items updated successfully!");
          window.location.reload();
        } else {
          alert("⚠️ Failed to update Renewal items: " + res.message);
        }
      } else {
        alert("✅ Purchase Order updated successfully!");
        const safePoId = poId.replace("/", "-");
        navigate(`/rentmachines/renewalporeports/${safePoId}`);
      }
    } catch (err) {
      console.error("❌ Failed to update PO and Renewal items:", err);
      alert("❌ Error updating PO. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (mr_id, index) => {
    try {
      if (!window.confirm("❌ Are you sure you want to delete this item?"))
        return;

      const res = await deleteRenewalPurchaseOrderMachine(mr_id);

      if (res.success) {
        setRows((prev) => prev.filter((_, i) => i !== index));
        alert("✅ Renewal Purchase Order Machine deleted successfully!");
      } else {
        alert("⚠️ Failed to delete: " + res.message);
      }
    } catch (err) {
      console.error("❌ Failed to delete Renewal Purchase Order Machine:", err);
      alert(
        "❌ Error deleting Renewal Purchase Order Machine. Please try again."
      );
    }
  };

  const handleSave = async () => {
    if (!purchaseOrder) return;

    setIsSubmitting(true);
    try {
      const payloadPO = {
        ...purchaseOrder,
        poId,
        is_vat: taxOption === "VAT",
        is_svat: taxOption === "SVAT",
        supplier_id: purchaseOrder.supplier,
        status: "Saved",
      };

      console.log(payloadPO);

      const poUpdateRes = await updateEntirePurchaseOrderbyPoId(
        poId,
        payloadPO
      );

      if (!poUpdateRes.success) {
        alert("⚠️ Failed to update Purchase Order: " + poUpdateRes.message);
        setIsSubmitting(false);
        return;
      }

      const bulkPayload = rows.map((row) => ({
        ...(row.mr_id ? { mr_id: row.mr_id } : {}), // only include mr_id if it's an update
        po_id: poId, // matches your Postman payload
        rent_item_id: row.rent_item_id, // instead of cat_id
        from_date: row.fromDate,
        to_date: row.toDate,
        qty: row.machines,
        perday_cost: row.costPerDay,
        d_percent: row.discount,
        description: row.description,
      }));

      if (bulkPayload.length > 0) {
        const res = await bulkRenewalPurchaseOrderUpdateCreate(bulkPayload);

        if (res.success) {
          alert("✅ Purchase Order and Renewal Items updated successfully!");
          window.location.reload();
        } else {
          alert("⚠️ Failed to update Renewal items: " + res.message);
        }
      } else {
        alert("✅ Purchase Order updated successfully!");
        const safePoId = poId.replace("/", "-");
        navigate(`/rentmachines/renewalporeports/${safePoId}`);
      }
    } catch (err) {
      console.error("❌ Failed to update PO and Renewal  items:", err);
      alert("❌ Error updating PO. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMachine = (machine) => {
    // Prevent duplicates
    if (rows.some((r) => r.rent_item_id === machine.id)) return;

    const newRow = {
      category: machine.rawData.RentMachine?.cat_id || "",
      description: "",
      machines: 1,
      costPerDay: machine.perDayCost || 0,
      discount: 0,
      fromDate: "",
      toDate: "",
      total: 0,
      rent_item_id: machine.id,
      serialNo: machine.serial_no,
      machineName: machine.name,
    };

    setRows((prev) => [...prev, newRow]);
    setShowPopup(false);
  };

  const handleClearRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };
  if (!purchaseOrder) return <p>Loading PO details...</p>;

  const handleToDateChange = (index, value) => {
    const selectedSupplier = suppliers.find(
      (s) => s.supplier_id === Number(purchaseOrder.supplier)
    );
    if (!selectedSupplier) return;

    const fromDate = new Date(rows[index].fromDate);
    const toDate = new Date(value);

    if (selectedSupplier.is_monthly_payment) {
      const dayDiff = Math.ceil((toDate - fromDate) / (1000 * 3600 * 24)) + 1;

      if (dayDiff !== 15 && dayDiff !== 30) {
        alert(
          "For monthly suppliers, 'To Date' must be exactly 15 or 30 days from 'From Date'."
        );
        return; // ignore invalid change
      }
    }

    // ✅ Update normally if valid
    handleChange(index, "toDate", value);
  };

  return (
    <div className="renewal-po-edit-wrapper">
      <div className="renewal-po-edit-top-section">
        <form
          className="renewal-po-edit-form-grid"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Supplier */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">Supplier</label>
            <select
              className="renewal-po-edit-input"
              value={purchaseOrder.supplier}
              onChange={(e) => {
                handlePOChange("supplier", e.target.value);

                // 🧹 If supplier changes, clear all rows
                setRows([]);
              }}
              required
              disabled={rows.length > 0} // 🔒 disable when table has data
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* PO Date */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">PO Date</label>
            <input
              type="date"
              className="renewal-po-edit-input"
              value={purchaseOrder.poDate}
              onChange={(e) => handlePOChange("poDate", e.target.value)}
              required
            />
          </div>

          {/* Delivery Date */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">Delivery Date</label>
            <input
              type="date"
              className="renewal-po-edit-input"
              value={purchaseOrder.deliveryDate}
              onChange={(e) => handlePOChange("deliveryDate", e.target.value)}
            />
          </div>

          {/* Deliver To */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">Deliver To</label>
            <select
              className="renewal-po-edit-input"
              value={purchaseOrder.deliverTo}
              onChange={(e) => handlePOChange("deliverTo", e.target.value)}
            >
              <option value="">Select Delivery Location</option>
              {invoiceOptions.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice To */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">Invoice To</label>
            <select
              className="renewal-po-edit-input"
              value={purchaseOrder.invoiceTo}
              onChange={(e) => handlePOChange("invoiceTo", e.target.value)}
            >
              <option value="">Select Invoice To</option>
              {invoiceOptions.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">Payment Method</label>
            <select
              className="renewal-po-edit-select"
              value={purchaseOrder.paymentMethod}
              onChange={(e) => handlePOChange("paymentMethod", e.target.value)}
            >
              <option value="">Select</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Attention */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">Attention</label>
            <input
              type="text"
              className="renewal-po-edit-input"
              value={purchaseOrder.attention}
              onChange={(e) => handlePOChange("attention", e.target.value)}
            />
          </div>

          {/* Payment Term */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">Payment Term</label>
            <input
              type="text"
              className="renewal-po-edit-input"
              value={purchaseOrder.paymentTerm}
              onChange={(e) => handlePOChange("paymentTerm", e.target.value)}
            />
          </div>

          {/* Instruction */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">Instruction</label>
            <textarea
              className="renewal-po-edit-textarea"
              rows={1}
              value={purchaseOrder.instruction}
              onChange={(e) => handlePOChange("instruction", e.target.value)}
            />
          </div>

          {/* PR Nos */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">PR Nos</label>
            <input
              type="text"
              className="renewal-po-edit-input"
              value={purchaseOrder.prNos}
              onChange={(e) => handlePOChange("prNos", e.target.value)}
            />
          </div>

          {/* Tax Option */}
          <div className="renewal-po-edit-field-group">
            <label className="renewal-po-edit-label">Tax Option</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {(() => {
                const selectedSupplier = suppliers.find(
                  (s) => s.supplier_id === Number(purchaseOrder.supplier)
                );

                if (!selectedSupplier) return <span>Select a supplier</span>;
                if (selectedSupplier?.svatno)
                  return <strong>SVAT No: {selectedSupplier.svatno}</strong>;
                if (selectedSupplier?.vatno)
                  return <strong>VAT No: {selectedSupplier.vatno}</strong>;
                return <span>No VAT or SVAT registered</span>;
              })()}
            </div>
          </div>
        </form>
      </div>

      {/* ---------------- Table Section ---------------- */}
      <div className="renewal-po-edit-form-card">
        <div className="renewal-po-edit-header-row">
          <div className="renewal-po-edit-action-buttons">
            <button className="renewal-po-edit-button-add" onClick={addRow}>
              ➕ Add Row
            </button>

            <div className="renewal-po-edit-right-buttons">
              <button
                className="renewal-po-edit-button-approval"
                onClick={handleSubmit}
              >
                📨 Send To Approval
              </button>
              <button
                className="renewal-po-edit-button-save"
                onClick={handleSave}
              >
                💾 Save
              </button>
            </div>
          </div>
        </div>

        <div className="renewal-po-edit-table-container">
          <table className="renewal-po-edit-table">
            <thead>
              <tr>
                <th>Serial No</th>
                <th>Machine</th>
                <th>Description</th>
                 
                <th>Per Day Cost</th>
                <th>Discount (%)</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>No Of Days</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    style={{ textAlign: "center", color: "#666" }}
                  >
                    No items to display
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.serialNo}</td>
                    <td>{row.machineName}</td>
                    <td>
                      <input
                        type="text"
                        value={row.description || ""}
                        onChange={(e) =>
                          handleChange(i, "description", e.target.value)
                        }
                      />
                    </td>
                    {/* <td>
                      <input
                        type="number"
                        value={row.machines}
                        onChange={(e) =>
                          handleChange(i, "machines", e.target.value)
                        }
                      />
                    </td> */}
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={row.costPerDay}
                        onChange={(e) =>
                          handleChange(i, "costPerDay", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={row.discount}
                        onChange={(e) =>
                          handleChange(i, "discount", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={row.fromDate}
                        min={new Date().toISOString().split("T")[0]} // today's date in YYYY-MM-DD forma
                        onChange={(e) =>
                          handleChange(i, "fromDate", e.target.value)
                        }
                      />
                    </td>
                    {/* <td>
                      <input
                        type="date"
                        value={row.toDate}
                        onChange={(e) =>
                          handleChange(i, "toDate", e.target.value)
                        }
                      />
                    </td>
                     */}

                    <td>
                      <input
                        type="date"
                        value={row.toDate}
                        disabled={!row.fromDate}
                        min={row.fromDate}
                        max={(() => {
                          const selectedSupplier = suppliers.find(
                            (s) =>
                              s.supplier_id === Number(purchaseOrder.supplier)
                          );
                          if (!row.fromDate || !selectedSupplier) return "";

                          const fromDateObj = new Date(row.fromDate);

                          if (selectedSupplier.is_monthly_payment) {
                            // Max 30 days from fromDate
                            const max30 = new Date(fromDateObj);
                            max30.setDate(max30.getDate() + 29);
                            return max30.toISOString().split("T")[0]; // ✅ string
                          } else {
                            // Daily supplier, max 31 days
                            const maxDaily = new Date(fromDateObj);
                            maxDaily.setDate(maxDaily.getDate() + 31);
                            return maxDaily.toISOString().split("T")[0]; // ✅ string
                          }
                        })()}
                        onChange={(e) => handleToDateChange(i, e.target.value)}
                      />
                    </td>

                    <td>
                      {row.fromDate && row.toDate
                        ? Math.ceil(
                            (new Date(row.toDate) - new Date(row.fromDate)) /
                              (1000 * 60 * 60 * 24) +
                              1
                          )
                        : 0}
                    </td>

                    <td>LKR {row.total.toFixed(2)}</td>
                    <td>
                      {row.mr_id ? (
                        <button
                          className="renewal-po-edit-btn renewal-po-edit-btn-delete"
                          onClick={() => handleDelete(row.mr_id, i)}
                        >
                          ❌ Delete
                        </button>
                      ) : (
                        <>
                          <button
                            className="renewal-po-edit-btn renewal-po-edit-btn-clear"
                            onClick={() => handleClearRow(i)}
                          >
                            🧹 Clear
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="renewal-purchaseorder-button-row">
          <div className="renewal-purchaseorder-total">
            Total: LKR {totalSum.toFixed(2)}
          </div>
        </div>
      </div>
      {isSubmitting && (
        <div className="renewal-po-edit-loading-overlay">
          <div className="renewal-po-edit-loading-spinner">
            <p>Updating...</p>
          </div>
        </div>
      )}

      {/* 🔲 Popup for selecting rent machines */}
      {showPopup && (
        <div className="renewalPurchaseOrder-loading-overlay">
          <div className="renewalPurchaseOrder-loading-spinner">
            <h3>Select Rent Machine</h3>

            {/* 🔍 Search Bar */}
            <input
              type="text"
              placeholder="Search by name or serial no"
              className="renewalPurchaseOrder-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
            />

            <table className="renewalPurchaseOrder-table">
              <thead>
                <tr>
                  <th>RENT ID</th>
                  <th>Machine</th>
                  <th>Serial No</th>
                  <th>Exp Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rentMachines
                  .filter(
                    (rm) =>
                      rm.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      rm.serial_no
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      rm.id.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((rm) => {
                    const alreadyInPO = rows.some(
                      (row) => row.rent_item_id === rm.id
                    );

                    return (
                      <tr key={rm.id}>
                        <td>{rm.id}</td>
                        <td>{rm.name}</td>
                        <td>{rm.serial_no}</td>
                        <td>{rm.rawData.to_date}</td>
                        <td>
                          <button
                            onClick={() => handleAddMachine(rm)}
                            className="renewalPurchaseOrder-button-submit"
                            disabled={alreadyInPO}
                          >
                            {alreadyInPO ? "Already Added" : "Select"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            <button
              onClick={() => setShowPopup(false)}
              className="renewalPurchaseOrder-button-submit"
              style={{ marginTop: "1rem" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenewalPurchaseOrderEdit;
