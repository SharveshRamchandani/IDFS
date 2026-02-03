import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Dashboard Pages
import StoreManagerDashboard from "./pages/dashboard/StoreManagerDashboard";
import AnalystDashboard from "./pages/dashboard/AnalystDashboard";
import WarehouseDashboard from "./pages/dashboard/WarehouseDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Inventory Pages
import InventoryList from "./pages/inventory/InventoryList";
import LowStock from "./pages/inventory/LowStock";
import DeadStock from "./pages/inventory/DeadStock";

// Forecasting Pages
import DemandForecast from "./pages/forecasting/DemandForecast";

// Not Found
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
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
          <Route path="/forecasting/seasonal" element={<DemandForecast />} />
          <Route path="/forecasting/accuracy" element={<DemandForecast />} />
          
          {/* Supply Chain Routes (placeholder) */}
          <Route path="/supply-chain/orders" element={<WarehouseDashboard />} />
          <Route path="/supply-chain/shipments" element={<WarehouseDashboard />} />
          <Route path="/supply-chain/suppliers" element={<WarehouseDashboard />} />
          
          {/* Admin Routes (placeholder) */}
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
          <Route path="/admin/thresholds" element={<AdminDashboard />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
