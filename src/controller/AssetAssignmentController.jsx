import apiClient from '../utility/api'; // Import the existing Axios instance


export const getAllAssetAssignments = async () => {
    try {
        const response = await apiClient.get(`assetassignments`);
        console.log('Asset Assignments Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Asset Assignments:', error.message);
        throw error;
    }
};

export const getAllAvailableAssetAssignments = async () => {
  try {
      const response = await apiClient.get(`assetsavaialable`);
      console.log('Asset Assignments Response:', response.data); // ✅ Log API response
      return response.data; // Return item data
  } catch (error) {
      console.error('Error fetching Asset Assignments:', error.message);
      throw error;
  }
};

export const checkGivenAssetHasCurrentUser = async (asset_code) => {
    try {
        const response = await apiClient.get(`assetassignmentcheckhascurrentuser?asset_code=${asset_code}`);
        console.log('Asset Assignments Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Asset Assignments:', error.message);
        throw error;
    }
};


// Method to create Asset Assignment
export const createAssetAssignment = async (assetId, assetUserId, assignedDate) => {
    console.log("Helloooooo "+assetId,assetUserId,assignedDate);
    try {
      const response = await apiClient.post('/assetassignments', {
        assetId,
        assetUserId,
        is_current_user: true, // Setting is_current_user as true
        assignedDate, // Today's date
      });
  
      console.log('Asset Assignment Created:', response.data); // ✅ Log API response
      return response.data; // Return the API response
    } catch (error) {
      console.error('Error creating Asset Assignment:', error.message);
      throw error; // Throw error to be handled by the calling function
    }
  };

  //method to update asset assignment record when returning
  export const updateAssetAssignmentReturn = async (asset_code) => {
    try {
        const response = await apiClient.get(`assetAssignmentreturnupdate?assetId=${asset_code}`);
        console.log('Asset Assignments Response:', response.data); // ✅ Log API response
        return response.data; // Return item data
    } catch (error) {
        console.error('Error fetching Asset Assignments:', error.message);
        throw error;
    }
};


  

export default {
    getAllAssetAssignments,
    checkGivenAssetHasCurrentUser,
    createAssetAssignment,
    getAllAvailableAssetAssignments,
    updateAssetAssignmentReturn
};