// import React, { useState, useEffect } from "react";
// import { getCategories } from "../controller/CategoryController"; // Import API call
// import { getItemsByBranchCategory,getItemScans } from "../controller/ItemController";
// import "./InventoryReport.css"; // Import styles

// const InventoryReport = () => {
//   // State for filters
//   const [branch, setBranch] = useState("");
//   const [scannedDate, setScannedDate] = useState("");
//   const [category, setCategory] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [categories, setCategories] = useState([]); // Store categories
//   const [items, setItems] = useState([]); // Store retrieved items

 
//   const [itemScans, setItemScans] = useState([]); // Store scanned item data

//   // Sample branches (you can replace this with dynamic data)
//   const branches = [
//     "Hettipola", "Bakamuna1", "Bakamuna2", "Mathara",
//     "Welioya", "Sample Room", "Piliyandala"
//   ];

//   // 🔹 Fetch categories when component loads
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const data = await getCategories();
//         setCategories(data.categories); // Adjust based on API response
//       } catch (error) {
//         console.error("Failed to fetch categories:", error);
//       }
//     };

//     fetchCategories();
//   }, []);

 

// const handleSearchItems = async () => {
//   // Validation check
//   if (!branch || !category) {
//       alert("Please select a branch and category before searching.");
//       return;
//   }

//   console.log("Searching for:", { branch, scannedDate, category, searchTerm });

//   try {
//       const fetchedItems = await getItemsByBranchCategory(branch, category);
//       console.log("Fetched Items:", fetchedItems);

//       if (fetchedItems && fetchedItems.success) {
//           const itemsList = fetchedItems.items;

//           // Fetch item scans
//           const fetchedItemScans = await getItemScans(branch, category, scannedDate);
//           console.log("Fetched Item Scans:", fetchedItemScans);

//           if (fetchedItemScans && fetchedItemScans.success) {
//               const scannedItemCodes = new Set(fetchedItemScans.itemScans.map(scan => scan.Item.item_code));

//               // Map over items and set availability based on item_code presence in item scans
//               const updatedItems = itemsList.map(item => ({
//                   ...item,
//                   availability: scannedItemCodes.has(item.item_code) ? "Available" : "Not Available"
//               }));

//               setItems(updatedItems);
//           } else {
//               // If no scans found, mark all items as "Not Available"
//               const updatedItems = itemsList.map(item => ({
//                   ...item,
//                   availability: "Not Available"
//               }));
//               setItems(updatedItems);
//           }
//       } else {
//           setItems([]); // Clear items if no data
//       }
//   } catch (error) {
//       console.error("Error fetching items or scans:", error);
//   }
// };




  

//   return (
//     <div className="inventory-report-container">
//       <h2>Inventory Report</h2>

//       {/* Search Panel */}
//       <div className="search-panel">
//         <select value={branch} onChange={(e) => setBranch(e.target.value)}>
//           <option value="">Select Branch</option>
//           {branches.map((b, index) => (
//             <option key={index} value={b}>{b}</option>
//           ))}
//         </select>

//         <input
//           type="date"
//           value={scannedDate}
//           onChange={(e) => setScannedDate(e.target.value)}
//         />

//         <select value={category} onChange={(e) => setCategory(e.target.value)}>
//           <option value="">Select Category</option>
//           {categories.map((c, index) => (
//             <option key={index} value={c.cat_id}>{c.cat_name}</option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />

//         {/* Search Button */}
//         <button className="search-button" onClick={handleSearchItems}>
//           Search
//         </button>
//       </div>



      

//       <div className="table-container">
//         <table className="inventory-table">
//           <thead>
//             <tr>
//               <th>Item Code</th>
//               <th>Serial No</th>
//               <th>Name</th>
//               <th>Description</th>
//               <th>Category</th>
//               <th>Availability</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length > 0 ? (
//               items.map((item) => (
//                 <tr
//                   key={item.item_code}
//                   className={item.availability === "Available" ? "available-row" : ""}
//                 >
//                   <td>{item.item_code}</td>
//                   <td>{item.serial_no}</td>
//                   <td>{item.name}</td>
//                   <td>{item.description}</td>
//                   <td>{item.Category ? item.Category.cat_name : "N/A"}</td>
//                   <td>{item.availability}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" style={{ textAlign: "center" }}>No items found</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>


//     </div>
//   );
// };

