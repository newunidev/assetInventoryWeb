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
        //console.log(' User permission Response Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Permissions:', error.message);
        throw error;
    }
};


export default {
    getAllPermissions
 };