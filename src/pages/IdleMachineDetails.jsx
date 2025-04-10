import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./IdleMachineDetails.css";
import { getAllIdleScanCountbyCateogryFactory } from "../controller/ItemController";

const IdleMachineDetails = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const category = searchParams.get('category') || 'N/A';
  const categoryId = searchParams.get('category_id') || 'N/A';
  const factory = searchParams.get('factory') || 'N/A';
  const count = searchParams.get('count') || 'N/A';

  const [idleMachines, setIdleMachines] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await getAllIdleScanCountbyCateogryFactory(factory, categoryId);
      if (response.success) {
        setIdleMachines(response.data);
      }
    } catch (error) {
      console.log("Error loading data: ", error);
    }
  };

  return (
    <div className="idlemachineDetail-container">

      <div className="idlemachineDetail-leftSection">
        <div className="idlemachineDetail-card">
          <h2 className="idlemachineDetail-cardTitle">Selected Details</h2>
          <div className="idlemachineDetail-cardContent">
            <p><span>Category:</span> {category}</p>
            <p><span>Factory:</span> {factory}</p>
            <p><span>Count:</span> {count}</p>
          </div>
        </div>
      </div>

      <div className="idlemachineDetail-rightSection">

        <div className="idlemachineDetail-tableSection">
          <h3>Idle {category} Machines List - {factory}</h3>
          <table className="idlemachineDetail-table">
            <thead>
              <tr>
                <th>Machine Code</th>
                <th>Serial Number</th>
                <th>Model</th>
                <th>Last Scan Date</th>
                <th>Owner Branch</th>
              </tr>
            </thead>
            <tbody>
              {idleMachines.length > 0 ? (
                idleMachines.map((machine, index) => (
                  <tr key={index}>
                    <td>{machine.item.item_code}</td>
                    <td>{machine.item.serial_no}</td>
                    <td>{machine.item.model_no}</td>
                    <td>{machine.scanned_date}</td>
                    <td>{machine.item.branch}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No Data Available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Your Static Machine History Table */}
        <div className="idlemachineDetail-tableSection">
          <h3>Machine History</h3>
          <table className="idlemachineDetail-table">
            <thead>
              <tr>
                <th>Machine Code</th>
                <th>Status</th>
                <th>Updated Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>MC001</td>
                <td>Idle</td>
                <td>2024-04-01</td>
              </tr>
              <tr>
                <td>MC001</td>
                <td>In Use</td>
                <td>2024-03-25</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default IdleMachineDetails;
