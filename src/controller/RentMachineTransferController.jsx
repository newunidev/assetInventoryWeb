import apiClient from "../utility/api"; // Import the existing Axios instance

export const createRentMachineTransfer = async (transferData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      "rentmachinetransfers",
      transferData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Rent Machine Transfer Created Success", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Rent Machine Transfers:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllRentMachineTransfers = async () => {
  try {
    const response = await apiClient.get(`rentmachinetransfers`);
    //console.log("Supplier Response:", response.data); // ✅ Log API response
    return response.data; // Return item data
  } catch (error) {
    console.error("Error fetching Rent machine Transfers:", error.message);
    throw error;
  }
};

export const updateRentMachineTransferStatus = async (
  rent_m_id,
  status,
  acceptedBy
) => {

  console.log("Values",rent_m_id,status,acceptedBy);
  try {
    const token = localStorage.getItem("token");

    const response =await apiClient.put(
      `/rentmachinetransferstatus-update?rent_m_id=${rent_m_id}`,
      {
        Status: status,
        Accepted_by: acceptedBy,
      }
    );

    console.log("✅ Rent Machine Transfer Status Updated:", response.data);
    return response.data;
  } catch (error) {
     
    console.error(
      "❌ Error updating Rent Machine Transfer Status:",
      error.data || error.message
    );
    throw error;
  }
};

export default {
  createRentMachineTransfer,
  getAllRentMachineTransfers,
  updateRentMachineTransferStatus,
};
