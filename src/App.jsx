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
import PurchaseOrder from "./pages/PurchaseOrder";
import PurchaseOrderEdit from "./components/PurchaseOrderEdit"
import PurchaseOrderReport from "./components/PurchaseOrderReport";
import PurchaseOrderView from "./components/PurchaseOrderView";
import PurchaseOrderReportAll from "./components/PurchaseOrderReportAll";
import RentMachineGrn from "./components/RentMachineGrn"
import RentMachineTransfer from "./components/RentMachineTransfer";
import RenewalPurchaseOrder from "./pages/RenewalPurchaseOrder";
import RenewalPurchaseOrderEdit from "./components/RenewalPurchaseOrderEdit";
import RenewalPurchaseOrderReport from "./components/RenewalPurchaseOrderReport";
import RenewalPurchaseOrderReportAll from "./components/RenewalPurchaseOrderReportAll";
import RentMachinePrintCard from "./components/RentMachinePrintCard";
import RentMachineReturn from "./components/RentMachineReturn";
import GatePass from "./components/GatePass";
import GatePassReport from "./components/GatePassReport";
import GatePassView from "./components/GatePassView";
import GatePassEdit from "./components/GatePassEdit";
//test
import UserCreationForm from "./pages/UserCreationForm";
import UnderDevelopment from "./pages/UnderMaintanance";
import DashboardNew from "./components/DashboardNew";
import UserManagementDashboard from "./components/UserManagementDashboard";
import ItAssetIndetailView from "./components/ItAssetIndetailView";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* 🔒 Private (Protected) Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard><div className="dashboard-content">Welcome to Dashboard</div></Dashboard></PrivateRoute>} />
        <Route path="/dashboardnew" element={<PrivateRoute><Dashboard><DashboardNew /></Dashboard></PrivateRoute>} />
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
        <Route path="/rentmachines/rentmachinetransfers" element={<PrivateRoute><Dashboard><RentMachineTransfer /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/allocations" element={<PrivateRoute><Dashboard><RentMachineAllocation /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/summary" element={<PrivateRoute><Dashboard><RentMachineSummary /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/return" element={<PrivateRoute><Dashboard><RentMachineReturn /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/renewal" element={<PrivateRoute><Dashboard><RentMachineRenewal /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/gatepass" element={<PrivateRoute><Dashboard><GatePass /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/gatepass-report/:gpId" element={<PrivateRoute><Dashboard><GatePassReport /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/gatepass-view" element={<PrivateRoute><Dashboard><GatePassView /></Dashboard></PrivateRoute>} />
       <Route path="/rentmachines/gatepass-edit/:gpId" element={<PrivateRoute><Dashboard><GatePassEdit /></Dashboard></PrivateRoute>
  }
/>

        <Route path="/rentmachines/po" element={<PrivateRoute><Dashboard><PurchaseOrder /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/porenewal" element={<PrivateRoute><Dashboard><RenewalPurchaseOrder /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/poreports/:poNo" element={<PrivateRoute><Dashboard><PurchaseOrderReport /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/renewalporeports/:poNo" element={<PrivateRoute><Dashboard><RenewalPurchaseOrderReport /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/poedit/:poNo" element={<PrivateRoute><Dashboard><PurchaseOrderEdit /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/renewalpoedit/:poNo" element={<PrivateRoute><Dashboard><RenewalPurchaseOrderEdit /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/poview" element={<PrivateRoute><Dashboard><PurchaseOrderView /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/poreportsall/:poNo" element={<PrivateRoute><Dashboard><PurchaseOrderReportAll /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/renewalporeportsall/:poNo" element={<PrivateRoute><Dashboard><RenewalPurchaseOrderReportAll /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/grn/:poNo" element={<PrivateRoute><Dashboard><RentMachineGrn /></Dashboard></PrivateRoute>} />
        <Route path="/rentmachines/printcard" element={<PrivateRoute><Dashboard><RentMachinePrintCard /></Dashboard></PrivateRoute>} />

        <Route path="/usercreationform" element={<PrivateRoute><Dashboard><UserCreationForm /></Dashboard></PrivateRoute>} />
        <Route path="/undermaintanance" element={<PrivateRoute><Dashboard><UnderDevelopment /></Dashboard></PrivateRoute>} />

        <Route path="/usermanagement" element={<PrivateRoute><Dashboard><UserManagementDashboard /></Dashboard></PrivateRoute>} />
        <Route path="/itassetindetailview" element={<PrivateRoute><Dashboard><ItAssetIndetailView /></Dashboard></PrivateRoute>} />


      </Routes>
    </Router>
  );
}

export default App;
