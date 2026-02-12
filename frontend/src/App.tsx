import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "./pages/Login";

// Dashboard Pages
import StoreManagerDashboard from "./pages/dashboard/StoreManagerDashboard";
import AnalystDashboard from "./pages/dashboard/AnalystDashboard";
import WarehouseDashboard from "./pages/dashboard/WarehouseDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import DataUpload from "./pages/DataUpload";


// Inventory Pages
import InventoryList from "./pages/inventory/InventoryList";
import LowStock from "./pages/inventory/LowStock";
import DeadStock from "./pages/inventory/DeadStock";

// Forecasting Pages
import DemandForecast from "./pages/forecasting/DemandForecast";
import SeasonalForecast from "./pages/forecasting/SeasonalForecast";
import ForecastAccuracy from "./pages/forecasting/ForecastAccuracy";

// Supply Chain Pages
import PurchaseOrders from "./pages/supply-chain/PurchaseOrders";
import InboundShipments from "./pages/supply-chain/InboundShipments";
import Suppliers from "./pages/supply-chain/Suppliers";
import UserProfile from "./pages/UserProfile";
import Notifications from "./pages/Notifications";

import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard/store" element={<StoreManagerDashboard />} />
            <Route path="/dashboard/analyst" element={<AnalystDashboard />} />
            <Route path="/dashboard/warehouse" element={<WarehouseDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />

            {/* Inventory Routes */}
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/low-stock" element={<LowStock />} />
            <Route path="/inventory/dead-stock" element={<DeadStock />} />

            {/* Forecasting Routes */}
            <Route path="/forecasting/demand" element={<DemandForecast />} />
            <Route path="/forecasting/seasonal" element={<SeasonalForecast />} />
            <Route path="/forecasting/accuracy" element={<ForecastAccuracy />} />

            {/* Supply Chain Routes */}
            <Route path="/supply-chain/orders" element={<PurchaseOrders />} />
            <Route path="/supply-chain/shipments" element={<InboundShipments />} />
            <Route path="/supply-chain/suppliers" element={<Suppliers />} />

            {/* Admin Routes (placeholder) */}

            <Route path="/admin/settings" element={<AdminDashboard />} />
            <Route path="/admin/thresholds" element={<AdminDashboard />} />

            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/data/upload" element={<DataUpload />} />

            {/* User Routes */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
