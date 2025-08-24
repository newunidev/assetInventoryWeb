import React, { useState, useEffect } from "react";
import { FaUserPlus, FaShieldAlt, FaCogs, FaTimes } from "react-icons/fa";
import "./UserManagementDashboard.css";
import { getAllEmployee } from "../controller/UserMangerController";
import { getAllPermissionsAll } from "../controller/EmployeeController";

export default function UserManagementDashboard() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([
    "View Reports",
    "Edit Data",
    "Manage Users",
  ]);

  const [popup, setPopup] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });
  const [searchTerm, setSearchTerm] = useState(""); // Search state

  // Fetch employees and their permissions
  useEffect(() => {
    fetchEmployeesWithPermissions();
  }, []);

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

  const handleOpenPopup = (type, user = null) => {
    if (user) setFormData({ ...user });
    else setFormData({ name: "", permissions: [] });
    setPopup({ type, user });
    document.body.style.overflow = "hidden";
  };

  const handleClosePopup = () => {
    setPopup(null);
    document.body.style.overflow = "auto";
  };

  const handleSaveUser = () => {
    if (popup.user) {
      setUsers((prev) =>
        prev.map((u) => (u.id === popup.user.id ? { ...u, ...formData } : u))
      );
    } else {
      setUsers((prev) => [...prev, { id: Date.now(), ...formData }]);
    }
    handleClosePopup();
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

  // Filter users based on search term
  const filteredUsers = users.filter(
    (u) =>
      u.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())||
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="usermanager-container">
      <div className="usermanager-layout">
        {/* LEFT SIDE - EMPLOYEE CARDS */}
        <div className="usermanager-table-section">
          <h2>Employees</h2>
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search by Employee ID or Email..."
            className="user-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Employee Cards Grid */}
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
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Branch"
                    value={formData.branch || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Designation"
                    value={formData.designation || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Contact"
                    value={formData.contact || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                  />
                  <div className="usermanager-permissions-list">
                    {permissions.map((perm) => (
                      <label key={perm}>
                        <input
                          type="checkbox"
                          checked={formData.permissions?.includes(perm)}
                          onChange={() => handlePermissionToggle(perm)}
                        />
                        {perm}
                      </label>
                    ))}
                  </div>
                  <button
                    className="usermanager-save-btn"
                    onClick={handleSaveUser}
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
