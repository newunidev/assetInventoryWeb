import apiClient from "../utility/api"; // Import the existing Axios instance

export const createRentMachineAllocation = async (allocationData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("rentmachineallocations", allocationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Rent Machine Allocation Created Success", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Rent Machine Allocation:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllRentMachineAllocations = async () => {
  try {
    const response = await apiClient.get(`rentmachineallocations`);
    //console.log("Supplier Response:", response.data); // ✅ Log API response
    return response.data; // Return item data
  } catch (error) {
    console.error("Error fetching Rent machine Allocations:", error.message);
    throw error;
  }
};

export default{
    createRentMachineAllocation,
    getAllRentMachineAllocations,
};