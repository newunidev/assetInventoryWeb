import React, { useEffect, useState } from "react";
import "./RentMachineReturn.css";
import { usePageTitle } from "../utility/usePageTitle";
import { getAllLatestMachineLifeActiveAndExpired } from "../controller/RentMachineLifeController";

const RentMachineReturn = () => {
  const [, setPageTitle] = usePageTitle();
  const [expiredMachines, setExpiredMachines] = useState([]);
  const [returnedMachines, setReturnedMachines] = useState([]);
  const [searchExpired, setSearchExpired] = useState("");
  const [searchReturned, setSearchReturned] = useState("");

  const fetchMachines = async () => {
    const res = await getAllLatestMachineLifeActiveAndExpired();
    console.log("Response",res);
    if (res.success && res.data) {
      const mapped = res.data.map((item) => ({
        id: item.rent_item_id,
        name: item.RentMachine?.name || "Unknown",
        branch: item.Branch?.branch_name || "N/A",
        status: item.isExpired ? "Expired" : "Active",
        from_date: item.from_date,
        to_date: item.to_date,
        machine_status: item.RentMachine?.machine_status,
        isReturned: item.RentMachine?.machine_status === "Returned", // ✅ assume returned tracked here
        supplier:item.RentMachine?.Supplier?.name,
      }));

      setExpiredMachines(mapped.filter((m) => m.status === "Expired" && !m.isReturned));
      setReturnedMachines(mapped.filter((m) => m.isReturned));
    }
  };

  useEffect(() => {
    setPageTitle("♻️ Rent Machine Return");
    fetchMachines();
  }, []);

  return (
    <div className="rentreturn-wrapper">
      <div className="rentreturn-container">
        {/* LEFT SIDE - Expired Machines */}
        <div className="rentreturn-left">
          <div className="rentreturn-header">
            <h3>⚠️ Expired Machines</h3>
            <input
              type="text"
              placeholder="🔍 Search expired..."
              className="rentreturn-search"
              onChange={(e) => setSearchExpired(e.target.value)}
            />
          </div>

          <div className="rentreturn-table-container">
            <table className="rentreturn-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Supplier</th>
                  <th>Branch</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {expiredMachines
                  .filter(
                    (m) =>
                      m.name.toLowerCase().includes(searchExpired.toLowerCase()) ||
                      m.id.toLowerCase().includes(searchExpired.toLowerCase())
                  )
                  .map((machine) => (
                    <tr key={machine.id} className="expired-row">
                      <td>{machine.id}</td>
                      <td>{machine.name}</td>
                      <td>{machine.supplier}</td>
                      <td>{machine.branch}</td>
                      <td>{machine.from_date}</td>
                      <td>{machine.to_date}</td>
                      <td>{machine.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE - Returned Machines */}
        <div className="rentreturn-right">
          <div className="rentreturn-header">
            <h3>✅ Already Returned Machines</h3>
            <input
              type="text"
              placeholder="🔍 Search returned..."
              className="rentreturn-search"
              onChange={(e) => setSearchReturned(e.target.value)}
            />
          </div>

          <div className="rentreturn-table-container">
            <table className="rentreturn-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Returned Date</th>
                  <th>Machine Status</th>
                </tr>
              </thead>
              <tbody>
                {returnedMachines
                  .filter(
                    (m) =>
                      m.name.toLowerCase().includes(searchReturned.toLowerCase()) ||
                      m.id.toLowerCase().includes(searchReturned.toLowerCase())
                  )
                  .map((machine) => (
                    <tr key={machine.id} className="returned-row">
                      <td>{machine.id}</td>
                      <td>{machine.name}</td>
                      <td>{machine.branch}</td>
                      <td>{machine.to_date}</td>
                      <td>{machine.machine_status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentMachineReturn;
