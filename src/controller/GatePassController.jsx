import apiClient from "../utility/api"; // Import the existing Axios instance

export const createGatePass = async (gatepass) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post("gatepass-rentmachines", gatepass, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("GatePass  created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updated created GatePass:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createGatePassWithApproval = async (gatepass) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      "gatepass-rentmachineswithapproval",
      gatepass,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("GatePass and approval  created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updated created GatePass:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const bulkGatePassRentMachinesUpdateCreate = async (
  gatepassRentMachines
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      "gatepassretmachinesupdatecreate",
      gatepassRentMachines,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "GatePass Rent machines updated created successfully:",
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updated created GatePass Rent machines:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ New method: deleteGatePass by gp_no
export const deleteGatePass = async (gp_no) => {
  try {
    const token = localStorage.getItem("token");
    console.log("called");
    const response = await apiClient.delete(
      `gatepass-rentmachines?gp_no=${gp_no}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(`GatePass ${gp_no} deleted successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting GatePass ${gp_no}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllGatePassRentMachinesAndGatePass = async (gp_no) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(
      `gatepassrentmachineswithmachinedetailsbygpno?gp_no=${encodeURIComponent(
        gp_no
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Checking NO", response);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching GatePass Rent machine by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllGatePasses = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get(`gatepass-rentmachines`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching GatePasses:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ New method: update GatePass Approval
export const updateGatePassApproval = async (
  gate_pass_id,
  type,
  employee_id
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post(
      `updategatepassapprovals?gate_pass_id=${encodeURIComponent(
        gate_pass_id
      )}`,
      { type, employee_id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      `GatePass ${gate_pass_id} approval updated successfully:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating approval for GatePass ${gate_pass_id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Updated method: update GatePass Approval first, then machine life update if confirmed
// export const updateGatePassApprovalFullUpdate = async (
//   gate_pass_id,
//   type,
//   employee_id,
//   machinelifupdatedetails // passed from frontend
// ) => {
//   try {
//     const token = localStorage.getItem("token");

//     // Step 1: Update gate pass approval
//     const approvalResponse = await apiClient.post(
//       `updategatepassapprovals?gate_pass_id=${encodeURIComponent(
//         gate_pass_id
//       )}`,
//       { type, employee_id },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log(
//       `✅ GatePass ${gate_pass_id} approval updated successfully:`,
//       approvalResponse.data
//     );

//     // Step 2: Only update machine life if type is "confirm"
//     let machineLifeResponse = null;
//     if (type === "confirm") {
//       machineLifeResponse = await apiClient.post(
//         `updatemachinelifegatepassandmachinestatus`,
//         machinelifupdatedetails,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log(
//         "✅ Machine life + gate pass + machine status updated:",
//         machineLifeResponse.data
//       );
//     } else {
//       console.log("⚠️ Skipped machine life update because type is not 'confirm'");
//     }

//     return {
//       approvalUpdate: approvalResponse.data,
//       machineLifeUpdate: machineLifeResponse,
//     };
//   } catch (error) {
//     console.error(
//       `❌ Error in updateGatePassApproval for GatePass ${gate_pass_id}:`,
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

export const updateGatePassApprovalFullUpdate = async (
  gate_pass_id,
  type,
  employee_id,
  machinelifupdatedetails // { gp_no, created_by, machines: [] }
) => {
  try {
    const token = localStorage.getItem("token");

    // Build payload
    const payload = {
      type,
      employee_id,
      gp_no: gate_pass_id, // use gate_pass_id for gp_no
      created_by: employee_id, // can also use machinelifupdatedetails.created_by if needed
      machines: machinelifupdatedetails?.machines || [],
    };
    console.log("Payload", payload);

    // Call the combined API
    const response = await apiClient.post(
      `updategatepassapprovalsmachinelifegatepassandmachinestatusFull?gate_pass_id=${encodeURIComponent(
        gate_pass_id
      )}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      `✅ GatePass ${gate_pass_id} approval + machine life updated successfully:`,
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      `❌ Error updating GatePass ${gate_pass_id} with machines:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteGatePassRentMachine = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.delete(
      `gatepassrentmachinebyid?id=${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      `✅ GatePass Rent Machine ${id} deleted successfully:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error deleting GatePass Rent Machine ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateGatePass = async (gp_no, payload) => {
  console.log("called");
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.put(
      `gatepass-rentmachines?gp_no=${encodeURIComponent(gp_no)}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ GatePass ${gp_no} updated successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error updating GatePass ${gp_no}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateGatePassStatus = async (gp_no, status) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.put(
      `gatepass-rentmachinesstatusupdate?gp_no=${encodeURIComponent(gp_no)}`,
      { status }, // send status in body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ GatePass ${gp_no} status updated successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error updating status for GatePass ${gp_no}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export default {
  createGatePass,
  bulkGatePassRentMachinesUpdateCreate,
  deleteGatePass,
  getAllGatePassRentMachinesAndGatePass,
  getAllGatePasses,
  createGatePassWithApproval,
  updateGatePassApproval,
  updateGatePassStatus,
  
};
