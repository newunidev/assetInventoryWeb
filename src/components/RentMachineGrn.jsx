import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPlus, FaSearch, FaBoxOpen } from "react-icons/fa";
import "./RentMachineGrn.css";
import { categoryPurchaseOrderByPoId } from "../controller/CategoryPurchaseOrderController";
import { getAllMachineAvailableToGrn } from "../controller/RentMachineController";
import { createGrn } from "../controller/GrnController";
import { createBulkGrnRentMachines } from "../controller/GrnRentMachineController";
import {
  deleteGrnById,
  getGrnDetailsWithGrnRentMachinesByPoId,
} from "../controller/GrnController";

import { usePageTitle } from "../utility/usePageTitle";

const RentMachineGrn = () => {
  const [, setPageTitle] = usePageTitle();
  const { poId } = useParams();
  const [po, setPo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [newMachine, setNewMachine] = useState({ name: "", serial: "" });
  const [allInactiveMachines, setAllInactiveMachines] = useState([]);

  // 1️⃣ Put this ABOVE your useEffect
  const fetchAndMergeGRNData = async (currentPO) => {
    try {
      const grnRes = await getGrnDetailsWithGrnRentMachinesByPoId(
        currentPO.po_no
      );
      //console.log("grn Response", grnRes);
      if (grnRes.success && grnRes.grns) {
        const allGRNMachines = grnRes.grns.flatMap((grn) =>
          grn.GRN_RentMachines.map((rm) => ({
            rent_item_id: rm.rent_item_id,

            serial: rm.RentMachine?.serial_no || "",
            category: rm.RentMachine?.Category.cat_name || "", // <-- flatten
            supplier: rm.RentMachine?.Supplier?.name || "", // <-- flatten
            cat_id: rm.CategoryPurchaseOrder?.cat_id,
          }))
        );

        const updatedPO = {
          ...currentPO,
          categories: currentPO.categories.map((cat) => ({
            ...cat,
            receivedMachines: [
              ...cat.receivedMachines,
              ...allGRNMachines.filter((m) => m.cat_id === cat.id),
            ],
          })),
        };

        setPo(updatedPO);
        //console.log("Updated Po",updatedPO);
      }
    } catch (error) {
      console.error("Error fetching GRN details:", error);
    }
  };

  useEffect(() => {
    setPageTitle("Rent Machine GRN");
  }, [setPageTitle]);
  //
  useEffect(() => {
    const fetchPOData = async () => {
      try {
        const id = poId;
        const res = await categoryPurchaseOrderByPoId(id);
        console.log("Cat PO Data", res);
        if (res.success && res.categoryPurchaseOrders) {
          const formattedPO = {
            po_no: id,
            supplier: res.purchaseOrder?.Supplier.supplier_id,
            categories: res.categoryPurchaseOrders.map((item) => ({
              id: item.cat_id, // keep category id for UI mapping
              cpo_id: item.cpo_id, // <-- actual CategoryPurchaseOrder id
              name: item.Category?.cat_name || "",
              orderedQty: item.Qty,
              from_date: item.from_date,
              to_date: item.to_date,
              receivedMachines: [],
            })),
          };

          setPo(formattedPO);

          //console.log("Testing Supplier",formattedPO);
          // 🔹 Fetch GRN and merge immediately
          await fetchAndMergeGRNData(formattedPO);
        }
      } catch (error) {
        console.error("Error fetching PO data:", error);
      }
    };

    const fetchInactiveMachines = async () => {
      try {
        const res = await getAllMachineAvailableToGrn(
          localStorage.getItem("userBranchId")
        );
        console.log("machine to grn", res);
        if (res.success && res.machines) {
          setAllInactiveMachines(res.machines);
        }
      } catch (error) {
        console.error("Error fetching inactive machines:", error);
      }
    };

    fetchPOData();
    fetchInactiveMachines();
  }, []);

  useEffect(() => {
    if (!selectedCategory || !po) {
      setSearchResults([]);
      return;
    }
    console.log("Tesitng ", po);

    const filtered = allInactiveMachines.filter(
      (m) =>
        m.cat_id === selectedCategory.id &&
        m.sup_id === po.supplier && // <-- filter by supplier of the PO
        (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.serial_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setSearchResults(
      filtered.map((m) => ({
        ...m, // keep all original fields
        id: m.rent_item_id, // optionally override/add fields
        serial: m.serial_no,
      }))
    );
  }, [selectedCategory, searchTerm, allInactiveMachines, po]);

  const handleAddMachineToGRN = (machine) => {
    const flattenedMachine = {
      ...machine,
      category: machine.Category?.cat_name || "",
      supplier: machine.Supplier?.name || "",
    };

    setPo((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => {
        if (cat.id === selectedCategory.id) {
          // Check if machine already added
          const exists = cat.receivedMachines.some(
            (m) => m.rent_item_id === machine.rent_item_id
          );
          if (exists) return cat; // Do not add duplicates
          return {
            ...cat,
            receivedMachines: [...cat.receivedMachines, flattenedMachine],
          };
        }
        return cat;
      }),
    }));

    setSelectedCategory(null);
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleSaveNewMachine = () => {
    handleAddMachineToGRN({ id: Date.now(), ...newMachine });
    setShowAddMachineModal(false);
    setNewMachine({ name: "", serial: "" });
  };

  const handleCreateGrn = async () => {
    if (!po) return;

    let grnId = null;
    let branchId = null;

    try {
      // 1️⃣ Get already-received machines for this PO
      let alreadyReceivedIds = new Set();

      try {
        const existingGrnRes = await getGrnDetailsWithGrnRentMachinesByPoId(
          po.po_no
        );

        if (existingGrnRes.success && existingGrnRes.grns) {
          alreadyReceivedIds = new Set(
            existingGrnRes.grns.flatMap((grn) =>
              grn.GRN_RentMachines
                ? grn.GRN_RentMachines.map((rm) => rm.rent_item_id)
                : []
            )
          );
        }
      } catch (err) {
        // Handle "no GRN records found" (404) gracefully
        if (err.response && err.response.status === 404) {
          alreadyReceivedIds = new Set(); // No machines received yet
          console.log(
            "No previous GRN records found, continuing with new machines..."
          );
        } else {
          // Other errors should be thrown
          throw err;
        }
      }

      // 2️⃣ Filter only new machines that aren't already received
      const newMachines = po.categories.flatMap((cat) =>
        cat.receivedMachines
          .filter((m) => !alreadyReceivedIds.has(m.rent_item_id))
          .map((m) => ({
            cpo_id: cat.cpo_id,
            rent_item_id: m.rent_item_id,
            additional: "Checked and approved",
          }))
      );

      if (newMachines.length === 0) {
        alert("No new machines to add to GRN.");
        return;
      }

      // 3️⃣ Create GRN
      const grnData = {
        po_id: po.po_no,
        grn_date: new Date().toISOString().split("T")[0],
        created_by: parseInt(localStorage.getItem("userid")),
        additional: `Received ${newMachines.length} new units in good condition.`,
      };

      //console.log("grn Data", grnData);

      const grnResponse = await createGrn(grnData);

      if (grnResponse.success && grnResponse.grn) {
        grnId = grnResponse.grn.grn_id;
        branchId = localStorage.getItem("userBranchId");
        // 4️⃣ Attach GRN ID to new machines
        // const bulkData = newMachines.map((m) => ({

        //   grn_id: grnId,
        //   branch: branchId,
        //   po_id:poId,

        //   ...m,
        // }));
        const bulkData = newMachines.map((m) => {
          const category = po.categories.find((cat) => cat.cpo_id === m.cpo_id);
          return {
            grn_id: grnId,
            branch: branchId,
            po_id: poId,
            cpo_id: m.cpo_id,
            rent_item_id: m.rent_item_id,
            from_date: category?.from_date || null,
            to_date: category?.to_date || null,
            additional: m.additional,
          };
        });

        const bulkResponse = await createBulkGrnRentMachines(bulkData);

        if (bulkResponse.success) {
          alert("GRN created successfully!");
        } else {
          await deleteGrnById(grnId);
          alert("Error creating GRN machines. GRN rolled back.");
        }
      } else {
        alert("Error creating GRN.");
      }
    } catch (error) {
      console.error("Error creating GRN:", error);
      if (grnId) {
        try {
          await deleteGrnById(grnId);
        } catch (deleteError) {
          console.error("Error rolling back GRN:", deleteError);
        }
      }
      alert("An error occurred while creating GRN.");
    }
  };

  if (!po) return <div className="loading">Loading...</div>;

  return (
    <div className="grn-wrapper">
      <div className="grn-page">
        <div className="grn-header">
          <h2>
            <FaBoxOpen /> GRN for PO: <span>{po.po_no}</span>
          </h2>
          <button className="top-right-grn-btn" onClick={handleCreateGrn}>
            GRN
          </button>
        </div>
        <div className="grn-data">
          <div className="grn-container">
            {po.categories.map((cat) => (
              <div key={cat.id} className="category-block">
                <div className="category-header">
                  <h3>{cat.name}</h3>
                  <p>
                    Ordered: {cat.orderedQty} | Received:{" "}
                    {cat.receivedMachines.length}
                  </p>
                  <button
                    className="add-btn"
                    disabled={cat.receivedMachines.length >= cat.orderedQty}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <FaPlus /> Add Machine
                  </button>
                </div>

                <table className="grn-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Code</th>
                      <th>Serial No</th>
                      <th>Category</th>
                      <th>Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.receivedMachines.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-row">
                          No machines received yet
                        </td>
                      </tr>
                    ) : (
                      cat.receivedMachines.map((m, idx) => {
                        // 🔹 Log each machine
                        //console.log("Received Machine:", m);

                        return (
                          <tr key={`${m.rent_item_id}-${m.serial}`}>
                            {/* unique key */}
                            <td>{idx + 1}</td>
                            <td>{m.rent_item_id}</td>
                            <td>{m.serial}</td>
                            <td>{m.category}</td>
                            <td>{m.supplier}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {selectedCategory && (
            <div className="grn-modal-backdrop">
              <div className="grn-modal">
                <h4>
                  <FaSearch /> Add Machine for {selectedCategory.name}
                </h4>

                <div className="grn-search-box">
                  <input
                    placeholder="Search Machine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <table className="grn-search-results">
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Serial No</th>
                      <th>Category</th>
                      <th>Supplier</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-row">
                          No results
                        </td>
                      </tr>
                    ) : (
                      searchResults.map((m) => {
                        const alreadyAdded = po.categories
                          .find((cat) => cat.id === selectedCategory.id)
                          ?.receivedMachines.some(
                            (rm) => rm.rent_item_id === m.rent_item_id
                          );

                        return (
                          <tr key={m.id}>
                            <td>{m.rent_item_id}</td>
                            <td>{m.serial}</td>
                            <td>{m.Category?.cat_name}</td>
                            <td>{m.Supplier?.name}</td>
                            <td>
                              {!alreadyAdded && (
                                <button
                                  className="grn-select-btn"
                                  onClick={() => handleAddMachineToGRN(m)}
                                  title="Select this machine"
                                >
                                  Select
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                <div className="grn-modal-actions">
                  <button
                    className="grn-secondary-btn"
                    onClick={() =>
                      window.open("/rentmachines/createrentmachines", "_blank")
                    }
                  >
                    + Add New Machine
                  </button>
                  <button
                    className="grn-cancel-btn"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAddMachineModal && (
            <div className="modal-backdrop">
              <div className="modal">
                <h4>New Machine</h4>
                <input
                  placeholder="Machine Name"
                  value={newMachine.name}
                  onChange={(e) =>
                    setNewMachine({ ...newMachine, name: e.target.value })
                  }
                />
                <input
                  placeholder="Serial Number"
                  value={newMachine.serial}
                  onChange={(e) =>
                    setNewMachine({ ...newMachine, serial: e.target.value })
                  }
                />
                <div className="modal-actions">
                  <button
                    className="primary-btn"
                    onClick={handleSaveNewMachine}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowAddMachineModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentMachineGrn;
