import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
import { LowStockAlerts } from "@/components/dashboard/LowStockAlerts";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { ReorderSuggestions } from "@/components/dashboard/ReorderSuggestions";

export default function StoreManagerDashboard() {
  return (
    <DashboardLayout title="Store Manager Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <DashboardStats />

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SalesTrendChart />
          <LowStockAlerts />
        </div>

        {/* Reorder Suggestions */}
        <ReorderSuggestions />

        {/* Product Performance */}
        <TopProducts />
      </div>
    </DashboardLayout>
  );
}
