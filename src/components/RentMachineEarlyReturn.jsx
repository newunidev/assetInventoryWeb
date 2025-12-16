import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./RentMachineEarlyReturn.css";
import { usePageTitle } from "../utility/usePageTitle";

import { purchaseOrderByPoId } from "../controller/PurchaseOrderController";
import { categoryPurchaseOrderByPoId } from "../controller/CategoryPurchaseOrderController";
import { getGrnDetailsWithGrnRentMachinesByPoId } from "../controller/GrnController";
import {
  createRentMachineEarlyReturnBulk,
  getAllRentMachineEarlyReturnByPoId,
} from "../controller/RentMachineEarlyReturnController";

const RentMachineEarlyReturn = () => {
  const { poNo } = useParams();
  const poId = poNo.replace("-", "/");
  const [, setPageTitle] = usePageTitle();
  const navigate = useNavigate();

  const [poDetails, setPoDetails] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [disabledButtons, setDisabledButtons] = useState({});
  const [alreadyEarlyReturned, setAlreadyEarlyReturned] = useState([]);

  useEffect(() => {
    setPageTitle("Rent Machine Early Return");
    fetchReportData(poId);
    fetchMachineList(poId);
  }, [poId]);

  const fetchReportData = async (id) => {
    try {
      const poRes = await purchaseOrderByPoId(id);
      const catRes = await categoryPurchaseOrderByPoId(id);

      if (poRes.success && poRes.purchaseOrder) {
        setPoDetails(poRes.purchaseOrder);
      }

      if (catRes.success && Array.isArray(catRes.categoryPurchaseOrders)) {
        setCategoryItems(catRes.categoryPurchaseOrders);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Unknown error");
    }
  };

  const fetchMachineList = async (id) => {
    try {
      const res = await getGrnDetailsWithGrnRentMachinesByPoId(id);

      if (res.success && Array.isArray(res.grns)) {
        const allMachines = res.grns.flatMap((g) => g.GRN_RentMachines);
        console.log(allMachines);
        setMachineList(allMachines);
      } else {
        setMachineList([]);
      }
    } catch (err) {
      console.error("Error fetching GRN machines:", err);
      setMachineList([]);
    }
  };

  const filteredMachines = machineList.filter((m) => {
    const id = m.RentMachine?.rent_item_id?.toLowerCase() || "";
    const serial = m.RentMachine?.serial_no?.toLowerCase() || "";

    return (
      id.includes(searchTerm.toLowerCase()) ||
      serial.includes(searchTerm.toLowerCase())
    );
  });

  const handleEarlyReturn = async (machine) => {
    console.log("Display", machine);
    try {
      const payload = {
        po_id: poId,
        items: [
          {
            cpo_id: machine.cpo_id, // you must have this in your machine object
            rent_item_id: machine.rent_item_id,
            per_day_cost: machine.per_day_cost, // you should set proper values
            d_rate: machine.d_rate,
            from_date: machine?.from_date, // modify if needed
            to_date: new Date().toISOString().split("T")[0], // modify if needed
          },
        ],
      };

      console.log("PAYLOAD", payload);

      const res = await createRentMachineEarlyReturnBulk(payload);

      if (res.success) {
        alert("Machine Early Return Request successfully!");
        fetchMachineList(poId); // refresh page list
      }
    } catch (e) {
      console.error("Early Return error", e);
      alert("Error processing early return!");
    }
  };

  useEffect(() => {
    fetchEarlyReturns(poId);
  }, [poId]);

  const fetchEarlyReturns = async (id) => {
    try {
      const res = await getAllRentMachineEarlyReturnByPoId(id);
      if (res.success) {
        // Store only rent_item_id
        const ids = res.data.map((x) => x.rent_item_id);
        setAlreadyEarlyReturned(ids);
      }
    } catch (e) {
      console.error("error fetch early returns", e);
    }
  };

  return (
    <div className="rentmachine-earlyreturn-wrapper">
      {categoryItems.length > 0 && (
        <div className="rentmachine-earlyreturn-category-card">
          <h3 className="rentmachine-earlyreturn-section-title">
            PURCHASE ORDER SUMMARY : {poId}
          </h3>
          <table className="rentmachine-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>From</th>
                <th>To</th>
                <th>Qty</th>
                <th>No.Of Days</th>
                <th>Cost / Day</th>
              </tr>
            </thead>
            <tbody>
              {categoryItems.map((c, i) => {
                const days =
                  (new Date(c.to_date) - new Date(c.from_date)) /
                    (1000 * 60 * 60 * 24) +
                  1;
                return (
                  <tr key={i}>
                    <td>{c.Category?.cat_name}</td>
                    <td>{c.description}</td>
                    <td>{c.from_date}</td>
                    <td>{c.to_date}</td>
                    <td>{c.Qty}</td>
                    <td>{days}</td>
                    <td>{c.PerDay_Cost}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MACHINE SECTION */}
      <div className="rentmachine-earlyreturn-table-wrapper">
        <h3 className="rentmachine-earlyreturn-section-title">
          Machines Under this PO
        </h3>
        <p className="rentmachine-earlyreturn-note">
          Select a machine to perform early return
        </p>

        {/* SEARCH */}
        <div className="rentmachine-earlyreturn-search">
          <input
            className="rentmachine-earlyreturn-search-input"
            placeholder="Search by Machine Code or Serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="rentmachine-table">
          <thead>
            <tr>
              <th>Machine Code</th>
              <th>Model</th>
              <th>Serial</th>
              <th>Branch</th>
              <th>Return</th>
            </tr>
          </thead>
          <tbody>
            {filteredMachines.map((m, i) => (
              <tr key={i}>
                <td>{m.RentMachine?.rent_item_id}</td>
                <td>{m.RentMachine?.model_no}</td>
                <td>{m.RentMachine?.serial_no}</td>
                <td>{poDetails?.branch}</td>
                <td>
                  {alreadyEarlyReturned.includes(
                    m.RentMachine?.rent_item_id
                  ) ? (
                    <span style={{ color: "gray", fontWeight: "600" }}>
                      Returned
                    </span>
                  ) : (
                    <button
                      className="rentmachine-earlyreturn-btn"
                      disabled={disabledButtons[m.RentMachine?.rent_item_id]}
                      onClick={() => {
                        const code = m.RentMachine?.rent_item_id;
                        setDisabledButtons((p) => ({ ...p, [code]: true }));
                        handleEarlyReturn({
                          cpo_id: m.cpo_id || m.CategoryPurchaseOrder?.cpo_id,
                          rent_item_id: code,
                          d_rate: m.CategoryPurchaseOrder?.d_percent,
                          from_date: m.CategoryPurchaseOrder?.from_date,
                          per_day_cost:
                            m.PerDay_Cost ||
                            m.CategoryPurchaseOrder?.PerDay_Cost,
                        });
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
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No machines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RentMachineEarlyReturn;
