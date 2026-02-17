import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth Pages
import Login from "./pages/Login";
import UnauthorizedPage from "./pages/Unauthorized";

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


import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Dashboard Routes - Protected */}
              <Route
                path="/dashboard/store"
                element={
                  <ProtectedRoute requiredCategory="dashboards" requiredFeature="store">
                    <StoreManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/analyst"
                element={
                  <ProtectedRoute requiredCategory="dashboards" requiredFeature="analyst">
                    <AnalystDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/warehouse"
                element={
                  <ProtectedRoute requiredCategory="supplyChain" requiredFeature="warehouse">
                    <WarehouseDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute requiredCategory="dashboards" requiredFeature="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Inventory Routes - Protected */}
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute requiredCategory="inventory" requiredFeature="all">
                    <InventoryList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/low-stock"
                element={
                  <ProtectedRoute requiredCategory="inventory" requiredFeature="low-stock">
                    <LowStock />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/dead-stock"
                element={
                  <ProtectedRoute requiredCategory="inventory" requiredFeature="dead-stock">
                    <DeadStock />
                  </ProtectedRoute>
                }
              />

              {/* Forecasting Routes - Protected */}
              <Route
                path="/forecasting/demand"
                element={
                  <ProtectedRoute requiredCategory="forecasting" requiredFeature="demand">
                    <DemandForecast />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forecasting/seasonal"
                element={
                  <ProtectedRoute requiredCategory="forecasting" requiredFeature="seasonal">
                    <SeasonalForecast />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forecasting/accuracy"
                element={
                  <ProtectedRoute requiredCategory="forecasting" requiredFeature="accuracy">
                    <ForecastAccuracy />
                  </ProtectedRoute>
                }
              />

              {/* Supply Chain Routes - Protected */}
              <Route
                path="/supply-chain/orders"
                element={
                  <ProtectedRoute requiredCategory="supplyChain" requiredFeature="orders">
                    <PurchaseOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supply-chain/shipments"
                element={
                  <ProtectedRoute requiredCategory="supplyChain" requiredFeature="shipments">
                    <InboundShipments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supply-chain/suppliers"
                element={
                  <ProtectedRoute requiredCategory="supplyChain" requiredFeature="suppliers">
                    <Suppliers />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes - Protected (Admin Only) */}
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requiredCategory="admin" requiredFeature="settings">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/thresholds"
                element={
                  <ProtectedRoute requiredCategory="admin" requiredFeature="thresholds">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredCategory="admin" requiredFeature="users">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              {/* Data Upload - Store Manager and above */}
              <Route
                path="/data/upload"
                element={
                  <ProtectedRoute requiredCategory="admin">
                    <DataUpload />
                  </ProtectedRoute>
                }
              />

              {/* User Routes - Any authenticated user */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute requiredCategory="notifications">
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
