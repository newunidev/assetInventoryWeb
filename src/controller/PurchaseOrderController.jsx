import apiClient from "../utility/api"; // Import the existing Axios instance

export const getAllPurchaseOrders = async () => {
  try {
    const token = localStorage.getItem("token"); // Step 1: Get token

    const response = await apiClient.get("purchaseorders", {
      headers: {
        Authorization: `Bearer ${token}`, // Step 2: Attach token
      },
    });

    //console.log("Rent Machines",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Purchase Orders:", error);
    throw error;
  }
};

export const createPurchaseOrder = async (assetData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("purchaseorders", assetData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("PO Created Success Created Success", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Purchase Order:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const purchaseOrderByPoId = async (poid) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(
      `purchaseordersbyid?id=${encodeURIComponent(poid)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    //console.log("PO Controller id",response);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching  Purchase Order by POID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//==========================API method calling for PO APprovals =================================//
export const createPurchaseOrderApproval = async (poApproval) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("poapprovals", poApproval, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("PO approval Created Success Created Success", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Purchase Order:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllPoApprovals = async () => {
  try {
    const token = localStorage.getItem("token"); // Step 1: Get token

    const response = await apiClient.get("poapprovals", {
      headers: {
        Authorization: `Bearer ${token}`, // Step 2: Attach token
      },
    });

    //console.log("Rent Machines",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Purchase Order approvals:", error);
    throw error;
  }
};

//method to update purchase order status column
export const updatePoStatus = async (poid, status) => {
  console.log("Method Called");
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.put(
      `purchaseorders-status?id=${encodeURIComponent(poid)}`,
      { status }, // sending as JSON
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PO Status Updated Successfully", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating PO status:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//*************Need to edit to update the purchase order********* */
export const updateEntirePurchaseOrderbyPoId = async (id, purchaseOrder) => {
  //console.log("Method Called", purchaseOrder);
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.put(
      `purchaseorders-entire?id=${id}`, // 👈 keep as is (don’t encode)
      purchaseOrder,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // ensure JSON
        },
      }
    );

    // console.log("PO details Updated Successfully", response);
    return response.data;
  } catch (error) {
    console.error("Error updating PO:", error.response?.data || error.message);
    throw error;
  }
};

export const updatePurchaseOrderApproval1 = async (approvalData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.put(
      `po-approvals/approval1`,
      approvalData, // directly send the object with po_no, approval1_by, approval1
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PO Approval Updated Successfully", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating PO Approval:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updatePurchaseOrderApproval2 = async (approvalData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.put(
      `po-approvals/approval2`,
      approvalData, // directly send the object with po_no, approval1_by, approval1
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PO Approval Updated Successfully", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating PO Approval:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//po approval 2 for the po renewal with the machine life records as well
export const updateRenewalPurchaseOrderApproval2 = async (approvalData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.put(
      `renewalpo-approvals/approval2`,
      approvalData, // directly send the object with po_no, approval1_by, approval1
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PO Approval Updated Successfully", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating PO Approval:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const poApprovalByPoId = async (poid) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(
      `po-approvals/poid?po_no=${encodeURIComponent(poid)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    //console.log("PO Controller id",response);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching  PO Approval by POID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//======================methods for po print pool ============================//
export const createPoPrintPool = async (poPrintPool) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("poprintpools", poPrintPool, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("PO print pool Created Success Created Success", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Purchase Order:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getPoPrintPoolByPoId = async (poid) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(
      `poprintpoolsbyPoId?po_id=${encodeURIComponent(poid)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    //console.log("PO Controller id",response);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching  PO Print Pool by POID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createPurchaseOrderReturn = async (poReject) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("porejects", poReject, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("PO Reject Created Success Created Success", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Purchase Order reject:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const createPurchaseOrderRevision= async (poRevision) => {
  try {
    const token = localStorage.getItem("token");
    console.log(poRevision);
    const response = await apiClient.post("porevisions", poRevision, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("PO Revision Created Success ", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Purchase Order revision:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getLatestPoRevisionByPoId = async (poid) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(
      `porevisionsbypoid?po_id=${encodeURIComponent(poid)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    //console.log("PO Controller id",response);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching  PO Revision Pool by POID:",
      error.response?.data || error.message
    );
    throw error;
  }
};



//======================methods for po print pool END ============================//

export default {
  getAllPurchaseOrders,
  createPurchaseOrder,
  purchaseOrderByPoId,
  createPurchaseOrderApproval,
  getAllPoApprovals,
  updatePurchaseOrderApproval1,
  poApprovalByPoId,
  updatePoStatus,
  updateEntirePurchaseOrderbyPoId,
  createPurchaseOrderReturn,
  updateRenewalPurchaseOrderApproval2,
  getLatestPoRevisionByPoId
};