// export default InventoryReport;




//updatge for the popup
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { getCategories } from "../controller/CategoryController";
import { getItemsByBranchCategory, getItemScans, getItemCountLastScannedLocation } from "../controller/ItemController";
import { FaTimes } from "react-icons/fa";
import "./InventoryReport.css"; // Import styles

const InventoryReport = () => {
  // State for filters
  const [branch, setBranch] = useState("");
  const [scannedDate, setScannedDate] = useState("");
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // State for popup
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItemCode, setSelectedItemCode] = useState(null);
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const branches = [
    "Hettipola", "Bakamuna1", "Bakamuna2", "Mathara",
    "Welioya", "Sample Room", "Piliyandala"
  ];

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
  }, []);

  const handleSearchItems = async () => {
    if (!branch || !category) {
      alert("Please select a branch and category before searching.");
      return;
    }

    try {
      const fetchedItems = await getItemsByBranchCategory(branch, category);
      if (fetchedItems && fetchedItems.success) {
        const itemsList = fetchedItems.items;
        const fetchedItemScans = await getItemScans(branch, category, scannedDate);

        if (fetchedItemScans && fetchedItemScans.success) {
          const scannedItemCodes = new Set(fetchedItemScans.itemScans.map(scan => scan.Item.item_code));
          const updatedItems = itemsList.map(item => ({
            ...item,
            availability: scannedItemCodes.has(item.item_code) ? "Available" : "Not Available"
          }));
          setItems(updatedItems);
        } else {
          setItems(itemsList.map(item => ({ ...item, availability: "Not Available" })));
        }
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching items or scans:", error);
    }
  };

  // Function to open popup and fetch last scan details
  const handleRowClick = async (itemCode) => {
    setSelectedItemCode(itemCode);
    setShowPopup(true);
    setItemDetails(null);
    setError(null);
    setLoading(true);

    try {
      const response = await getItemCountLastScannedLocation(itemCode);
      if (response.success && response.latestItemCount) {
        setItemDetails(response.latestItemCount);
      } else {
        setError("No data found for this item.");
      }
    } catch (error) {
      setError("Failed to fetch item details.");
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedItemCode(null);
    setItemDetails(null);
  };

  return (
    <div className="inventory-report-container">
      <h2>Inventory Report</h2>

      <div className="search-panel">
        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">Select Branch</option>
          {branches.map((b, index) => (
            <option key={index} value={b}>{b}</option>
          ))}
        </select>

        <input type="date" value={scannedDate} onChange={(e) => setScannedDate(e.target.value)} />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((c, index) => (
            <option key={index} value={c.cat_id}>{c.cat_name}</option>
          ))}
        </select>

        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <button className="search-button" onClick={handleSearchItems}>Search</button>
      </div>

      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Serial No</th>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.item_code} className={item.availability === "Available" ? "available-row" : ""}
                  onClick={() => handleRowClick(item.item_code)}>
                  <td>{item.item_code}</td>
                  <td>{item.serial_no}</td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.Category ? item.Category.cat_name : "N/A"}</td>
                  <td>{item.availability}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>No items found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Dialog */}
      {showPopup &&
        ReactDOM.createPortal(
          <div className="assetinventoryreport-popup">
            <div className="assetinventoryreport-popup-content">
              <button className="assetinventoryreport-close-btn" onClick={closePopup}>
                <FaTimes />
              </button>
              <h3 className="assetinventoryreport-title">MACHINE TRACKER</h3>
              {loading && <p className="assetinventoryreport-loading">Loading...</p>}
              {error && <p className="assetinventoryreport-error">{error}</p>}
              {itemDetails && (
                <div className="assetinventoryreport-item-details">
                  <h4>Item Details</h4>
                  <p>🔹 <strong>Name:</strong> {itemDetails.Item.name}</p>
                  <p>🔢 <strong>Serial No:</strong> {itemDetails.Item.serial_no}</p>
                  <p>📂 <strong>Category:</strong> {itemDetails.Category.cat_name}</p>
                  <p>📅 <strong>Last Scanned Date:</strong> {itemDetails.scanned_date}</p>
                  <p>🏢 <strong>Last Scanned Branch:</strong> {itemDetails.current_branch}</p>
                  <p>📍 <strong>Owner Branch:</strong> {itemDetails.branch}</p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default InventoryReport;
