import apiClient from '../utility/api'; // Import the existing Axios instance


export const getAllEmployee = async () => {
    try {
        const response = await apiClient.get(`employees`);
        console.log('Employee Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Users:', error.message);
        throw error;
    }
};
// ✅ Create a new employee
export const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post('employees', employeeData);
    console.log('Employee Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error.response?.data || error.message);
    throw error;
  }
};


export const getAllEmployeeBranches = async () => {
    try {
        const response = await apiClient.get(`branches`);
        console.log('Branch Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Users:', error.message);
        throw error;
    }
};





export default {
   getAllEmployee,
   createEmployee,
};