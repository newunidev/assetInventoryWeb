import apiClient from "../utility/api"; // Import the existing Axios instance

export const getAllCategoryPurchaseOrders = async () => {
  try {
    const token = localStorage.getItem("token"); // Step 1: Get token

    const response = await apiClient.get("categorypurchaseorders", {
      headers: {
        Authorization: `Bearer ${token}`, // Step 2: Attach token
      },
    });

    //console.log("Rent Machines",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Purchase Orders:", error);
    throw error;
  }
};

export const createCategoryPurchaseOrder = async (purchaseOrder) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      "categorypurchaseoders",
      purchaseOrder,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Category Purchase Order created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Category Purchase Orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const bulkcreateCategoryPurchaseOrders = async (purchaseOrders) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      "bulk-category-purchaseorders",
      purchaseOrders,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Category Purchase Orders created successfully:",
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Category Purchase Orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const bulkCategoryPurchaseOrderUpdateCreate  = async (purchaseOrders) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      "bulk-category-purchaseorders-update",
      purchaseOrders,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Category Purchase Orders updated created successfully:",
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updated created Category Purchase Orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 🔍 Get category purchase orders by POID
export const categoryPurchaseOrderByPoId = async (poid) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(
      `categorypurchaseordersbypoid?poid=${encodeURIComponent(poid)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Controller method ", response);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching Category Purchase Order by POID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 🔹 Delete Category Purchase Order by cpo_id
export const deleteCategoryPurchaseOrder = async (cpo_id) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.delete(
      `categorypurchaseorders/${cpo_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Category Purchase Order deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting Category Purchase Order:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default {
  getAllCategoryPurchaseOrders,
  bulkcreateCategoryPurchaseOrders,
  categoryPurchaseOrderByPoId,
  deleteCategoryPurchaseOrder
};
