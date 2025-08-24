import apiClient from "../utility/api"; // Import the existing Axios instance

export const getItemsByBranchCategory = async (branch, categoryId) => {
  try {
    const response = await apiClient.get(
      `/itemsbybranch?branch=${branch}&category_id=${categoryId}`
    );
    console.log("Items Response:", response.data); // ✅ Log API response
    return response.data; // Return item data
  } catch (error) {
    console.error("Error fetching items:", error.message);
    throw error;
  }
};

export const getItemScans = async (branch, categoryId, scannedDate) => {
  try {
    const response = await apiClient.get(
      `/itemscansbybranchitemcategory?branch=${branch}&category_id=${categoryId}&scanned_date=${scannedDate}`
    );
    console.log("Item Scans Response:", response.data); // ✅ Log API response
    return response.data; // Return scanned item data
  } catch (error) {
    console.error("Error fetching item scans:", error.message);
    throw error;
  }
};

//api method for item count
export const getItemCountScans = async (
  categoryId,
  currentBranch,
  scannedDate
) => {
  try {
    const response = await apiClient.get(
      `itemcountscansbybranchcurrentbranchdatecat?category_id=${categoryId}&scanned_date=${scannedDate}&current_branch=${currentBranch}`
    );
    console.log("Item Scan count Response:", response.data); // ✅ Log API response
    return response.data;
  } catch (error) {
    console.error("Error fetching item count scans:", error.message);
    throw error;
  }
};

export const getItemByItemCode = async (item_code) => {
  try {
    const response = await apiClient.get(
      `itemsbyitemcode?item_code=${item_code}`
    );
    console.log("Item Scan count Response:", response.data); // ✅ Log API response
    return response.data;
  } catch (error) {
    console.error("Error fetching item count scans:", error.message);
    throw error;
  }
};

export const getTotalItemsbyBranch = async (branch) => {
  try {
    const response = await apiClient.get(
      `itemsatotalbybranch?branch=${branch}`
    );
    console.log("Total Item Count Scan Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching item count :", error.message);
    throw error;
  }
};

export const getTotalItemsCount = async () => {
  try {
    const response = await apiClient.get(`noofitems`);
    //console.log("Total Item total Count  Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching total item count :", error.message);
    throw error;
  }
};

export const getItemCountLastScannedLocation = async (item_code) => {
  try {
    const response = await apiClient.get(
      `itemcountscanbyserailno?item_code=${item_code}`
    );
    //console.log("Total Item Last Location CountScan  Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching Item Last Location CountSca :",
      error.message
    );
    throw error;
  }
};

export const getAllItemCountLastScannedLocation = async () => {
  try {
    const response = await apiClient.get(`itemcountscanslatest`);
    //console.log("All Last Location CountScan  Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching All  Item Last Location CountSca :",
      error.message
    );
    throw error;
  }
};

//methods for get Unique cateory Idle machine count
export const getAllIdleScanCountbyCateogryLast3Days = async () => {
  try {
    const response = await apiClient.get(`idlescancountbycategorylast3days`);
    //console.log("All Last Location CountScan  Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching All  Item Last Location CountSca :",
      error.message
    );
    throw error;
  }
};

//method for get unique category idele machine count
export const getAllIdleScanCountbyCateogryTodaysDate = async () => {
  try {
    const response = await apiClient.get(`idlescancountbycategoryTodaysDate`);
    //console.log("All Last Location CountScan  Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching All  Item Last Location CountSca :",
      error.message
    );
    throw error;
  }
};

//method for get unique category idele machine count
export const getAllIdleScanCountbyCateogryFactory = async (branch, cat_id) => {
  try {
    const response = await apiClient.get(
      `idlescancountbycategoryBranch?category_id=${cat_id}&current_branch=${branch}`
    );
    //console.log("All Last Location CountScan  Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching All  Item Last Location CountSca :",
      error.message
    );
    throw error;
  }
};

export const getItemScanCountByCategory = async () => {
  try {
    const response = await apiClient.get(`itemscansunique`);
    //console.log("All LUnique Item Scan Count:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching All  Item unique scan counts :",
      error.message
    );
    throw error;
  }
};

// export const getItemTransferDetailsBySendingOrRecievingBranch = async ({ prev_used_branch, sending_branch }) => {
//   try {
//     console.log(`Sending Branch: ${sending_branch}`);
//     console.log(`Previous Used Branch: ${prev_used_branch}`);

//     const params = new URLSearchParams();

//     if (sending_branch) params.append("sending_branch", sending_branch);
//     if (prev_used_branch) params.append("prev_used_branch", prev_used_branch);

//     const response = await apiClient.get(`itemtransferbysendingandprev?${params.toString()}`);
//     console.log(response.data.data);
//     return response.data.data;
//   } catch (error) {
//     console.error("Error fetching Item Transfers:", error.message);
//     throw error;
//   }
// };
export const getItemTransferDetailsBySendingOrRecievingBranch = async ({ prev_used_branch, sending_branch }) => {
  try {
    console.log(`Sending Branch: ${sending_branch}`);
    console.log(`Previous Used Branch: ${prev_used_branch}`);

    let response;

    if (!sending_branch && !prev_used_branch) {
      // Call the general API when both are empty
      response = await apiClient.get("itemtransfers");
    } else {
      // Build filtered API URL
      const params = new URLSearchParams();
      if (sending_branch) params.append("sending_branch", sending_branch);
      if (prev_used_branch) params.append("prev_used_branch", prev_used_branch);

      response = await apiClient.get(`itemtransferbysendingandprev?${params.toString()}`);
    }

    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching Item Transfers:", error.message);
    throw error;
  }
};



export default {
  getItemsByBranchCategory,
  getItemScans,
  getItemByItemCode,
  getTotalItemsbyBranch,
  getTotalItemsCount,
  getItemCountLastScannedLocation,
  getAllItemCountLastScannedLocation,
  getAllIdleScanCountbyCateogryLast3Days,
  getAllIdleScanCountbyCateogryTodaysDate,
  getAllIdleScanCountbyCateogryFactory,
  getItemScanCountByCategory,
};
