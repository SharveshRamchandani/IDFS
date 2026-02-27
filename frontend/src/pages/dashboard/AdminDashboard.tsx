
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconBuilding, IconUsers, IconAlertTriangle, IconTrendingUp, IconDownload } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/lib/exportCsv";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api";
import { IconLoader2 } from "@tabler/icons-react";

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Admin / HQ Dashboard">
        <div className="flex h-[50vh] items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Admin / HQ Dashboard">
        <div className="flex h-[50vh] items-center justify-center text-destructive">
          Error loading dashboard data. Please try again later.
        </div>
      </DashboardLayout>
    );
  }

  const systemStats = [
    {
      title: "Total Stores",
      value: stats?.summary?.total_stores || 0,
      icon: IconBuilding,
      description: "Active locations",
    },
    {
      title: "Total Products",
      value: stats?.summary?.total_products || 0,
      icon: IconUsers,
      description: "SKUs in catalog",
    },
    {
      title: "Total Sales Records",
      value: (stats?.summary?.total_sales_records || 0).toLocaleString(),
      icon: IconTrendingUp,
      description: "Historical data points",
    },
    {
      title: "Avg Daily Sales",
      value: Math.round(stats?.avg_daily_sales || 0).toLocaleString(),
      icon: IconAlertTriangle,
      description: "Units per day",
    },
  ];

  const topStores: any[] = stats?.top_stores || [];
  const isQty = topStores[0]?.metric === "quantity";
  const grandTotal = topStores.reduce((s, r) => s + (r.revenue ?? 0), 0);

  return (
    <DashboardLayout title="Admin / HQ Dashboard">
      <div className="space-y-6">

        {/* Export bar */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={!stats} onClick={() =>
            exportToCSV("admin_top_stores", topStores.map((s) => ({
              "Store ID": s.store_id,
              Region: s.region,
              [isQty ? "Units Sold" : "Revenue"]: s.revenue,
              "% of Total": grandTotal > 0 ? `${((s.revenue / grandTotal) * 100).toFixed(1)}%` : "—",
            })))
          }>
            <IconDownload className="mr-2 h-4 w-4" /> Export Top Stores
          </Button>
          <Button variant="outline" size="sm" disabled={!stats?.recent_sales?.length} onClick={() =>
            exportToCSV("admin_recent_sales", (stats?.recent_sales ?? []).map((s: any) => ({
              Date: s.date,
              SKU: s.sku,
              Store: s.store_id,
              Quantity: s.quantity,
            })))
          }>
            <IconDownload className="mr-2 h-4 w-4" /> Export Recent Sales
          </Button>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {systemStats.map((stat) => (
            <Card key={stat.title} className="bg-sidebar-background">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{stat.title}</CardDescription>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── Donut pie: store contribution ── */}
          <Card>
            <CardHeader>
              <CardTitle>Store Sales Contribution</CardTitle>
              <CardDescription>
                {topStores.length === 0
                  ? "No store data available"
                  : isQty
                    ? `Total: ${grandTotal.toLocaleString()} units sold across all stores`
                    : `Total: $${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} gross revenue`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topStores.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
                  No store data available.
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {/* Donut */}
                  <div className="h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topStores}
                          dataKey="revenue"
                          nameKey="store_id"
                          cx="50%"
                          cy="50%"
                          innerRadius="52%"
                          outerRadius="78%"
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {topStores.map((_: any, i: number) => (
                            <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number, _: any, props: any) => [
                            `${isQty
                              ? value.toLocaleString() + " units"
                              : "$" + value.toLocaleString(undefined, { minimumFractionDigits: 2 })
                            }  (${((value / grandTotal) * 100).toFixed(1)}%)`,
                            props.payload.store_id,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend table */}
                  <div className="space-y-2 px-1">
                    {topStores.map((store: any, i: number) => {
                      const pct = grandTotal > 0
                        ? ((store.revenue / grandTotal) * 100).toFixed(1)
                        : "0.0";
                      return (
                        <div key={store.store_id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ background: `hsl(var(--chart-${(i % 5) + 1}))` }}
                            />
                            <span className="font-medium">{store.store_id}</span>
                            {store.region && (
                              <span className="text-muted-foreground text-xs truncate">({store.region})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-muted-foreground tabular-nums text-xs">
                              {isQty
                                ? store.revenue.toLocaleString() + " u"
                                : `$${store.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                            </span>
                            <Badge variant="outline" className="text-xs w-16 justify-center font-mono">
                              {pct}%
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Recent Sales Activity ── */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales Activity</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recent_sales?.map((sale: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                    <div>
                      <p className="font-medium">{sale.sku}</p>
                      <p className="text-sm text-muted-foreground">{sale.store_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{sale.quantity} units</p>
                      <p className="text-xs text-muted-foreground">{sale.date}</p>
                    </div>
                  </div>
                ))}
                {!stats?.recent_sales?.length && (
                  <div className="text-center text-muted-foreground py-8">
                    No recent sales found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
