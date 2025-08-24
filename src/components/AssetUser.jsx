import React, { useState, useEffect } from "react";
import { getAllAssetUsers } from "../controller/AssetUserController"; // Import API calls
import "./AssetUser.css"; // Import styles
import { usePageTitle } from "../utility/usePageTitle";

const AssetUser = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [, setPageTitle] = usePageTitle();

  useEffect(() => {
    setPageTitle("Asset Users");
  }, [setPageTitle]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllAssetUsers();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.full_name?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (user.designation?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (user.branch?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (user.epf_no?.toString().toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      )
  );

  return (
    <div className="asset-user-container">
      {/* <h2>Asset Users</h2> */}

      <div className="search-panel">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="asset-user-table-container">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <table className="asset-user-table">
            <thead>
              <tr>
                <th>EPF NO</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Branch</th>
                <th>Date Of Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.epf_no}</td>
                    <td>{user.full_name}</td>
                    <td>{user.designation}</td>
                    <td>{user.branch}</td>
                    <td>{user.date_of_joined}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssetUser;
