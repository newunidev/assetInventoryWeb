import React, { useEffect, useState } from "react";
import "./RenewalPurchaseOrder.css"; // ✅ use new CSS
import { getAllSuppliers } from "../controller/RentMachineController";
import { getCategories } from "../controller/CategoryController";
import { usePageTitle } from "../utility/usePageTitle";
import { useNavigate } from "react-router-dom";

import { getAllRentMachineLifeExpired } from "../controller/RentMachineLifeController";
//import { bulkCreateRenewalPurchaseOrderMachines } from "../controller/RenewPurchaseOrderController";

import {
  createPurchaseOrder,
  createPurchaseOrderApproval,
} from "../controller/PurchaseOrderController";
import { bulkCreateRenewalPurchaseOrderMachines } from "../controller/RenewalPurchaseOrderController";

const RenewalPurchaseOrder = () => {
  const navigate = useNavigate();
  const [, setPageTitle] = usePageTitle();
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [rentMachines, setRentMachines] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taxOption, setTaxOption] = useState(""); // 'VAT' or 'SVAT'
  const [newPurchaseOrder, setNewPurchaseOrder] = useState({
    supplier: "",
    deliverTo: "",
    attention: "",
    poDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    paymentMethod: "",
    paymentTerm: "",
    instruction: "",
    invoiceTo: "",
    prNos: "",
  });

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
  // Mock rent machines API (replace with real one)
  // ✅ Separate function
  const fetchRentMachines = async (selectedSupplierId) => {
    try {
      const res = await getAllRentMachineLifeExpired();
      if (res.success && Array.isArray(res.data)) {
        return res.data
          .filter(
            (item) =>
              item.RentMachine && item.RentMachine.sup_id === selectedSupplierId // ✅ filter supplier
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

  // ✅ fetch suppliers
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
  useEffect(() => {
    setPageTitle("Rent Machine Renew Purchase Order");
  }, [setPageTitle]);
  // ✅ useEffect calls it
  useEffect(() => {
    if (!selectedSupplierId) return;
    const loadMachines = async () => {
      const machines = await fetchRentMachines(selectedSupplierId);
      setRentMachines(machines);
    };
    loadMachines();
  }, [selectedSupplierId]);

  // ✅ add machine from popup
  const handleAddMachine = (machine) => {
    setSelectedMachines((prev) => [
      ...prev,
      {
        ...machine,
        fromDate: "",
        toDate: "",
        discount: 0,
        total: 0,
      },
    ]);
    setShowPopup(false);
  };

  // ✅ update row values
  const handleRowChange = (index, field, value) => {
    const updated = [...selectedMachines];
    updated[index][field] = value;
    console.log("row data change ", field, value);

    // recalc totals when dates, discount, or perDayCost changes
    if (["fromDate", "toDate", "discount", "perDayCost"].includes(field)) {
      const from = new Date(updated[index].fromDate);
      const to = new Date(updated[index].toDate);
      const days =
        isNaN(from) || isNaN(to) || from > to
          ? 0
          : Math.max((to - from) / (1000 * 3600 * 24) + 1, 0);

      const rawCost = (Number(updated[index].perDayCost) || 0) * days;
      const discountAmount = (Number(updated[index].discount) / 100) * rawCost;
      updated[index].discountAmount = discountAmount;
      updated[index].total = rawCost - discountAmount;
    }

    setSelectedMachines(updated);
  };

  // ✅ subtotal
  const subTotal = selectedMachines.reduce(
    (sum, m) => sum + (Number(m.total) || 0),
    0
  );

  const handlePurchaseOrderChange = (field, value) => {
    setNewPurchaseOrder((prev) => ({ ...prev, [field]: value }));

    if (field === "supplier") {
      const selected = suppliers.find((s) => s.supplier_id === Number(value));

      if (selected?.svatno) {
        setTaxOption("SVAT");
      } else if (selected?.vatno) {
        setTaxOption("VAT");
      } else if (selected?.svatno && selected?.vatno) {
        setTaxOption("SVAT"); // default priority
      } else {
        setTaxOption("");
      }
    }
    // ✅ just update supplierId state
    setSelectedSupplierId(Number(value));
  };

  const handleSendToApproval = async () => {
    const userBranch = localStorage.getItem("userBranch");
    const userBranchId = localStorage.getItem("userBranchId");
    const userId = localStorage.getItem("userid");
    setIsSubmitting(true);

    try {
      const {
        supplier,
        poDate,
        deliverTo,
        invoiceTo,
        attention,
        paymentMethod,
        paymentTerm,
      } = newPurchaseOrder;

      // ✅ Basic required field validation
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

      // ✅ Machine validation
      for (const m of selectedMachines) {
        if (!m.fromDate || !m.toDate || !m.perDayCost) {
          alert(
            "Please fill From Date, To Date, and Per Day Cost for all machines."
          );
          setIsSubmitting(false);
          return;
        }
      }

      console.log("Tax option", taxOption);
      // ✅ Construct payload (same as before)
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
        is_renew_po: true,
        delivery_date: newPurchaseOrder.deliveryDate,
        is_vat: taxOption === "VAT" ? true : false,
        is_svat: taxOption === "SVAT" ? true : false,
      };

      console.log("📦 Creating Renew Purchase Order:", payload);

      // ✅ Step 1: Create Purchase Order
      const poResponse = await createPurchaseOrder(payload);
      const PO_id = poResponse.purchaseOrder?.POID;
      if (!PO_id) throw new Error("PO_id not returned from the server.");
      console.log("✅ Created PO:", PO_id);

      // ✅ Step 2: Map selectedMachines into renewal data
      const renewalMachinesData = selectedMachines.map((m) => ({
        po_id: PO_id,
        rent_item_id: m.id,
        from_date: m.fromDate,
        to_date: m.toDate,
        qty: 1,
        perday_cost: m.perDayCost || 100,
        d_percent: m.discount || 0,
      }));

      console.log("📦 Renewal Machines Data:", renewalMachinesData);

      // ✅ Step 3: Save renewal machines in bulk
      await bulkCreateRenewalPurchaseOrderMachines(renewalMachinesData);

      // ✅ Step 4: Create approval entry
      const approvalData = {
        po_no: PO_id,
        approval1: false,
        approval1_by: null,
        approved1_date: null,
        approval2: false,
        approval2_by: null,
        approved2_date: null,
      };

      await createPurchaseOrderApproval(approvalData);

      alert("✅ Renewal Purchase Order created & sent for approval!");
      navigate(`/rentmachines/renewalporeports/${encodeURIComponent(PO_id)}`);
    } catch (error) {
      console.error("❌ Error in handleSendToApproval:", error);
      alert("Failed to send for approval. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePo = async () => {
    const userBranch = localStorage.getItem("userBranch");
    const userBranchId = localStorage.getItem("userBranchId");
    const userId = localStorage.getItem("userid");
    setIsSubmitting(true);

    try {
      const {
        supplier,
        poDate,
        deliverTo,
        invoiceTo,
        attention,
        paymentMethod,
        paymentTerm,
      } = newPurchaseOrder;

      // ✅ Basic required field validation
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

      // ✅ Machine validation
      for (const m of selectedMachines) {
        if (!m.fromDate || !m.toDate || !m.perDayCost) {
          alert(
            "Please fill From Date, To Date, and Per Day Cost for all machines."
          );
          setIsSubmitting(false);
          return;
        }
      }

      console.log("Tax option", taxOption);
      // ✅ Construct payload (same as before)
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
        is_renew_po: true,
        delivery_date: newPurchaseOrder.deliveryDate,
        is_vat: taxOption === "VAT" ? true : false,
        is_svat: taxOption === "SVAT" ? true : false,
        status: "Saved",
      };

      console.log("📦 Creating Renew Purchase Order:", payload);

      // ✅ Step 1: Create Purchase Order
      const poResponse = await createPurchaseOrder(payload);
      const PO_id = poResponse.purchaseOrder?.POID;
      if (!PO_id) throw new Error("PO_id not returned from the server.");
      console.log("✅ Created PO:", PO_id);

      // ✅ Step 2: Map selectedMachines into renewal data
      const renewalMachinesData = selectedMachines.map((m) => ({
        po_id: PO_id,
        rent_item_id: m.id,
        from_date: m.fromDate,
        to_date: m.toDate,
        qty: 1,
        perday_cost: m.perDayCost || 100,
        description: m.description,
        d_percent: m.discount || 0,
      }));

      console.log("📦 Renewal Machines Data:", renewalMachinesData);

      // ✅ Step 3: Save renewal machines in bulk
      await bulkCreateRenewalPurchaseOrderMachines(renewalMachinesData);

      // ✅ Step 4: Create approval entry
      const approvalData = {
        po_no: PO_id,
        approval1: false,
        approval1_by: null,
        approved1_date: null,
        approval2: false,
        approval2_by: null,
        approved2_date: null,
      };

      await createPurchaseOrderApproval(approvalData);

      alert("✅ Renewal Purchase Order created & sent for approval!");
      navigate(`/rentmachines/renewalporeports/${encodeURIComponent(PO_id)}`);
    } catch (error) {
      console.error("❌ Error in handleSendToApproval:", error);
      alert("Failed to send for approval. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="renewalPurchaseOrder-wrapper">
      {/* 🔝 top section */}
      <div className="renewalPurchaseOrder-top-section">
        <form
          className="renewalPurchaseOrder-form-grid"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Supplier */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">Supplier</label>
            <select
              className="renewalPurchaseOrder-input"
              value={newPurchaseOrder.supplier}
              onChange={(e) =>
                handlePurchaseOrderChange("supplier", e.target.value)
              }
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
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">PO Date</label>
            <input
              type="date"
              className="renewalPurchaseOrder-input"
              value={newPurchaseOrder.poDate}
              onChange={(e) =>
                handlePurchaseOrderChange("poDate", e.target.value)
              }
            />
          </div>

          {/* Delivery Date */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">Delivery Date</label>
            <input
              type="date"
              className="renewalPurchaseOrder-input"
              value={newPurchaseOrder.deliveryDate}
              onChange={(e) =>
                handlePurchaseOrderChange("deliveryDate", e.target.value)
              }
            />
          </div>

          {/* Deliver To */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">Deliver To</label>
            <select
              className="renewalPurchaseOrder-input"
              value={newPurchaseOrder.deliverTo}
              onChange={(e) =>
                handlePurchaseOrderChange("deliverTo", e.target.value)
              }
            >
              <option value="">Select Delivery Location</option>
              {invoiceOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice To */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">Invoice To</label>
            <select
              className="renewalPurchaseOrder-input"
              value={newPurchaseOrder.invoiceTo}
              onChange={(e) =>
                handlePurchaseOrderChange("invoiceTo", e.target.value)
              }
            >
              <option value="">Select Invoice To</option>
              {invoiceOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">Payment Method</label>
            <select
              className="renewalPurchaseOrder-input"
              value={newPurchaseOrder.paymentMethod || ""}
              onChange={(e) =>
                handlePurchaseOrderChange("paymentMethod", e.target.value)
              }
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Attention */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">Attention</label>
            <input
              type="text"
              className="renewalPurchaseOrder-input"
              value={newPurchaseOrder.attention || ""}
              onChange={(e) =>
                handlePurchaseOrderChange("attention", e.target.value)
              }
            />
          </div>

          {/* Payment Term */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">Payment Term</label>
            <input
              type="text"
              className="renewalPurchaseOrder-input"
              value={newPurchaseOrder.paymentTerm || ""}
              onChange={(e) =>
                handlePurchaseOrderChange("paymentTerm", e.target.value)
              }
            />
          </div>

          {/* Instruction */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">Instruction</label>
            <textarea
              className="renewalPurchaseOrder-textarea"
              value={newPurchaseOrder.instruction || ""}
              onChange={(e) =>
                handlePurchaseOrderChange("instruction", e.target.value)
              }
            ></textarea>
          </div>

          {/* PR Nos */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">PR Nos</label>
            <input
              type="text"
              className="renewalPurchaseOrder-input"
              value={newPurchaseOrder.prNos || ""}
              onChange={(e) =>
                handlePurchaseOrderChange("prNos", e.target.value)
              }
            />
          </div>

          {/* SVAT / VAT display based on selected supplier */}
          <div className="renewalPurchaseOrder-field-group">
            <label className="renewalPurchaseOrder-label">Tax Option</label>
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

      {/* 🔽 machine table */}
      <div className="renewalPurchaseOrder-form-card">
        <div className="renewalPurchaseOrder-header-row">
          <button
            className="renewalPurchaseOrder-button-add"
            onClick={() => setShowPopup(true)}
            type="button"
          >
            ➕
          </button>
          <div className="renewalPurchaseOrder-button-row-right">
            <button
              className="renewalPurchaseOrder-gradient-button renewalPurchaseOrder-gradient-button-approval"
              onClick={handleSendToApproval}
              disabled={localStorage.getItem("userBranch") === "Head Office"}
            >
              SEND TO APPROVAL
            </button>

            <button
              className="renewalPurchaseOrder-gradient-button renewalPurchaseOrder-gradient-button-save"
              onClick={handleSavePo}
              disabled={localStorage.getItem("userBranch") === "Head Office"}
            >
              ✅ SAVE
            </button>
          </div>
        </div>

        <div className="renewalPurchaseOrder-table-container">
          <table className="renewalPurchaseOrder-table">
            <thead>
              <tr>
                <th>Rent Item Id</th>
                <th>Machine</th>
                <th>Serial No</th>
                <th>Description</th>
                <th>Per Day Cost</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Discount (%)</th>
                <th>Discount Amount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedMachines.map((m, i) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.name}</td>
                  <td>{m.serial_no}</td>
                  <td>
                    <input
                      type="text"
                      value={m.description}
                      onChange={(e) =>
                        handleRowChange(i, "description", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={m.perDayCost}
                      onChange={(e) =>
                        handleRowChange(i, "perDayCost", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={m.fromDate}
                      onChange={(e) =>
                        handleRowChange(i, "fromDate", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={m.toDate}
                      onChange={(e) =>
                        handleRowChange(i, "toDate", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={m.discount}
                      onChange={(e) =>
                        handleRowChange(i, "discount", e.target.value)
                      }
                    />
                  </td>
                  <td>LKR {m.discountAmount?.toFixed(2) || "0.00"}</td>
                  <td>LKR {m.total?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="renewalPurchaseOrder-button-row">
          <div className="renewalPurchaseOrder-total">
            Sub Total: LKR {subTotal.toFixed(2)}
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
                      !selectedMachines.some((m) => m.id === rm.id) &&
                      (rm.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                        rm.serial_no
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        rm.id.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((rm) => (
                    <tr key={rm.id}>
                      <td>{rm.id}</td>
                      <td>{rm.name}</td>
                      <td>{rm.serial_no}</td>
                      <td>{rm.rawData.to_date}</td>
                      <td>
                        <button
                          onClick={() => handleAddMachine(rm)}
                          className="renewalPurchaseOrder-button-submit"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
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

export default RenewalPurchaseOrder;
