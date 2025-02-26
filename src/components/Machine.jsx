import React, { useEffect, useState } from 'react';
import { getMachines } from '../utility/api';
import './Machine.css';

const branches = [
  "All", "Hettipola", "Bakamuna1", "Bakamuna2", "Mathara",
  "Welioya", "Sample Room", "Piliyandala"
];

const Machine = () => {
  const [machines, setMachines] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search input

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const data = await getMachines();
        if (Array.isArray(data)) {
          setMachines(data);
        } else if (data.items && Array.isArray(data.items)) {
          setMachines(data.items);
        } else {
          console.error("Unexpected API response format:", data);
        }
      } catch (error) {
        console.error("Failed to fetch machines:", error);
      }
    };

    fetchMachines();
  }, []);

  // Filter machines based on selected branch and search query
  // const filteredMachines = machines.filter(machine => 
  //   (selectedBranch === "All" || machine.branch === selectedBranch) &&
  //   (searchQuery === "" || machine.item_code.toLowerCase().includes(searchQuery.toLowerCase()))
  // );
  const filteredMachines = machines.filter(machine => 
    (selectedBranch === "All" || machine.branch === selectedBranch) &&
    (searchQuery === "" || 
      machine.item_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      machine.serial_no.toLowerCase().includes(searchQuery.toLowerCase()) // ✅ Search serial_no too
    )
  );


  return (
    <div className="machine-container">
      <h2>Machine Details</h2>

      {/* Filters: Branch Dropdown & Search Box */}
      <div className="filter-container">
      <div className="dropdown-container">
        <label htmlFor="branchSelect" className="block text-sm font-medium text-gray-700 mb-1">
          Select Branch:
        </label>
        <select
          id="branchSelect"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-200"
        >
          <option value="">-- Select a Branch --</option>
          {branches.map((branch, index) => (
            <option key={index} value={branch}>{branch}</option>
          ))}
        </select>
      </div>


        {/* Search Input Box */}
        <div className="search-container">
            <label htmlFor="searchInput">Search Item Code:</label>
            <input
                type="text"
                id="searchInput"
                placeholder="Enter Item Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchQuery('')} // Clears text on focus
            />
        </div>
      </div>

      {/* Machine Table */}
      <div className="table-container">
        <table>
            <thead>
            <tr>
                <th>Item Code</th>
                <th>Serial No</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Model No</th>
                <th>Box No</th>
            </tr>
            </thead>
            <tbody>
            {filteredMachines.length > 0 ? (
                filteredMachines.map((machine, index) => (
                <tr key={index}>
                    <td>{machine.item_code || 'N/A'}</td>
                    <td>{machine.serial_no || 'N/A'}</td>
                    <td>{machine.name || 'N/A'}</td>
                    <td>{machine.branch || 'N/A'}</td>
                    <td>{machine.model_no || 'N/A'}</td>
                    <td>{machine.box_no || 'N/A'}</td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="6">No machines found</td>
                </tr>
            )}
            </tbody>
        </table>
    </div>

    </div>
  );
};

export default Machine;
