import apiClient from '../utility/api'; // Import the existing Axios instance


export const getAllAssetUsers = async () => {
    try {
        const response = await apiClient.get(`assetusers`);
        console.log('Asset User Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Users:', error.message);
        throw error;
    }
};


export default {
   getAllAssetUsers
};