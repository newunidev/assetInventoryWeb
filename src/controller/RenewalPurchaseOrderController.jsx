import apiClient from "../utility/api"; // Import the existing Axios instance

export const bulkCreateRenewalPurchaseOrderMachines = async (
  purchaseOrderMachines
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      "porenewalmachinesbulk",
      purchaseOrderMachines,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Renwal Purchase Orders created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Category Purchase Orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getRenewalPurchaseOrderMachinesByPoId = async (po_id) => {
  try {
    const token = localStorage.getItem("token"); // Step 1: Get token

    const response = await apiClient.get(`porenewalmachinesbypo?po_id=${po_id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Step 2: Attach token
      },
    });

    //console.log("Rent Machines",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Renewal Purchase Order machines:", error);
    throw error;
  }
};

export const deleteRenewalPurchaseOrderMachine = async (mr_id) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.delete(
      `deleteporenewalmachine/${mr_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Renewal Purchase Order Machine deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error deleting Renewal Purchase Order Machine:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const bulkRenewalPurchaseOrderUpdateCreate  = async (purchaseOrders) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      "porenewalmachinesbulk-create-update",
      purchaseOrders,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Rewewal Purchase Orders updated created successfully:",
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updated created Renewal Purchase Orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};



export default {
  bulkCreateRenewalPurchaseOrderMachines,
  deleteRenewalPurchaseOrderMachine,
  getRenewalPurchaseOrderMachinesByPoId,
  bulkRenewalPurchaseOrderUpdateCreate,
};
