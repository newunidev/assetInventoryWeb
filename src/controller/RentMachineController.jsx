import apiClient from "../utility/api"; // Import the existing Axios instance

export const getAllSuppliers = async () => {
  try {
    const response = await apiClient.get(`suppliers`);
    //console.log("Supplier Response:", response.data); // ✅ Log API response
    return response.data; // Return item data
  } catch (error) {
    console.error("Error fetching Suupliers:", error.message);
    throw error;
  }
};

// export const getAllRentMachines = async () => {
//   try {
//     const response = await apiClient.get("rentmachines");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching Rent Machines");
//     throw error;
//   }
// };
export const getAllRentMachines = async () => {
  try {
    const token = localStorage.getItem("token"); // Step 1: Get token

    const response = await apiClient.get("rentmachines", {
      headers: {
        Authorization: `Bearer ${token}`, // Step 2: Attach token
      },
    });

    console.log("Rent Machines",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Rent Machines:", error);
    throw error;
  }
};

// export const createRentMachines = async (assetData) => {
//   try {
//     const response = await apiClient.post("rentmachines", assetData);
//     console.log("Rent Machine Created Success", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error creating rent Machines:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

export const createRentMachines = async (assetData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("rentmachines", assetData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Rent Machine Created Success", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating rent Machines:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createRentTimeAllocation = async (allocationData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("rentmachinetimes", allocationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Rent Time Allocation Created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Rent Time Allocation:",
      error.response?.data || error.message
    );
    throw error;
  }
};
//get rent machines with no avctive by branch
export const getAllMachineAvailableToGrn = async (branch) => {
  try {
    const token = localStorage.getItem("token"); // Step 1: Get token
    //console.log("Branch:",branch);
    const response = await apiClient.get(`rentmachines-avaialable-to-grn?rented_by=&machine_status=${"Returned"}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Step 2: Attach token
      },
    });


    //console.log("Rent Machines",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Not Active Rent Machines:", error);
    throw error;
  }
};

//new Method to get Grn Items from RETURNED and AVailable TO Grn
export const getAllMachineAvailableToGrnAndReturned = async () => {
  try {
    const token = localStorage.getItem("token"); // Step 1: Get token
    //console.log("Branch:",branch);
    const response = await apiClient.get(`rentmachines-avaialable-to-grn-all`, {
      headers: {
        Authorization: `Bearer ${token}`, // Step 2: Attach token
      },
    });


    //console.log("Rent Machines",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Not Active Rent Machines:", error);
    throw error;
  }
};



export default {
  getAllSuppliers,
  getAllRentMachines,
  createRentMachines,
  createRentTimeAllocation,
  getAllMachineAvailableToGrn,
  getAllMachineAvailableToGrnAndReturned,
  
};
