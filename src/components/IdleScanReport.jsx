import React, { useState, useEffect } from "react";
import { getCategories } from "../controller/CategoryController";
import { getAllIdleScanCountbyCateogryLast3Days,getAllIdleScanCountbyCateogryTodaysDate } from "../controller/ItemController";
import "./IdleScanReport.css"; // Import styles
import { GiSewingMachine } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

const IdleScanReport = () => {
  const [categories, setCategories] = useState([]);
  const [scanDataMap, setScanDataMap] = useState({}); // Stores scan counts
  const [selectedCategory, setSelectedCategory] = useState(""); // Filter by category
  const navigate = useNavigate();
  // Manually set the branch names
  const branches = [
    { branch_id: 1, branch_name: "Hettipola" },
    { branch_id: 2, branch_name: "Welioya" },
    { branch_id: 3, branch_name: "Mathara" },
    { branch_id: 4, branch_name: "Bakamuna1" },
    { branch_id: 5, branch_name: "Bakamuna2" },
    { branch_id: 6, branch_name: "Piliyandala" },
    { branch_id: 7, branch_name: "Sample Room" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData.categories || []);

        // Fetch scan count data
        const scanCountsResponse =
          await getAllIdleScanCountbyCateogryTodaysDate();
        if (scanCountsResponse.success) {
          processScanData(scanCountsResponse.counts || []);
          console.log("Data", scanCountsResponse);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const processScanData = (scans) => {
    let dataMap = {};

    // Initialize the scanDataMap with categories and branches
    categories.forEach((category) => {
      dataMap[category.cat_id] = {
        category_name: category.cat_name,
        counts: {},
      };
      branches.forEach((branch) => {
        dataMap[category.cat_id].counts[branch.branch_name] = 0; // Default count is 0
      });
    });

    // Process scan counts and organize them by category and branch
    scans.forEach(
      ({ category_id, category_name, current_branch, unique_item_count }) => {
        if (!dataMap[category_id]) {
          dataMap[category_id] = {
            category_name: category_name,
            counts: {},
          };
        }
        if (!dataMap[category_id].counts[current_branch]) {
          dataMap[category_id].counts[current_branch] = 0; // Set to 0 if it's missing
        }
        dataMap[category_id].counts[current_branch] = unique_item_count || 0;
      }
    );

    setScanDataMap(dataMap);
  };

  return (
    <div>
      <div className="idleScanReport-header-container">
         
         
      </div>

      {/* Dropdown to filter by category */}
      <div className="idleScanReport-filter-container">
        <label htmlFor="categoryFilter">Filter by Category: </label>
        <select
          id="idlescanreport-categoryFilter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.cat_id} value={category.cat_id}>
              {category.cat_name}
            </option>
          ))}
        </select>
      </div>

      <div className="idleScanReport-table-container">
        <table className="idleScanReport-scan-table">
          <thead>
            <tr>
              <th>Category</th>
              {branches.map((branch) => (
                <th key={branch.branch_id}>{branch.branch_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories
              .filter(
                (category) =>
                  selectedCategory === "" ||
                  category.cat_id === Number(selectedCategory)
              )
              .map((category) => (
                <tr key={category.cat_id}>
                  <td>{category.cat_name}</td>
                  {branches.map((branch) => {
                    const count =
                      scanDataMap[category.cat_id]?.counts[
                        branch.branch_name
                      ] || 0;

                    return (
                      <td
                        key={branch.branch_id}
                        onClick={() => {
                          const queryParams = new URLSearchParams({
                            category: category.cat_name,
                            category_id: category.cat_id,
                            
                            factory: branch.branch_name,
                            count: count,
                          }).toString();
                        
                          window.open(`/idlemachinedetails?${queryParams}`, '_blank');
                        }}
                        
                        style={{ cursor: "pointer" }} // Optional: shows hand cursor
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* <div className="idleScanReport-table-container">
        <table className="idleScanReport-scan-table">
          <thead>
            <tr>
              <th>Category</th>
              {branches.map((branch) => (
                <th key={branch.branch_id}>{branch.branch_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories
              .filter(
                (category) =>
                  selectedCategory === "" ||
                  category.cat_id === Number(selectedCategory)
              )
              .map((category) => (
                <tr key={category.cat_id}>
                  <td>{category.cat_name}</td>
                  {branches.map((branch) => {
                    const idleCount =
                      scanDataMap[category.cat_id]?.counts[
                        branch.branch_name
                      ] || 0;

                    const runningCount = 0; // Dummy Running Machine Count

                    return (
                      <td
                        key={branch.branch_id}
                        onClick={() => {
                          const queryParams = new URLSearchParams({
                            category: category.cat_name,
                            category_id: category.cat_id,
                            factory: branch.branch_name,
                            count: idleCount,
                          }).toString();

                          window.open(
                            `/idlemachinedetails?${queryParams}`,
                            "_blank"
                          );
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div style={{ color: "red", fontWeight: "bold" }}>
                          {idleCount}
                        </div>
                        <div style={{ color: "green", fontWeight: "bold" }}>
                          {runningCount}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default IdleScanReport;
