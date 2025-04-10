import apiClient from '../utility/api'; // Import the existing Axios instance


export const getAllItAssets = async () => {
    try {
        const response = await apiClient.get(`itassets`);
        console.log('Asset  Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Asset:', error.message);
        throw error;
    }
};

export const getITAssetCountByCategory = async () => {
    try {
        const response = await apiClient.get(`itassetcountbycategory`);
        console.log('Asset count Response :', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Asset Count:', error.message);
        throw error;
    }
};

// ✅ Create a New IT Asset
export const createItAsset = async (assetData) => {
    try {
        const response = await apiClient.post('itassets', assetData);
        console.log('Asset Created Successfully:', response.data);
        return response.data; // Return created asset response
    } catch (error) {
        console.error('Error creating IT Asset:', error.response?.data || error.message);
        throw error;
    }
};


export default {
   getAllItAssets,
   getITAssetCountByCategory,
   createItAsset,
};