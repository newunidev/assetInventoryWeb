import axios from "axios";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: "http://35.240.187.228:3003", // Base URL of your backend
  timeout: 5000, // Optional timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const getMachines = async () => {
  try {
    const response = await apiClient.get("/items");
    // console.log('API Response:', response.data); // ✅ Log API response
    return response.data; // Make sure response.data is the actual array of machines
  } catch (error) {
    console.error("Error fetching machines:", error.message);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.get(`/login`, {
      params: { email, password }, // Pass parameters correctly
    });

    //console.log('Login Response:', response.data); // ✅ Log response

    return response.data; // Return response (success, token, user info)
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

//loing with web cookies
export const loginUserWithCookie = async (email, password) => {
  try {
    const response = await apiClient.post(
      "/loginweb",
      { email, password },
      { withCredentials: true } // 👈 important!
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);

    // Axios error handling
    if (error.response) {
      // Server responded with status code outside 2xx
      return {
        success: false,
        message: error.response.data?.message || "Login failed. Server error.",
      };
    } else if (error.request) {
      // Request made but no response received
      return { success: false, message: "No response from server." };
    } else {
      // Something else went wrong
      return { success: false, message: "An unexpected error occurred." };
    }
  }
};

export default apiClient;
