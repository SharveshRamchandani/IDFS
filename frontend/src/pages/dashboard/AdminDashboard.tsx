
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconBuilding, IconUsers, IconAlertTriangle, IconTrendingUp } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api";
import { IconLoader2 } from "@tabler/icons-react";

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning-foreground border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000 // Refresh every 30s
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
      description: "Active locations"
    },
    {
      title: "Total Products",
      value: stats?.summary?.total_products || 0,
      icon: IconUsers, // Using broadly as 'items'
      description: "SKUs in catalog"
    },
    {
      title: "Total Sales Records",
      value: (stats?.summary?.total_sales_records || 0).toLocaleString(),
      icon: IconTrendingUp,
      description: "Historical data points"
    },
    {
      title: "Avg Daily Sales",
      value: Math.round(stats?.avg_daily_sales || 0),
      icon: IconAlertTriangle, // Placeholder icon
      description: "Units per day"
    },
  ];

  const topStores = stats?.top_stores || [];

  return (
    <DashboardLayout title="Admin / HQ Dashboard">
      <div className="space-y-6">
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

        {/* Regional Performance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Stores by Revenue</CardTitle>
              <CardDescription>Highest performing locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topStores} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="store_id"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {topStores.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sales Activity</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recent_sales?.map((sale, index) => (
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
