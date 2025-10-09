import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, loginUserWithCookie } from "../utility/api"; // Import login API method
import { getAllPermissions } from "../controller/EmployeeController";
import "./Login.css"; // Import CSS file

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const navigate = useNavigate(); // Hook for navigation

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError(null);
  //   setLoading(true); // ✅ Show loading indicator

  //   try {
  //     const data = await loginUser(email, password);
  //     if (data.success) {
  //       sessionStorage.setItem("token", data.token);
  //       sessionStorage.setItem("userEmail", data.user.email);
  //       sessionStorage.setItem("userBranch", data.user.branch);

  //       navigate("/dashboardcontent"); // ✅ Redirect to dashboard
  //     } else {
  //       setError(data.message || "Login failed!");
  //     }
  //   } catch (error) {
  //     setError("Invalid credentials or server error!");
  //   } finally {
  //     setLoading(false); // ✅ Hide loading indicator after API call
  //   }
  // };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userBranch", data.user.branch);
        localStorage.setItem(
          "userBranchId",
          data.user.branch_details.branch_id
        );
        localStorage.setItem("userid", data.user.employee_id);
        localStorage.setItem("name", data.user.name);

        console.log(data.user.branch);

        const permissionData = await getAllPermissions(data.user.employee_id);
        if (permissionData.success) {
          // Extract permission IDs
          const permissionIds = permissionData.data.map((perm) => perm.perm_id);

          // Store in localStorage as a JSON string
          localStorage.setItem("permissions", JSON.stringify(permissionIds));
          console.log("Permissions", localStorage.getItem("permissions"));
        }

        navigate("/dashboardnew");
      } else {
        setError(data.message || "Login failed!");
      }
    } catch (error) {
      setError("Invalid credentials or server error!");
    } finally {
      setLoading(false);
    }
  };

  // return (
  //   <div className="login-container">
  //     <div className="login-box">
  //       <img
  //         src="/nu.png"
  //         alt="User Profile"
  //         className="user-profile-img"
  //       />
  //       <h2>Login</h2>
  //       {error && <p className="error-message">{error}</p>}{" "}
  //       {/* Show error message */}
  //       <form onSubmit={handleLogin}>
  //         <div className="input-group">
  //           <label>Email</label>
  //           <input
  //             type="email"
  //             placeholder="Enter your email"
  //             value={email}
  //             onChange={(e) => setEmail(e.target.value)}
  //             required
  //           />
  //         </div>
  //         <div className="input-group">
  //           <label>Password</label>
  //           <input
  //             type="password"
  //             placeholder="Enter your password"
  //             value={password}
  //             onChange={(e) => setPassword(e.target.value)}
  //             required
  //           />
  //         </div>

  //         {/* ✅ Show spinner when loading */}
  //         <button type="submit" className="login-btn" disabled={loading}>
  //           {loading ? <div className="spinner"></div> : "Login"}

  //         </button>
  //       </form>
  //     </div>
  //   </div>
  // );

  return (
    <div className="login-container">
      {/* Left Column: Info / Background */}
      <div className="login-left">
        <img src="/nu.png" alt="User Profile" className="user-profile-img" />
        <h1>Welcome to Inventory Management</h1>
        <p>
          Streamline your inventory operations with real-time tracking, fast
          reporting, and easy management. Keep your warehouse organized, monitor
          stock levels, and empower your team with a powerful, user-friendly
          system.
        </p>
        <ul>
          <li>📦 Real-time stock updates</li>
          <li>📊 Detailed reporting & analytics</li>
          <li>🔒 Secure user management</li>
          <li>⚡ Fast & responsive interface</li>
        </ul>
      </div>

      {/* Right Column: Login Form */}
      <div className="login-right">
        <div className="login-box">
          

          {error && <p className="error-message">{error}</p>}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Login"}
            </button>
          </form>

          

          {/* Notes / Info */}
          <div className="login-notes">
            <h4>💡 Tips</h4>
            <ul>
              <li>Use your company email for login.</li>
              <li>Password must be at least 8 characters.</li>
              <li>Contact IT if you face login issues.</li>
            </ul>
          </div>

          <div className="info">🔒 Secure Inventory Management System</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
