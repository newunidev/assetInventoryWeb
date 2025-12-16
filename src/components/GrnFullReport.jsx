import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./GrnFullReport.css";
// Import your API
import { getGrnDetailsWithGrnRentMachinesByPoId } from "../controller/GrnController";

export default function GrnFullView() {
  const { poNo } = useParams();
  const poId = poNo.replace("-", "/");

  const [loading, setLoading] = useState(true);
  const [poDetails, setPoDetails] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [grnList, setGrnList] = useState([]);

  useEffect(() => {
    const fetchGrnData = async () => {
      setLoading(true);

      try {
        const res = await getGrnDetailsWithGrnRentMachinesByPoId(poId);

        if (res.success) {
          // Set PO details from the first GRN
          setPoDetails(res.grns.length > 0 ? res.grns[0].PurchaseOrder : null);
          console.log("res.grns",res.grns);
          // Set the GRN list
          setGrnList(res.grns || []);
        } else {
          setPoDetails(null);
          setGrnList([]);
        }
      } catch (err) {
        console.error("Error fetching GRN details:", err);
        setPoDetails(null);
        setGrnList([]);
      }

      setLoading(false);
    };

    fetchGrnData();
  }, [poId]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div className="grnfullview-wrapper">
      {/* HEADER */}
      <div className="grnfullview-header">
        <button
          onClick={() => window.history.back()}
          className="grnfullview-backbtn"
        >
          <FaArrowLeft size={14} /> Back
        </button>

        <h2 className="grnfullview-title">
          GRN Full View — PO Number:{" "}
          <span style={{ color: "#007bff" }}>{poId}</span>
        </h2>
      </div>

      {/* PO DETAILS */}
      {poDetails && (
        <div className="grnfullview-po-box">
          <p>
            <strong>Supplier:</strong> {poDetails?.supplier_id}
          </p>
          <p>
            <strong>Created Date:</strong> {poDetails.date}
          </p>
          <p>
            <strong>Deliver To:</strong> {poDetails.deliver_to}
          </p>
          <p>
            <strong>Payment Term:</strong> {poDetails.payment_term}
          </p>
        </div>
      )}

      {/* GRN LIST */}
      <div className="grnfullview-grnlist">
        {grnList.length === 0 ? (
          <p>No GRN records found.</p>
        ) : (
          grnList.map((grn, index) => (
            <div key={index} className="grnfullview-grn-card">
              <h3>
                GRN No: <span style={{ color: "#28a745" }}>{grn.grn_id}</span>
              </h3>
              <p>
                <strong>GRN Date:</strong> {grn.grn_date}
              </p>
              <p>
                <strong>Additional Notes:</strong> {grn.additional}
              </p>

              {/* MACHINES INSIDE THIS GRN */}
              <div className="grnfullview-table-wrapper">
                <table className="grnfullview-table">
                  <thead>
                    <tr>
                      <th>Machine Code</th>
                      <th>Name</th>
                      <th>Serial No</th>
                      <th>Category</th>
                      <th>Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grn.GRN_RentMachines.map((rm, i) => (
                      <tr key={i}>
                        <td>{rm.RentMachine.rent_item_id}</td>
                        <td>{rm.RentMachine.name}</td>
                        <td>{rm.RentMachine.serial_no}</td>
                        <td>{rm.RentMachine.Category?.cat_name}</td>
                        <td>{rm.RentMachine.branch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
