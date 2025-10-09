import React, { useEffect, useState } from "react";
import "./PurchaseOrder.css";
import { getAllSuppliers } from "../controller/RentMachineController";
import { usePageTitle } from "../utility/usePageTitle";
import { getCategories } from "../controller/CategoryController";
import {
  createPurchaseOrder,
  createPurchaseOrderApproval,
} from "../controller/PurchaseOrderController";
import { bulkcreateCategoryPurchaseOrders } from "../controller/CategoryPurchaseOrderController";
import { useNavigate } from "react-router-dom";

//const categories = ["Excavator", "Bulldozer", "Crane", "Loader"];
const userEmail = localStorage.getItem("userEmail");

const userName = localStorage.getItem("name");
const userBranch = localStorage.getItem("userBranch");
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

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const loggedUserBranch = localStorage.getItem("userBranch");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setPageTitle] = usePageTitle();
  const [supplier, setSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [rows, setRows] = useState([{ ...initialRow }]);
  const [categories, setCategories] = useState([]);
  const [formFields, setFormFields] = useState({
    supplier: "",
    deliverTo: "",
    attention: "",
    poDate: new Date().toISOString().split("T")[0], // Sets current date by default
    deliveryDate: new Date().toISOString().split("T")[0], // Sets current date by default,
    paymentMethod: "",
    paymentTerm: "",
    instruction: "",
    invoiceTo: "",
    prNos: "",
  });
  const [taxOption, setTaxOption] = useState(""); // 'VAT' or 'SVAT'
  const [newPurchaseOrder, setNewPurchaseOrder] = useState({
    supplier: "",
    deliverTo: "",
    attention: "",
    poDate: new Date().toISOString().split("T")[0],
    deliveryDate: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    paymentTerm: "",
    instruction: "",
    invoiceTo: "",
    prNos: "",
  });

  const invoiceOptions = [
    "New Universe Corporate Head Office Borella",
    "New Universe Bakamuna1 Factory",
    "New Universe Bakamuna2 Factory",
    "New Universe Hettipola Factory",
    "New Universe Piliyandala Factory",
    "New Universe Mathara Factory",
    "New Universe Welioya Factory",
    "New Universe Kaduwela Stores",
  ];

  // 🔍 Match branch inside option string
  const filteredOptions = invoiceOptions.filter((option) =>
    option.toLowerCase().includes(userBranch?.toLowerCase())
  );
  // ✅ Ensure default value is set
  useEffect(() => {
    if (filteredOptions.length > 0) {
      handlePurchaseOrderChange("deliverTo", filteredOptions[0]);
    }
  }, [userBranch]);

  const handlePurchaseOrderChange = (field, value) => {
    setNewPurchaseOrder((prev) => ({ ...prev, [field]: value }));
    if (field === "supplier") {
      console.log("Selected value:", value); // <--- Add this
      const selected = suppliers.find((s) => s.supplier_id === Number(value));
      console.log("Selected", selected);

      if (selected?.svatno) {
        setTaxOption("SVAT");
      } else if (selected?.vatno) {
        setTaxOption("VAT");
      } else if (selected?.svatno && selected?.vatno) {
        setTaxOption("SVAT");
      } else {
        setTaxOption("");
      }
    }
  };

  const handleFormChange = (field, value) => {
    setFormFields({ ...formFields, [field]: value });
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

  const addRow = () => {
    setRows([...rows, { ...initialRow }]);
  };

  // Calculate overall total for all rows
  const totalSum = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);

  const handleSubmit = async () => {
    const userBranch = localStorage.getItem("userBranch");
    const userBranchId = localStorage.getItem("userBranchId");
    const userId = localStorage.getItem("userid");
    setIsSubmitting(true); // Start loading
    console.log("User Branch", userBranch);
    const {
      supplier,
      poDate,
      deliverTo,
      invoiceTo,
      attention,
      paymentMethod,
      paymentTerm,
    } = newPurchaseOrder;

    // Basic required fields validation
    if (
      !supplier ||
      !poDate ||
       
      !invoiceTo ||
      !attention ||
      !paymentMethod ||
      !paymentTerm
    ) {
      alert("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    // Validate item rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (
        !row.category ||
        row.machines <= 0 ||
        row.costPerDay <= 0 ||
        !row.fromDate ||
        !row.toDate
      ) {
        alert(`Please complete all fields in row ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    // Construct payload
    const payload = {
      date: poDate,
      invoice_to: invoiceTo,
      deliver_to: deliverTo,
      attention: attention,
      payment_mode: paymentMethod,
      payment_term: paymentTerm,
      instruction: newPurchaseOrder.instruction,
      pr_nos: newPurchaseOrder.prNos,
      created_by: userId,
      supplier_id: supplier,
      branch_id: userBranchId,
      branch: userBranch,
      delivery_date: newPurchaseOrder.deliveryDate,
      is_vat: taxOption === "VAT" ? true : false,
      is_svat: taxOption === "SVAT" ? true : false,
    };

    console.log("✅ Final payload:", payload);

    try {
      // First: create the purchase order
      const poResponse = await createPurchaseOrder(payload);
      //console.log("✅ Purchase Order response:", poResponse);

      // Extract PO_id from the response
      const PO_id =
        poResponse.purchaseOrder?.POID || poResponse.purchaseOrder?.POID;
      console.log("returned Po Id ", PO_id);
      if (!PO_id) {
        throw new Error("PO_id not returned from the server.");
      }

      // Then: prepare bulk category rows
      const categoryData = rows.map((row) => ({
        PO_id,
        cat_id: row.category,
        description: row.description,
        Qty: row.machines,
        PerDay_Cost: row.costPerDay,
        d_percent: row.discount || 0,
        from_date: row.fromDate,
        to_date: row.toDate,
      }));

      //prepare puchaseorder approval data
      const approvalData = {
        po_no: PO_id,
        approval1: false,
        approval1_by: null,
        approved1_date: null,
        approval2: false,
        approval2_by: null,
        approved2_date: null,
      };

      console.log("📦 Sending bulk category data:", categoryData);

      // Finally: send the bulk category purchase orders
      try {
        console.log("📦 Sending bulk category data:", categoryData);

        await bulkcreateCategoryPurchaseOrders(categoryData);
        await createPurchaseOrderApproval(approvalData);

        alert("Purchase Order and category allocations created successfully!");
        navigate(`/rentmachines/poreports/${encodeURIComponent(PO_id)}`);
      } catch (error) {
        console.error(
          "❌ Error creating purchase order or category allocations:",
          error
        );
        alert("Failed to create Purchase Order. Please try again.");
      }
      //window.location.reload();
      // Optionally reset state here
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      alert("Failed to create Purchase Order. Please try again.");
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  const handleSave = async () => {
    const userBranch = localStorage.getItem("userBranch");
    const userBranchId = localStorage.getItem("userBranchId");
    const userId = localStorage.getItem("userid");
    setIsSubmitting(true); // Start loading
    console.log("User Branch", userBranch);
    const {
      supplier,
      poDate,
      deliverTo,
      invoiceTo,
      attention,
      paymentMethod,
      paymentTerm,
    } = newPurchaseOrder;

    // Basic required fields validation
    if (
      !supplier ||
      !poDate ||
      !deliverTo ||
      !invoiceTo ||
      !attention ||
      !paymentMethod ||
      !paymentTerm
    ) {
      alert("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    // Validate item rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (
        !row.category ||
        row.machines <= 0 ||
        row.costPerDay <= 0 ||
        !row.fromDate ||
        !row.toDate
      ) {
        alert(`Please complete all fields in row ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    // Construct payload
    const payload = {
      date: poDate,
      invoice_to: invoiceTo,
      deliver_to: deliverTo,
      attention: attention,
      payment_mode: paymentMethod,
      payment_term: paymentTerm,
      instruction: newPurchaseOrder.instruction,
      pr_nos: newPurchaseOrder.prNos,
      created_by: userId,
      supplier_id: supplier,
      branch_id: userBranchId,
      branch: userBranch,
      delivery_date: newPurchaseOrder.deliveryDate,
      is_vat: taxOption === "VAT" ? true : false,
      is_svat: taxOption === "SVAT" ? true : false,
      status: "Saved",
    };

    console.log("✅ Final payload:", payload);

    try {
      // First: create the purchase order
      const poResponse = await createPurchaseOrder(payload);
      //console.log("✅ Purchase Order response:", poResponse);

      // Extract PO_id from the response
      const PO_id =
        poResponse.purchaseOrder?.POID || poResponse.purchaseOrder?.POID;
      console.log("returned Po Id ", PO_id);
      if (!PO_id) {
        throw new Error("PO_id not returned from the server.");
      }

      // Then: prepare bulk category rows
      const categoryData = rows.map((row) => ({
        PO_id,
        cat_id: row.category,
        description: row.description,
        Qty: row.machines,
        PerDay_Cost: row.costPerDay,
        d_percent: row.discount || 0,
        from_date: row.fromDate,
        to_date: row.toDate,
      }));

      //prepare puchaseorder approval data
      const approvalData = {
        po_no: PO_id,
        approval1: false,
        approval1_by: null,
        approved1_date: null,
        approval2: false,
        approval2_by: null,
        approved2_date: null,
      };

      console.log("📦 Sending bulk category data:", categoryData);

      // Finally: send the bulk category purchase orders
      try {
        console.log("📦 Sending bulk category data:", categoryData);

        await bulkcreateCategoryPurchaseOrders(categoryData);
        await createPurchaseOrderApproval(approvalData);

        alert("Purchase Order and category allocations created successfully!");
        navigate(`/rentmachines/poreports/${encodeURIComponent(PO_id)}`);
      } catch (error) {
        console.error(
          "❌ Error creating purchase order or category allocations:",
          error
        );
        alert("Failed to create Purchase Order. Please try again.");
      }
      //window.location.reload();
      // Optionally reset state here
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      alert("Failed to create Purchase Order. Please try again.");
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  useEffect(() => {
    setPageTitle("Rent Machine Purchase Order");
  }, [setPageTitle]);
  //method to fecth all the suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getAllSuppliers();

        setSuppliers(data.suppliers);
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  //method to fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
    newPurchaseOrder.deliverTo = `New Universe ${localStorage.getItem("userBranch")} Factory`;
  }, []);

  return (
    <div className="purchaseorder-wrapper">
      <div className="purchaseorder-top-section">
        <form className="po-form-grid" onSubmit={(e) => e.preventDefault()}>
          <div className="po-field-group">
            <label className="po-label">Supplier</label>
            <select
              className="po-input"
              value={newPurchaseOrder.supplier}
              onChange={(e) =>
                handlePurchaseOrderChange("supplier", e.target.value)
              }
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier, index) => (
                <option key={supplier.id ?? index} value={supplier.supplier_id}>
                  {supplier.name}
                </option>
              ))}
              required
            </select>
          </div>

          {/* Other input fields */}
          <div className="po-field-group">
            <label className="po-label">PO Date</label>
            <input
              type="date"
              className="po-input"
              value={newPurchaseOrder.poDate}
              onChange={(e) =>
                handlePurchaseOrderChange("poDate", e.target.value)
              }
              required
            />
          </div>

          <div className="po-field-group">
            <label className="po-label">Delivery Date</label>
            <input
              type="date"
              className="po-input"
              value={newPurchaseOrder.deliveryDate}
              onChange={(e) =>
                handlePurchaseOrderChange("deliveryDate", e.target.value)
              }
            />
          </div>

          {/* <div className="po-field-group">
            <label className="po-label">Deliver To</label>
            <select
              className="po-input"
              value={newPurchaseOrder.deliverTo}
              onChange={(e) =>
                handlePurchaseOrderChange("deliverTo", e.target.value)
              }
            >
              {filteredOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div> */}
          <div className="po-field-group">
            <label className="po-label">Deliver To</label>
            <input
              type="text"
              className="po-input"
              value={newPurchaseOrder.deliverTo}
              readOnly
            />
          </div>

          <div className="po-field-group">
            <label className="po-label">Invoice To</label>
            <select
              className="po-input"
              value={newPurchaseOrder.invoiceTo}
              onChange={(e) =>
                handlePurchaseOrderChange("invoiceTo", e.target.value)
              }
            >
              <option value="">Select Invoice To</option>
              {invoiceOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="po-field-group">
            <label className="po-label">Payment Method</label>
            <select
              className="po-select"
              value={newPurchaseOrder.paymentMethod}
              onChange={(e) =>
                handlePurchaseOrderChange("paymentMethod", e.target.value)
              }
            >
              <option value="">Select</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="po-field-group">
            <label className="po-label">Attention</label>
            <input
              type="text"
              className="po-input"
              value={newPurchaseOrder.attention}
              onChange={(e) =>
                handlePurchaseOrderChange("attention", e.target.value)
              }
            />
          </div>

          <div className="po-field-group">
            <label className="po-label">Payment Term</label>
            <input
              type="text"
              className="po-input"
              value={newPurchaseOrder.paymentTerm}
              onChange={(e) =>
                handlePurchaseOrderChange("paymentTerm", e.target.value)
              }
            />
          </div>

          <div className="po-field-group">
            <label className="po-label">Instruction</label>
            <textarea
              className="po-textarea"
              rows={1}
              value={newPurchaseOrder.instruction}
              onChange={(e) =>
                handlePurchaseOrderChange("instruction", e.target.value)
              }
            />
          </div>

          <div className="po-field-group">
            <label className="po-label">PR Nos</label>
            <input
              type="text"
              className="po-input"
              value={newPurchaseOrder.prNos}
              onChange={(e) =>
                handlePurchaseOrderChange("prNos", e.target.value)
              }
            />
          </div>
          <div className="po-field-group">
            <label className="po-label">Tax Option</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {(() => {
                const selectedSupplier = suppliers.find(
                  (s) => s.supplier_id === Number(newPurchaseOrder.supplier)
                );

                if (!selectedSupplier) return <span>Select a supplier</span>;

                if (selectedSupplier?.svatno) {
                  return <strong>SVAT No: {selectedSupplier.svatno}</strong>;
                }

                if (selectedSupplier?.vatno) {
                  return <strong>VAT No: {selectedSupplier.vatno}</strong>;
                }

                return <span>No VAT or SVAT registered</span>;
              })()}
            </div>
          </div>
        </form>
      </div>

      <div className="purchaseorder-form-card">
        <div className="purchaseorder-header-row">
          <div className="purchaseorder-action-buttons">
            <button className="po-button-add" onClick={addRow}>
              ➕
            </button>
            <div className="po-right-buttons">
              <button
                className="po-button-submit"
                onClick={handleSubmit}
                disabled={loggedUserBranch === "Head Office"}
              >
                📨 Send To Approval
              </button>
              <button className="po-button-save" onClick={handleSave}>
                💾 Save
              </button>
            </div>
          </div>
        </div>
        <div className="po-table-container">
          <table className="purchaseorder-table">
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
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
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
                  {/* <td>
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
                  </td> */}
                  <td>
                    <input
                      type="date"
                      value={row.fromDate}
                      onChange={(e) =>
                        handleChange(i, "fromDate", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]} // no backdates
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={row.toDate}
                      disabled = {!row.fromDate}
                      onChange={(e) =>
                        handleChange(i, "toDate", e.target.value)
                      }
                      min={
                        row.fromDate || new Date().toISOString().split("T")[0]
                      } // at least fromDate
                      max={
                        row.fromDate
                          ? new Date(
                              new Date(row.fromDate).setDate(
                                new Date(row.fromDate).getDate() + 31
                              )
                            )
                              .toISOString()
                              .split("T")[0]
                          : ""
                      } // max 31 days from fromDate
                    />
                  </td>
                  <td>LKR {row.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="purchaseorder-button-row">
          <div className="purchaseorder-total">
            Total: LKR {totalSum.toFixed(2)}
          </div>
        </div>
      </div>
      {/* ✅ Add it right here */}
      {isSubmitting && (
        <div className="po-loading-overlay">
          <div className="po-loading-spinner">
            <span className="loader-icon">
              <img
                src="/nu.png"
                alt="User Profile"
                className="user-profile-img"
              />
            </span>
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;
