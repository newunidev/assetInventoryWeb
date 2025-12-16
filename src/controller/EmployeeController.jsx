import apiClient from '../utility/api';


export const getAllPermissions = async (employee_id) => {
     
    try {
        const response = await apiClient.get(`employeepermissionsbyemployeid?employee_id=${employee_id}`);
        //console.log(' User permission Response Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Permissions:', error.message);
        throw error;
    }
};


export const getAllPermissionsAll = async () => {
     
    try {
        const response = await apiClient.get(`employeepermissions`);
        console.log(' User permission Response Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Permissions:', error.message);
        throw error;
    }
};

export const getAllBranches = async () => {
     
    try {
        const response = await apiClient.get(`branches`);
        //console.log(' User permission Response Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching branches:', error.message);
        throw error;
    }
};


export const getPermissions = async () => {
     
    try {
        const response = await apiClient.get(`permissions`);
        //console.log(' User permission Response Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching permissions:', error.message);
        throw error;
    }
};
export const createBulkEmployeePermissions = async (data) => {
 console.log("Created");
  try {
    const res = await apiClient.post(
      'employeepermissions-bulk', // <-- your backend route
      data
    );
    return res.data;
  } catch (error) {
    console.error("Error creating bulk employee permissions:", error);
    return { success: false, message: "Failed to create permissions" };
  }
};



export default {
    getAllPermissions,
    getAllBranches,
    createBulkEmployeePermissions,
 };