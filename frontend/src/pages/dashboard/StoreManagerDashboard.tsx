import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
import { LowStockAlerts } from "@/components/dashboard/LowStockAlerts";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { ReorderSuggestions } from "@/components/dashboard/ReorderSuggestions";
import {
  IconPackage,
  IconAlertTriangle,
  IconShoppingCart,
  IconTruck,
  IconLoader2,
  IconCalendarStats,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api";
import { TrendingUp } from "lucide-react";

// ─── Bento Grid primitives ────────────────────────────────────────────────────
function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {children}
    </div>
  );
}

function BentoCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "text-primary",
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 p-5 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className={`rounded-lg bg-muted p-2 ${accent}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="text-3xl font-extrabold tabular-nums tracking-tight">
        {value}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

// ─── Radar Chart – Top Moving Products ───────────────────────────────────────
function TopProductsRadar({
  data,
}: {
  data: { sku: string; quantity: number }[];
}) {
  const radarData = data.map((d) => ({
    product: d.sku,
    sales: d.quantity,
  }));

  return (
    <div className="flex flex-col h-full p-5">
      <div className="mb-2">
        <h3 className="font-semibold text-base">Top Moving Products</h3>
        <p className="text-xs text-muted-foreground">By recent sales volume</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart
            data={radarData}
            margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
          >
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="product"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Radar
              dataKey="sales"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.35}
              dot={{ r: 4, fillOpacity: 1, fill: "hsl(var(--primary))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(v: number) => [v, "Units"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium mt-1">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span>Based on latest transactions</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StoreManagerDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });

  // Derive top-moving products from recent_sales
  const skuMap: Record<string, number> = {};
  (stats?.recent_sales || []).forEach((s: any) => {
    skuMap[s.sku] = (skuMap[s.sku] || 0) + (s.quantity || 0);
  });
  const topProducts = Object.entries(skuMap)
    .map(([sku, quantity]) => ({ sku, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

  // Fallback radar data
  const radarData =
    topProducts.length > 0
      ? topProducts
      : [
        { sku: "SKU-001", quantity: 1247 },
        { sku: "SKU-002", quantity: 892 },
        { sku: "SKU-003", quantity: 756 },
        { sku: "SKU-004", quantity: 634 },
        { sku: "SKU-005", quantity: 521 },
        { sku: "SKU-006", quantity: 430 },
      ];

  return (
    <DashboardLayout title="Store Manager Dashboard">
      <div className="space-y-6">

        {/* ── Row 1: 2×2 Stat Cards (left) + Radar Chart (right) ── */}
        <BentoGrid>
          {/* Left: 2×2 stat cards */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <BentoCell>
              {isLoading ? (
                <div className="flex h-[100px] items-center justify-center p-8">
                  <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <StatCard
                  title="Total Products"
                  value={stats?.summary?.total_products ?? "—"}
                  description="Active SKUs in catalog"
                  icon={IconPackage}
                  accent="text-violet-500"
                />
              )}
            </BentoCell>

            <BentoCell>
              {isLoading ? (
                <div className="flex h-full items-center justify-center p-8">
                  <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <StatCard
                  title="Low Stock Items"
                  value={stats?.summary?.low_stock_count ?? "—"}
                  description={`${stats?.summary?.out_of_stock_count ?? 0} out of stock`}
                  icon={IconAlertTriangle}
                  accent="text-amber-500"
                />
              )}
            </BentoCell>

            <BentoCell>
              {isLoading ? (
                <div className="flex h-full items-center justify-center p-8">
                  <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <StatCard
                  title="Daily Avg Sales"
                  value={Math.round(stats?.avg_daily_sales ?? 0).toLocaleString()}
                  description="Units sold per day"
                  icon={IconShoppingCart}
                  accent="text-emerald-500"
                />
              )}
            </BentoCell>

            <BentoCell>
              {isLoading ? (
                <div className="flex h-full items-center justify-center p-8">
                  <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <StatCard
                  title="Total Revenue"
                  value={
                    stats?.total_revenue
                      ? `$${(stats.total_revenue / 1000).toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}k`
                      : "—"
                  }
                  description="All-time revenue"
                  icon={IconTruck}
                  accent="text-blue-500"
                />
              )}
            </BentoCell>
          </div>

          {/* Right: Radar Chart */}
          <BentoCell className="lg:col-span-2 min-h-[200px]">
            <TopProductsRadar data={radarData} />
          </BentoCell>
        </BentoGrid>

        {/* ── Today's Sales Banner ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              icon: IconCalendarStats,
              label: "Today's Date",
              value: stats?.today?.date
                ? new Date(stats.today.date + "T00:00:00").toLocaleDateString(undefined, {
                  weekday: "short", day: "numeric", month: "short", year: "numeric",
                })
                : new Date().toLocaleDateString(undefined, {
                  weekday: "short", day: "numeric", month: "short", year: "numeric",
                }),
              sub: "Current trading day",
              accent: "text-primary",
            },
            {
              icon: IconShoppingCart,
              label: "Today's Transactions",
              value: isLoading ? "—" : (stats?.today?.records ?? 0).toLocaleString(),
              sub: "sales records today",
              accent: "text-emerald-500",
            },
            {
              icon: IconPackage,
              label: "Today's Units Sold",
              value: isLoading ? "—" : (stats?.today?.quantity ?? 0).toLocaleString(),
              sub: "units across all stores",
              accent: "text-violet-500",
            },
            {
              icon: IconCurrencyDollar,
              label: "Today's Revenue",
              value: isLoading
                ? "—"
                : `$${(stats?.today?.revenue ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
              sub: "gross revenue today",
              accent: "text-blue-500",
            },
          ].map((kpi) => (
            <BentoCell key={kpi.label}>
              <div className="flex flex-col gap-2 p-5 h-full">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                  <span className={`rounded-lg bg-muted p-1.5 ${kpi.accent}`}>
                    <kpi.icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className={`text-2xl font-extrabold tabular-nums tracking-tight ${kpi.accent}`}>
                  {kpi.value}
                </div>
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
            </BentoCell>
          ))}
        </div>

        {/* ── Row 2: Sales Trend Chart (full width) ── */}
        <BentoCell className="rounded-2xl overflow-hidden">

          <SalesTrendChart />

        </BentoCell>

        {/* ── Row 3: Reorder Suggestions + Low Stock Alerts ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BentoCell className="overflow-hidden">

            <ReorderSuggestions />

          </BentoCell>


          <LowStockAlerts />


        </div>

      </div>
    </DashboardLayout>
  );
}
