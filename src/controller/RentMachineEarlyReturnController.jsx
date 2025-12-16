import apiClient from "../utility/api"; // Import the existing Axios instance

 

export const createRentMachineEarlyReturnBulk = async (payload) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("cpoearlyreturn", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Rent Machine Early return Bulk Created Success", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating rent Machines early returns:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createRenewalRentMachineEarlyReturnBulk = async (payload) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("renewalpoer", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Renewal Rent Machine Early return Bulk Created Success", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Renewal rent Machines early returns:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getAllRentMachineEarlyReturnByPoId = async (poId) => {
  try {
    const response = await apiClient.get(`cpoearlyreturnbypoid?po_id=${poId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Rent Machines Early returns");
    throw error;
  }
};

export const getAllRenewalRentMachineEarlyReturnByPoId = async (poId) => {
  try {
    const response = await apiClient.get(`renewalpoer?po_id=${poId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Rent Machines Early returns");
    throw error;
  }
};
 



export default {
   createRentMachineEarlyReturnBulk,
   getAllRentMachineEarlyReturnByPoId,
   createRenewalRentMachineEarlyReturnBulk,
   getAllRenewalRentMachineEarlyReturnByPoId,
  
};
