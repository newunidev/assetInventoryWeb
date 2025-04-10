import apiClient from '../utility/api'; // Import the existing Axios instance

export const getCategories = async () => {
    try {
        const response = await apiClient.get('/categories');
        console.log('Categories Response:', response.data); // ✅ Log API response
        return response.data; // Return categories data
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        throw error;
    }
};

export const getItAssetCategories = async()=>{
    try{
        const response = await apiClient.get('/itcategories');
        console.log('IT Categories Response:', response.data); 
        return response.data;// ✅ Log API response

    }catch(error){
        console.error("error Fetching It Categories",error.message);
        throw error;
    }
}

export default {
    getCategories
};
