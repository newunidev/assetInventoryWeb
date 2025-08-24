import apiClient from "../utility/api"; // Existing Axios instance

export const getAllGrnRentMachines = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get("grn-rent-machines", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GRNs:", error.response?.data || error.message);
    throw error;
  }
};

export const createBulkGrnRentMachines = async (grnDataArray) => {
   
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.post("grn-rent-machines-bulk", grnDataArray, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Bulk GRN Created Successfully", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating bulk GRNs:", error.response?.data || error.message);
    throw error;
  }
};
export default {
 getAllGrnRentMachines,
 createBulkGrnRentMachines,
};