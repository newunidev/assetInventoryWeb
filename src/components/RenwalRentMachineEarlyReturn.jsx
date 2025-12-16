import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./RenwalRentMachineEarlyReturn.css";
import { usePageTitle } from "../utility/usePageTitle";

// API: Get machines in this renewal PO
import { getRenewalPurchaseOrderMachinesByPoId } from "../controller/RenewalPurchaseOrderController";

// Early return APIs
import {
  createRenewalRentMachineEarlyReturnBulk,
  getAllRenewalRentMachineEarlyReturnByPoId,
} from "../controller/RentMachineEarlyReturnController";

const RenewalRentMachineEarlyReturn = () => {
  const { poNo } = useParams();
  const poId = poNo.replace("-", "/");

  const [, setPageTitle] = usePageTitle();

  const [machineList, setMachineList] = useState([]);
  const [alreadyReturned, setAlreadyReturned] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [disabledButtons, setDisabledButtons] = useState({});

  // ======================================================
  // INIT LOAD
  // ======================================================
  useEffect(() => {
    setPageTitle("Renewal Rent Machine Early Return");

    loadMachines(poId);
    loadAlreadyReturned(poId);
  }, [poId]);

  // ======================================================
  // GET MACHINES IN THIS PO
  // ======================================================
  const loadMachines = async (id) => {
    try {
      const res = await getRenewalPurchaseOrderMachinesByPoId(id);
      console.log("PO Machines:", res);

      if (res.success && Array.isArray(res.poMachineRenewals)) {
        setMachineList(res.poMachineRenewals);
      } else {
        setMachineList([]);
      }
    } catch (err) {
      console.error(err);
      setMachineList([]);
    }
  };

  // ======================================================
  // GET ALREADY RETURNED ITEMS
  // ======================================================
  const loadAlreadyReturned = async (id) => {
    try {
      const res = await getAllRenewalRentMachineEarlyReturnByPoId(id);

      if (res.success) {
        setAlreadyReturned(res.data.map((x) => x.rent_item_id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ======================================================
  // SEARCH FILTER
  // ======================================================
  const filteredMachines = machineList.filter((m) => {
    const code = m.rent_item_id?.toLowerCase() || "";
    const serial = m.RentMachine?.serial_no?.toLowerCase() || "";

    return (
      code.includes(searchTerm.toLowerCase()) ||
      serial.includes(searchTerm.toLowerCase())
    );
  });

  // ======================================================
  // HANDLE EARLY RETURN
  // ======================================================
  const handleEarlyReturn = async (machine) => {
    try {
      const payload = {
        po_id: poId,
        items: [
          {
            rent_item_id: machine.rent_item_id,
            from_date: machine.from_date,
            to_date: new Date().toISOString().split("T")[0], // today
            per_day_cost: machine.perday_cost,
            d_rate: machine.d_percent,
            mr_id:machine.mr_id,
          },
        ],
      };

      const res = await createRenewalRentMachineEarlyReturnBulk(payload);

      if (res.success) {
        alert("Machine early Renewal returned successfully!");

        loadMachines(poId);
        loadAlreadyReturned(poId);
      }
    } catch (err) {
      console.error(err);
      alert("Error while returning machine");
    }
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="renewal-earlyreturn-wrapper">
      <div className="renewal-earlyreturn-header-card">
        <h2 className="renewal-earlyreturn-section-title">
          Renewal PO: <span style={{ color: "#007bff" }}>{poId}</span>
        </h2>

        

        {/* SEARCH */}
        <div className="renewal-earlyreturn-search">
          <input
            className="renewal-earlyreturn-search-input"
            placeholder="Search by Machine Code or Serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ONLY ONE TABLE */}
      <table className="renewal-table">
        <thead>
          <tr>
            <th>Machine Code</th>
            <th>Model</th>
            <th>Serial No</th>
            <th>From</th>
            <th>To</th>
            <th>Per Day Cost</th>
            <th>Return</th>
          </tr>
        </thead>

        <tbody>
          {filteredMachines.map((m, idx) => (
            <tr key={idx}>
              <td>{m.rent_item_id}</td>
              <td>{m.RentMachine?.model_no}</td>
              <td>{m.RentMachine?.serial_no}</td>
              <td>{m.from_date}</td>
              <td>{m.to_date}</td>
              <td>{m.perday_cost}</td>

              <td>
                {alreadyReturned.includes(m.rent_item_id) ? (
                  <span style={{ color: "gray", fontWeight: "600" }}>
                    Returned
                  </span>
                ) : (
                  <button
                    className="renewal-earlyreturn-btn"
                    disabled={disabledButtons[m.rent_item_id]}
                    onClick={() => {
                      setDisabledButtons((prev) => ({
                        ...prev,
                        [m.rent_item_id]: true,
                      }));
                      handleEarlyReturn(m);
                    }}
                  >
                    ↩️
                  </button>
                )}
              </td>
            </tr>
          ))}

          {filteredMachines.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No machines found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RenewalRentMachineEarlyReturn;
