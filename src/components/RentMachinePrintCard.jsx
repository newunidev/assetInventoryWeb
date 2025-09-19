import React, { useEffect, useState, useRef } from "react";
import {
  getAllRentMachineLifeActive,
  getAllLatestMachineLifeActiveByRentItemId,
} from "../controller/RentMachineLifeController";
import JsBarcode from "jsbarcode";
import "./RentMachinePrintCard.css";

const RentMachinePrintCard = () => {
  const [machines, setMachines] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [printQueue, setPrintQueue] = useState([]);
  const barcodeRefs = useRef({}); // store refs for multiple cards

  // Load active machines
  useEffect(() => {
    const loadMachines = async () => {
      try {
        const res = await getAllRentMachineLifeActive();
        if (res.success) setMachines(res.data);
      } catch (err) {
        console.error("Error loading machines:", err);
      }
    };
    loadMachines();
  }, []);

  // Fetch selected machine details and add to print queue
  const handleAddToQueue = async () => {
    if (!selectedId) return;

    // Avoid duplicates
    if (printQueue.find((m) => m.rent_item_id === selectedId)) return;

    try {
      const res = await getAllLatestMachineLifeActiveByRentItemId(selectedId);
      console.log("active machine data", res);
      if (res.success) {
        setPrintQueue((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error("Error fetching machine details:", err);
    }
  };

  // Generate barcodes whenever printQueue changes
  useEffect(() => {
    printQueue.forEach((machine) => {
      const ref = barcodeRefs.current[machine.rent_item_id];
      if (ref) {
        JsBarcode(ref, machine.rent_item_id, {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: true,
        });
      }
    });
  }, [printQueue]);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="rentprint-container">
      <h2 className="rentprint-title">🖨️ Rent Machine Print Card</h2>

      {/* Dropdown + Buttons */}
      <div className="rentprint-select">
        <label>Select Machine: </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Choose Machine --</option>
          {machines.map((m) => (
            <option key={m.id} value={m.rent_item_id}>
              {m.rent_item_id} - {m.RentMachine?.name}
            </option>
          ))}
        </select>
        <button
          className="rentprint-btn"
          onClick={handleAddToQueue}
          disabled={!selectedId}
        >
          ➕ Add to Print
        </button>
        <button
          className="rentprint-btn"
          onClick={handlePrint}
          disabled={printQueue.length === 0}
        >
          🖨️ Print All
        </button>
      </div>

      {/* Print Queue Cards */}
      {printQueue.map((machine) => (
        <div key={machine.rent_item_id} className="rentprint-card">
          {/* Watermark */}
          <img src="/nu.png" alt="Watermark" className="rentprint-watermark" />
          {/* Barcode */}
          <div className="rentprint-header">
            <div className="rentprint-header-right">
              <canvas
                ref={(el) => (barcodeRefs.current[machine.rent_item_id] = el)}
                className="rentprint-barcode"
              ></canvas>
            </div>
            <div className="rentprint-header-left">
              <h2 className="rentprint-company-name">
                New Universe Cooperate Clothing PVT Ltd.
              </h2>

              <h2 className="rentprint-company-name">RENT MACHINES</h2>
              <h3 className="rentprint-machine">{machine.RentMachine.name}</h3>
            </div>
          </div>

          {/* Rent ID & Serial */}
          <div className="rentprint-main-info">
            <span className="rentprint-rentid">
              <strong>Rent ID:</strong> {machine.rent_item_id}
            </span>
            <span className="rentprint-serial">
              <strong>Serial No:</strong> {machine.RentMachine.serial_no}
            </span>
          </div>

          {/* Details table */}
          <div className="rentprint-details-table">
            <div className="rentprint-col">
              <p>
                <strong>Brand:</strong> {machine.RentMachine.brand}
              </p>
              <p>
                <strong>Model No:</strong> {machine.RentMachine.model_no}
              </p>
              <p>
                <strong>Box No:</strong> {machine.RentMachine.box_no}
              </p>
              <p>
                <strong>Motor No:</strong> {machine.RentMachine.motor_no}
              </p>
              <p>
                <strong>Condition:</strong> {machine.RentMachine.condition}
              </p>
            </div>
            <div className="rentprint-col">
              <p>
                <strong>Supplier:</strong> {machine.RentMachine.Supplier?.name}
              </p>
              <p>
                <strong>Branch:</strong> {machine.Branch?.branch_name}
              </p>
              <p>
                <strong>PO No:</strong> {machine.PurchaseOrder?.POID}
              </p>
              <p className="rentprint-valid-period">
                <strong>Valid Time Period:</strong> {machine.from_date} →{" "}
                {machine.to_date}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RentMachinePrintCard;
