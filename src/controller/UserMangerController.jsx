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


export default {
   getAllEmployee,
};