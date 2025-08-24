// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Dashboard from './components/Dashboard';
// import Machine from './components/Machine';
// import ScanDashboard from './components/ScanDashboard';
// import Login from './components/Login';
// import InventoryReport from './components/InventoryReport';
// import InventoryCountReport from './components/InventoryCountReport';
// import DashboardContent from './components/DashboardContent';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* ✅ Login is loaded separately */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/" element={<Login />} />

//         ✅ Dashboard layout applied only to dashboard routes
//         <Route path="/dashboard" element={<Dashboard><div className="dashboard-content">Welcome to Dashboard</div></Dashboard>} />
//         <Route path="/machine" element={<Dashboard><Machine /></Dashboard>} />
//         <Route path="/scans" element={<Dashboard><ScanDashboard /></Dashboard>} />
//         <Route path="/reports/inventoryreport" element={<Dashboard><InventoryReport /></Dashboard>} />
//         <Route path="/reports/inventorycountreport" element={<Dashboard><InventoryCountReport /></Dashboard>} />
//         <Route path="/dashboardcontent" element={<Dashboard><DashboardContent /></Dashboard>} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Machine from "./components/Machine";
import ScanDashboard from "./components/ScanDashboard";
import Login from "./components/Login";
import InventoryReport from "./components/InventoryReport";
import InventoryCountReport from "./components/InventoryCountReport";
import DashboardContent from "./components/DashboardContent";
import PrivateRoute from "./components/PrivateRoute"; // ✅ Import PrivateRoute
import AssetUser  from "./components/AssetUser";
import ItAssetDetails from "./components/ItAssetDetails";
import AssetAssignment from "./components/AssetAssignment";
import MachineTrackingReport from "./components/MachineTrackingReport";
import MachineDetailDisplay from "./pages/MachineDetailsDisplay";
import IdleScanReport from "./components/IdleScanReport";
import IdleMachineDetails from "./pages/IdleMachineDetails";
import MachineTransfer from "./pages/MachineTransfer";
import RentMachine from "./pages/RentMachine";

import RentMachineAllocation from "./pages/RentMachineAllocation";
import RentMachineSummary from "./pages/RentMachineSummary";

import RentMachineRenewal from "./pages/RentMachineRenewal";
import PurchaseOrder from "./pages/purchaseOrder";
import PurchaseOrderEdit from "./components/PurchaseOrderEdit"
import PurchaseOrderReport from "./components/PurchaseOrderReport";
import PurchaseOrderView from "./components/PurchaseOrderView";
import PurchaseOrderReportAll from "./components/PurchaseOrderReportAll";
import RentMachineGrn from "./components/RentMachineGrn"

//test
import UserCreationForm from "./pages/UserCreationForm";
import UnderDevelopment from "./pages/UnderMaintanance";
import UserManagementDashboard from "./components/UserManagementDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* 🔒 Private (Protected) Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard><div className="dashboard-content">Welcome to Dashboard</div></Dashboard></PrivateRoute>} />
        <Route path="/machine" element={<PrivateRoute><Dashboard><Machine /></Dashboard></PrivateRoute>} />
        <Route path="/scans" element={<PrivateRoute><Dashboard><ScanDashboard /></Dashboard></PrivateRoute>} />
        <Route path="/reports/inventoryreport" element={<PrivateRoute><Dashboard><InventoryReport /></Dashboard></PrivateRoute>} />
        <Route path="/reports/inventorycountreport" element={<PrivateRoute><Dashboard><InventoryCountReport /></Dashboard></PrivateRoute>} />
        <Route path="/reports/idle" element={<PrivateRoute><Dashboard><IdleScanReport /></Dashboard></PrivateRoute>} />
        <Route path="/reports/machinetrackingreport" element={<PrivateRoute><Dashboard><MachineTrackingReport /></Dashboard></PrivateRoute>} />
        <Route path="/dashboardcontent" element={<PrivateRoute><Dashboard><DashboardContent /></Dashboard></PrivateRoute>} />
        <Route path="/itassets/assetuser" element={<PrivateRoute><Dashboard><AssetUser /></Dashboard></PrivateRoute>} />
        <Route path="/itassets/itassets" element={<PrivateRoute><Dashboard><ItAssetDetails /></Dashboard></PrivateRoute>} />
        <Route path="/itassets/assetassignment" element={<PrivateRoute><Dashboard><AssetAssignment /></Dashboard></PrivateRoute>} />
        <Route path="/machine-details" element={<PrivateRoute><Dashboard><MachineDetailDisplay /></Dashboard></PrivateRoute>} />
        <Route path="/idlemachinedetails" element={<PrivateRoute><Dashboard><IdleMachineDetails /></Dashboard></PrivateRoute>} />
        <Route path="/reports/machinetransfers" element={<PrivateRoute><Dashboard><MachineTransfer/></Dashboard></PrivateRoute>}/>

        <Route path="/rentmachines/createrentmachines" element={<PrivateRoute><Dashboard><RentMachine /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/allocations" element={<PrivateRoute><Dashboard><RentMachineAllocation /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/summary" element={<PrivateRoute><Dashboard><RentMachineSummary /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/renewal" element={<PrivateRoute><Dashboard><RentMachineRenewal /></Dashboard></PrivateRoute>} />

        <Route path="/rentmachines/po" element={<PrivateRoute><Dashboard><PurchaseOrder /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/poreports/:poId" element={<PrivateRoute><Dashboard><PurchaseOrderReport /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/poedit/:poId" element={<PrivateRoute><Dashboard><PurchaseOrderEdit /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/poview" element={<PrivateRoute><Dashboard><PurchaseOrderView /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/poreportsall/:poId" element={<PrivateRoute><Dashboard><PurchaseOrderReportAll /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/grn/:poId" element={<PrivateRoute><Dashboard><RentMachineGrn /></Dashboard></PrivateRoute>} />

        <Route path="/usercreationform" element={<PrivateRoute><Dashboard><UserCreationForm /></Dashboard></PrivateRoute>} />
        <Route path="/undermaintanance" element={<PrivateRoute><Dashboard><UnderDevelopment /></Dashboard></PrivateRoute>} />

        <Route path="/usermanagement" element={<PrivateRoute><Dashboard><UserManagementDashboard /></Dashboard></PrivateRoute>} />



      </Routes>
    </Router>
  );
}

export default App;
