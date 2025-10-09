import apiClient from "../utility/api"; // Existing Axios instance

export const getAllRentMachineLifeActive = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get("rentmachinesActive", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Rent Machine lisfe with Active:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllRentMachineLifeExpired = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get("rentmachinesexpired", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Rent Machine lisfe with Expired:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllLatestMachineLifeActiveAndExpired = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get("rentmachinesActiveExpiredLatestLife", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching AllLatestMachineLifeActiveAndExpired:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllLatestMachineLifeActiveByRentItemId = async (rent_item_id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(`rentmachineLatesActiveByRentMachineId?rent_item_id=${rent_item_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching getAllLatestMachineLifeActiveByRentItemId:", error.response?.data || error.message);
    throw error;
  }
};

//new Method to get Grn Items from RETURNED and AVailable TO Grn
export const getRentMachineLifeRecordByItemId = async (item_id) => {
  try {
    const token = localStorage.getItem("token"); // Step 1: Get token
    //console.log("Branch:",branch);
    const response = await apiClient.get(`rentmachinelifehistorybyitemid?rent_item_id=${item_id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Step 2: Attach token
      },
    });


    //console.log("Rent Machines",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Machine life records by item id:", error);
    throw error;
  }
};


export default {
 getAllRentMachineLifeActive,
 getAllRentMachineLifeExpired,
 getAllLatestMachineLifeActiveAndExpired,
 getRentMachineLifeRecordByItemId,
};