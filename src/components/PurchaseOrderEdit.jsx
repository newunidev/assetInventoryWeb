import React, { useEffect, useState } from "react";
import "./PurchaseOrderEdit.css";
import { useParams, useNavigate } from "react-router-dom";

import {
  purchaseOrderByPoId,
  updateEntirePurchaseOrderbyPoId,
} from "../controller/PurchaseOrderController";
import { getCategories } from "../controller/CategoryController";
import { getAllSuppliers } from "../controller/RentMachineController";
import { usePageTitle } from "../utility/usePageTitle";
import {
  categoryPurchaseOrderByPoId,
  createCategoryPurchaseOrder,
  deleteCategoryPurchaseOrder,
  bulkCategoryPurchaseOrderUpdateCreate,
} from "../controller/CategoryPurchaseOrderController";

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

const PurchaseOrderEdit = () => {
  const { poId } = useParams();
  const navigate = useNavigate();
  const [, setPageTitle] = usePageTitle();
  const [rows, setRows] = useState([{ ...initialRow }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [taxOption, setTaxOption] = useState("");
  const [categoryItems, setCategoryItems] = useState([]);

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
    setPageTitle("Rent Machine PO EDIT");
  }, [setPageTitle]);

  const fetchData = async () => {
    try {
      const [supplierData, categoryData, poData, catRes] = await Promise.all([
        getAllSuppliers(),
        getCategories(),
        purchaseOrderByPoId(poId),
        categoryPurchaseOrderByPoId(poId),
      ]);

      setSuppliers(supplierData.suppliers);
      setCategories(categoryData.categories);

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

      // ✅ Map categoryPurchaseOrders into table rows
      if (catRes.success && Array.isArray(catRes.categoryPurchaseOrders)) {
        const mappedRows = catRes.categoryPurchaseOrders.map((item) => {
          const days =
            item.from_date && item.to_date
              ? Math.max(
                  1,
                  Math.ceil(
                    (new Date(item.to_date) - new Date(item.from_date)) /
                      (1000 * 60 * 60 * 24)
                  )
                )
              : 1;

          const total =
            (item.Qty || 0) *
            (item.PerDay_Cost || 0) *
            days *
            (1 - (item.d_percent || 0) / 100);

          return {
            cpo_id: item.cpo_id, // ✅ Keep reference for Delete
            category: item.cat_id,
            description: item.description || "",
            machines: item.Qty || 0,
            costPerDay: item.PerDay_Cost || 0,
            discount: item.d_percent || 0,
            fromDate: item.from_date || "",
            toDate: item.to_date || "",
            total,
          };
        });

        setRows(mappedRows); // ✅ this fills your table
      } else {
        throw new Error(catRes.message || "Failed to fetch category items.");
      }
    } catch (err) {
      console.error("❌ Failed to fetch PO data:", err);
    }
  };

  // ---------------- Form Handlers ----------------
  const handlePOChange = (field, value) => {
    //console.log("field:",field,"value:",value);
    setPurchaseOrder((prev) => ({ ...prev, [field]: value }));
  };

  // ---------------- Table Handlers ----------------
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        category: "",
        description: "",
        machines: 0,
        costPerDay: 0,
        discount: 0,
        fromDate: "",
        toDate: "",
        total: 0,
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    // Recalculate total when relevant fields change
    if (
      ["machines", "costPerDay", "discount", "fromDate", "toDate"].includes(
        field
      )
    ) {
      const from = new Date(updatedRows[index].fromDate);
      const to = new Date(updatedRows[index].toDate);

      // Calculate days. Ensure 'days' is at least 1 if valid dates are selected
      // and 'from' date is not after 'to' date.
      const days =
        isNaN(from) || isNaN(to) || from > to
          ? 0
          : Math.max((to - from) / (1000 * 3600 * 24) + 1, 0);

      const rawCost =
        updatedRows[index].machines * updatedRows[index].costPerDay * days;
      const discountAmount =
        (Number(updatedRows[index].discount) / 100) * rawCost; // Ensure discount is treated as number
      updatedRows[index].total = rawCost - discountAmount;
    }

    setRows(updatedRows);
  };
  // Calculate overall total for all rows
  const totalSum = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);

  // ---------------- Submit Handler ----------------
  const handleSubmit = async () => {
    if (!purchaseOrder) return;

    setIsSubmitting(true);
    try {
      // 1️⃣ Update main purchase order (entire update)
      const payloadPO = {
        ...purchaseOrder,
        poId,
        is_vat: taxOption === "VAT",
        is_svat: taxOption === "SVAT",
        supplier_id: purchaseOrder.supplier,
      };

      console.log("Payload Print",payloadPO);
      const poUpdateRes = await updateEntirePurchaseOrderbyPoId(
        poId,
        payloadPO
      );

      if (!poUpdateRes.success) {
        alert("⚠️ Failed to update Purchase Order: " + poUpdateRes.message);
        setIsSubmitting(false);
        return;
      }

      // 2️⃣ Prepare bulk category purchase orders payload
      const bulkPayload = rows.map((row) => ({
        ...(row.cpo_id ? { cpo_id: row.cpo_id } : {}), // include cpo_id if exists
        PO_id: poId,
        cat_id: row.category,
        Qty: row.machines,
        PerDay_Cost: row.costPerDay,
        d_percent: row.discount,
        from_date: row.fromDate,
        to_date: row.toDate,
        description: row.description,
      }));

      if (bulkPayload.length > 0) {
        const res = await bulkCategoryPurchaseOrderUpdateCreate(bulkPayload);

        if (res.success) {
          alert("✅ Purchase Order and Category Items updated successfully!");
          window.location.reload(); // optional: refresh to see updated data
        } else {
          alert("⚠️ Failed to update category items: " + res.message);
        }
      } else {
        alert("✅ Purchase Order updated successfully!");
        navigate(`/rentmachines/poreports/${encodeURIComponent(poId)}`);
      }
    } catch (err) {
      console.error("❌ Failed to update PO and category items:", err);
      alert("❌ Error updating PO. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete from DB + UI
  const handleDelete = async (cpo_id, index) => {
    try {
      if (!window.confirm("❌ Are you sure you want to delete this item?"))
        return;

      const res = await deleteCategoryPurchaseOrder(cpo_id);

      if (res.success) {
        // Remove the row from state
        setRows((prev) => prev.filter((_, i) => i !== index));
        alert("✅ Category Purchase Order deleted successfully!");
      } else {
        alert("⚠️ Failed to delete: " + res.message);
      }
    } catch (err) {
      console.error("❌ Failed to delete Category Purchase Order:", err);
      alert("❌ Error deleting Category Purchase Order. Please try again.");
    }
  };

  // Save new row to DB
  const handleSave = async (row, index) => {
    try {
      // Prepare payload based on your API requirements
      const payload = {
        PO_id: poId, // Make sure purchaseOrder is in scope
        cat_id: row.category,
        Qty: row.machines,
        PerDay_Cost: row.costPerDay,
        d_percent: row.discount,
        from_date: row.fromDate,
        to_date: row.toDate,
        description: row.description,
      };

      const res = await createCategoryPurchaseOrder(payload);

      if (res.success) {
        // Update the row with returned cpo_id
        setRows((prev) => {
          const updated = [...prev];
          updated[index] = { ...row, cpo_id: res.data?.cpo_id };
          return updated;
        });

        alert("✅ Category Purchase Order saved successfully!");
        // Refresh the page
        window.location.reload();
      } else {
        alert("⚠️ Failed to save Category Purchase Order: " + res.message);
      }
    } catch (err) {
      console.error("❌ Failed to save Category Purchase Order:", err);
      alert("❌ Error saving Category Purchase Order. Please try again.");
    }
  };

  if (!purchaseOrder) return <p>Loading PO details...</p>;

  return (
    <div className="po-edit-wrapper">
      <div className="po-edit-top-section">
        <form
          className="po-edit-form-grid"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Supplier */}
          <div className="po-edit-field-group">
            <label className="po-edit-label">Supplier</label>
            <select
              className="po-edit-input"
              value={purchaseOrder.supplier}
              onChange={(e) => handlePOChange("supplier", e.target.value)}
              required
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
          <div className="po-edit-field-group">
            <label className="po-edit-label">PO Date</label>
            <input
              type="date"
              className="po-edit-input"
              value={purchaseOrder.poDate}
              onChange={(e) => handlePOChange("poDate", e.target.value)}
              required
            />
          </div>

          {/* Delivery Date */}
          <div className="po-edit-field-group">
            <label className="po-edit-label">Delivery Date</label>
            <input
              type="date"
              className="po-edit-input"
              value={purchaseOrder.deliveryDate}
              onChange={(e) => handlePOChange("deliveryDate", e.target.value)}
            />
          </div>

          {/* Deliver To */}
          <div className="po-edit-field-group">
            <label className="po-edit-label">Deliver To</label>
            <select
              className="po-edit-input"
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
          <div className="po-edit-field-group">
            <label className="po-edit-label">Invoice To</label>
            <select
              className="po-edit-input"
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
          <div className="po-edit-field-group">
            <label className="po-edit-label">Payment Method</label>
            <select
              className="po-edit-select"
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
          <div className="po-edit-field-group">
            <label className="po-edit-label">Attention</label>
            <input
              type="text"
              className="po-edit-input"
              value={purchaseOrder.attention}
              onChange={(e) => handlePOChange("attention", e.target.value)}
            />
          </div>

          {/* Payment Term */}
          <div className="po-edit-field-group">
            <label className="po-edit-label">Payment Term</label>
            <input
              type="text"
              className="po-edit-input"
              value={purchaseOrder.paymentTerm}
              onChange={(e) => handlePOChange("paymentTerm", e.target.value)}
            />
          </div>

          {/* Instruction */}
          <div className="po-edit-field-group">
            <label className="po-edit-label">Instruction</label>
            <textarea
              className="po-edit-textarea"
              rows={1}
              value={purchaseOrder.instruction}
              onChange={(e) => handlePOChange("instruction", e.target.value)}
            />
          </div>

          {/* PR Nos */}
          <div className="po-edit-field-group">
            <label className="po-edit-label">PR Nos</label>
            <input
              type="text"
              className="po-edit-input"
              value={purchaseOrder.prNos}
              onChange={(e) => handlePOChange("prNos", e.target.value)}
            />
          </div>

          {/* Tax Option */}
          <div className="po-edit-field-group">
            <label className="po-edit-label">Tax Option</label>
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

        {/* Update Button */}
        {/* <div className="po-edit-button-row">
          <button className="po-edit-button-submit" onClick={handleSubmit}>
            💾 Update
          </button>
        </div> */}
      </div>

      {/* ---------------- Table Section ---------------- */}
      <div className="po-edit-form-card">
        <div className="po-edit-header-row">
          <div className="po-edit-action-buttons">
            {/* Left side */}
            <button className="po-edit-button-add" onClick={addRow}>
              ➕ Add Row
            </button>

            {/* Right side */}
            <div className="po-edit-right-buttons">
              <button
                className="po-edit-button-approval"
                onClick={handleSubmit}
              >
                📨 Send To Approval
              </button>
              <button className="po-edit-button-save" onClick={handleSubmit}>
                💾 Save
              </button>
            </div>
          </div>
        </div>

        <div className="po-edit-table-container">
          <table className="po-edit-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>No. of Machines</th>
                <th>Per Day Cost</th>
                <th>Discount (%)</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", color: "#666" }}
                  >
                    No items to display
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <select
                        value={row.category}
                        onChange={(e) =>
                          handleChange(i, "category", parseInt(e.target.value))
                        }
                      >
                        <option value="">Select</option>
                        {categories.map((cat) => (
                          <option key={cat.cat_id} value={cat.cat_id}>
                            {cat.cat_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.description || ""}
                        onChange={(e) =>
                          handleChange(i, "description", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.machines}
                        onChange={(e) =>
                          handleChange(i, "machines", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.costPerDay}
                        onChange={(e) =>
                          handleChange(i, "costPerDay", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
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
                        onChange={(e) =>
                          handleChange(i, "fromDate", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={row.toDate}
                        onChange={(e) =>
                          handleChange(i, "toDate", e.target.value)
                        }
                      />
                    </td>
                    <td>LKR {row.total.toFixed(2)}</td>
                    <td>
                      {row.cpo_id ? (
                        <button
                          className="po-edit-btn po-edit-btn-delete"
                          onClick={() => handleDelete(row.cpo_id, i)}
                        >
                          Delete
                        </button>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="purchaseorder-button-row">
          <div className="purchaseorder-total">
            Total: LKR {totalSum.toFixed(2)}
          </div>
        </div>
      </div>
      {isSubmitting && (
        <div className="po-edit-loading-overlay">
          <div className="po-edit-loading-spinner">
            <p>Updating...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderEdit;
