import apiClient from "../utility/api"; // Existing Axios instance

// ================= GRN API METHODS ================= //

/**
 * Get all GRNs
 */
export const getAllGrns = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get("grns", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GRNs:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create a new GRN
 * @param {Object} grnData - Data to create GRN
 */
export const createGrn = async (grnData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.post("grns", grnData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("GRN Created Successfully", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating GRN:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get GRN by ID
 * @param {string} grnId
 */
export const getGrnById = async (grnId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(`grns/${encodeURIComponent(grnId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GRN by ID:", error.response?.data || error.message);
    throw error;
  }
};

 
export const updateGrn = async (grnId, updateData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.put(`grns/${encodeURIComponent(grnId)}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("GRN Updated Successfully", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating GRN:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteGrnById = async (grnId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.delete(
      `grnsdeletebyid?id=${encodeURIComponent(grnId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("GRN Deleted Successfully", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting GRN:",
      error.response?.data || error.message
    );
    throw error;
  }
};



export const getGrnDetailsWithGrnRentMachinesByPoId = async (po_id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(`grns-rentmachine-cpo-bypoid?po_id=${encodeURIComponent(po_id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.log("Error fetching GRN full details with renmachines grns by PO ID:", error.response?.data || error.message);
    throw error;
  }
};

export default {
  getAllGrns,
  createGrn,
  getGrnById,
  updateGrn,
  deleteGrnById,
};