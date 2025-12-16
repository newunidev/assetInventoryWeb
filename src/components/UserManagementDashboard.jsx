import React, { useState, useEffect } from "react";
import { FaUserPlus, FaShieldAlt, FaCogs, FaTimes } from "react-icons/fa";
import "./UserManagementDashboard.css";
import {
  getAllEmployee,
  createEmployee,
  getAllEmployeeBranches,
} from "../controller/UserMangerController";
import { getAllPermissionsAll } from "../controller/EmployeeController";
import { getPermissions } from "../controller/EmployeeController";
import { createBulkEmployeePermissions } from "../controller/EmployeeController";

export default function UserManagementDashboard() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [popup, setPopup] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    branch_id: "",
    address: "",
    contact: "",
    designation: "",
    password: "",
    permissions: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployeesWithPermissions();
    fetchBranches();
  }, []);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const res = await getPermissions(); // ⬅ your API call

      if (res.success && res.permissions) {
        setPermissions(res.permissions); // holds full objects
      }
    } catch (err) {
      console.error("Failed to load permissions", err);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedEmployeeId) {
      alert("Please select an employee");
      return;
    }

    if (!formData.permissions || formData.permissions.length === 0) {
      alert("Please select at least one permission");
      return;
    }

    try {
      const body = {
        employee_id: selectedEmployeeId,
        perm_ids: formData.permissions, // array of selected permission IDs
      };

      const res = await createBulkEmployeePermissions(body);

      if (res.success) {
        alert("✅ Permissions saved successfully!");
        fetchEmployeesWithPermissions(); // refresh user data
        handleClosePopup();
      } else {
        alert("❌ Failed to save permissions: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving permissions");
    }
  };

  const fetchEmployeesWithPermissions = async () => {
    try {
      const empRes = await getAllEmployee();
      const permRes = await getAllPermissionsAll();

      if (empRes.success && permRes.success) {
        const mappedUsers = empRes.employees.map((emp) => ({
          id: emp.employee_id,
          name: emp.name,
          email: emp.email,
          branch: emp.branch,
          contact: emp.contact,
          designation: emp.designation,
          address: emp.address,
          permissions: permRes.data
            .filter((p) => p.employee_id === emp.employee_id)
            .map((p) => p.Permission.Permission),
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error fetching employees or permissions:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await getAllEmployeeBranches();
      if (res.success) setBranches(res.branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const handleOpenPopup = (type, user = null) => {
    if (user) setFormData({ ...user });
    else
      setFormData({
        name: "",
        email: "",
        branch: "",
        branch_id: "",
        address: "",
        contact: "",
        designation: "",
        password: "",
        permissions: [],
      });
    setPopup({ type, user });
    document.body.style.overflow = "hidden";
  };

  const handleClosePopup = () => {
    setPopup(null);
    document.body.style.overflow = "auto";
  };

  const handlePermissionToggle = (perm) => {
    setFormData((prev) => {
      const hasPerm = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: hasPerm
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const handleSaveUser = async () => {
    try {
      const newEmployee = {
        name: formData.name,
        email: formData.email,
        branch:
          branches.find((b) => b.branch_id === parseInt(formData.branch_id))
            ?.branch_name || "",
        branch_id: parseInt(formData.branch_id),
        address: formData.address,
        contact: formData.contact,
        designation: formData.designation,
        password: formData.password,
      };

      const res = await createEmployee(newEmployee);
      if (res.success) {
        alert("✅ Employee created successfully!");
        fetchEmployeesWithPermissions();
        handleClosePopup();
      } else {
        alert("❌ Failed to create employee");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving employee");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="usermanager-container">
      <div className="usermanager-layout">
        {/* LEFT SIDE - EMPLOYEE CARDS */}
        <div className="usermanager-table-section">
          <h2>Employees</h2>
          <input
            type="text"
            placeholder="Search by Employee ID or Email..."
            className="user-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="employee-cards-container">
            {filteredUsers.map((u) => (
              <div key={u.id} className="employee-card">
                <h4>{u.name}</h4>
                <p>ID: {u.id}</p>
                <p>Email: {u.email}</p>
                <p>Branch: {u.branch}</p>
                <p>Designation: {u.designation}</p>
                <p>Contact: {u.contact}</p>
                <p>
                  Permissions:{" "}
                  {u.permissions.length > 0 ? u.permissions.join(", ") : "None"}
                </p>
                <button
                  className="usermanager-edit-btn"
                  onClick={() => handleOpenPopup("editUser", u)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - ACTION CARDS */}
        <div className="usermanager-card-section">
          <div
            className="usermanager-card"
            onClick={() => handleOpenPopup("addUser")}
          >
            <FaUserPlus size={28} className="usermanager-card-icon" />
            <span>Add New User</span>
          </div>
          <div
            className="usermanager-card"
            onClick={() => handleOpenPopup("managePermissions")}
          >
            <FaCogs size={28} className="usermanager-card-icon" />
            <span>Manage Permissions</span>
          </div>
          <div
            className="usermanager-card"
            onClick={() => handleOpenPopup("assignPermissions")}
          >
            <FaShieldAlt size={28} className="usermanager-card-icon" />
            <span>Assign Permissions</span>
          </div>
        </div>
      </div>

      {/* POPUP */}
      {popup && (
        <div className="usermanager-popup-overlay">
          <div className="usermanager-popup">
            <div className="usermanager-popup-header">
              <h3>
                {popup.type === "addUser"
                  ? "Add User"
                  : popup.type === "editUser"
                  ? "Edit User"
                  : popup.type === "managePermissions"
                  ? "Manage Permissions"
                  : "Assign Permissions"}
              </h3>
              <button
                className="usermanager-close-btn"
                onClick={handleClosePopup}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="usermanager-popup-body">
              {(popup.type === "addUser" || popup.type === "editUser") && (
                <>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <select
                    value={formData.branch_id}
                    onChange={(e) => {
                      const selectedBranch = branches.find(
                        (b) => b.branch_id === parseInt(e.target.value)
                      );
                      setFormData({
                        ...formData,
                        branch_id: e.target.value,
                        branch: selectedBranch?.branch_name || "",
                      });
                    }}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Contact"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Designation"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />

                  <button
                    className="usermanager-save-btn"
                    onClick={handleSaveUser}
                  >
                    Save
                  </button>
                </>
              )}

              {/* Popup for assign permission */}
              {popup.type === "assignPermissions" && (
                <div className="assign-permission-container">
                  {/* EMPLOYEE SELECT DROPDOWN */}
                  <label>Select Employee</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setSelectedEmployeeId(empId);

                      // find employee and load their existing permission IDs
                      const selectedEmp = users.find(
                        (u) => u.id === parseInt(empId)
                      );

                      setFormData((prev) => ({
                        ...prev,
                        permissions: selectedEmp
                          ? selectedEmp.permissions.map((p) => p.Perm_id)
                          : [],
                      }));
                    }}
                  >
                    <option value="">-- Select Employee --</option>
                    {users.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>

                  {/* PERMISSION LIST */}
                  <div className="assign-permission-list">
                    <h4>Assign Permissions</h4>

                    {permissions.map((perm) => {
                      const alreadyAssigned =
                        users
                          .find((u) => u.id === parseInt(selectedEmployeeId))
                          ?.permissions?.includes(perm.Permission) || false;

                      return (
                        <label
                          key={perm.Perm_id}
                          className="permission-checkbox"
                        >
                          <input
                            type="checkbox"
                            checked={
                              alreadyAssigned ||
                              formData.permissions.includes(perm.Perm_id)
                            }
                            disabled={alreadyAssigned} // ⬅ disable if already assigned
                            onChange={() =>
                              handlePermissionToggle(perm.Perm_id)
                            }
                          />
                          {perm.Permission}
                          {alreadyAssigned && (
                            <span style={{ color: "green", marginLeft: "6px" }}>
                              (already assigned)
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <button
                    className="usermanager-save-btn"
                    onClick={handleSavePermissions}
                  >
                    Save Permissions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
